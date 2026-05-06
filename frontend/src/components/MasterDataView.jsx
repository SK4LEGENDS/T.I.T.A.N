import { useState, useEffect } from 'react';

export default function MasterDataView({ initialTab = 'faculty' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab); // 'faculty' or 'subjects'
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState({ faculties: [], subjects: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/analytics/summary');
        const result = await response.json();
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (e) {
        console.error("Failed to load master data summary", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const filteredFaculties = data.faculties.filter(fac =>
    fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fac.subjects.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSubjects = data.subjects.filter(subj =>
    subj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subj.faculties.some(fac => fac.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/30 text-slate-900 p-8 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-xs font-semibold uppercase tracking-wider text-blue-800 border border-blue-200/50">
            {activeSubTab === 'faculty' ? '👥 Faculty Database' : '📚 Course Syllabus'}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {activeSubTab === 'faculty' ? 'Faculty Directory' : 'Subject Syllabus'}
          </h2>
          <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
            {activeSubTab === 'faculty' 
              ? 'Manage, search, and audit your academic teacher directory, weekly hours tracking, and assigned sections.'
              : 'Manage, search, and audit core syllabus credits, departments, and assigned instructors.'}
          </p>
        </div>
      </div>

      {/* Search Controls & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center text-sm font-semibold text-slate-500 px-2">
          <span>
            Showing {activeSubTab === 'faculty' ? filteredFaculties.length : filteredSubjects.length} verified records
          </span>
        </div>

        <div className="relative flex-1 md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={activeSubTab === 'faculty' ? "Search teachers or specialities..." : "Search subject codes or teachers..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-500 font-medium">Loading register database...</span>
          </div>
        </div>
      ) : activeSubTab === 'faculty' ? (
        filteredFaculties.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-lg">No faculty records found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculties.map((fac, idx) => (
              <div 
                key={fac.name} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {fac.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{fac.name}</h3>
                        <p className="text-xs text-gray-500">Department of Computer Science</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                      {fac.hours} hrs/week
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subject Specialities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {fac.subjects.map(sub => (
                        <span key={sub} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>Assigned Sections:</span>
                  <span className="font-semibold text-gray-800">{fac.sections.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-lg">No subjects found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map(subj => (
              <div 
                key={subj.code} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {subj.code.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{subj.code}</h3>
                        <p className="text-xs text-gray-500">Core Engineering Curriculum</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                      {subj.hours} Credits
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned Instructors</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {subj.faculties.map(fac => (
                        <span key={fac} className="px-2 py-0.5 rounded bg-gray-50 text-blue-700 text-xs font-medium border border-blue-100">
                          👤 {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>Assigned Sections:</span>
                  <span className="font-semibold text-gray-800">{subj.sections.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
