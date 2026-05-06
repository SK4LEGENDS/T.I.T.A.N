import { useState } from 'react';

export default function UploadView({ onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [section, setSection] = useState('CSE-1A');
  const [timeSlotsFile, setTimeSlotsFile] = useState(null);
  const [facultyFile, setFacultyFile] = useState(null);
  const [subjectsFile, setSubjectsFile] = useState(null);
  const [academicCycle, setAcademicCycle] = useState('ODD');
  const [academicYear, setAcademicYear] = useState(1);
  const [error, setError] = useState(null);

  const calculatedSemester = academicYear * 2 - (academicCycle === 'ODD' ? 1 : 0);

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
    const startIdx = lines[0] && lines[0].toLowerCase().includes('time') ? 1 : 0;
    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts[0]) slots.push(parts[0].trim());
    }
    return slots.length > 0 ? slots : ['7:50 AM - 8:40 AM', '8:40 AM - 9:30 AM', '10:20 AM - 11:10 AM', '11:10 AM - 12:00 PM'];
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const timeSlotsCsv = await readFileAsText(timeSlotsFile);
      const facultyCsv = await readFileAsText(facultyFile);
      const subjectsCsv = await readFileAsText(subjectsFile);

      if (calculatedSemester === 8) {
        // Fast-track Project bypass simulation for instant premium experience
        await new Promise(r => setTimeout(r, 1200));
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
          timetables: [{
            section,
            entries
          }],
          academic_cycle: academicCycle,
          academic_year: academicYear,
          semester: calculatedSemester
        });
        return;
      }

      const payload = {
        section,
        timeSlotsCsv,
        facultyCsv,
        subjectsCsv,
        academic_cycle: academicCycle,
        academic_year: academicYear,
        semester: calculatedSemester
      };

      const response = await fetch('http://localhost:8000/api/generate-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
         onGenerate({
           ...result.data,
           academic_cycle: academicCycle,
           academic_year: academicYear,
           semester: calculatedSemester
         });
      } else {
         console.error("Backend Error:", result.message);
         setError("Error generating timetable: " + result.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setError("Failed to connect to the backend. Is it running?");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Setup Timetable</h2>
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm relative pr-8">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1 font-medium">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="space-y-5">
          {/* File Uploads - hide if semester 8 */}
          {calculatedSemester !== 8 && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Time Slots File (.csv)</label>
                <input type="file" accept=".csv" onChange={(e) => setTimeSlotsFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Faculty File (.csv)</label>
                <input type="file" accept=".csv" onChange={(e) => setFacultyFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subjects File (.csv)</label>
                <input type="file" accept=".csv" onChange={(e) => setSubjectsFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
              </div>
            </>
          )}

          {/* Academic Cycle and Year */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Academic Cycle</label>
              <select
                value={academicCycle}
                onChange={(e) => setAcademicCycle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md border"
              >
                <option value="ODD">ODD Semesters</option>
                <option value="EVEN">EVEN Semesters</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md border"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          {/* Calculated Semester Display */}
          <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 flex justify-between items-center text-sm font-medium">
            <span className="text-gray-500 font-normal">Standard Semester:</span>
            <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-semibold">
              Semester {calculatedSemester}
            </span>
          </div>

          {/* 8th Sem Bypass Banner */}
          {calculatedSemester === 8 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-xs space-y-1.5 animate-pulse">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <span>💡</span> 8th Semester Project Phase Active
              </div>
              <p className="leading-relaxed">
                Standard classroom lectures are bypassed for 8th-semester students. Generation will auto-populate a dedicated Project Work / Internship schedule instantly.
              </p>
            </div>
          )}

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Section Name</label>
            <input 
              type="text"
              value={section} 
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. CSE-1A"
              className="mt-1 block w-full px-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md border"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (calculatedSemester !== 8 && (!timeSlotsFile || !facultyFile || !subjectsFile))}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                calculatedSemester === 8 ? 'Generate Project Timetable' : 'Generate Timetable'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
