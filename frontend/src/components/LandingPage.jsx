import React, { useState } from 'react';

export default function LandingPage({ onGetStarted, onLoginClick }) {
  const [isSolving, setIsSolving] = useState(false);
  const [solvedSlots, setSolvedSlots] = useState([]);

  const mockCourses = [
    { id: 1, name: 'CSE-301: OS', prof: 'Prof. Sharma', room: 'Room 402', color: 'blue', day: 'Monday', time: '09:00 AM' },
    { id: 2, name: 'CSE-303: AI', prof: 'Dr. Patel', room: 'Room 204', color: 'violet', day: 'Tuesday', time: '10:00 AM' },
    { id: 3, name: 'CSE-305: DBMS', prof: 'Prof. Verma', room: 'Room 102', color: 'amber', day: 'Wednesday', time: '11:15 AM' },
    { id: 4, name: 'CSE-307: TOC', prof: 'Dr. Roy', room: 'Lab 3', color: 'emerald', day: 'Thursday', time: '09:00 AM' },
  ];

  const handleSolveSimulation = () => {
    if (isSolving) return;
    setIsSolving(true);
    setSolvedSlots([]);

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < mockCourses.length) {
        setSolvedSlots(prev => [...prev, mockCourses[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsSolving(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-[50%] right-[10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Sleek Header */}
      <header className="border-b border-slate-200/80 bg-slate-50/85 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/10">T</span>
            <span className="text-lg font-extrabold tracking-widest text-slate-900 uppercase">TITAN</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">How It Works</a>
            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Key Features</a>
            <a href="#why-titan" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Solutions</a>
            <a href="#maximize" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Platform</a>
          </nav>

          <div className="flex items-center gap-6">
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition duration-200 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Launch Scheduler
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Brand Statement */}
          <div className="lg:col-span-5 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold uppercase tracking-wider rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              TITAN Engine v3.0
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] text-slate-900">
                Streamline Your <br />
                <span className="font-extrabold text-slate-900 italic">Academic Scheduling.</span> <br />
                Effortlessly.
              </h1>
              <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                TITAN is the all-in-one intelligent timetable platform that helps universities, departments, and administrators generate conflict-free schedules, balance teacher workloads, and allocate classrooms in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="px-8 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Start Free Trial</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column: Laptop Sandbox Representation */}
          <div className="lg:col-span-7 relative">
            <div className="absolute inset-0 bg-blue-600/10 rounded-3xl blur-[80px] -z-10 transform scale-95 translate-y-4" />
            
            {/* Laptop CSS Frame */}
            <div className="bg-slate-900 p-3 rounded-3xl shadow-2xl border border-slate-800">
              {/* Screen Frame */}
              <div className="bg-white border-4 border-slate-950 rounded-2xl p-4 overflow-hidden relative">
                
                {/* Control Strip */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-2">Interactive Solver Sandbox</span>
                  </div>
                  <button 
                    onClick={handleSolveSimulation}
                    disabled={isSolving}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      isSolving 
                        ? 'bg-slate-100 text-slate-400' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {isSolving ? 'Solving...' : 'Run Auto-Solver'}
                  </button>
                </div>

                {/* Simulated Slots */}
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 grid grid-cols-4 gap-3 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5">Mon</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5">Tue</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5">Wed</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5">Thu</div>

                    <div className="min-h-[55px] flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-1">
                      {solvedSlots.some(s => s.day === 'Monday') ? (
                        <div className="w-full h-full rounded-md bg-blue-50 border border-blue-100 p-1.5 text-left flex flex-col justify-between transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
                          <p className="text-[9px] font-bold text-blue-700 leading-tight">CSE-301: OS</p>
                          <p className="text-[7px] font-semibold text-blue-500">Prof. Sharma</p>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300">Empty</span>
                      )}
                    </div>

                    <div className="min-h-[55px] flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-1">
                      {solvedSlots.some(s => s.day === 'Tuesday') ? (
                        <div className="w-full h-full rounded-md bg-violet-50 border border-violet-100 p-1.5 text-left flex flex-col justify-between transition-all duration-300 animate-in fade-in zoom-in-95">
                          <p className="text-[9px] font-bold text-violet-700 leading-tight">CSE-303: AI</p>
                          <p className="text-[7px] font-semibold text-violet-500">Dr. Patel</p>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300">Empty</span>
                      )}
                    </div>

                    <div className="min-h-[55px] flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-1">
                      {solvedSlots.some(s => s.day === 'Wednesday') ? (
                        <div className="w-full h-full rounded-md bg-amber-50 border border-amber-100 p-1.5 text-left flex flex-col justify-between transition-all duration-300 animate-in fade-in zoom-in-95">
                          <p className="text-[9px] font-bold text-amber-700 leading-tight">CSE-305: DBMS</p>
                          <p className="text-[7px] font-semibold text-amber-500">Prof. Verma</p>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300">Empty</span>
                      )}
                    </div>

                    <div className="min-h-[55px] flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-1">
                      {solvedSlots.some(s => s.day === 'Thursday') ? (
                        <div className="w-full h-full rounded-md bg-emerald-50 border border-emerald-100 p-1.5 text-left flex flex-col justify-between transition-all duration-300 animate-in fade-in zoom-in-95">
                          <p className="text-[9px] font-bold text-emerald-700 leading-tight">CSE-307: TOC</p>
                          <p className="text-[7px] font-semibold text-emerald-500">Dr. Roy</p>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300">Empty</span>
                      )}
                    </div>
                  </div>

                  {/* Status Update Feed */}
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${solvedSlots.length === mockCourses.length ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Solver Engine Console</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 space-y-1">
                      <p className="text-slate-400"># Initializing multi-agent scheduling parser...</p>
                      {solvedSlots.map((slot, i) => (
                        <p key={i} className="text-slate-700 font-semibold">
                          ⚡ [Resolved] Assigned {slot.name} to {slot.day} {slot.time} • Room conflict cleared.
                        </p>
                      ))}
                      {solvedSlots.length === mockCourses.length && (
                        <p className="text-emerald-600 font-bold mt-0.5">✓ Solution complete. 0 conflicts, 100% accurate.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              {/* Keyboard Hinge Representation */}
              <div className="h-2 bg-slate-950 w-32 mx-auto rounded-b-xl" />
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-200/80 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">How It Works</h2>
            <p className="text-slate-500 font-semibold text-sm sm:text-base">
              TITAN leverages a highly structured three-step automated generation cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-4 hover:border-blue-500/30 transition duration-300">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">1. Upload Constraints</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Upload your master configuration templates (faculties directory, subjects syllabus, rooms, teaching limits) in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-4 hover:border-blue-500/30 transition duration-300">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">2. Run AI Solver</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                TITAN's multi-agent constraint engine analyzes over 1,200 permutations to guarantee completely collision-free slot allocation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-4 hover:border-blue-500/30 transition duration-300">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">3. Review & Balance</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Visualize teaching hour indicators, drag elements on an active calendar grid, and export print-ready master documents.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 border-t border-slate-200/80 bg-slate-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Key Features</h2>
            <p className="text-slate-500 font-semibold text-sm sm:text-base">
              Intelligent scheduling elements optimized specifically for academic administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
              <div className="space-y-4">
                <div className="text-blue-600">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Workflow Automation</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Say goodbye to conflict sheets. TITAN monitors rooms, instructors, batch cohorts, and slots concurrently to ensure 100% collision-free timetables.
                </p>
              </div>
              <button onClick={onGetStarted} className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-800 text-left flex items-center gap-1.5 cursor-pointer">
                <span>Learn More</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
              <div className="space-y-4">
                <div className="text-blue-600">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Team Collaboration</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Support dynamic file exchanges. Share compiled results with departments, faculties, and batches directly inside beautifully designed directories.
                </p>
              </div>
              <button onClick={onGetStarted} className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-800 text-left flex items-center gap-1.5 cursor-pointer">
                <span>Learn More</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
              <div className="space-y-4">
                <div className="text-blue-600">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Advanced Analytics</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Real-time visualization of teaching hour allocations. Prevent overloaded teachers and ensure completely balanced department progress.
                </p>
              </div>
              <button onClick={onGetStarted} className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-800 text-left flex items-center gap-1.5 cursor-pointer">
                <span>Learn More</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Why TITAN / Testimonials Section */}
      <section id="why-titan" className="py-20 border-t border-slate-200 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Testimonial Quote */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">Why TITAN?</h2>
            <blockquote className="text-lg text-slate-600 font-medium italic leading-relaxed border-l-4 border-blue-600 pl-4">
              "TITAN has completely revolutionized our administrative operations. Previously, resolving department clashes took our team over a week of manual spreadsheet auditing. With TITAN, we generate a flawless, conflict-free schedule in minutes."
            </blockquote>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                RS
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Dr. Rajesh Sharma</p>
                <p className="text-xs text-slate-500 font-semibold">Academic Dean of Engineering</p>
              </div>
            </div>
          </div>

          {/* Graphical Team Illustration representation */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-indigo-500/5 to-transparent" />
            
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Active Classroom Allocation Monitor</h3>
              
              {/* Mock classroom slots */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-slate-700">Room 402 • Batch A</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">Occupied</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">Lab 3 • Batch B</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">Occupied</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-xs font-bold text-slate-700">Room 102 • Batch C</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold border border-slate-200">Available</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Maximize Performance section */}
      <section id="maximize" className="py-20 border-t border-slate-200 bg-slate-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left details */}
          <div className="lg:col-span-5 space-y-6 lg:order-last">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">Maximize Your Department's Efficiency</h2>
            <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
              Establish a highly organized administration center. Group old semesters under saved directories, manage teacher rosters, and preview classroom availability graphs seamlessly.
            </p>
            <button
              onClick={onGetStarted}
              className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Get Started for Free
            </button>
          </div>

          {/* Right mockup elements */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-6">
            {/* Tablet Mockup */}
            <div className="flex-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700">Saved Timetables Directory</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-lg">📁</span>
                  <span className="text-xs font-bold text-slate-700">CSE Department 2026</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-lg">📁</span>
                  <span className="text-xs font-bold text-slate-700">ECE Department 2026</span>
                </div>
              </div>
            </div>

            {/* Mobile Mockup */}
            <div className="w-full sm:w-60 bg-white border border-slate-200 p-6 rounded-2xl shadow-md space-y-4">
              <div className="h-4 w-12 bg-slate-100 rounded-full mx-auto" />
              <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active License</p>
                <p className="text-sm font-extrabold text-slate-800">Academic Enterprise</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-xl text-center border border-blue-50">
                <span className="text-xs font-bold text-blue-700">Status: Active ✓</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Ready to Transform Section */}
      <section className="py-20 border-t border-slate-200 bg-white relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-slate-500 font-semibold text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            TITAN is the all-in-one academic scheduler platform that helps teams collaborate, resolve batch constraints, and export conflict-free timetables in seconds.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-lg shadow-blue-500/15 cursor-pointer"
          >
            Get Started - Free (No Signup Required)
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/10">T</span>
              <span className="text-lg font-extrabold tracking-widest text-slate-900 uppercase">TITAN</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              <a href="#how-it-works" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">How It Works</a>
              <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Key Features</a>
              <a href="#why-titan" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Solutions</a>
              <a href="#maximize" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Platform</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-semibold text-center sm:text-left">
              &copy; 2026 TITAN Academic Timetable Network. All rights reserved. Precision-engineered solutions.
            </p>
            <div className="flex gap-4 opacity-50">
              <span className="text-sm font-bold text-slate-800">Twitter</span>
              <span className="text-sm font-bold text-slate-800">LinkedIn</span>
              <span className="text-sm font-bold text-slate-800">GitHub</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
