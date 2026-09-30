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

  const COLORS = ['#10b981', '#f43f5e', '#f59e0b'];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {user?.role === 'Admin' && 'Admin Executive Dashboard'}
              {user?.role === 'Manager' && 'Manager Operations Dashboard'}
              {user?.role === 'Employee' && `Welcome back, ${user?.name}! 👋`}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              user?.role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
              user?.role === 'Manager' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}>
              {user?.role === 'Admin' ? '🛡️ Administrator Control' :
               user?.role === 'Manager' ? '⚡ Floor & Shift Operations' :
               '👷 Employee Portal'}
            </span>
          </div>
          <p className="text-xs text-stone-500">
            {user?.role === 'Admin' && `Enterprise Master Overview • Logged in as ${user?.name} (${user?.email}) • Full Administrative Authority`}
            {user?.role === 'Manager' && `Factory Floor Supervision • Shift Coverage, Department Operations & Workforce Attendance (${user?.name})`}
            {user?.role === 'Employee' && 'Factory Workforce Self-Service Portal • Shift Schedule & Attendance'}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-[#F8F5EE] hover:bg-[#EFEAE1] text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
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
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-stone-800 flex items-center space-x-2 mb-4">
                <TrendingUp className="w-4 h-4 text-amber-600" />
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
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '12px', color: '#1c1917', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-stone-800 flex items-center space-x-2 mb-4">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Department Availability Comparison</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe1" />
                    <XAxis dataKey="department" stroke="#78716c" fontSize={11} />
                    <YAxis stroke="#78716c" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '12px', color: '#1c1917', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                    />
                    <Bar dataKey="present" name="Present" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="total" name="Total Workforce" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Real-Time Roster */}
          {availability && (
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Real-Time Shift Availability Roster</span>
                  </h3>
                  <p className="text-xs text-stone-500">Live active workforce roster for today ({availability.date})</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">
                  {availability.summary.present} / {availability.summary.totalActive} Active Workers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F5EE] text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Clock In</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {availability.availabilityList.map(({ employee, attendance, status }) => (
                      <tr key={employee._id} className="hover:bg-[#FAF7F2] transition">
                        <td className="px-4 py-3 font-semibold text-stone-800">
                          <div>{employee.name}</div>
                          <div className="text-[10px] text-stone-400 font-normal">{employee.employeeId} • {employee.designation}</div>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{employee.department}</td>
                        <td className="px-4 py-3 text-stone-600">{employee.shift.split(' ')[0]}</td>
                        <td className="px-4 py-3 font-mono text-stone-700 font-medium">
                          {attendance?.clockIn 
                            ? new Date(attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'
                          }
                        </td>
                        <td className="px-4 py-3 text-stone-600">{attendance?.workType || 'On-Site'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            status === 'On Leave' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Assigned Shift"
              value={user?.shift?.split(' ')[0] || 'Morning'}
              icon={Clock}
              color="cyan"
              subtext={user?.shift}
            />
            <StatCard
              title="Department & Role"
              value={user?.department || 'Operations'}
              icon={Building2}
              color="purple"
              subtext={`${user?.employeeId} • ${user?.designation}`}
            />
            <StatCard
              title="Annual Leave Balance"
              value="25 Days"
              icon={Calendar}
              color="emerald"
              subtext="Paid time off available"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: My Recent Attendance History */}
            <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-800 text-sm flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Recent Attendance Activity</span>
                </h3>
                <Link to="/attendance" className="text-xs text-amber-600 hover:text-amber-700 hover:underline flex items-center space-x-1 font-semibold">
                  <span>View All Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F5EE] text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Clock In</th>
                      <th className="px-3 py-2.5">Clock Out</th>
                      <th className="px-3 py-2.5">Work Type</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          No attendance records found yet. Use the Clock-In button above when your shift starts.
                        </td>
                      </tr>
                    ) : (
                      myHistory.slice(0, 7).map((rec) => (
                        <tr key={rec._id} className="hover:bg-[#FAF7F2] transition">
                          <td className="px-3 py-2.5 font-mono text-stone-800 font-semibold">{rec.date}</td>
                          <td className="px-3 py-2.5 font-mono text-stone-600">
                            {rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-stone-600">
                            {rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (rec.clockIn ? <span className="text-amber-600 font-semibold font-sans">Active</span> : '--:--')}
                          </td>
                          <td className="px-3 py-2.5 text-stone-600">{rec.workType || 'On-Site'}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              rec.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-yellow-50 text-yellow-800 border-yellow-200'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: My Leaves & Quick Action */}
            <div className="space-y-6">
              
              {/* My Leaves Status */}
              <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-800 text-sm flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>My Leave Requests</span>
                  </h3>
                  <Link 
                    to="/leaves" 
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    + Apply Leave
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {myLeaves.length > 0 ? (
                    myLeaves.slice(0, 4).map((l) => (
                      <div key={l._id} className="flex items-center justify-between bg-[#F8F5EE] p-3 rounded-2xl border border-stone-200/80 text-xs">
                        <div>
                          <div className="font-semibold text-stone-800">{l.leaveType}</div>
                          <div className="text-[10px] text-stone-500 mt-0.5">{l.startDate} to {l.endDate}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          l.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-stone-400 italic text-xs py-4 text-center">
                      No leave requests submitted.
                    </div>
                  )}
                </div>
              </div>

              {/* Helpful Factory Guidelines Card */}
              <div className="bg-[#FAF7F2] border border-stone-200/90 rounded-3xl p-5 text-xs text-stone-600 space-y-2">
                <div className="font-bold text-stone-800 text-xs flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Workforce Daily Checklist</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-500">
                  <li>Clock in on time at your station.</li>
                  <li>Verify scheduled work mode & notes.</li>
                  <li>Clock out at the end of your shift.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;
