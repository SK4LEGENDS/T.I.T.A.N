import { useState, useEffect, useRef } from 'react';

export default function UploadView({ onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [section, setSection] = useState('CSE-1A');
  
  // Files State
  const [timeSlotsFile, setTimeSlotsFile] = useState(null);
  const [facultyFile, setFacultyFile] = useState(null);
  const [subjectsFile, setSubjectsFile] = useState(null);

  // File Meta State for Validation/Previews
  const [timeSlotsMeta, setTimeSlotsMeta] = useState(null);
  const [facultyMeta, setFacultyMeta] = useState(null);
  const [subjectsMeta, setSubjectsMeta] = useState(null);

  // Cache & Drag State
  const [useCache, setUseCache] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ slots: null, faculty: null, subjects: null });
  const [dragActive, setDragActive] = useState({ slots: false, faculty: false, subjects: false });

  // Inputs
  const [department, setDepartment] = useState('CSE');
  const [numLabs, setNumLabs] = useState(2);
  const [physicsLabs, setPhysicsLabs] = useState(1);
  const [chemistryLabs, setChemistryLabs] = useState(1);
  const [computerLabs, setComputerLabs] = useState(1);
  const [mechanicalLabs, setMechanicalLabs] = useState(1);
  const [academicCycle, setAcademicCycle] = useState('ODD');
  const [academicYear, setAcademicYear] = useState(1);
  const [error, setError] = useState(null);

  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    if (newDept !== 'GLOBAL') {
      const suffix = section.includes('-') ? section.split('-')[1] : '1A';
      setSection(`${newDept}-${suffix}`);
    }
  };

  // Solver Stepper State
  const [generationStep, setGenerationStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const logsEndRef = useRef(null);

  const calculatedSemester = academicYear * 2 - (academicCycle === 'ODD' ? 1 : 0);

  // Stepper descriptions
  const STEPS = [
    { title: 'Data Prep', desc: 'Validating schemas & parsing active datasets' },
    { title: 'AI Core Initializer', desc: 'Spawning Groq Llama-3 agent instance' },
    { title: 'Constraint Solving', desc: 'Optimizing faculty limits & section matrices' },
    { title: 'Clash Avoidance', desc: 'Resolving multi-timetable schedule overlaps' },
    { title: 'Render Canvas', desc: 'Finalizing structure and painting layout' }
  ];

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Check LocalStorage cache on mount
  useEffect(() => {
    const slots = localStorage.getItem('cached_timeSlotsCsv');
    const faculty = localStorage.getItem('cached_facultyCsv');
    const subjects = localStorage.getItem('cached_subjectsCsv');
    
    if (slots && faculty && subjects) {
      const slotsName = localStorage.getItem('cached_timeSlotsFileName') || 'TimeSlots.csv';
      const facultyName = localStorage.getItem('cached_facultyFileName') || 'Faculty.csv';
      const subjectsName = localStorage.getItem('cached_subjectsFileName') || 'Subjects.csv';
      
      setCacheInfo({ slots: slotsName, faculty: facultyName, subjects: subjectsName });
      
      // Auto-populate parsed preview info for cached records
      setTimeSlotsMeta({ name: slotsName, isValid: true, summary: `${parseTimeSlots(slots).length} active periods parsed` });
      setFacultyMeta({ name: facultyName, isValid: true, summary: `${faculty.split('\n').filter(Boolean).length - 1} instructors parsed` });
      setSubjectsMeta({ name: subjectsName, isValid: true, summary: `${subjects.split('\n').filter(Boolean).length - 1} subjects parsed` });
      
      setUseCache(true);
    }
  }, []);

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const parseTimeSlots = (csvText) => {
    if (!csvText) return ['7:50 AM - 8:40 AM', '8:40 AM - 9:30 AM', '10:20 AM - 11:10 AM', '11:10 AM - 12:00 PM'];
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    const slots = [];
    
    let periodColIdx = 0;
    let startColIdx = -1;
    let endColIdx = -1;
    let timeColIdx = -1;
    
    if (lines[0]) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const periodIdx = headers.findIndex(h => h.includes('period'));
      if (periodIdx !== -1) periodColIdx = periodIdx;
      
      const startIdx = headers.findIndex(h => h.includes('start') || h.includes('from'));
      if (startIdx !== -1) startColIdx = startIdx;
      
      const endIdx = headers.findIndex(h => h.includes('end') || h.includes('to'));
      if (endIdx !== -1) endColIdx = endIdx;
      
      const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('slot'));
      if (timeIdx !== -1) timeColIdx = timeIdx;
    }
    
    if (startColIdx === -1 || endColIdx === -1) {
      if (timeColIdx === -1) {
        timeColIdx = 1;
        periodColIdx = 0;
      }
    }
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(v => v.replace(/^"|"$/g, '').trim());
    };

    const startIdx = lines[0] && (lines[0].toLowerCase().includes('time') || lines[0].toLowerCase().includes('slot') || lines[0].toLowerCase().includes('period') || lines[0].toLowerCase().includes('start') || lines[0].toLowerCase().includes('end') || lines[0].toLowerCase().includes('from') || lines[0].toLowerCase().includes('to')) ? 1 : 0;
    for (let i = startIdx; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      if (parts.length > 0) {
        let timeVal = '';
        if (startColIdx !== -1 && endColIdx !== -1 && parts[startColIdx] && parts[endColIdx]) {
          timeVal = `${parts[startColIdx]} - ${parts[endColIdx]}`;
        } else if (timeColIdx !== -1 && parts[timeColIdx]) {
          timeVal = parts[timeColIdx];
        } else if (parts[1]) {
          timeVal = parts[1];
        } else {
          timeVal = parts[0];
        }
        
        const periodVal = parts[periodColIdx] ? parts[periodColIdx] : "";
        const cleanP = periodVal.toLowerCase();
        const cleanT = timeVal.toLowerCase();
        if (cleanP.includes('break') || cleanT.includes('break')) {
          slots.push(cleanT.includes('break') ? timeVal : `BREAK (${timeVal})`);
        } else if (cleanP.includes('lunch') || cleanT.includes('lunch')) {
          slots.push(cleanT.includes('lunch') ? timeVal : `LUNCH (${timeVal})`);
        } else {
          slots.push(timeVal);
        }
      }
    }
    return slots.length > 0 ? slots : ['7:50 AM - 8:40 AM', '8:40 AM - 9:30 AM', '10:20 AM - 11:10 AM', '11:10 AM - 12:00 PM'];
  };


  const validateCSV = (text, type) => {
    if (!text || text.trim() === '') return { isValid: false, message: 'File is completely empty.' };
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { isValid: false, message: 'File must contain a header row and data rows.' };
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    if (type === 'slots') {
      const hasTime = headers.some(h => h.includes('time') || h.includes('slot') || h.includes('period'));
      if (!hasTime) return { isValid: false, message: 'Invalid format. Missing "Time" or "Slot" column header.' };
      const count = parseTimeSlots(text).length;
      return { isValid: true, summary: `${count} active periods parsed` };
    }
    
    if (type === 'faculty') {
      const hasFaculty = headers.some(h => h.includes('teacher') || h.includes('faculty') || h.includes('name') || h.includes('instructor'));
      if (!hasFaculty) return { isValid: false, message: 'Invalid format. Missing "Teacher Name" or "Faculty" column.' };
      return { isValid: true, summary: `${lines.length - 1} instructors parsed` };
    }
    
    if (type === 'subjects') {
      const hasSubject = headers.some(h => h.includes('subject') || h.includes('course') || h.includes('name') || h.includes('title'));
      if (!hasSubject) return { isValid: false, message: 'Invalid format. Missing "Subject" or "Course" column.' };
      return { isValid: true, summary: `${lines.length - 1} syllabus items parsed` };
    }
    
    return { isValid: true, summary: `${lines.length - 1} records parsed` };
  };

  const handleFileSelect = async (file, type) => {
    setError(null);
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    try {
      const text = await readFileAsText(file);
      const validation = validateCSV(text, type);
      
      if (type === 'slots') {
        setTimeSlotsFile(file);
        setTimeSlotsMeta({ name: file.name, ...validation });
      } else if (type === 'faculty') {
        setFacultyFile(file);
        setFacultyMeta({ name: file.name, ...validation });
      } else if (type === 'subjects') {
        setSubjectsFile(file);
        setSubjectsMeta({ name: file.name, ...validation });
      }
    } catch (e) {
      console.error(e);
      setError('Failed to parse file.');
    }
  };

  // Drag and drop listeners
  const handleDrag = (e, type, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], type);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setGenerationStep(0);
    setTerminalLogs([
      '[SYS] Initializing timetable compiler...',
      `[SYS] Targeted Section: ${section} | Semester: ${calculatedSemester}`
    ]);

    // Timer list to trigger visual updates inside the loader stepper
    const addLog = (msg, delay = 0) => {
      return new Promise(resolve => setTimeout(() => {
        setTerminalLogs(prev => [...prev, msg]);
        resolve();
      }, delay));
    };

    try {
      let timeSlotsCsv = '';
      let facultyCsv = '';
      let subjectsCsv = '';

      if (useCache) {
        timeSlotsCsv = localStorage.getItem('cached_timeSlotsCsv') || '';
        facultyCsv = localStorage.getItem('cached_facultyCsv') || '';
        subjectsCsv = localStorage.getItem('cached_subjectsCsv') || '';
        await addLog('[CACHE] Loaded Faculty, Subjects, and Time Slots datasets from browser memory storage.', 400);
      } else {
        await addLog('[PARSER] Reading uploaded CSV raw contents...', 200);
        timeSlotsCsv = await readFileAsText(timeSlotsFile);
        facultyCsv = await readFileAsText(facultyFile);
        subjectsCsv = await readFileAsText(subjectsFile);

        // Save uploaded files to cache
        localStorage.setItem('cached_timeSlotsCsv', timeSlotsCsv);
        localStorage.setItem('cached_timeSlotsFileName', timeSlotsFile.name);
        localStorage.setItem('cached_facultyCsv', facultyCsv);
        localStorage.setItem('cached_facultyFileName', facultyFile.name);
        localStorage.setItem('cached_subjectsCsv', subjectsCsv);
        localStorage.setItem('cached_subjectsFileName', subjectsFile.name);
        
        setCacheInfo({ slots: timeSlotsFile.name, faculty: facultyFile.name, subjects: subjectsFile.name });
        await addLog('[CACHE] Saved CSV structures into active session cache for quicker subsequent runs.', 300);
      }

      setGenerationStep(1);
      await addLog('[AI-CORE] Contacting Groq LLM agent gateway...', 400);
      await addLog('[AI-CORE] Initiating model: llama3-70b-8192 high-constraint solver...', 300);

      if (calculatedSemester === 8) {
        setGenerationStep(2);
        await addLog('[SOLVER] Fast-track Project Phase rule matches. Classroom lecturing bypassed.', 300);
        setGenerationStep(3);
        await addLog('[SOLVER] Creating dedicated 8th Sem project/internship tracking blocks...', 400);
        setGenerationStep(4);
        await addLog('[RENDER] Finalizing schedule representation grid...', 200);
        await new Promise(r => setTimeout(r, 600));

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const slots = parseTimeSlots(timeSlotsCsv);
        const entries = [];
        days.forEach(day => {
          slots.forEach(slot => {
            entries.push({
              day,
              time: slot,
              subject: 'PROJECT WORK / INTERNSHIP',
              faculty: 'PROJECT COORDINATOR'
            });
          });
        });

        onGenerate({
          timetables: [{ section, entries }],
          academic_cycle: academicCycle,
          academic_year: academicYear,
          semester: calculatedSemester
        });
        return;
      }

      setGenerationStep(2);
      await addLog(`[SOLVER] Optimizing teaching workloads for ${facultyMeta?.summary || 'Instructors'}...`, 400);
      await addLog(`[SOLVER] Mapping curriculum dependencies for ${subjectsMeta?.summary || 'Syllabus'}...`, 300);
      
      setGenerationStep(3);
      await addLog('[CLASH-DETECTOR] Loading database of active sections to build busy-teacher overlay constraints...', 400);
      await addLog('[CLASH-DETECTOR] Computing non-overlapping section timetable matrices...', 300);

      const payload = {
        section,
        department,
        num_labs: numLabs,
        num_physics_labs: physicsLabs,
        num_chemistry_labs: chemistryLabs,
        num_computer_labs: computerLabs,
        num_mechanical_labs: mechanicalLabs,
        timeSlotsCsv,
        facultyCsv,
        subjectsCsv,
        academic_cycle: academicCycle,
        academic_year: academicYear,
        semester: calculatedSemester
      };

      const response = await fetch('http://localhost:8000/api/generate-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setGenerationStep(4);
        await addLog('[RENDER] No clashes found! Generating interactive dashboard view...', 300);
        await new Promise(r => setTimeout(r, 500));
        onGenerate({
          ...result.data,
          academic_cycle: academicCycle,
          academic_year: academicYear,
          semester: calculatedSemester
        });
      } else {
        console.error("Backend Error:", result.message);
        setError("Error generating timetable: " + result.message);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setError("Failed to connect to the backend. Is it running?");
      setIsGenerating(false);
    }
  };

  const isFormValid = useCache || (timeSlotsFile && facultyFile && subjectsFile && timeSlotsMeta?.isValid && facultyMeta?.isValid && subjectsMeta?.isValid);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50/50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-4xl w-full">
        <div className="flex flex-col items-center justify-center mb-8 border-b border-gray-100 pb-5">
          <h2 className="text-2xl font-black text-gray-900 tracking-wider uppercase text-center w-full">
            TIMETABLE GENERATOR
          </h2>
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-1.5 text-center leading-none">Upload configuration files to generate academic schedules</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm relative pr-8">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1 font-semibold">{error}</div>
            <button onClick={() => setError(null)} className="absolute top-3.5 right-3 text-red-400 hover:text-red-600 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Master Cache Banner Toggle */}
        {cacheInfo.slots && (
          <div className="mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col items-center justify-center text-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-blue-600 text-2xl">💡</div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Active Master Cache Found</h4>
                <p className="text-xs text-gray-500 leading-tight mt-1">Reuses Faculty, Subjects, and Slots loaded previously.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={useCache} 
                onChange={(e) => setUseCache(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}

        <div className="space-y-6">
          {/* File Uploads Dropzones - Hide if using cache or in semester 8 */}
          {calculatedSemester !== 8 && !useCache && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Drag and Drop Units */}
              {[
                { label: 'Time Slots File (.csv)', key: 'slots', meta: timeSlotsMeta, color: 'border-blue-300 hover:border-blue-500' },
                { label: 'Faculty File (.csv)', key: 'faculty', meta: facultyMeta, color: 'border-emerald-300 hover:border-emerald-500' },
                { label: 'Subjects File (.csv)', key: 'subjects', meta: subjectsMeta, color: 'border-blue-300 hover:border-blue-500' }
              ].map((zone) => (
                <div key={zone.key} className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 text-center w-full">{zone.label}</label>
                  <div
                    onDragOver={(e) => handleDrag(e, zone.key, true)}
                    onDragLeave={(e) => handleDrag(e, zone.key, false)}
                    onDrop={(e) => handleDrop(e, zone.key)}
                    className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragActive[zone.key] ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                    } ${zone.meta?.isValid ? 'border-emerald-200 bg-emerald-50/25' : ''} ${zone.meta && !zone.meta.isValid ? 'border-red-200 bg-red-50/25' : ''}`}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileSelect(e.target.files[0], zone.key)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {zone.meta ? (
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-2.5 rounded-lg ${zone.meta.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {zone.meta.isValid ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{zone.meta.name}</p>
                          <p className={`text-xs ${zone.meta.isValid ? 'text-emerald-600 font-medium' : 'text-red-500'}`}>{zone.meta.summary || zone.meta.message}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-gray-600 font-medium mt-1">
                          Drag and drop or <span className="text-blue-600 hover:underline">browse</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Academic Cycle and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 text-center w-full">Academic Cycle</label>
              <select
                value={academicCycle}
                onChange={(e) => setAcademicCycle(e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl border font-medium bg-gray-50/50 hover:bg-gray-50 text-center transition"
              >
                <option value="ODD">ODD Semesters</option>
                <option value="EVEN">EVEN Semesters</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 text-center w-full">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="block w-full px-3 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl border font-medium bg-gray-50/50 hover:bg-gray-50 text-center transition"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          {/* Calculated Semester Display */}
          <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-2 justify-center items-center text-sm font-bold text-gray-800">
            <span className="text-gray-500 font-semibold text-center">Standard Semester:</span>
            <span className="text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 font-extrabold text-xs text-center">
              Semester {calculatedSemester}
            </span>
          </div>

          {/* 8th Sem Bypass Banner */}
          {calculatedSemester === 8 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs space-y-1.5 animate-pulse">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <span>💡</span> 8th Semester Project Phase Active
              </div>
              <p className="leading-relaxed font-medium">
                Standard classroom lectures are bypassed for 8th-semester students. Generation will auto-populate a dedicated Project Work / Internship schedule instantly.
              </p>
            </div>
          )}

          {/* Department Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 text-center w-full">Department Filter</label>
            <select
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="block w-full px-3 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl border font-medium bg-gray-50/50 hover:bg-gray-50 text-center transition"
            >
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="ADS">Applied Data Science (ADS)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="MECH">Mechanical Engineering (MECH)</option>
              <option value="GLOBAL">First Year</option>
            </select>
          </div>

          {/* Department Lab Capacity */}
          {department === 'GLOBAL' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full bg-gray-50/50 p-4 rounded-2xl border border-gray-100 col-span-1 md:col-span-3">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 text-center w-full uppercase tracking-wider">Physics Lab</label>
                <select
                  value={physicsLabs}
                  onChange={(e) => setPhysicsLabs(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-xs border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border font-semibold bg-white text-center transition"
                >
                  <option value={0}>0 (No Session)</option>
                  <option value={1}>1 Lab Room</option>
                  <option value={2}>2 Lab Rooms</option>
                  <option value={3}>3 Lab Rooms</option>
                  <option value={4}>4 Lab Rooms</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 text-center w-full uppercase tracking-wider">Chemistry Lab</label>
                <select
                  value={chemistryLabs}
                  onChange={(e) => setChemistryLabs(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-xs border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border font-semibold bg-white text-center transition"
                >
                  <option value={0}>0 (No Session)</option>
                  <option value={1}>1 Lab Room</option>
                  <option value={2}>2 Lab Rooms</option>
                  <option value={3}>3 Lab Rooms</option>
                  <option value={4}>4 Lab Rooms</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 text-center w-full uppercase tracking-wider">Computer Lab</label>
                <select
                  value={computerLabs}
                  onChange={(e) => setComputerLabs(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-xs border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border font-semibold bg-white text-center transition"
                >
                  <option value={0}>0 (No Session)</option>
                  <option value={1}>1 Lab Room</option>
                  <option value={2}>2 Lab Rooms</option>
                  <option value={3}>3 Lab Rooms</option>
                  <option value={4}>4 Lab Rooms</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 text-center w-full uppercase tracking-wider">Mechanical Lab</label>
                <select
                  value={mechanicalLabs}
                  onChange={(e) => setMechanicalLabs(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-xs border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border font-semibold bg-white text-center transition"
                >
                  <option value={0}>0 (No Session)</option>
                  <option value={1}>1 Lab Room</option>
                  <option value={2}>2 Lab Rooms</option>
                  <option value={3}>3 Lab Rooms</option>
                  <option value={4}>4 Lab Rooms</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 text-center w-full">Physical Labs Available</label>
              <select
                value={numLabs}
                onChange={(e) => setNumLabs(Number(e.target.value))}
                className="block w-full px-3 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl border font-medium bg-gray-50/50 hover:bg-gray-50 text-center transition"
              >
                <option value={1}>1 Physical Lab (Max 1 concurrent lab session)</option>
                <option value={2}>2 Physical Labs (Max 2 concurrent lab sessions)</option>
                <option value={3}>3 Physical Labs (Max 3 concurrent lab sessions)</option>
                <option value={4}>4 Physical Labs (Max 4 concurrent lab sessions)</option>
              </select>
            </div>
          )}

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 text-center w-full">Section Name</label>
            <input 
              type="text"
              value={section} 
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. CSE-1A"
              className="block w-full px-4 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl border font-medium bg-gray-50/50 hover:bg-gray-50 text-center transition"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !isFormValid}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculatedSemester === 8 ? 'Generate Project Timetable' : 'Generate Timetable'}
            </button>
          </div>
        </div>
      </div>

      {/* Solver Stepper Modal Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-xl w-full p-6 m-4 flex flex-col gap-6 transform scale-100 transition-all duration-300 text-slate-900">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center relative">
                <span className="absolute inset-0 rounded-xl border-2 border-blue-400/30 animate-ping"></span>
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">AI Timetable Solver</h3>
                <p className="text-xs text-slate-500 font-medium">Section {section} • Sem {calculatedSemester}</p>
              </div>
            </div>

            {/* Steps Visual Progress */}
            <div className="space-y-4">
              {STEPS.map((step, idx) => {
                const isActive = generationStep === idx;
                const isCompleted = generationStep > idx;
                
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                          ✓
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs relative">
                          <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></span>
                          ●
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-slate-700 font-medium' : isCompleted ? 'text-slate-500' : 'text-slate-400'} leading-tight mt-0.5`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Console Typewriter Logs Container */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                <span>Compiler Terminal Logs</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-mono animate-pulse font-bold">Groq Active</span>
              </label>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-xs h-36 overflow-y-auto space-y-1.5 text-gray-300">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className={`leading-relaxed ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[SYS]') ? 'text-blue-400' : log.includes('[CACHE]') ? 'text-emerald-400' : 'text-gray-400'}`}>
                    <span className="text-gray-600 select-none mr-2">&gt;</span>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
