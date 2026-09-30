import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Award, Lock, User, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

const Login = () => {
  const [loginId, setLoginId] = useState('admin@manpower.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginId, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (id) => {
    setLoginId(id);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl z-10">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-3">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Manpower & Skill System</h1>
          <p className="text-xs text-slate-400 mt-1">Centralized Workforce & Attendance Portal</p>
        </div>

        {/* Quick Credentials Switcher */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 mb-2">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Select Demo Role to Login:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect('admin@manpower.com')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                loginId === 'admin@manpower.com'
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-900 text-purple-300 border-purple-500/20 hover:bg-slate-800'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('manager@manpower.com')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                loginId === 'manager@manpower.com'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 text-blue-300 border-blue-500/20 hover:bg-slate-800'
              }`}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('employee@manpower.com')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                loginId === 'employee@manpower.com'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-900 text-emerald-300 border-emerald-500/20 hover:bg-slate-800'
              }`}
            >
              Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email or Employee ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. admin@manpower.com or EMP-1001"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95 disabled:opacity-50 mt-6"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Supported Roles: <span className="text-slate-400 font-medium">Admin • Manager • Employee</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
