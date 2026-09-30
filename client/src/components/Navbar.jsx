import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, Clock, Menu, X, Shield, Award } from 'lucide-react';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Manager':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800 backdrop-blur px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Toggle & Branding */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-slate-400 hover:text-slate-200 p-1.5 rounded-lg focus:outline-none"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm sm:text-base leading-tight">
                Manpower & Skill System
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Digital Attendance & Workforce Management
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Clock & User Profile Badge */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="text-cyan-300 font-semibold">{currentTime.toLocaleTimeString()}</span>
          </div>

          {user && (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="font-semibold text-xs text-slate-200">{user.name}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{user.employeeId} • {user.department}</div>
              </div>

              <div className="w-9 h-9 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm">
                {user.name.charAt(0)}
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
