import os
from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel
from dotenv import load_dotenv
from typing import Dict, Any

from models.schemas import TimetableGenerationResponse

load_dotenv()

def get_agent():
    api_key = os.getenv("GROQ_API_KEY", "")
    
    # We use llama-3.3-70b-versatile, which is Groq's best model for this
    # The GROQ_API_KEY is automatically picked up from the environment by the Groq SDK
    model = GroqModel(
        model_name="llama-3.3-70b-versatile",
    )

    # Define the Agentic logic
    agent = Agent(
        model=model,
        output_type=TimetableGenerationResponse,
        system_prompt=(
            "You are an expert Academic Scheduler. Your goal is to generate a valid, realistic college timetable "
            "based on the provided constraints (faculty, subjects, timeslots, days).\n\n"
            "CRITICAL RULES:\n"
            "1. DIVERSITY & SHUFFLING: Distribute subjects across the week. DO NOT generate the exact same schedule every day. Each day must have a different sequence of subjects.\n"
            "2. EXACT MATCH: You MUST use the exact timeslots and days provided in the constraints. Do not invent your own times or days.\n"
            "3. STRICT SINGLE/DUAL FACULTY CONSISTENCY (MAX 1-2 TEACHERS PER SUBJECT): For any single subject (e.g. Maths, Physics, Chemistry, English, C-programming) in a given section, exactly ONE (or a MAXIMUM of TWO) faculty members can be assigned to teach that subject across the entire week. Do NOT rotate multiple different teachers for the same subject in the same section on different days. Once you assign a faculty member to teach a subject for a section, keep that same faculty member consistent for all occurrences of that subject in that section throughout the week.\n"
            "4. STRICT LAB CONSTRAINTS (3 LABS ONLY, 3 CONTINUOUS PERIODS EACH):\n"
            "   - There must be exactly THREE lab subjects scheduled per week: 'C-programming Lab' (or C programming), 'Physics Lab', and 'Chemistry Lab'. Do not schedule any other labs.\n"
            "   - Each of these three labs must be scheduled EXACTLY ONCE per week.\n"
            "   - Each lab MUST occupy exactly THREE CONTINUOUS periods (timeslots) back-to-back on its scheduled day (e.g., Periods 1, 2, and 3, or Periods 4, 5, and 6). Do NOT scatter lab periods as single-period slots on different days.\n"
            "   - **CRITICAL**: You MUST NOT combine multiple timeslots into a single custom string like '7:50 AM - 10:20 AM'. Doing so creates duplicate or misaligned columns in the frontend. Instead, you MUST create three SEPARATE entries in the final timetable, each using the exact, original individual timeslot (e.g., one entry for '7:50 AM - 8:40 AM' with 'Physics Lab', one entry for '8:40 AM - 9:20 AM' with 'Physics Lab', and one entry for '9:30 AM - 10:20 AM' with 'Physics Lab').\n"
            "   - Lab blocks CAN cross over non-academic periods such as 'Break' or 'Lunch' (e.g., if there is a 'Break' or 'Lunch' between timeslots, the periods are still considered continuous if they are adjacent before and after the break/lunch).\n"
            "5. NO OVERLAPS & MULTI-SECTION CONSTRAINTS: A faculty member CANNOT teach two different classes (sections) at the exact same day and timeslot. "
            "You are provided with a 'faculty_busy_map' showing exactly when each faculty is already teaching in other classes. "
            "You MUST strictly verify that you DO NOT assign any faculty member to teach the current section "
            "at any day and timeslot where they are listed as busy in 'faculty_busy_map'. This is a STRICT constraint.\n"
            "6. MATCH FACULTY TO SUBJECTS: Ensure that the assigned faculty actually teaches the given subject based on the input constraints.\n"
            "7. NO EMPTY SLOTS: Ensure every standard timeslot for every day has an entry, using all available subjects.\n"
            "8. BREAKS & LUNCH: If the timeslots constraint explicitly mentions 'Break', 'Lunch', or any similar non-academic periods, you MUST include those timeslots in the timetable for EVERY day. Assign the subject as 'Break' or 'Lunch' and leave the faculty empty or 'N/A'.\n"
            "9. NO COPY-PASTING: Do NOT generate the exact same schedule layout or identical faculty-to-timeslot assignments as any existing section's timetable. "
            "Ensure the schedule for the new section is distinct, randomized, and completely conflict-free.\n"
            "10. WORKLOAD CAP AND BALANCE: Avoid over-allocating any single faculty member. If 'faculty_workloads' indicates a teacher already has many hours assigned, prefer other available teachers who teach that subject but have fewer hours assigned, to distribute workloads evenly."
        ),
    )
    return agent

async def generate_timetable_agent(constraints: Dict[str, Any]) -> TimetableGenerationResponse:
    """
    Executes the timetable generation via the LLM agent.
    """
    agent = get_agent()
    prompt = f"Please generate a timetable based on the following constraints:\n{constraints}"
    
    # Run the agent asynchronously
    result = await agent.run(prompt)
    
    # PydanticAI automatically handles structured output when using output_type
    return result.output
