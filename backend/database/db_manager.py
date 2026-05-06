import sqlite3
import json
import os

DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "database",
    "timetable.db"
)

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS timetables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            section TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            entries_json TEXT NOT NULL,
            academic_cycle TEXT DEFAULT 'ODD',
            academic_year INTEGER DEFAULT 1,
            semester INTEGER DEFAULT 1
        )
    """)
    # Safe backward compatibility schema updates
    try:
        cursor.execute("ALTER TABLE timetables ADD COLUMN academic_cycle TEXT DEFAULT 'ODD'")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE timetables ADD COLUMN academic_year INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE timetables ADD COLUMN semester INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

def save_timetable(name: str, section: str, data: dict, academic_cycle: str = "ODD", academic_year: int = 1, semester: int = 1):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO timetables (name, section, entries_json, academic_cycle, academic_year, semester) VALUES (?, ?, ?, ?, ?, ?)",
        (name, section, json.dumps(data), academic_cycle, academic_year, semester)
    )
    timetable_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return timetable_id

def get_saved_timetables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, section, created_at, academic_cycle, academic_year, semester FROM timetables ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": f"db-{row[0]}", 
            "db_id": row[0], 
            "name": row[1], 
            "section": row[2], 
            "created_at": row[3],
            "academic_cycle": row[4],
            "academic_year": row[5],
            "semester": row[6]
        } 
        for row in rows
    ]

def get_timetable_by_id(db_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name, section, entries_json, academic_cycle, academic_year, semester FROM timetables WHERE id = ?", (db_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "name": row[0],
            "section": row[1],
            "data": json.loads(row[2]),
            "academic_cycle": row[3],
            "academic_year": row[4],
            "semester": row[5]
        }
    return None

def delete_timetable(db_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM timetables WHERE id = ?", (db_id,))
    conn.commit()
    conn.close()
