import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import QuickLoginBanner from '../components/QuickLoginBanner';
import ClockWidget from '../components/ClockWidget';
import StatCard from '../components/StatCard';
import { 
  Users, 
  UserCheck, 
  UserX, 
  CalendarOff, 
  Clock, 
  Layers, 
  TrendingUp, 
  Building2,
  RefreshCw,
  Award,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'Admin' || user?.role === 'Manager') {
        const [statsRes, availRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/attendance/availability')
        ]);
        setStats(statsRes.data);
        setAvailability(availRes.data);
      } else {
        // Employee dashboard specific calls
        const [historyRes, leavesRes] = await Promise.all([
          API.get('/attendance/history'),
          API.get('/leaves')
        ]);
        setMyHistory(historyRes.data);
        setMyLeaves(leavesRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  const pieData = stats ? [
    { name: 'Present', value: stats.metrics.presentToday },
    { name: 'Absent', value: stats.metrics.absentToday },
    { name: 'On Leave', value: stats.metrics.onLeaveToday },
  ] : [];

  const isEmployee = user?.role === 'Employee';

  return (
    <div className="space-y-6">
      {/* Quick Role Switcher Banner */}
      <QuickLoginBanner />

      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isEmployee 
              ? 'Employee Self-Service Portal • Manage Attendance, Shifts & Skills'
              : `Real-time Workforce Availability Dashboard • Role: ${user?.role}`}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Clock In / Clock Out Self-Service Widget */}
      <ClockWidget onAttendanceChange={fetchDashboardData} />

      {/* ADMIN & MANAGER DASHBOARD VIEW */}
      {!isEmployee && stats && (
        <>
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Active Workforce"
              value={stats.metrics.activeEmployees}
              icon={Users}
              color="cyan"
              subtext={`${stats.metrics.totalEmployees} total registered`}
            />
            <StatCard
              title="Present Today"
              value={stats.metrics.presentToday}
              icon={UserCheck}
              color="emerald"
              subtext={`${stats.metrics.availabilityPercentage}% Availability Rate`}
            />
            <StatCard
              title="Absent Today"
              value={stats.metrics.absentToday}
              icon={UserX}
              color="rose"
              subtext="Workforce gap count"
            />
            <StatCard
              title="On Leave Today"
              value={stats.metrics.onLeaveToday}
              icon={CalendarOff}
              color="amber"
              subtext={`${stats.metrics.pendingLeaves} pending approvals`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 mb-4">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Today's Attendance Breakdown</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 mb-4">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Department Availability Comparison</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total Workforce" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Real-Time Roster */}
          {availability && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Real-Time Shift Availability Roster</span>
                  </h3>
                  <p className="text-xs text-slate-400">Live active workforce roster for today ({availability.date})</p>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold rounded-full">
                  {availability.summary.present} / {availability.summary.totalActive} Active Workers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/50">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Clock In</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {availability.availabilityList.map(({ employee, attendance, status }) => (
                      <tr key={employee._id} className="hover:bg-slate-700/20 transition">
                        <td className="px-4 py-3 font-medium text-slate-200">
                          <div>{employee.name}</div>
                          <div className="text-[10px] text-slate-400">{employee.employeeId} • {employee.designation}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{employee.department}</td>
                        <td className="px-4 py-3 text-slate-300">{employee.shift.split(' ')[0]}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {attendance?.clockIn 
                            ? new Date(attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'
                          }
                        </td>
                        <td className="px-4 py-3 text-slate-300">{attendance?.workType || 'On-Site'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            status === 'Late' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            status === 'On Leave' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* EMPLOYEE SELF-SERVICE DASHBOARD VIEW */}
      {isEmployee && (
        <div className="space-y-6">
          
          {/* Employee Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Shift Schedule"
              value={user?.shift?.split(' ')[0] || 'Morning'}
              icon={Clock}
              color="cyan"
              subtext={user?.shift}
            />
            <StatCard
              title="Department & Title"
              value={user?.department || 'Engineering'}
              icon={Building2}
              color="purple"
              subtext={user?.designation}
            />
            <StatCard
              title="Leave Quota Remaining"
              value="25 Days"
              icon={Calendar}
              color="emerald"
              subtext="8 Casual • 5 Sick • 12 Annual"
            />
            <StatCard
              title="Tagged Competencies"
              value={`${user?.skills?.length || 0} Skills`}
              icon={Layers}
              color="amber"
              subtext="Self-assessed portfolio"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: My Recent Attendance Logs */}
            <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>My Attendance History</span>
                </h3>
                <Link to="/attendance" className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-medium">
                  <span>View Full Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/50">
                    <tr>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Clock In</th>
                      <th className="px-3 py-2.5">Clock Out</th>
                      <th className="px-3 py-2.5">Mode</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {myHistory.slice(0, 5).map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-700/20 transition">
                        <td className="px-3 py-2.5 font-mono text-slate-200 font-medium">{rec.date}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-300">
                          {rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-300">
                          {rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-300">{rec.workType || 'On-Site'}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            rec.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            rec.status === 'Late' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: My Skills & Leave Status */}
            <div className="space-y-6">
              
              {/* My Skill Ratings Widget */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>My Skills Portfolio</span>
                  </h3>
                  <Link to="/profile" className="text-xs text-cyan-400 hover:underline font-medium">Update</Link>
                </div>

                <div className="space-y-2">
                  {user?.skills && user.skills.length > 0 ? (
                    user.skills.map((sk, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <div className="font-semibold text-slate-200">{sk.skillName}</div>
                          <div className="text-[10px] text-slate-400">{sk.category}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-bold">
                          {sk.proficiency}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic text-xs py-2">No skill tags added yet.</div>
                  )}
                </div>
              </div>

              {/* My Leaves Quick Status */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>My Leave Requests</span>
                  </h3>
                  <Link to="/leaves" className="text-xs text-amber-400 hover:underline font-medium">Apply</Link>
                </div>

                <div className="space-y-2">
                  {myLeaves.length > 0 ? (
                    myLeaves.slice(0, 3).map((l) => (
                      <div key={l._id} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <div className="font-semibold text-slate-200">{l.leaveType}</div>
                          <div className="text-[10px] text-slate-400">{l.startDate} to {l.endDate}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          l.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          l.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic text-xs py-2">No leave requests submitted.</div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;
