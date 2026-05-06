import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import TimetableGrid from './TimetableGrid';
import FacultyDashboard from './FacultyDashboard';

export default function TimetableView({ currentLab, generatedData }) {
  const [section, setSection] = useState('CSE-1A');
  const [timetableData, setTimetableData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [academicCycle, setAcademicCycle] = useState('ODD');
  const [academicYear, setAcademicYear] = useState(1);
  const [semester, setSemester] = useState(1);

  // We extract sections dynamically from the timetableData if available
  const sections = Object.keys(timetableData).length > 0 
    ? Object.keys(timetableData) 
    : [];

  const [timeSlots, setTimeSlots] = useState(["9-10", "10-11", "11-12", "1-2", "2-3"]);
  const [days, setDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'prompt', // 'prompt', 'alert'
    title: '',
    message: '',
    defaultValue: '',
    onConfirm: null,
  });

  // Use the generated data from the AI backend
  useEffect(() => {
    setIsLoading(true);
    if (generatedData && generatedData.timetables) {
      const formattedData = {};
      const uniqueDays = new Set();
      const uniqueTimes = new Set();

      if (generatedData.academic_cycle) setAcademicCycle(generatedData.academic_cycle);
      if (generatedData.academic_year) setAcademicYear(generatedData.academic_year);
      if (generatedData.semester) setSemester(generatedData.semester);

      generatedData.timetables.forEach(t => {
        formattedData[t.section] = t.entries;
        t.entries.forEach(entry => {
          uniqueDays.add(entry.day);
          uniqueTimes.add(entry.time);
        });
      });
      setTimetableData(formattedData);

      if (uniqueDays.size > 0) {
        const dayOrder = { "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6, "sunday": 7, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6, "sun": 7 };
        setDays(Array.from(uniqueDays).sort((a, b) => (dayOrder[a.toLowerCase()] || 99) - (dayOrder[b.toLowerCase()] || 99)));
      }
      
      if (uniqueTimes.size > 0) {
        setTimeSlots(Array.from(uniqueTimes).sort((a, b) => {
           const parseTime = (t) => {
             const match = t.match(/(\d+)(?::(\d+))?\s*(AM|PM|am|pm)?/i);
             if (!match) return 0;
             let hour = parseInt(match[1]);
             let mins = parseInt(match[2] || '0');
             const ampm = match[3] ? match[3].toUpperCase() : null;
             if (ampm === 'PM' && hour !== 12) hour += 12;
             if (ampm === 'AM' && hour === 12) hour = 0;
             if (!ampm && hour < 8) hour += 12; // fallback for "1-2"
             return hour * 60 + mins;
           };
           return parseTime(a) - parseTime(b);
        }));
      }
      
      if (generatedData.timetables.length > 0) {
        setSection(generatedData.timetables[0].section);
      }
      setIsLoading(false);
    } else {
      setTimetableData({});
      setIsLoading(false);
    }
  }, [generatedData, currentLab]);

  const handleSave = () => {
    setModal({
      isOpen: true,
      type: 'prompt',
      title: 'Save Timetable',
      message: 'Enter a custom name for this timetable:',
      defaultValue: currentLab?.name || `Timetable - ${section}`,
      onConfirm: async (timetableName) => {
        if (!timetableName) return;
        try {
          const savedPayload = {
            timetables: Object.entries(timetableData).map(([sec, entries]) => ({
              section: sec,
              entries: entries
            }))
          };

          const response = await fetch('http://localhost:8000/api/save-timetable', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: timetableName,
              section: section,
              data: savedPayload,
              academic_cycle: academicCycle,
              academic_year: academicYear,
              semester: semester
            })
          });
          const result = await response.json();
          if (result.status === 'success') {
            setModal({
              isOpen: true,
              type: 'alert',
              title: 'Success',
              message: 'Timetable saved to database successfully!',
              onConfirm: () => {
                if (window.location) window.location.reload();
              }
            });
          } else {
            setModal({
              isOpen: true,
              type: 'alert',
              title: 'Error',
              message: 'Failed to save timetable: ' + result.message
            });
          }
        } catch (e) {
          console.error(e);
          setModal({
            isOpen: true,
            type: 'alert',
            title: 'Connection Error',
            message: 'Failed to connect to backend to save timetable.'
          });
        }
      }
    });
  };

  const handleExport = () => {
    console.log("Export triggered for section:", section);
    const data = timetableData[section] || [];

    // Dynamically identify break columns exactly like TimetableGrid.jsx does
    const getEntry = (day, time) => {
      return data.find(entry => entry.day === day && entry.time === time);
    };

    const breakColumns = new Set(timeSlots.filter(time => {
      let hasBreak = false;
      for (const d of days) {
        const entry = getEntry(d, time);
        if (entry) {
          const subj = entry.subject.toLowerCase();
          if (subj.includes('break') || subj.includes('lunch')) {
            hasBreak = true;
          } else {
            return false;
          }
        }
      }
      return hasBreak;
    }));

    // Construct the spreadsheet rows (Array of Arrays)
    const rows = [];

    // Row 0: Title row
    const titleVal = `${section.toUpperCase()} TIMETABLE`;
    const titleRow = [titleVal];
    for (let i = 0; i < timeSlots.length; i++) titleRow.push('');
    rows.push(titleRow);

    // Row 1: Blank Row
    rows.push(Array(timeSlots.length + 1).fill(''));

    // Row 2: Headers
    const headers = ['Day / Time', ...timeSlots];
    rows.push(headers);

    // Row 3 onwards: Days data
    days.forEach(day => {
      const row = [day];
      timeSlots.forEach(time => {
        const isBreakCol = breakColumns.has(time);
        if (isBreakCol) {
          // If it is a break column, only write the subject for the first day (Monday)
          // because the cells will be merged vertically!
          if (day === days[0]) {
            const breakEntry = data.find(e => e.time === time);
            row.push(breakEntry ? breakEntry.subject.toUpperCase() : 'BREAK');
          } else {
            row.push('');
          }
        } else {
          const entry = getEntry(day, time);
          if (entry) {
            row.push(`${entry.subject}\n(${entry.faculty})`);
          } else {
            row.push('');
          }
        }
      });
      rows.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Configure column widths
    worksheet['!cols'] = [
      { wch: 14 }, // 'Day' column
      ...timeSlots.map(time => {
        const isBreakCol = breakColumns.has(time);
        return { wch: isBreakCol ? 10 : 24 }; // Break columns are narrower, class columns are wider
      })
    ];

    // Configure row heights
    worksheet['!rows'] = [
      { hpt: 35 }, // Row 0: Title
      { hpt: 12 }, // Row 1: Spacing blank
      { hpt: 25 }, // Row 2: Headers
      ...days.map(() => ({ hpt: 45 })) // Row 3 onwards: Class timeslots are tall to fit wrap text
    ];

    // Configure merged ranges
    const merges = [];
    
    // 1. Merge Title Row across all columns
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: timeSlots.length } });

    // 2. Merge Break Columns vertically across all days
    timeSlots.forEach((time, colIdx) => {
      if (breakColumns.has(time)) {
        merges.push({
          s: { r: 3, c: colIdx + 1 }, // colIdx + 1 because col 0 is 'Day'
          e: { r: 2 + days.length, c: colIdx + 1 }
        });
      }
    });

    worksheet['!merges'] = merges;

    // Apply alignment & text wrap to every cell
    Object.keys(worksheet).forEach(cellRef => {
      if (cellRef.startsWith('!')) return;
      const cell = worksheet[cellRef];
      if (!cell.s) cell.s = {};
      cell.s.alignment = {
        wrapText: true,
        vertical: 'center',
        horizontal: 'center'
      };
    });

    // Configure print settings to render perfectly as landscape A4 with gridlines enabled
    worksheet['!pageSetup'] = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1
    };

    worksheet['!views'] = [
      { showGridLines: true }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, section);
    XLSX.writeFile(workbook, `${section}_Timetable.xlsx`);
  };

  const updateEntry = (day, time, newSubject, newFaculty) => {
    setTimetableData(prev => {
      const sectionData = [...(prev[section] || [])];
      const existingIndex = sectionData.findIndex(e => e.day === day && e.time === time);
      
      if (newSubject || newFaculty) {
        const newEntry = { day, time, subject: newSubject, faculty: newFaculty };
        if (existingIndex >= 0) {
          sectionData[existingIndex] = newEntry;
        } else {
          sectionData.push(newEntry);
        }
      } else {
        if (existingIndex >= 0) {
          sectionData.splice(existingIndex, 1);
        }
      }
      return { ...prev, [section]: sectionData };
    });
  };

  const updateDay = (oldDay, newDay) => {
    if (oldDay === newDay || !newDay.trim()) return;
    setDays(prev => prev.map(d => d === oldDay ? newDay.trim() : d));
    setTimetableData(prev => {
      const newData = { ...prev };
      for (const sec in newData) {
        newData[sec] = newData[sec].map(entry => 
          entry.day === oldDay ? { ...entry, day: newDay.trim() } : entry
        );
      }
      return newData;
    });
  };

  const updateTimeSlot = (oldTime, newTime) => {
    if (oldTime === newTime || !newTime.trim()) return;
    setTimeSlots(prev => prev.map(t => t === oldTime ? newTime.trim() : t));
    setTimetableData(prev => {
      const newData = { ...prev };
      for (const sec in newData) {
        newData[sec] = newData[sec].map(entry => 
          entry.time === oldTime ? { ...entry, time: newTime.trim() } : entry
        );
      }
      return newData;
    });
  };

  const currentSectionData = timetableData[section] || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900">{currentLab?.name || 'Timetable Viewer'}</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">View Section:</label>
            <select 
              value={section} 
              onChange={(e) => setSection(e.target.value)}
              className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save to Database
          </button>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export as Excel
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-500 font-medium">Loading timetable...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <TimetableGrid 
            data={currentSectionData} 
            timeSlots={timeSlots} 
            days={days} 
            onUpdateEntry={updateEntry}
            onUpdateDay={updateDay}
            onUpdateTimeSlot={updateTimeSlot}
          />
          <FacultyDashboard data={currentSectionData} />
        </div>
      )}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 m-4 transform scale-100 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${modal.type === 'alert' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                {modal.type === 'alert' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{modal.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{modal.message}</p>
                {modal.type === 'prompt' && (
                  <input
                    type="text"
                    id="modal-prompt-input"
                    defaultValue={modal.defaultValue}
                    className="mt-3 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-900"
                    placeholder="Enter name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.target.value;
                        setModal({ ...modal, isOpen: false });
                        if (modal.onConfirm) modal.onConfirm(val);
                      }
                    }}
                  />
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {modal.type === 'prompt' && (
                <button
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  const val = modal.type === 'prompt' ? document.getElementById('modal-prompt-input')?.value : null;
                  setModal({ ...modal, isOpen: false });
                  if (modal.onConfirm) modal.onConfirm(val || modal.defaultValue);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                {modal.type === 'prompt' ? 'Save' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
