import { useState, useEffect } from 'react';

export default function AnalyticsView({ initialTab = 'workloads' }) {
  const [data, setData] = useState(null);
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
        console.error("Failed to fetch analytics summary", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 font-medium text-lg">Gathering college-wide analytics...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || { sections_count: 0, faculties_count: 0, allocated_hours: 0, average_workload: 0 };
  const faculties = data?.faculties || [];
  const subjects = data?.subjects || [];

  const getWorkloadStatus = (hours) => {
    if (hours < 8) return { label: 'Light Load', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (hours <= 14) return { label: 'Balanced', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' };
    if (hours <= 18) return { label: 'Heavy Load', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
    return { label: 'Overloaded', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/30 text-slate-900 p-8 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-xs font-semibold uppercase tracking-wider text-blue-800 border border-blue-200/50">
            {initialTab === 'workloads' ? '📊 Workload Audit' : '📈 Allocation Weights'}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {initialTab === 'workloads' ? 'Workload Analytics' : 'Usage Insights'}
          </h2>
          <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
            {initialTab === 'workloads' 
              ? 'Monitor real-time resource allocations, inspect faculty balance factors, and prevent teacher burnout with live college-wide timetabling audit dashboards.'
              : 'Inspect subject period densities, class requirements, and curriculum balance statistics.'}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow transition duration-200">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Sections</p>
            <h3 className="text-3xl font-bold text-gray-900">{kpis.sections_count}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow transition duration-200">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Teachers</p>
            <h3 className="text-3xl font-bold text-gray-900">{kpis.faculties_count}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg text-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow transition duration-200">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Periods</p>
            <h3 className="text-3xl font-bold text-gray-900">{kpis.allocated_hours}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow transition duration-200">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Teacher Load</p>
            <h3 className="text-3xl font-bold text-gray-900">{kpis.average_workload} <span className="text-sm font-normal text-gray-400">hrs/wk</span></h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg text-amber-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
        </div>
      </div>

      {initialTab === 'workloads' ? (
        /* Workload View - Faculty Balance Register takes full stage */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Faculty Balance Register</h3>
            <p className="text-xs text-gray-500 mt-1">Live workload tracking with smart alert thresholds.</p>
          </div>

          <div className="space-y-5">
            {faculties.length === 0 ? (
              <p className="text-center text-gray-400 py-6">No teaching records found. Save a timetable first!</p>
            ) : (
              faculties.map((fac) => {
                const status = getWorkloadStatus(fac.hours);
                const pct = Math.min((fac.hours / 20) * 100, 100);
                return (
                  <div key={fac.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 text-sm">{fac.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{fac.hours} hrs</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${status.color}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Insights View - Subject distribution in a beautiful wide layout grid */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Subject Distribution</h3>
            <p className="text-xs text-gray-500 mt-1">Allocation weights of syllabus components.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.length === 0 ? (
              <p className="text-center text-gray-400 col-span-full py-6">No subjects tracked yet.</p>
            ) : (
              subjects.map((subj) => {
                const totalHours = kpis.allocated_hours || 1;
                const pct = Math.round((subj.hours / totalHours) * 100);
                return (
                  <div key={subj.code} className="flex justify-between items-center text-sm p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <span className="font-semibold text-slate-800">{subj.code}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">{subj.sections.length} classes</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
