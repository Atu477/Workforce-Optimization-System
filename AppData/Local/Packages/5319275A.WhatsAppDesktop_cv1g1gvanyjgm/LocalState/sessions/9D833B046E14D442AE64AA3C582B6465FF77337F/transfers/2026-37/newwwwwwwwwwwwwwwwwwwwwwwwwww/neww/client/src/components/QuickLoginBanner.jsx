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
    <div className="bg-white border border-amber-200/70 rounded-2xl p-3.5 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-amber-700 font-semibold text-sm">
          <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Quick Demo Access Switcher:</span>
          <span className="text-stone-500 text-xs font-normal hidden lg:inline">
            (Click any account to test role permissions instantly)
          </span>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => handleQuickLogin('admin@manpower.com')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => handleQuickLogin('manager@manpower.com')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manager</span>
          </button>
          <button
            onClick={() => handleQuickLogin('employee@manpower.com')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition shadow-2xs"
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
