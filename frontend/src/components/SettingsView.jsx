import { useState } from 'react';

export default function SettingsView() {
  const [fullName, setFullName] = useState('Dr. Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@university.edu');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Associate Professor & Coordinator');
  const [employeeId, setEmployeeId] = useState('EMP-CSE-2026-098');
  const [accentColor, setAccentColor] = useState('blue');
  const [defaultView, setDefaultView] = useState('grid');
  
  // AI & Generation Preferences
  const [optimizeFor, setOptimizeFor] = useState('balanced');
  const [autoResolveConflicts, setAutoResolveConflicts] = useState(true);
  
  // Notification & Integration
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/30 text-slate-900 p-8 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-xs font-semibold uppercase tracking-wider text-blue-800 border border-blue-200/50">
            ⚙️ Personal Settings
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">User Configuration</h2>
          <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
            Configure your personal profile details, designation department affiliations, and system appearance preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Profile Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Personal Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Employee ID / Code</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* AI Generator Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">AI Scheduler Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase block">Optimization Goal</label>
              <div className="space-y-2">
                {[
                  { value: 'balanced', label: '⚖️ Balanced workload distribution' },
                  { value: 'gaps', label: '⏱️ Minimize daily teacher gaps' },
                  { value: 'research', label: '📚 Allocate research/admin days' }
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="optimizeFor"
                      value={opt.value}
                      checked={optimizeFor === opt.value}
                      onChange={() => setOptimizeFor(opt.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-slate-800">Auto-Resolve Conflicts</label>
                  <p className="text-xs text-slate-500">Enable AI auto-balancing for soft constraint overlaps.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoResolveConflicts(!autoResolveConflicts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoResolveConflicts ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoResolveConflicts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-slate-800">Email Alerts</label>
                  <p className="text-xs text-slate-500">Notify of newly saved databases or conflict overrides.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Visual Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">System Appearance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase block">Accent Theme Color</label>
              <div className="flex gap-3">
                {['blue', 'indigo', 'emerald', 'slate'].map((color) => {
                  const bgClass = {
                    blue: 'bg-blue-600',
                    indigo: 'bg-indigo-600',
                    emerald: 'bg-emerald-600',
                    slate: 'bg-slate-700'
                  }[color];
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      className={`w-8 h-8 rounded-full ${bgClass} transition flex items-center justify-center border-2 ${accentColor === color ? 'border-gray-950 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                    >
                      {accentColor === color && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Default View Layout</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="defaultView"
                    value="grid"
                    checked={defaultView === 'grid'}
                    onChange={() => setDefaultView('grid')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Weekly Grid
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="defaultView"
                    value="list"
                    checked={defaultView === 'list'}
                    onChange={() => setDefaultView('list')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Compact List
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {isSaved && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-fade-in bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>Configuration saved successfully!</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('is_logged_in');
                window.location.reload();
              }}
              className="px-5 py-2.5 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
            >
              Sign Out
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
