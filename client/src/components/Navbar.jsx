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
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 border-b border-stone-200/80 backdrop-blur px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Toggle & Branding */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-stone-500 hover:text-stone-800 p-1.5 rounded-lg focus:outline-none hover:bg-stone-100 transition"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-stone-800 text-sm sm:text-base leading-tight">
                Workforce Optimization System
              </h1>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Digital Attendance & Workforce Management
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Clock & User Profile Badge */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-stone-600 bg-stone-100/90 px-3 py-1.5 rounded-xl border border-stone-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="text-amber-700 font-semibold">{currentTime.toLocaleTimeString()}</span>
          </div>

          {user && (
            <div className="flex items-center space-x-3 pl-2 border-l border-stone-200">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="font-semibold text-xs text-stone-800">{user.name}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500">{user.employeeId} • {user.department}</div>
              </div>

              <div className="w-9 h-9 bg-amber-100 border border-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-sm shadow-xs">
                {user.name.charAt(0)}
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition"
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
