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
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-3xl p-8 shadow-xl z-10">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Workforce Optimization</h1>
          <p className="text-xs text-stone-500 mt-1">Digital Attendance & Workforce Management</p>
        </div>

        {/* Quick Credentials Switcher */}
        <div className="bg-[#F8F5EE] border border-stone-200/80 rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-700 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Demo Role to Login:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect('admin@manpower.com')}
              className={`px-2 py-2 rounded-xl text-xs font-bold border transition ${
                loginId === 'admin@manpower.com'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('manager@manpower.com')}
              className={`px-2 py-2 rounded-xl text-xs font-bold border transition ${
                loginId === 'manager@manpower.com'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('employee@manpower.com')}
              className={`px-2 py-2 rounded-xl text-xs font-bold border transition ${
                loginId === 'employee@manpower.com'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Email or Employee ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. admin@manpower.com or EMP-1001"
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50 mt-6"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Supported Roles: <span className="text-stone-700 font-semibold">Admin • Manager • Employee</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
