from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# We'll import the agent later
from agent.timetable_agent import generate_timetable_agent
from database.db_manager import init_db, save_timetable, get_saved_timetables, get_timetable_by_id, delete_timetable

load_dotenv()

# Initialize the SQLite database on startup
init_db()

app = FastAPI(title="Smart Timetable API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SaveTimetableRequest(BaseModel):
    name: str
    section: str
    data: dict
    academic_cycle: str = "ODD"
    academic_year: int = 1
    semester: int = 1

@app.get("/")
def read_root():
    return {"message": "Smart Timetable API is running."}

@app.post("/api/generate-timetable")
async def generate_timetable(data: dict):
    """
    Endpoint to trigger the agentic timetable generation.
    Expects data containing constraints like faculty, subjects, and timeslots.
    """
    try:
        if not os.getenv("GROQ_API_KEY"):
            return {"status": "error", "message": "GROQ_API_KEY is not set."}
            
        # Fetch existing timetables to pass to the agent as overlap constraints
        existing_timetables = []
        faculty_busy_map = {}
        faculty_workloads = {}
        academic_cycle = data.get("academic_cycle", "ODD")
        
        try:
            saved = get_saved_timetables()
            for item in saved:
                full_t = get_timetable_by_id(item["db_id"])
                if full_t and "data" in full_t and "timetables" in full_t["data"]:
                    if full_t.get("academic_cycle", "ODD") == academic_cycle:
                        existing_timetables.extend(full_t["data"]["timetables"])
                        for t in full_t["data"]["timetables"]:
                            for entry in t.get("entries", []):
                                fac = entry.get("faculty", "")
                                day = entry.get("day", "")
                                time = entry.get("time", "")
                                subj = entry.get("subject", "").lower()
                                
                                if not fac or fac in ["N/A", ""] or "break" in subj or "lunch" in subj:
                                    continue
                                    
                                if fac not in faculty_busy_map:
                                    faculty_busy_map[fac] = []
                                faculty_busy_map[fac].append({"day": day, "time": time, "section": t.get("section")})
                                faculty_workloads[fac] = faculty_workloads.get(fac, 0) + 1
        except Exception as db_err:
            print("Error retrieving existing timetables for overlap constraints:", db_err)

        data["existing_timetables"] = existing_timetables
        data["faculty_busy_map"] = faculty_busy_map
        data["faculty_workloads"] = faculty_workloads
            
        result = await generate_timetable_agent(data)
        return {"status": "success", "data": result.model_dump()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/saved-timetables")
def list_saved_timetables():
    try:
        timetables = get_saved_timetables()
        return {"status": "success", "data": timetables}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/timetable/{db_id}")
def load_saved_timetable(db_id: int):
    try:
        timetable = get_timetable_by_id(db_id)
        if timetable:
            return {"status": "success", "data": timetable}
        return {"status": "error", "message": "Timetable not found."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/save-timetable")
def save_new_timetable(payload: SaveTimetableRequest):
    try:
        db_id = save_timetable(
            payload.name, 
            payload.section, 
            payload.data, 
            payload.academic_cycle, 
            payload.academic_year, 
            payload.semester
        )
        return {"status": "success", "db_id": db_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/api/timetable/{db_id}")
def remove_saved_timetable(db_id: int):
    try:
        delete_timetable(db_id)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/analytics/summary")
def get_analytics_summary():
    try:
        saved = get_saved_timetables()
        faculties = {}
        subjects = {}
        total_allocated_hours = 0
        unique_sections = set()
        
        for item in saved:
            full_t = get_timetable_by_id(item["db_id"])
            if full_t and "data" in full_t and "timetables" in full_t["data"]:
                for t in full_t["data"]["timetables"]:
                    sec = t.get("section", "Unknown")
                    unique_sections.add(sec)
                    for entry in t.get("entries", []):
                        fac = entry.get("faculty", "")
                        subj_name = entry.get("subject", "")
                        subj_lower = subj_name.lower()
                        
                        if not fac or fac in ["N/A", ""] or "break" in subj_lower or "lunch" in subj_lower:
                            continue
                            
                        total_allocated_hours += 1
                        
                        # Faculty tracking
                        if fac not in faculties:
                            faculties[fac] = {
                                "name": fac,
                                "hours": 0,
                                "sections": set(),
                                "subjects": set()
                            }
                        faculties[fac]["hours"] += 1
                        faculties[fac]["sections"].add(sec)
                        faculties[fac]["subjects"].add(subj_name)
                        
                        # Subject tracking
                        if subj_name not in subjects:
                            subjects[subj_name] = {
                                "code": subj_name,
                                "hours": 0,
                                "sections": set(),
                                "faculties": set()
                            }
                        subjects[subj_name]["hours"] += 1
                        subjects[subj_name]["sections"].add(sec)
                        subjects[subj_name]["faculties"].add(fac)
                        
        # Format sets to lists for JSON serialization
        faculties_list = []
        for fac, info in faculties.items():
            faculties_list.append({
                "name": info["name"],
                "hours": info["hours"],
                "sections": list(info["sections"]),
                "subjects": list(info["subjects"])
            })
            
        subjects_list = []
        for subj, info in subjects.items():
            subjects_list.append({
                "code": info["code"],
                "hours": info["hours"],
                "sections": list(info["sections"]),
                "faculties": list(info["faculties"])
            })
            
        # Sort by hours descending
        faculties_list.sort(key=lambda x: x["hours"], reverse=True)
        subjects_list.sort(key=lambda x: x["hours"], reverse=True)
        
        fac_count = len(faculties)
        avg_workload = round(total_allocated_hours / fac_count, 1) if fac_count > 0 else 0
        
        return {
            "status": "success",
            "data": {
                "kpis": {
                    "sections_count": len(unique_sections),
                    "faculties_count": fac_count,
                    "allocated_hours": total_allocated_hours,
                    "average_workload": avg_workload
                },
                "faculties": faculties_list,
                "subjects": subjects_list
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
