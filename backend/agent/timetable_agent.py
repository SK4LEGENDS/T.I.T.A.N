import os
import csv
import io
import re
import random
from collections import defaultdict
from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel
from dotenv import load_dotenv
from typing import Dict, Any, List

from models.schemas import TimetableGenerationResponse, TimetableEntry, TimetableResult

load_dotenv()

def classify_lab_type(subject_name: str) -> str:
    subj = subject_name.lower()
    if "physics" in subj:
        return "physics_lab"
    elif "chemistry" in subj:
        return "chemistry_lab"
    elif "computer" in subj or "programming" in subj or "python" in subj or "data structures" in subj or "java" in subj or "web" in subj or "dbms" in subj or "database" in subj or "sql" in subj or "coding" in subj or "it lab" in subj or "ds lab" in subj or "ads lab" in subj or "software" in subj or "algorithm" in subj:
        return "computer_lab"
    elif "mechanical" in subj or "graphics" in subj or "workshop" in subj or "mech" in subj or "cad" in subj or "drawing" in subj or "manufacturing" in subj:
        return "mechanical_lab"
    else:
        return "departmental_lab"

def parse_time_slots_csv(csv_text: str) -> list:
    if not csv_text:
        return []
    f = io.StringIO(csv_text.strip())
    reader = csv.reader(f)
    rows = list(reader)
    if not rows:
        return []
    
    headers = [h.strip().lower() for h in rows[0]] if rows else []
    
    period_col = 0
    # Find column containing 'period'
    for idx, h in enumerate(headers):
        if 'period' in h:
            period_col = idx
            break
            
    # Try to find 'start' and 'end' columns
    start_col = -1
    end_col = -1
    for idx, h in enumerate(headers):
        if 'start' in h or 'from' in h:
            start_col = idx
        elif 'end' in h or 'to' in h:
            end_col = idx
            
    # If not found, try finding 'time' or 'slot'
    time_col = -1
    if start_col == -1 or end_col == -1:
        for idx, h in enumerate(headers):
            if 'time' in h or 'slot' in h:
                time_col = idx
                break
        if time_col == -1:
            time_col = 1 if len(headers) > 1 else 0
            
    # Check if first row is a header
    start_idx = 0
    first_cell = rows[0][0].lower() if rows[0] else ""
    if any(x in first_cell for x in ["time", "slot", "period", "start", "end", "from", "to", "s:no", "s.no", "no"]):
        start_idx = 1
        
    slots = []
    for row in rows[start_idx:]:
        if not row:
            continue
        # Get time value
        if start_col != -1 and end_col != -1 and len(row) > max(start_col, end_col):
            time_val = f"{row[start_col].strip()} - {row[end_col].strip()}"
        elif time_col != -1 and len(row) > time_col:
            time_val = row[time_col].strip()
        elif len(row) > 1:
            time_val = row[1].strip()
        else:
            time_val = row[0].strip()
            
        period_val = row[period_col].strip() if len(row) > period_col else ""
        clean_p = period_val.lower()
        time_val = time_val.replace('"', '').replace("'", "").strip()
        clean_t = time_val.lower()
        if "break" in clean_p or "break" in clean_t:
            slots.append(f"BREAK ({time_val})" if "break" not in clean_t else time_val)
        elif "lunch" in clean_p or "lunch" in clean_t:
            slots.append(f"LUNCH ({time_val})" if "lunch" not in clean_t else time_val)
        else:
            slots.append(time_val)
    return slots

