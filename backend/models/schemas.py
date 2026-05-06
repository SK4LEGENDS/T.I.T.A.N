from pydantic import BaseModel, Field
from typing import List

class FacultyConstraint(BaseModel):
    name: str
    subjects: List[str] = Field(description="List of subjects this faculty can teach")
    max_classes_per_week: int

class SubjectConstraint(BaseModel):
    name: str
    classes_per_week: int

class TimeSlot(BaseModel):
    day: str
    time: str

class TimetableEntry(BaseModel):
    day: str
    time: str
    subject: str
    faculty: str

class TimetableResult(BaseModel):
    section: str
    entries: List[TimetableEntry]

class TimetableGenerationResponse(BaseModel):
    timetables: List[TimetableResult] = Field(description="The generated timetables for each section")
