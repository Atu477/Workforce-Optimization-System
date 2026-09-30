import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Layers, 
  CalendarDays, 
  User, 
  ShieldAlert,
  TrendingUp 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);

  const getLabel = (path, defaultLabel) => {
    if (user?.role === 'Admin') {
      if (path === '/leaves') return 'Leave Approvals';
      if (path === '/attendance') return 'Workforce Roster';
      if (path === '/') return 'Admin Dashboard';
    } else if (user?.role === 'Manager') {
      if (path === '/leaves') return 'Leave Approvals';
      if (path === '/attendance') return 'Workforce Roster';
      if (path === '/') return 'Manager Dashboard';
    } else {
      if (path === '/leaves') return 'My Leaves';
      if (path === '/attendance') return 'My Attendance';
      if (path === '/profile') return 'My Profile';
      if (path === '/') return 'Employee Home';
    }
    return defaultLabel;
  };

  const navItems = [
    { label: getLabel('/', 'Dashboard'), path: '/', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    { label: 'Employee Directory', path: '/employees', icon: Users, roles: ['Admin', 'Manager'] },
    { label: getLabel('/attendance', 'Attendance'), path: '/attendance', icon: Clock, roles: ['Admin', 'Manager', 'Employee'] },
    { label: 'Skill Matrix', path: '/skills', icon: Layers, roles: ['Admin', 'Manager'] },
    { label: 'Performance', path: '/performance', icon: TrendingUp, roles: ['Admin', 'Manager'] },
    { label: getLabel('/leaves', 'Leave Portal'), path: '/leaves', icon: CalendarDays, roles: ['Admin', 'Manager', 'Employee'] },
    { label: getLabel('/profile', 'My Profile'), path: '/profile', icon: User, roles: ['Admin', 'Manager', 'Employee'] },
  ];

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 border-r border-slate-800
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-200 ease-in-out
        flex flex-col justify-between p-4 overflow-y-auto shrink-0
      `}>
        <div className="space-y-6">
          {/* Navigation Category Header */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                if (!item.roles || !Array.isArray(item.roles) || !item.roles.includes(user?.role)) return null;
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition
                      ${isActive 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/10' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Role Info Panel */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="font-medium">Role: {user?.role}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {user?.role === 'Admin' && 'Admin & Supervisory Control'}
            {user?.role === 'Manager' && 'Team & Department Supervision'}
            {user?.role === 'Employee' && 'Self-service Attendance & Skills'}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