def parse_faculty_csv(csv_text: str) -> list:
    if not csv_text:
        return []
    f = io.StringIO(csv_text.strip())
    reader = csv.reader(f)
    rows = list(reader)
    if not rows:
        return []
    
    headers = [h.strip().lower() for h in rows[0]]
    
    name_col = -1
    subjects_col = -1
    max_col = -1
    dept_col = -1
    
    for idx, h in enumerate(headers):
        if any(x in h for x in ['name', 'faculty', 'teacher', 'instructor']):
            name_col = idx
        elif any(x in h for x in ['subject', 'course', 'expertise', 'teach']):
            subjects_col = idx
        elif any(x in h for x in ['max', 'limit', 'classes', 'hours']):
            max_col = idx
        elif any(x in h for x in ['dept', 'department']):
            dept_col = idx
            
    if name_col == -1: name_col = 0
    if subjects_col == -1: subjects_col = min(1, len(headers)-1)
    if max_col == -1: max_col = min(2, len(headers)-1)
    
    faculty_list = []
    for row in rows[1:]:
        if len(row) > max(name_col, subjects_col):
            name = row[name_col].strip()
            subjects_str = row[subjects_col].strip()
            subjects = [s.strip() for s in subjects_str.replace(';', ',').split(',') if s.strip()]
            
            max_classes = 4
            if max_col < len(row):
                try:
                    max_classes = int(row[max_col].strip())
                except:
                    pass
                    
            dept_val = None
            if dept_col != -1 and len(row) > dept_col:
                dept_val = row[dept_col].strip().upper()
                
            faculty_list.append({
                "name": name,
                "subjects": subjects,
                "max_classes_per_week": max_classes,
                "department": dept_val
            })
    return faculty_list

def parse_subjects_csv(csv_text: str) -> list:
    if not csv_text:
        return []
    f = io.StringIO(csv_text.strip())
    reader = csv.reader(f)
    rows = list(reader)
    if not rows:
        return []
    
    headers = [h.strip().lower() for h in rows[0]]
    
    name_col = -1
    hours_col = -1
    year_col = -1
    sem_col = -1
    
    for idx, h in enumerate(headers):
        if any(x in h for x in ['name', 'subject', 'course', 'title']):
            name_col = idx
        elif any(x in h for x in ['hours', 'classes', 'frequency', 'per_week', 'count']):
            hours_col = idx
        elif any(x in h for x in ['year', 'level', 'class', 'grade']):
            year_col = idx
        elif any(x in h for x in ['sem', 'semester']):
            sem_col = idx
            
    if name_col == -1: name_col = 0
    if hours_col == -1: hours_col = min(1, len(headers)-1)
    
    subjects_list = []
    for row in rows[1:]:
        if len(row) > max(name_col, hours_col):
            name = row[name_col].strip()
            is_lab = "lab" in name.lower()
            hours = 0 if is_lab else 4
            try:
                if not is_lab and hours_col != name_col:
                    hours = int(row[hours_col].strip())
            except:
                pass
                
            year_val = None
            if year_col != -1 and len(row) > year_col and row[year_col].strip():
                try:
                    digits = re.findall(r'\d+', row[year_col])
                    if digits:
                        year_val = int(digits[0])
                except:
                    pass
                    
            sem_val = None
            if sem_col != -1 and len(row) > sem_col and row[sem_col].strip():
                try:
                    digits = re.findall(r'\d+', row[sem_col])
                    if digits:
                        sem_val = int(digits[0])
                except:
                    pass
                    
            subjects_list.append({
                "name": name,
                "classes_per_week": hours,
                "is_lab": is_lab,
                "academic_year": year_val,
                "semester": sem_val
            })
    return subjects_list


def normalize_subject_name(name: str) -> str:
    """Normalize subject names for fuzzy matching.
    Strips hyphens, collapses whitespace, and lowercases.
    e.g. 'C-programming' -> 'c programming', 'C programming' -> 'c programming'
    """
    s = name.strip().lower()
    s = s.replace('-', ' ').replace('_', ' ')
    s = re.sub(r'\s+', ' ', s)
    return s


