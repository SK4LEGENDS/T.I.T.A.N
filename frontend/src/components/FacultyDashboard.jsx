export default function FacultyDashboard({ data }) {
  // Aggregate faculty data
  const facultyStats = {};

  data.forEach(entry => {
    const facultyName = entry.faculty?.trim();
    if (facultyName && facultyName !== '' && facultyName.toUpperCase() !== 'N/A') {
      const name = facultyName;
      if (!facultyStats[name]) {
        facultyStats[name] = {
          name: name,
          count: 0,
          subjects: new Set()
        };
      }
      facultyStats[name].count += 1;
      if (entry.subject) {
        facultyStats[name].subjects.add(entry.subject.trim());
      }
    }
  });

  const statsList = Object.values(facultyStats).sort((a, b) => b.count - a.count);

  if (statsList.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Faculty Workload Dashboard
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {statsList.length} Active Faculties
        </span>
      </div>
      
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsList.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-gray-900 text-lg">{stat.name}</h4>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                {stat.count}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Handling Subjects</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.from(stat.subjects).map((sub, i) => (
                  <span key={i} className="inline-block bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
