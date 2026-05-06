import { useState } from 'react';
import UploadView from './components/UploadView';
import TimetableView from './components/TimetableView';
import Sidebar from './components/Sidebar';
import MasterDataView from './components/MasterDataView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';

function App() {
  const [authStage, setAuthStage] = useState(() => {
    return localStorage.getItem('is_logged_in') === 'true' ? 'app' : 'landing';
  });
  const [currentView, setCurrentView] = useState('upload');
  const [currentLab, setCurrentLab] = useState({ id: 'home', name: 'New Timetable' });
  const [generatedData, setGeneratedData] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  const handleHistorySelect = async (item) => {
    if (item.id === 'home') {
      if (generatedData) {
        setCurrentLab({ id: 'home', name: 'New Timetable' });
        setCurrentView('timetable');
      } else {
        setCurrentView('upload');
      }
    } else if (item.id.startsWith('db-')) {
      const dbId = parseInt(item.id.replace('db-', ''));
      try {
        const response = await fetch(`http://localhost:8000/api/timetable/${dbId}`);
        const result = await response.json();
        if (result.status === 'success') {
          setGeneratedData({
            ...result.data.data,
            academic_cycle: result.data.academic_cycle,
            academic_year: result.data.academic_year,
            semester: result.data.semester
          });
          setCurrentLab(item);
          setCurrentView('timetable');
        } else {
          setErrorModal({
            isOpen: true,
            title: 'Error Loading Timetable',
            message: result.message
          });
        }
      } catch (e) {
        console.error(e);
        setErrorModal({
          isOpen: true,
          title: 'Connection Error',
          message: 'Failed to connect to the server to load the timetable.'
        });
      }
    } else {
      setCurrentLab(item);
      setCurrentView('timetable');
    }
  };

  const handleGenerate = (data) => {
    setGeneratedData(data);
    setCurrentLab({ id: 'home', name: 'New Timetable' });
    setCurrentView('timetable');
  };

  const renderContent = () => {
    if (currentView === 'upload') {
      return <UploadView onGenerate={handleGenerate} />;
    }
    
    // Non-timetable views based on id prefix
    if (currentLab.id.startsWith('master-')) {
      const initialTab = currentLab.id === 'master-subjects' ? 'subjects' : 'faculty';
      return <MasterDataView initialTab={initialTab} key={currentLab.id} />;
    }
    
    if (currentLab.id === 'settings') {
      return <SettingsView />;
    }

    if (currentLab.id.startsWith('analytics-')) {
      const initialTab = currentLab.id === 'analytics-insights' ? 'insights' : 'workloads';
      return <AnalyticsView initialTab={initialTab} key={currentLab.id} />;
    }

    // Default to timetable view for drafts, archives, and unknown IDs
    return <TimetableView currentLab={currentLab} generatedData={generatedData} />;
  };

  if (authStage === 'landing') {
    return (
      <LandingPage 
        onGetStarted={() => setAuthStage('login')} 
        onLoginClick={() => setAuthStage('login')} 
      />
    );
  }

  if (authStage === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={() => {
          localStorage.setItem('is_logged_in', 'true');
          setAuthStage('app');
        }}
        onBackToHome={() => setAuthStage('landing')}
      />
    );
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden relative">
      <Sidebar 
        onSelectHistory={handleHistorySelect} 
        activeItemId={currentLab.id} 
        onLogout={() => {
          localStorage.removeItem('is_logged_in');
          setAuthStage('landing');
        }}
      />
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {currentView === 'timetable' && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-end h-16 items-center">
                <button 
                  onClick={() => {
                    setGeneratedData(null);
                    setCurrentView('upload');
                    setCurrentLab({ id: 'home', name: 'New Timetable' });
                  }}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
                >
                  Start Over
                </button>
              </div>
            </div>
          </header>
        )}

      <main>
        {renderContent()}
      </main>
      </div>
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 m-4 transform scale-100 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-red-50 text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{errorModal.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{errorModal.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