def validate_and_fix_timetable(
    response: TimetableGenerationResponse,
    valid_time_slots: List[str],
    faculty_list: List[dict],
    subjects_list: List[dict],
    faculty_busy_map: dict = None,
    num_labs: int = None,
    department_lab_busy_slots: dict = None,
    data: dict = None
) -> TimetableGenerationResponse:
    """
    Post-generation validator that programmatically fixes common LLM errors:
    1. BREAK/LUNCH are treated as structural slots, eliminating duplicate columns.
    2. Labs are priority-allocated to 3 consecutive academic periods on unique days.
    3. Regular subjects are globally shuffled to prevent repetitive daily layouts.
    """
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    if faculty_busy_map is None:
        faculty_busy_map = {}

    # Separate academic slots from break/lunch (case-insensitive substring checks)
    academic_slots = [s for s in valid_time_slots if "break" not in s.lower() and "lunch" not in s.lower()]
    break_slots = [s for s in valid_time_slots if "break" in s.lower()]
    lunch_slots = [s for s in valid_time_slots if "lunch" in s.lower()]

    # Identify lab subjects and regular subjects
    lab_subjects = [s["name"] for s in subjects_list if s.get("is_lab", False) or "lab" in s["name"].lower()]
    regular_subjects = [s["name"] for s in subjects_list if s["name"] not in lab_subjects]

    # Build subject workload mapping
    subject_hours_map = {s["name"]: s.get("classes_per_week", 4) for s in subjects_list}

    # Build faculty-to-subject mapping
    faculty_subject_map = {}
    for f in faculty_list:
        for subj in f.get("subjects", []):
            norm_key = normalize_subject_name(subj)
            if norm_key not in faculty_subject_map:
                faculty_subject_map[norm_key] = []
            faculty_subject_map[norm_key].append(f["name"])

    # Extract 3-period consecutive academic blocks (consecutive within academic slots, allowing breaks/lunch to be interspersed)
    consecutive_blocks = []
    for i in range(len(academic_slots) - 2):
        block = academic_slots[i:i+3]
        consecutive_blocks.append(block)

    for timetable in response.timetables:
        entries = timetable.entries

        # ===== STEP 1: Fix teacher consistency =====
        subject_teacher_counts = defaultdict(lambda: defaultdict(int))
        for entry in entries:
            subj = entry.subject.strip()
            fac = entry.faculty.strip()
            if subj.upper() not in ["BREAK", "LUNCH"] and fac != "N/A":
                subject_teacher_counts[subj][fac] += 1

        subject_teacher_map = {}
        for subj, teacher_counts in subject_teacher_counts.items():
            best_teacher = max(teacher_counts, key=teacher_counts.get)
            norm_key = normalize_subject_name(subj)
            valid_teachers = faculty_subject_map.get(norm_key, [])
            if valid_teachers and best_teacher not in valid_teachers:
                best_teacher = valid_teachers[0]
            subject_teacher_map[subj] = best_teacher

        # ===== STEP 2: Clear Structural Slots (No AI Duplicates) =====
        # Completely strip out any BREAK or LUNCH entries generated by the AI
        academic_entries = []
        for entry in entries:
            subj_upper = entry.subject.upper()
            time_upper = entry.time.upper()
            if subj_upper in ["BREAK", "LUNCH"] or "BREAK" in time_upper or "LUNCH" in time_upper:
                continue
            if any(entry.subject.lower() == lab.lower() for lab in lab_subjects):
                continue  # Clear labs now to priority-schedule them in Step 3
            academic_entries.append(entry)

        # ===== STEP 3: Priority-Schedule Labs (3 Consecutive Periods) =====
        day_slot_map = defaultdict(set)
        lab_entries = []
        shuffled_labs = list(lab_subjects)
        random.shuffle(shuffled_labs)

        # Apply manual lab count override if provided by the user
        if num_labs is not None:
            try:
                num_labs_val = int(num_labs)
                if len(shuffled_labs) > 0:
                    extended_labs = []
                    for i in range(num_labs_val):
                        extended_labs.append(shuffled_labs[i % len(shuffled_labs)])
                    shuffled_labs = extended_labs
                else:
                    # If no labs parsed from the CSV, create beautiful generic lab placeholders
                    shuffled_labs = [f"Lab {i+1}" for i in range(num_labs_val)]
            except Exception as e:
                print("Error applying manual lab count override:", e)

        if data is None:
            data = {}
            
        req_dept = data.get("department", "GLOBAL").strip().upper()

        if department_lab_busy_slots is None:
            department_lab_busy_slots = {
                "physics_lab": {},
                "chemistry_lab": {},
                "computer_lab": {},
                "mechanical_lab": {},
                "departmental_lab": {}
            }
        if num_labs is None:
            num_labs = 2  # Default to 2 physical labs as requested by the user

        used_current_days = set()

        for idx, lab in enumerate(shuffled_labs):
            placed = False
            norm_key = normalize_subject_name(lab)
            valid_teachers = faculty_subject_map.get(norm_key, [])
            teacher = valid_teachers[0] if valid_teachers else "TBD"

            # Determine capacity for this lab type
            l_type = classify_lab_type(lab)
            if req_dept == "GLOBAL":  # First Year
                if l_type == "physics_lab":
                    lab_capacity = int(data.get("num_physics_labs", 1))
                elif l_type == "chemistry_lab":
                    lab_capacity = int(data.get("num_chemistry_labs", 1))
                elif l_type == "computer_lab":
                    lab_capacity = int(data.get("num_computer_labs", 1))
                elif l_type == "mechanical_lab":
                    lab_capacity = int(data.get("num_mechanical_labs", 1))
                else:
                    lab_capacity = int(data.get("num_labs", 2))
            else:  # Higher Years
                if l_type == "computer_lab":
                    lab_capacity = int(data.get("num_computer_labs", 2)) if "num_computer_labs" in data else int(data.get("num_labs", 2))
                elif l_type == "mechanical_lab":
                    lab_capacity = int(data.get("num_mechanical_labs", 1)) if "num_mechanical_labs" in data else int(data.get("num_labs", 2))
                elif l_type == "physics_lab":
                    lab_capacity = int(data.get("num_physics_labs", 1)) if "num_physics_labs" in data else int(data.get("num_labs", 2))
                elif l_type == "chemistry_lab":
                    lab_capacity = int(data.get("num_chemistry_labs", 1)) if "num_chemistry_labs" in data else int(data.get("num_labs", 2))
                else:
                    lab_capacity = int(data.get("num_labs", 2))

            # Skip scheduling if capacity is explicitly set to 0 by the user!
            if lab_capacity == 0:
                print(f"Skipping scheduling of {lab} because physical room capacity is set to 0")
                continue

            # Find all (day, block) options that have no capacity clashing
            possible_options = []
            for d in days:
                if d in used_current_days:
                    continue
                for block in consecutive_blocks:
                    clash = False
                    for slot in block:
                        current_concurrent_count = department_lab_busy_slots.get(l_type, {}).get(f"{d}|{slot}", 0)
                        if current_concurrent_count >= lab_capacity:
                            clash = True
                            break
                    if not clash:
                        possible_options.append((d, block))

            # Fallback: if overcrowding makes it impossible, relax the physical lab capacity constraint
            if not possible_options:
                for d in days:
                    if d in used_current_days:
                        continue
                    for block in consecutive_blocks:
                        possible_options.append((d, block))

            if possible_options:
                chosen_day, chosen_block = random.choice(possible_options)
                used_current_days.add(chosen_day)

                # Determine room number (1, 2, 3, or 4) based on concurrent allocations
                max_concurrent_count = max(department_lab_busy_slots.get(l_type, {}).get(f"{chosen_day}|{slot}", 0) for slot in chosen_block)
                room_num = min(lab_capacity, max_concurrent_count + 1)
                if room_num < 1:
                    room_num = 1

                if l_type == "physics_lab":
                    room_name = f"Physics Lab {room_num}"
                elif l_type == "chemistry_lab":
                    room_name = f"Chemistry Lab {room_num}"
                elif l_type == "computer_lab":
                    room_name = f"Computer Lab {room_num}"
                elif l_type == "mechanical_lab":
                    room_name = f"Mechanical Lab {room_num}"
                else:
                    room_name = f"Lab {room_num}"

                if room_name.lower() in lab.lower():
                    labeled_lab = f"{lab} {room_num}"
                elif "physics" in lab.lower() and "physics" in room_name.lower():
                    labeled_lab = f"{lab} {room_num}"
                elif "chemistry" in lab.lower() and "chemistry" in room_name.lower():
                    labeled_lab = f"{lab} {room_num}"
                elif "computer" in lab.lower() and "computer" in room_name.lower():
                    labeled_lab = f"{lab} {room_num}"
                elif "mechanical" in lab.lower() and "mechanical" in room_name.lower():
                    labeled_lab = f"{lab} {room_num}"
                else:
                    labeled_lab = f"{lab} - {room_name}"

                for slot in chosen_block:
                    lab_entries.append(TimetableEntry(
                        day=chosen_day, time=slot, subject=labeled_lab, faculty=teacher
                    ))
                    day_slot_map[chosen_day].add(slot)
                    # Dynamically track this placement for subsequent labs in the same run
                    if l_type not in department_lab_busy_slots:
                        department_lab_busy_slots[l_type] = {}
                    department_lab_busy_slots[l_type][f"{chosen_day}|{slot}"] = department_lab_busy_slots[l_type].get(f"{chosen_day}|{slot}", 0) + 1

        # ===== STEP 4: Evict AI Entries Clashing with Labs =====
        clean_academic_entries = []
        for entry in academic_entries:
            if entry.time not in day_slot_map[entry.day]:
                clean_academic_entries.append(entry)

        # ===== STEP 5: Inject Structural Breaks & Lunch (100% Consistent) =====
        break_lunch_entries = []
        for day in days:
            for bs in break_slots:
                break_lunch_entries.append(TimetableEntry(
                    day=day, time=bs, subject="BREAK", faculty="N/A"
                ))
            for ls in lunch_slots:
                break_lunch_entries.append(TimetableEntry(
                    day=day, time=ls, subject="LUNCH", faculty="N/A"
                ))

        # ===== STEP 6: Global Workload-Aware Shuffling =====
        # Rebuild the regular academic periods using our global weekly pool
        all_occupied = defaultdict(set)
        for entry in lab_entries:
            all_occupied[entry.day].add(entry.time)

        # Find empty academic slots
        empty_by_day = defaultdict(list)
        for day in days:
            for slot in academic_slots:
                if slot not in all_occupied[day]:
                    empty_by_day[day].append(slot)

        # Count already scheduled regular subjects
        subject_weekly_count = defaultdict(int)
        for entry in clean_academic_entries:
            subject_weekly_count[entry.subject] += 1

        # Build global academic pool
        total_empty = sum(len(slots) for slots in empty_by_day.values())
        weekly_pool = []
        for subj in regular_subjects:
            target = subject_hours_map.get(subj, 4)
            already = subject_weekly_count.get(subj, 0)
            remaining = max(0, target - already)
            weekly_pool.extend([subj] * remaining)

        # If pool is smaller than empty slots, pad it evenly
        if len(weekly_pool) < total_empty:
            deficit = total_empty - len(weekly_pool)
            extra = []
            cycle_idx = 0
            while len(extra) < deficit:
                extra.append(regular_subjects[cycle_idx % len(regular_subjects)])
                cycle_idx += 1
            weekly_pool.extend(extra)
        else:
            weekly_pool = weekly_pool[:total_empty]

        random.shuffle(weekly_pool)

        # Distribute into daily schedules with per-day shuffling
        fill_entries = []
        pool_idx = 0
        for day in days:
            day_slots = empty_by_day[day]
            if not day_slots:
                continue
            day_subjects = weekly_pool[pool_idx:pool_idx + len(day_slots)]
            random.shuffle(day_subjects)  # Per-day shuffle
            pool_idx += len(day_slots)

            for slot, subj in zip(day_slots, day_subjects):
                teacher = subject_teacher_map.get(subj, "TBD")
                if teacher == "TBD":
                    norm_key = normalize_subject_name(subj)
                    valid_teachers = faculty_subject_map.get(norm_key, [])
                    teacher = valid_teachers[0] if valid_teachers else "TBD"
                    subject_teacher_map[subj] = teacher

                # Clash check against faculty_busy_map
                is_busy = False
                if teacher in faculty_busy_map:
                    for busy in faculty_busy_map[teacher]:
                        if busy.get("day") == day and busy.get("time") == slot:
                            is_busy = True
                            break
                
                # If teacher is busy, attempt to swap with a non-busy alternative
                if is_busy:
                    norm_key = normalize_subject_name(subj)
                    valid_teachers = faculty_subject_map.get(norm_key, [])
                    for alt_teacher in valid_teachers:
                        alt_busy = False
                        if alt_teacher in faculty_busy_map:
                            for busy in faculty_busy_map[alt_teacher]:
                                if busy.get("day") == day and busy.get("time") == slot:
                                    alt_busy = True
                                    break
                        if not alt_busy:
                            teacher = alt_teacher
                            break

                fill_entries.append(TimetableEntry(
                    day=day, time=slot, subject=subj, faculty=teacher
                ))

        # ===== STEP 7: Reassemble and sort =====
        all_entries = lab_entries + break_lunch_entries + fill_entries

        # Deduplicate
        seen = set()
        deduped = []
        for entry in all_entries:
            key = (entry.day, entry.time)
            if key not in seen:
                seen.add(key)
                deduped.append(entry)

        # Sort
        day_order = {d: i for i, d in enumerate(days)}
        slot_order = {s: i for i, s in enumerate(valid_time_slots)}
        deduped.sort(key=lambda e: (
            day_order.get(e.day, 99),
            slot_order.get(e.time, 99)
        ))

        timetable.entries = deduped

    return response

