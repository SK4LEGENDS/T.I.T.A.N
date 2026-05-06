import { useState, useEffect } from 'react';

export default function Sidebar({ onSelectHistory, activeItemId, onLogout }) {
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

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('timetable_groups');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'group-cse', name: 'CSE Timetables', items: [] }
    ];
  });
  
  const [expandedFolders, setExpandedFolders] = useState({ 'group-cse': true });
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [dragOverUngrouped, setDragOverUngrouped] = useState(false);

  useEffect(() => {
    if (savedTimetables.length > 0) {
      const saved = localStorage.getItem('timetable_groups');
      if (!saved) {
        const cseIds = savedTimetables
          .filter(t => t.name.toUpperCase().includes('CSE'))
          .map(t => t.id);
        if (cseIds.length > 0) {
          const defaultGroups = [
            { id: 'group-cse', name: 'CSE Timetables', items: cseIds }
          ];
          setGroups(defaultGroups);
          localStorage.setItem('timetable_groups', JSON.stringify(defaultGroups));
        }
      }
    }
  }, [savedTimetables]);

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

  const handleCreateFolder = (e) => {
    e.stopPropagation();
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;
    const newId = 'folder-' + Date.now();
    const updated = [...groups, { id: newId, name: folderName, items: [] }];
    setGroups(updated);
    localStorage.setItem('timetable_groups', JSON.stringify(updated));
    setExpandedFolders(prev => ({ ...prev, [newId]: true }));
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleRenameFolder = (e, folderId) => {
    e.stopPropagation();
    const folder = groups.find(g => g.id === folderId);
    if (!folder) return;
    const newName = prompt("Rename folder:", folder.name);
    if (!newName) return;
    const updated = groups.map(g => g.id === folderId ? { ...g, name: newName } : g);
    setGroups(updated);
    localStorage.setItem('timetable_groups', JSON.stringify(updated));
  };

  const handleDeleteFolder = (e, folderId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this folder? Items inside will be ungrouped.")) {
      const updated = groups.filter(g => g.id !== folderId);
      setGroups(updated);
      localStorage.setItem('timetable_groups', JSON.stringify(updated));
    }
  };

  const handleMoveItem = (e, itemId) => {
    e.stopPropagation();
    const folderList = groups.map((g, index) => `${index + 1}. ${g.name}`).join('\n');
    const choice = prompt(
      `Select folder number to move item to (or enter 0 to ungroup):\n\n${folderList}\n\nType "new" to create a new folder.`
    );
    if (choice === null) return;

    let updatedGroups = groups.map(g => ({
      ...g,
      items: g.items.filter(id => id !== itemId)
    }));

    if (choice.toLowerCase() === 'new') {
      const folderName = prompt("Enter new folder name:");
      if (folderName) {
        const newId = 'folder-' + Date.now();
        updatedGroups.push({ id: newId, name: folderName, items: [itemId] });
        setExpandedFolders(prev => ({ ...prev, [newId]: true }));
      }
    } else {
      const idx = parseInt(choice, 10) - 1;
      if (idx >= 0 && idx < groups.length) {
        updatedGroups[idx].items.push(itemId);
        setExpandedFolders(prev => ({ ...prev, [groups[idx].id]: true }));
      }
    }

    setGroups(updatedGroups);
    localStorage.setItem('timetable_groups', JSON.stringify(updatedGroups));
  };

  const handleFolderOptions = (e, group) => {
    e.stopPropagation();
    const choice = prompt(`Folder Options for "${group.name}":\n\n1. Rename Folder\n2. Delete Folder\n\nEnter option (1-2):`);
    if (choice === '1') {
      handleRenameFolder(e, group.id);
    } else if (choice === '2') {
      handleDeleteFolder(e, group.id);
    }
  };

  const handleItemOptions = (e, t) => {
    e.stopPropagation();
    const choice = prompt(`Options for "${t.name}":\n\n1. Move to Folder / Group\n2. Delete Timetable\n\nEnter option (1-2):`);
    if (choice === '1') {
      handleMoveItem(e, t.id);
    } else if (choice === '2') {
      handleDelete(e, t.db_id);
    }
  };

  const handleDragStart = (e, itemId) => {
    setDraggedItemId(itemId);
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverFolderId(null);
    setDragOverUngrouped(false);
  };

  const handleDragOverFolder = (e, folderId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeaveFolder = (e) => {
    e.preventDefault();
    setDragOverFolderId(null);
  };

  const handleDropOnFolder = (e, folderId) => {
    e.preventDefault();
    const itemId = draggedItemId || e.dataTransfer.getData("text/plain");
    if (!itemId) return;

    // Remove item from all other folders first
    let updatedGroups = groups.map(g => ({
      ...g,
      items: g.items.filter(id => id !== itemId)
    }));

    // Add item to target folder
    updatedGroups = updatedGroups.map(g => {
      if (g.id === folderId) {
        if (!g.items.includes(itemId)) {
          return { ...g, items: [...g.items, itemId] };
        }
      }
      return g;
    });

    setGroups(updatedGroups);
    localStorage.setItem('timetable_groups', JSON.stringify(updatedGroups));
    setExpandedFolders(prev => ({ ...prev, [folderId]: true }));
    handleDragEnd();
  };

  const handleDragOverUngrouped = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverUngrouped(true);
  };

  const handleDragLeaveUngrouped = () => {
    setDragOverUngrouped(false);
  };

  const handleDropOnUngrouped = (e) => {
    e.preventDefault();
    const itemId = draggedItemId || e.dataTransfer.getData("text/plain");
    if (!itemId) return;

    const updatedGroups = groups.map(g => ({
      ...g,
      items: g.items.filter(id => id !== itemId)
    }));

    setGroups(updatedGroups);
    localStorage.setItem('timetable_groups', JSON.stringify(updatedGroups));
    handleDragEnd();
  };

  const handleItemClick = (id, name) => {
    setActiveItem(id);
    if (id === 'settings') {
      setActiveTab('SettingsTab');
    } else if (activeTab === 'SettingsTab') {
      setActiveTab('Personal');
    }
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


      {/* Sidebar Panel - Dark Premium Theme */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0B0F19] text-slate-300 border-r border-slate-800/60 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'
        }`}
      >
        {/* Header */}
        <div className="h-20 px-4 flex flex-col justify-center items-center shrink-0 border-b border-slate-800/60 text-center relative">
          <h1 className="text-white text-xl font-black tracking-widest uppercase text-center w-full">
            TITAN
          </h1>
          <p className="text-[7px] text-blue-400 font-extrabold uppercase tracking-wider mt-1.5 leading-none whitespace-nowrap">
            Timetable Intelligence & Teacher Allocation Network
          </p>
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors lg:hidden"
            title="Close Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-4 pt-2">

          {/* Tabs */}
          <div className="flex gap-5 border-b border-slate-800/60">
            <button 
              onClick={() => {
                setActiveTab('Personal');
                if (activeItem === 'settings') {
                  handleItemClick('home', 'Home');
                }
              }}
              className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${activeTab === 'Personal' && activeItem !== 'settings' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Recent
              {activeTab === 'Personal' && activeItem !== 'settings' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-md"></div>
              )}
            </button>
            <button 
              onClick={() => {
                setActiveTab('Untitled Labs');
                if (activeItem === 'settings') {
                  handleItemClick('home', 'Home');
                  setActiveTab('Untitled Labs');
                }
              }}
              className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${activeTab === 'Untitled Labs' && activeItem !== 'settings' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Saved Labs
              {activeTab === 'Untitled Labs' && activeItem !== 'settings' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-md"></div>
              )}
            </button>
            <button 
              onClick={() => {
                setActiveTab('SettingsTab');
                handleItemClick('settings', 'System Settings');
              }}
              className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${activeTab === 'SettingsTab' || activeItem === 'settings' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Settings
              {(activeTab === 'SettingsTab' || activeItem === 'settings') && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-md"></div>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {activeTab === 'Untitled Labs' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Saved Databases</p>
                <button 
                  onClick={handleCreateFolder}
                  className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white px-2 py-0.5 rounded font-bold transition flex items-center gap-1"
                  title="Create new folder group"
                >
                  <span>+ Folder</span>
                </button>
              </div>

              {savedTimetables.length === 0 ? (
                <p className="py-2 px-3 text-xs text-slate-500 italic">No saved timetables found</p>
              ) : (
                <>
                  {/* Folders */}
                  {groups.map(group => {
                    const groupItems = savedTimetables.filter(t => group.items.includes(t.id));
                    const isExpanded = !!expandedFolders[group.id];
                    
                    return (
                      <div key={group.id} className="space-y-1">
                        <div 
                          onClick={() => toggleFolder(group.id)}
                          onDragOver={(e) => handleDragOverFolder(e, group.id)}
                          onDragLeave={handleDragLeaveFolder}
                          onDrop={(e) => handleDropOnFolder(e, group.id)}
                          className={`flex items-center justify-between py-1.5 px-3 text-sm rounded-xl cursor-pointer transition-all duration-200 group/folder ${dragOverFolderId === group.id ? 'bg-blue-900/30 scale-[1.02] border border-blue-500/30' : 'hover:bg-slate-900/40 border border-transparent'} text-slate-300`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''} text-slate-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-amber-500">📁</span>
                            <span className="truncate font-semibold text-slate-200">{group.name}</span>
                            <span className="text-xs text-slate-500">({groupItems.length})</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/folder:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleFolderOptions(e, group)}
                              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                              title="Folder options"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="pl-4 space-y-1 border-l border-slate-800 ml-4 mb-2">
                            {groupItems.length === 0 ? (
                              <p className="py-1 px-3 text-[11px] text-slate-500 italic">Empty folder</p>
                            ) : (
                              groupItems.map(t => (
                                <div 
                                  key={t.id}
                                  onClick={() => handleItemClick(t.id, t.name)}
                                  draggable="true"
                                  onDragStart={(e) => handleDragStart(e, t.id)}
                                  onDragEnd={handleDragEnd}
                                  className={`group/item flex items-center justify-between py-1.5 px-2.5 text-[13px] rounded-xl cursor-grab active:cursor-grabbing border transition-colors ${activeItem === t.id ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
                                >
                                  <span className="truncate">{t.name}</span>
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity ml-2 shrink-0">
                                    <button 
                                      onClick={(e) => handleItemOptions(e, t)}
                                      className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                                      title="Timetable options"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Ungrouped Timetables */}
                  {(() => {
                    const ungrouped = savedTimetables.filter(t => !groups.some(g => g.items.includes(t.id)));
                    if (ungrouped.length === 0) return null;
                    return (
                      <div className="space-y-1 mt-2 border-t border-slate-800/40 pt-2">
                        <p className="px-3 py-1 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ungrouped</p>
                        {ungrouped.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => handleItemClick(t.id, t.name)}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            onDragEnd={handleDragEnd}
                            className={`group/item flex items-center justify-between py-1.5 px-3 text-[13px] rounded-xl cursor-grab active:cursor-grabbing border transition-colors ${activeItem === t.id ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
                          >
                            <span className="truncate">{t.name}</span>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity ml-2 shrink-0">
                              <button 
                                onClick={(e) => handleItemOptions(e, t)}
                                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                                title="Timetable options"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {draggedItemId && (
                    <div
                      onDragOver={handleDragOverUngrouped}
                      onDragLeave={handleDragLeaveUngrouped}
                      onDrop={handleDropOnUngrouped}
                      className={`mt-4 p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-200 ${dragOverUngrouped ? 'bg-red-950/20 border-red-500/50 text-red-400 scale-[1.01]' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      <svg className="w-5 h-5 text-slate-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span className="text-xs font-semibold">Drop here to ungroup</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {/* Home Item */}
              <div 
                onClick={() => handleItemClick('home', 'Home')}
                className={`px-2.5 py-2 flex items-center justify-between rounded-xl cursor-pointer border transition-colors group ${activeItem === 'home' ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${activeItem === 'home' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-semibold text-sm">Home</span>
                </div>
              </div>

              {/* Dashboard (Expanded Group) */}
              <div className="space-y-1">
                <div 
                  onClick={() => toggleGroup('dashboard')}
                  className={`px-2.5 py-2 flex items-center justify-between rounded-xl cursor-pointer border transition-colors group ${expandedGroups.dashboard || activeItem.startsWith('db-') ? 'bg-blue-950/20 text-blue-300 font-semibold border-blue-900/20' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${expandedGroups.dashboard || activeItem.startsWith('db-') ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-semibold text-sm">2026 Drafts</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${expandedGroups.dashboard ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
                
                {/* Sub-items */}
                {expandedGroups.dashboard && (
                  <div className="pl-10 pr-2 py-1 space-y-1">
                    {savedTimetables.length === 0 ? (
                      <p className="py-2 px-3 text-xs text-slate-500 italic">No recent drafts</p>
                    ) : (
                      savedTimetables.map(t => (
                        <div 
                          key={t.id}
                          onClick={() => handleItemClick(t.id, t.name)}
                          className={`group/item flex items-center justify-between py-2 px-3 text-sm rounded-xl cursor-pointer border transition-colors ${activeItem === t.id ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
                        >
                          <span className="truncate">{t.name}</span>
                          <button 
                            onClick={(e) => handleDelete(e, t.db_id)}
                            className="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-red-400 transition-opacity ml-2 shrink-0"
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

              {/* Faculty Directory Item */}
              <div 
                onClick={() => handleItemClick('master-faculty', 'Faculty Directory')}
                className={`px-2.5 py-2 flex items-center justify-between rounded-xl cursor-pointer border transition-colors group ${activeItem === 'master-faculty' ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${activeItem === 'master-faculty' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold text-sm">Faculty Directory</span>
                </div>
              </div>

              {/* Subject Syllabus Item */}
              <div 
                onClick={() => handleItemClick('master-subjects', 'Subject Syllabus')}
                className={`px-2.5 py-2 flex items-center justify-between rounded-xl cursor-pointer border transition-colors group ${activeItem === 'master-subjects' ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${activeItem === 'master-subjects' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-semibold text-sm">Subject Syllabus</span>
                </div>
              </div>

              {/* Workload Analytics Item */}
              <div 
                onClick={() => handleItemClick('analytics-workloads', 'Workload Analytics')}
                className={`px-2.5 py-2 flex items-center justify-between rounded-xl cursor-pointer border transition-colors group ${activeItem === 'analytics-workloads' ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${activeItem === 'analytics-workloads' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  <span className="font-semibold text-sm">Workload Analytics</span>
                </div>
              </div>

              {/* Usage Insights Item */}
              <div 
                onClick={() => handleItemClick('analytics-insights', 'Usage Insights')}
                className={`px-2.5 py-2 flex items-center justify-between rounded-xl cursor-pointer border transition-colors group ${activeItem === 'analytics-insights' ? 'bg-blue-950/40 text-blue-400 font-bold border-blue-800/40 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${activeItem === 'analytics-insights' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <span className="font-semibold text-sm">Usage Insights</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* User Profile / Bottom */}
        <div className="p-4 mt-auto border-t border-slate-800/60 space-y-2 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-900/50 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@university.edu</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg border border-transparent hover:border-red-900/30 transition duration-200 uppercase tracking-wider cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
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
          background: #1e293b;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #334155;
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
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition ${modal.type === 'confirm' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
