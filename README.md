# 🗓️ T.I.T.A.N. — Timetable Intelligent Technology & Agentic Negotiator

An advanced, AI-powered academic scheduling and conflict-free timetable generator built with **React**, **FastAPI**, and **PydanticAI** (powered by **Groq** and **Llama 3.3 70B**).

The application provides an agentic AI solution that analyzes academic constraints (faculty, subjects, timeslots, and days) and generates beautifully randomized, balanced, and complete multi-section timetables without conflicts or teacher overloads.

---

## 🚀 Key Features & Latest Enhancements

*   **Agentic AI Engine (Powered by PydanticAI)**: Leverages **Llama 3.3 (70B) via Groq** to intelligently negotiate scheduling conflicts and assign optimal faculty-to-subject combinations.
*   **Conflict & Overlap Resolution**: Strict validation to ensure no faculty is scheduled for multiple sections at the same day and timeslot (utilizing multi-section busy maps).
*   **Balanced Faculty Workloads**: Distributes hours evenly and respects workload caps across academic departments.
*   **🆕 Sleek Landing Page**: A gorgeous, interactive product landing page featuring an active, animated CSS laptop sandbox simulation demonstrating the agentic auto-solving algorithm.
*   **🆕 Simulation & Login Views**: Premium simulation modules including an administrative **Login Page** and **Settings Panel** for enterprise dashboard management.
*   **🆕 Modern Premium UI**: Fully responsive light-themed dashboard with Glassmorphism, micro-animations, real-time analytics, and dynamic timetable grids.
*   **Dynamic CSV Parsing**: Instantly parse and analyze timeslots, subjects, and teacher constraints from CSV uploads.
*   **🆕 Centralized Database Infrastructure**: Re-architected SQLite database path from nested backend folders to a unified, top-level `database/` directory for cleaner git isolation and automated database backups.

---

## 📂 Project Structure

```text
Timetable_Bot/
├── backend/                  # FastAPI & Agentic AI Backend
│   ├── agent/                # PydanticAI Agent configuration
│   ├── database/             # SQLite DB manager (configured for root database storage)
│   ├── models/               # Pydantic schemas for structured inputs/outputs
│   ├── main.py               # FastAPI router and server entrypoint
│   └── requirements.txt      # Python dependencies
├── database/                 # Centralized SQLite Storage (Ignored by Git)
│   └── timetable.db          # Main local relational database
├── frontend/                 # Vite + React Frontend
│   ├── src/                  # React components & UI logic
│   │   ├── components/       # Reusable UI views (Upload, Grid, Analytics, Sidebar...)
│   │   │   ├── LandingPage.jsx # 🆕 Sleek interactive product presentation
│   │   │   ├── LoginPage.jsx   # 🆕 Simulative portal authentication
│   │   │   ├── SettingsView.jsx# 🆕 Centralized UI and API preference panel
│   │   │   └── ...
│   │   └── App.jsx           # Main App entry and state management
│   ├── package.json          # Frontend dependencies and Vite scripts
│   └── vite.config.js        # Vite configuration
├── package.json              # Root package.json for orchestrating concurrently
└── .gitignore                # Comprehensive Git exclusions for build, env & caches
```

---

## 🛠| Quick Start

This project is fully orchestrated to run both the backend and frontend concurrently with a single command.

### 1. Prerequisites

Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Python](https://www.python.org/) (v3.10 or higher)
*   A **Groq API Key** (Get one for free at [console.groq.com](https://console.groq.com))

### 2. Installation

1.  **Clone this repository** (or navigate to your local folder).
2.  **Install dependencies** at the root level:
    ```bash
    npm install
    ```
3.  **Install Frontend dependencies**:
    ```bash
    cd frontend && npm install && cd ..
    ```
4.  **Set up Backend virtual environment & dependencies**:
    ```bash
    cd backend
    python -m venv venv
    
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    pip install -r requirements.txt
    cd ..
    ```

### 3. Environment Setup

Configure your Groq API Key:
1.  Copy the backend template file:
    ```bash
    cp backend/.env.example backend/.env
    ```
2.  Open `backend/.env` and paste your active **Groq API Key**:
    ```env
    GROQ_API_KEY="your-actual-groq-api-key"
    ```

### 4. Running the Application

To run both the **FastAPI Backend** (port `8000`) and the **Vite Frontend** (port `5173`) concurrently:

```bash
npm start
```

Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)** to start generating schedules!

---

## 🛠️ Technology Stack

*   **Frontend**: React, Vite, Tailwind CSS / Vanilla CSS, Lucide Icons, Recharts (Analytics)
*   **Backend**: FastAPI, Pydantic, Uvicorn, SQLite
*   **AI Framework**: PydanticAI
*   **LLM Model**: `llama-3.3-70b-versatile` via Groq Cloud

---

## 📤 Pushing to GitHub

To push your fully configured local repository to your remote GitHub repository:

1.  **Create a new, empty repository** on GitHub (do not initialize with README, license, or `.gitignore`).
2.  **Add the remote origin URL** to your local repository:
    ```bash
    git remote add origin https://github.com/SK4LEGENDS/T.I.T.A.N.git
    ```
3.  **Push the repository** to GitHub:
    ```bash
    git push -u origin main
    ```