def get_agent():
    load_dotenv(override=True)
    api_key = os.getenv("GROQ_API_KEY", "")
    if api_key:
        os.environ["GROQ_API_KEY"] = api_key
    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    model = GroqModel(
        model_name=model_name,
    )

    agent = Agent(
        model=model,
        output_type=TimetableGenerationResponse,
        retries=5,
        system_prompt=(
            "You are T.I.T.A.N. (Timetable Intelligent Technology & Agentic Negotiator), an elite college scheduler "
            "built with state-of-the-art AI constraint-solving algorithms.\n\n"
            "YOUR MISSION:\n"
            "Generate a beautiful, realistic, and highly diverse academic timetable for a specific section "
            "based on the provided JSON constraints. You must achieve 100% adherence to all academic constraints, "
            "distribute teachers evenly, and avoid any teacher overlaps.\n\n"
            "CRITICAL RULES:\n\n"
            "1. 📅 COMPLETE 5-DAY TIMETABLE (MONDAY TO FRIDAY) & DAILY SHUFFLING:\n"
            "   - You MUST generate a complete timetable covering exactly ALL 5 academic days: Monday, Tuesday, Wednesday, Thursday, and Friday.\n"
            "   - Do not skip any day. Every single one of these 5 days must have a complete set of entries matching all provided timeslots.\n"
            "   - DO NOT generate the exact same schedule layout or the exact same sequence of subjects for multiple days.\n"
            "   - The order of subjects MUST be completely randomized and shuffled for each of the 5 days of the week.\n"
            "   - For example, if Monday is: Maths, Physics, Chemistry, English, C-programming, Tamil.\n"
            "     Tuesday MUST NOT have the same sequence! Tuesday should start with a different subject "
            "     (e.g., Chemistry, English, Tamil, Maths...) and shuffle all subsequent periods.\n"
            "   - Each day must feel unique, realistic, and dynamically structured.\n\n"
            "2. 🧪 STRICT LAB CONSTRAINTS & TWO-PASS SCHEDULING (CRITICAL):\n"
            "   Lab subjects are identified by 'is_lab: true' in the input OR any subject name containing 'Lab' (case-insensitive).\n"
            "\n"
            "   *** ABSOLUTE LAB RULE — READ THIS CAREFULLY ***\n"
            "   Each lab subject MUST produce EXACTLY 3 TimetableEntry objects in your JSON output — no more, no less.\n"
            "   These 3 entries MUST be on the SAME day, using 3 CONSECUTIVE academic timeslots from the time_slots list.\n"
            "   The 'classes_per_week' value for labs in the input is 0 — this means DO NOT use it for counting. Always use exactly 3 entries per lab.\n"
            "\n"
            "   - THE 3-ENTRY OUTPUT RULE: For every single lab subject, you MUST write exactly 3 TimetableEntry lines in your JSON — one for each of the 3 consecutive periods of that lab block. Count to 3 before moving on.\n"
            "   - THE SINGLE-DAY RULE: All 3 entries for a lab MUST have the same 'day' value. Never split across days.\n"
            "   - THE ONCE-PER-WEEK RULE: Each lab subject appears exactly ONCE in the week (exactly 3 entries total for that subject across the whole week).\n"
            "   - NO MIXED LABS ON SAME DAY: At most ONE lab block per day. Never put two different lab subjects on the same day.\n"
            "   - SAME FACULTY FOR LAB BLOCK: All 3 entries of a lab block MUST have the EXACT same faculty name.\n"
            "   - NO LABS DURING BREAK OR LUNCH: The 3 consecutive lab periods must all be academic periods. Never include a BREAK or LUNCH slot as one of the 3 lab periods.\n"
            "   - TWO-PASS SCHEDULING METHODOLOGY (MANDATORY):\n"
            "     * PASS 1 (Labs First): For each lab subject, pick a day and 3 consecutive ACADEMIC timeslots (not crossing BREAK or LUNCH). Write all 3 entries now. Distribute labs across different sections of the day (morning before BREAK, mid-day between BREAK and LUNCH, afternoon after LUNCH) for variety.\n"
            "     * PASS 2 (Regular Subjects): Fill all remaining empty slots with regular subjects.\n"
            "\n"
            "   PRE-OUTPUT SELF-CHECK (MANDATORY — do this before writing JSON):\n"
            "   For each lab subject, verify:\n"
            "     [1] Does it have exactly 3 TimetableEntry lines? (Count them: 1, 2, 3)\n"
            "     [2] Are all 3 on the same day?\n"
            "     [3] Are the 3 timeslots consecutive academic periods (no BREAK or LUNCH in between)?\n"
            "     [4] Is the same faculty assigned to all 3?\n"
            "   If ANY answer is NO, fix it before outputting.\n"
            "\n"
            "   - Example of a Valid Lab Block (using 3 consecutive timeslots from the time_slots list):\n"
            "     * Entry 1: Day='Monday', Time=time_slots[N],   Subject='Physics Lab', Faculty='Dr. X'\n"
            "     * Entry 2: Day='Monday', Time=time_slots[N+1], Subject='Physics Lab', Faculty='Dr. X'\n"
            "     * Entry 3: Day='Monday', Time=time_slots[N+2], Subject='Physics Lab', Faculty='Dr. X'\n"
            "   Where time_slots[N], time_slots[N+1], and time_slots[N+2] are 3 consecutive ACADEMIC entries from the provided time_slots list (never BREAK or LUNCH).\n\n"
            "3. ⏰ EXACT TIMESLOTS MATCHING (BREAKS & LUNCH):\n"
            "   - You MUST use the exact, original timeslot strings provided in the 'time_slots' list. Do not invent, alter, or round off any times.\n"
            "   - If a timeslot is literally labeled as 'BREAK' or 'LUNCH', you MUST include an entry for it for EVERY single day of the week (Monday to Friday) in your response.\n"
            "   - For these non-academic slots, set the Time to the exact timeslot label (e.g., 'BREAK' or 'LUNCH'), Subject to 'BREAK' or 'LUNCH' respectively, and Faculty to 'N/A'.\n\n"
            "4. 👨‍🏫 TEACHER CONSISTENCY & CREDIBILITY:\n"
            "   - For any given subject (e.g., 'Maths') in a section, you must assign exactly ONE (or at most TWO) consistent faculty member(s) to teach it throughout the entire week. Do not rotate different teachers randomly for the same subject on different days.\n"
            "   - Ensure that the assigned faculty actually teaches the given subject based on the input constraints.\n\n"
            "5. ❌ ZERO CLASHES & OVERLAPS:\n"
            "   - A faculty member cannot teach two sections at the exact same day and timeslot.\n"
            "   - You are provided with a 'faculty_busy_map' showing when each faculty member is already teaching other sections. You MUST strictly ensure that you do not schedule a faculty member to teach at any day and timeslot where they are listed as busy in 'faculty_busy_map'. This is an absolute hard constraint.\n\n"
            "6. ⚖️ WORKLOAD BALANCE & CAP:\n"
            "   - Distribute teaching hours evenly. Avoid over-allocating any single teacher beyond their 'max_classes_per_week' cap.\n"
            "   - Prefer available faculty members who teach that subject but have fewer active hours assigned in 'faculty_workloads' to maintain a balanced, healthy workload."
        ),
    )
    return agent

