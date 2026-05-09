import { useState } from 'react';

export default function TimetableGrid({ data, timeSlots, days, onUpdateEntry, onUpdateDay, onUpdateTimeSlot }) {
  const [editingCell, setEditingCell] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editFaculty, setEditFaculty] = useState("");

  const [editingHeader, setEditingHeader] = useState(null); // { type: 'day'|'time', oldValue: string }
  const [editHeaderValue, setEditHeaderValue] = useState("");

  const getEntry = (day, time) => {
    if (!time) return undefined;
    const isLunchTime = time.toLowerCase().includes('lunch');
    const isBreakTime = time.toLowerCase().includes('break');
    
    return data.find(entry => {
      if (!entry || !entry.day || !entry.time) return false;
      if (entry.day.toLowerCase() !== day.toLowerCase()) return false;
      
      const entryTime = entry.time.toLowerCase();
      const entrySubj = (entry.subject || '').toLowerCase();
      
      if (isLunchTime) {
        return entryTime.includes('lunch') || entrySubj.includes('lunch');
      }
      if (isBreakTime) {
        return entryTime.includes('break') || entrySubj.includes('break');
      }
      
      const normalize = (t) => {
        if (!t) return '';
        return t.toLowerCase().replace(/(am|pm)/g, '').replace(/[\s-().:]/g, '');
      };
      return normalize(entry.time) === normalize(time);
    });
  };


  const breakColumns = new Set(timeSlots.filter(time => {
    const timeLower = time.toLowerCase();
    // If the timeslot header itself contains 'break' or 'lunch', it's always a break column
    if (timeLower.includes('break') || timeLower.includes('lunch')) return true;
    
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

  const handleEditClick = (day, time, entry) => {
    setEditingCell(`${day}-${time}`);
    setEditSubject(entry ? entry.subject : "");
    setEditFaculty(entry ? entry.faculty : "");
    setEditingHeader(null);
  };

  const handleSave = (day, time) => {
    if (onUpdateEntry) {
      onUpdateEntry(day, time, editSubject.trim(), editFaculty.trim());
    }
    setEditingCell(null);
  };

  const handleCancel = () => {
    setEditingCell(null);
  };

  const handleHeaderEditClick = (type, value) => {
    setEditingHeader({ type, oldValue: value });
    setEditHeaderValue(value);
    setEditingCell(null);
  };

  const handleHeaderSave = () => {
    if (editingHeader.type === 'day' && onUpdateDay) {
      onUpdateDay(editingHeader.oldValue, editHeaderValue);
    } else if (editingHeader.type === 'time' && onUpdateTimeSlot) {
      onUpdateTimeSlot(editingHeader.oldValue, editHeaderValue);
    }
    setEditingHeader(null);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
              Day / Time
            </th>
            {timeSlots.map(time => {
              const isEditing = editingHeader?.type === 'time' && editingHeader?.oldValue === time;
              const isBreakCol = breakColumns.has(time);
              return (
                <th 
                  key={time} 
                  className={`py-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-0 ${
                    isBreakCol ? 'px-4 text-center whitespace-nowrap w-auto' : 'px-6 text-left min-w-[200px]'
                  } ${!isEditing ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => { if (!isEditing) handleHeaderEditClick('time', time); }}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editHeaderValue}
                        onChange={e => setEditHeaderValue(e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1"
                        autoFocus
                      />
                      <button onClick={handleHeaderSave} className="text-blue-600 hover:text-blue-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button onClick={() => setEditingHeader(null)} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : time}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {days.map((day, dayIndex) => {
            const isEditingDay = editingHeader?.type === 'day' && editingHeader?.oldValue === day;
            return (
              <tr key={day} className="hover:bg-gray-50 transition-colors">
                <td 
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-gray-50/50 ${!isEditingDay ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => { if (!isEditingDay) handleHeaderEditClick('day', day); }}
                >
                  {isEditingDay ? (
                    <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editHeaderValue}
                        onChange={e => setEditHeaderValue(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={handleHeaderSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 rounded">Save</button>
                        <button onClick={() => setEditingHeader(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium py-1 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : day}
                </td>
                {timeSlots.map(time => {
                  const isBreakCol = breakColumns.has(time);
                  if (isBreakCol && dayIndex > 0) return null;

                  const entry = getEntry(day, time);
                  const isEditing = editingCell === `${day}-${time}`;

                  if (isBreakCol && dayIndex === 0) {
                     const breakName = days.map(d => getEntry(d, time)).find(e => e)?.subject || 'BREAK';
                     return (
                        <td 
                          key={`break-${time}`} 
                          rowSpan={days.length} 
                          className="px-2 py-3 align-middle border-r border-gray-200 bg-gray-50/80 text-center"
                        >
                          <div className="flex items-center justify-center h-full min-h-[16rem]">
                            <span 
                              className="font-extrabold text-gray-400 tracking-[1.5em] uppercase text-xl" 
                              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                              {breakName}
                            </span>
                          </div>
                        </td>
                     );
                  }

                  return (
                    <td 
                      key={`${day}-${time}`} 
                      className={`px-4 py-3 align-top border-r border-gray-200 last:border-0 transition-all ${
                        isEditing ? 'bg-blue-50/30' : entry ? 'bg-blue-50/50 hover:bg-blue-100/50 cursor-pointer' : 'hover:bg-gray-100/50 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isEditing) handleEditClick(day, time, entry);
                      }}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                          <input 
                            type="text" 
                            placeholder="Subject"
                            value={editSubject}
                            onChange={e => setEditSubject(e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5"
                            autoFocus
                          />
                          <input 
                            type="text" 
                            placeholder="Faculty"
                            value={editFaculty}
                            onChange={e => setEditFaculty(e.target.value)}
                            className="w-full text-xs text-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5"
                          />
                          <div className="flex gap-2 mt-1">
                            <button 
                              onClick={() => handleSave(day, time)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 rounded transition-colors"
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleCancel}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium py-1 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : entry ? (
                        <div className="flex flex-col h-full min-h-[3rem]">
                          <span className="font-bold text-gray-800">{entry.subject}</span>
                          <span className="text-xs text-gray-500 mt-1">{entry.faculty}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[3rem] text-transparent hover:text-gray-400 transition-colors">
                          <span className="text-sm">+ Add</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
