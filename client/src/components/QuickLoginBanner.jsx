import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, UserCheck, User, Zap } from 'lucide-react';

const QuickLoginBanner = () => {
  const { login } = useContext(AuthContext);

  const handleQuickLogin = async (email) => {
    try {
      await login(email, 'password123');
    } catch (err) {
      alert(err.response?.data?.message || 'Quick login failed');
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-4 mb-6 shadow-md backdrop-blur">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span>Quick Demo Access Switcher:</span>
          <span className="text-slate-400 text-xs font-normal hidden lg:inline">
            (Click any account to test role permissions instantly)
          </span>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => handleQuickLogin('admin@manpower.com')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => handleQuickLogin('manager@manpower.com')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manager</span>
          </button>
          <button
            onClick={() => handleQuickLogin('employee@manpower.com')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Employee</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLoginBanner;