async def generate_timetable_agent(constraints: Dict[str, Any]) -> TimetableGenerationResponse:
    """
    Executes the timetable generation via the LLM agent.
    """
    agent = get_agent()
    
    # Pre-parse CSV inputs to simplify the LLM's prompt and make generation robust
    time_slots = parse_time_slots_csv(constraints.get("timeSlotsCsv", ""))
    raw_faculty = parse_faculty_csv(constraints.get("facultyCsv", ""))
    raw_subjects = parse_subjects_csv(constraints.get("subjectsCsv", ""))
    
    req_dept = constraints.get("department")
    
    # Filter faculty by department if specified (and not global/unspecified)
    if req_dept and req_dept.upper() != "GLOBAL":
        filtered_faculty = []
        for f in raw_faculty:
            f_dept = f.get("department")
            if f_dept:
                depts = [d.strip().upper() for d in f_dept.replace(';', ',').split(',') if d.strip()]
                if req_dept.upper() in depts or "GLOBAL" in depts or "ALL" in depts:
                    filtered_faculty.append(f)
            else:
                filtered_faculty.append(f)
        faculty = filtered_faculty
    else:
        faculty = raw_faculty
    
    req_year = constraints.get("academic_year")
    req_sem = constraints.get("semester")
    
    # Filter subjects by selected year/semester if present in the CSV (backward compatible if columns missing)
    filtered_subjects = []
    for s in raw_subjects:
        if s.get("academic_year") is not None and req_year is not None:
            try:
                if int(s["academic_year"]) != int(req_year):
                    continue
            except:
                pass
        if s.get("semester") is not None and req_sem is not None:
            try:
                if int(s["semester"]) != int(req_sem):
                    continue
            except:
                pass
        filtered_subjects.append(s)
        
    subjects = filtered_subjects if filtered_subjects else raw_subjects
    
    structured_constraints = {
        "section": constraints.get("section", ""),
        "academic_cycle": constraints.get("academic_cycle", ""),
        "academic_year": constraints.get("academic_year", 1),
        "semester": constraints.get("semester", 1),
        "time_slots": time_slots,
        "faculty": faculty,
        "subjects": subjects,
        "faculty_busy_map": constraints.get("faculty_busy_map", {}),
        "faculty_workloads": constraints.get("faculty_workloads", {})
    }
    
    # Build the academic (non-break/lunch) timeslots list for explicit injection into the prompt
    academic_slots = [s for s in time_slots if "break" not in s.lower() and "lunch" not in s.lower()]

    prompt = (
        f"Please generate a timetable based on the following pre-parsed structured constraints:\n"
        f"{structured_constraints}\n\n"
        f"TIMESLOT ENFORCEMENT:\n"
        f"The ONLY valid time strings you may use for any TimetableEntry are the exact strings in the 'time_slots' list above.\n"
        f"Do NOT invent, round, or alter any timeslot string. Copy them character-for-character.\n"
        f"The full list of valid time strings is: {time_slots}\n"
        f"Academic (non-break) slots available for classes and labs: {academic_slots}\n"
        f"For a 3-period lab block, pick any 3 CONSECUTIVE entries from the academic slots list above."
    )
    
    # Run the agent asynchronously with robust validation retries (up to 2 complete agent run attempts)
    try:
        result = await agent.run(prompt)
    except Exception as e:
        print(f"First timetable generation attempt failed: {e}. Retrying with a fresh agent run...")
        result = await agent.run(prompt)
    
    # Post-generation validation: fix labs, teacher consistency, timeslots
    validated = validate_and_fix_timetable(
        response=result.output,
        valid_time_slots=time_slots,
        faculty_list=faculty,
        subjects_list=subjects,
        faculty_busy_map=constraints.get("faculty_busy_map", {}),
        num_labs=constraints.get("num_labs"),
        department_lab_busy_slots=constraints.get("department_lab_busy_slots", {}),
        data=constraints
    )
    
    return validated
