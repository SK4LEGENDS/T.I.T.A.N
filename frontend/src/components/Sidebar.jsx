import { useState, useEffect } from 'react';

export default function Sidebar({ onSelectHistory, activeItemId }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Personal');
  const [expandedGroups, setExpandedGroups] = useState({
    dashboard: true,
    projects: false,
    tasks: false,
    reporting: false
  });
  const [activeItem, setActiveItem] = useState('sources');
  const [savedTimetables, setSavedTimetables] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm', 'alert'
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    if (activeItemId) {
      setActiveItem(activeItemId);
    }
  }, [activeItemId]);

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/saved-timetables');
        const result = await response.json();
        if (result.status === 'success') {
          setSavedTimetables(result.data);
        }
      } catch (e) {
        console.error("Failed to fetch saved timetables", e);
      }
    };
    fetchTimetables();
  }, []);

  const handleDelete = (e, dbId) => {
    e.stopPropagation();
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Timetable',
      message: 'Are you sure you want to delete this saved timetable? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/timetable/${dbId}`, {
            method: 'DELETE'
          });
          const result = await response.json();
          if (result.status === 'success') {
            setSavedTimetables(prev => prev.filter(t => t.db_id !== dbId));
            setModal({
              isOpen: true,
              type: 'alert',
              title: 'Deleted',
              message: 'Timetable has been deleted successfully.'
            });
          } else {
            setModal({
              isOpen: true,
              type: 'alert',
              title: 'Error',
              message: 'Failed to delete timetable: ' + result.message
            });
          }
        } catch (err) {
          console.error(err);
          setModal({
            isOpen: true,
            type: 'alert',
            title: 'Connection Error',
            message: 'Failed to connect to backend to delete.'
          });
        }
      }
    });
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleItemClick = (id, name) => {
    setActiveItem(id);
    if(onSelectHistory) onSelectHistory({ id, name });
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden z-50 p-3 bg-[#101828] text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          title="Open Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel - Dark Theme */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#101828] text-gray-300 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-6 flex justify-between items-center shrink-0">
          <h1 className="text-white text-xl font-semibold tracking-wide">Smart Timetable</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 pt-2">

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('Personal')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'Personal' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Recent
              {activeTab === 'Personal' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-md"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('Untitled Labs')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'Untitled Labs' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Saved Labs
              {activeTab === 'Untitled Labs' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-md"></div>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {activeTab === 'Untitled Labs' ? (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider font-semibold">Saved Databases</p>
              {savedTimetables.length === 0 ? (
                <p className="py-2 px-3 text-xs text-gray-500 italic">No saved timetables found</p>
              ) : (
                savedTimetables.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => handleItemClick(t.id, t.name)}
                    className={`group/item flex items-center justify-between py-2 px-3 text-sm rounded-md cursor-pointer transition-colors ${activeItem === t.id ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="truncate">{t.name}</span>
                    <button 
                      onClick={(e) => handleDelete(e, t.db_id)}
                      className="opacity-0 group-hover/item:opacity-100 text-gray-500 hover:text-red-400 transition-opacity ml-2 shrink-0"
                      title="Delete saved timetable"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Home Item */}
              <div 
                onClick={() => handleItemClick('home', 'Home')}
                className={`px-2 py-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors group ${activeItem === 'home' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${activeItem === 'home' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium text-sm">Home</span>
                </div>
              </div>

              {/* Dashboard (Expanded Group) */}
              <div className="space-y-1">
                <div 
                  onClick={() => toggleGroup('dashboard')}
                  className={`px-2 py-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors group ${expandedGroups.dashboard ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${expandedGroups.dashboard ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-medium text-sm">2026 Drafts</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${expandedGroups.dashboard ? 'rotate-180 text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
                
                {/* Sub-items */}
                {expandedGroups.dashboard && (
                  <div className="pl-10 pr-2 py-1 space-y-1">
                    {savedTimetables.length === 0 ? (
                      <p className="py-2 px-3 text-xs text-gray-500 italic">No recent drafts</p>
                    ) : (
                      savedTimetables.map(t => (
                        <div 
                          key={t.id}
                          onClick={() => handleItemClick(t.id, t.name)}
                          className={`group/item flex items-center justify-between py-2 px-3 text-sm rounded-md cursor-pointer transition-colors ${activeItem === t.id ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          <span className="truncate">{t.name}</span>
                          <button 
                            onClick={(e) => handleDelete(e, t.db_id)}
                            className="opacity-0 group-hover/item:opacity-100 text-gray-500 hover:text-red-400 transition-opacity ml-2 shrink-0"
                            title="Delete saved timetable"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Projects Group */}
              <div className="space-y-1">
                <div 
                  onClick={() => toggleGroup('projects')}
                  className={`px-2 py-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors group ${expandedGroups.projects ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${expandedGroups.projects ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="font-medium text-sm">2025 Archives</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${expandedGroups.projects ? 'rotate-180 text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Sub-items */}
                {expandedGroups.projects && (
                  <div className="pl-10 pr-2 py-1 space-y-1">
                    <p className="py-2 px-3 text-xs text-gray-500 italic">No archives found</p>
                  </div>
                )}
              </div>

              {/* Tasks Group */}
              <div className="space-y-1">
                <div 
                  onClick={() => toggleGroup('tasks')}
                  className={`px-2 py-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors group ${expandedGroups.tasks || activeItem.startsWith('master-') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${expandedGroups.tasks || activeItem.startsWith('master-') ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="font-medium text-sm">Master Data</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${expandedGroups.tasks ? 'rotate-180 text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Sub-items */}
                {expandedGroups.tasks && (
                  <div className="pl-10 pr-2 py-1 space-y-1">
                    <div 
                      onClick={() => handleItemClick('master-faculty', 'Faculty Directory')}
                      className={`flex items-center justify-between py-1.5 px-3 text-xs rounded-md cursor-pointer transition-colors ${activeItem === 'master-faculty' ? 'bg-white/15 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span>Faculty Directory</span>
                    </div>
                    <div 
                      onClick={() => handleItemClick('master-subjects', 'Subject Syllabus')}
                      className={`flex items-center justify-between py-1.5 px-3 text-xs rounded-md cursor-pointer transition-colors ${activeItem === 'master-subjects' ? 'bg-white/15 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span>Subject Syllabus</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reporting Group */}
              <div className="space-y-1">
                <div 
                  onClick={() => toggleGroup('reporting')}
                  className={`px-2 py-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors group ${expandedGroups.reporting || activeItem.startsWith('analytics-') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${expandedGroups.reporting || activeItem.startsWith('analytics-') ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <span className="font-medium text-sm">Analytics</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${expandedGroups.reporting ? 'rotate-180 text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Sub-items */}
                {expandedGroups.reporting && (
                  <div className="pl-10 pr-2 py-1 space-y-1">
                    <div 
                      onClick={() => handleItemClick('analytics-workloads', 'Workload Analytics')}
                      className={`flex items-center justify-between py-1.5 px-3 text-xs rounded-md cursor-pointer transition-colors ${activeItem === 'analytics-workloads' ? 'bg-white/15 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span>Workload Analytics</span>
                    </div>
                    <div 
                      onClick={() => handleItemClick('analytics-insights', 'Usage Insights')}
                      className={`flex items-center justify-between py-1.5 px-3 text-xs rounded-md cursor-pointer transition-colors ${activeItem === 'analytics-insights' ? 'bg-white/15 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span>Usage Insights</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* User Profile / Bottom */}
        <div className="p-4 mt-auto border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@university.edu</p>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #4B5563;
        }
      `}} />
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 m-4 transform scale-100 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${modal.type === 'confirm' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {modal.type === 'confirm' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{modal.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{modal.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {modal.type === 'confirm' && (
                <button
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  setModal({ ...modal, isOpen: false });
                  if (modal.onConfirm) modal.onConfirm();
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition ${modal.type === 'confirm' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {modal.type === 'confirm' ? 'Delete' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
