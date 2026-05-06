import React, { useState } from 'react';

export default function LoginPage({ onLoginSuccess, onBackToHome }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulated authentic authentication flow
    setTimeout(() => {
      if (username.trim() && password.trim()) {
        onLoginSuccess();
      } else {
        setError('Please fill out all fields.');
      }
      setLoading(false);
    }, 800);
  };

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess();
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-6 relative font-sans selection:bg-blue-500/20">
      {/* Background glow effects */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              TITAN
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600">Unlock automatic, conflict-free academic scheduling</p>
        </div>

        {/* Login Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Log in to your Workspace</h2>
            <p className="text-xs text-slate-500 font-medium">No account required. Use demo credentials or log in instantly as guest.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm outline-none text-slate-800 transition"
                placeholder="Enter demo username"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm outline-none text-slate-800 transition"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-semibold text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/10 transform hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase tracking-widest font-black">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Quick Login - No Signup Guest mode */}
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg className="w-4.5 h-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Quick Login (Guest Mode)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
