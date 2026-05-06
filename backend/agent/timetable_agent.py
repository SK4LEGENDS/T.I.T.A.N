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
            "1. DIVERSITY: Distribute subjects randomly across the week. DO NOT generate the exact same schedule every day. Each day must have a different sequence of subjects.\n"
            "2. EXACT MATCH: You MUST use the exact timeslots and days provided in the constraints. Do not invent your own times or days.\n"
            "3. NO OVERLAPS & MULTI-SECTION CONSTRAINTS: A faculty member CANNOT teach two different classes (sections) at the exact same day and timeslot. "
            "You are provided with a 'faculty_busy_map' showing exactly when each faculty is already teaching in other classes. "
            "You MUST strictly verify that you DO NOT assign any faculty member to teach the current section "
            "at any day and timeslot where they are listed as busy in 'faculty_busy_map'. This is a STRICT constraint.\n"
            "4. MATCH FACULTY TO SUBJECTS: Ensure that the assigned faculty actually teaches the given subject based on the input constraints.\n"
            "5. NO EMPTY SLOTS: Ensure every standard timeslot for every day has an entry, using all available subjects.\n"
            "6. SHUFFLE: Mix up the order! If Monday starts with Physics, Tuesday should start with something else.\n"
            "7. CONSISTENT FACULTY: Within a single section (e.g. CSE-1A), a subject MUST be taught by exactly ONE specific faculty member. Do NOT rotate different teachers for the same subject in the same section. Pick ONE valid teacher for a subject and use them for all instances of that subject.\n"
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
