import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import QuickLoginBanner from '../components/QuickLoginBanner';
import {
  TrendingUp, Star, Clock, UserCheck, AlertTriangle,
  ChevronLeft, ChevronRight, BarChart3, Users, Award,
  CheckCircle2, Timer, CalendarOff, Zap, Calendar,
  ShieldAlert, RefreshCw, Sparkles, Filter, ArrowRight,
  CalendarDays, CalendarRange
} from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Helper date utilities
const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRangeDates = (preset) => {
  const now = new Date();
  const todayStr = formatDateStr(now);

  switch (preset) {
    case 'today':
      return { start: todayStr, end: todayStr, label: `Today (${todayStr})` };

    case 'week': {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        start: formatDateStr(monday),
        end: formatDateStr(sunday),
        label: `This Week (${formatDateStr(monday)} to ${formatDateStr(sunday)})`
      };
    }

    case 'month': {
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        start: formatDateStr(firstDay),
        end: formatDateStr(lastDay),
        label: `${MONTHS[month]} ${year} (${formatDateStr(firstDay)} to ${formatDateStr(lastDay)})`
      };
    }

    case 'year': {
      const year = now.getFullYear();
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
        label: `Year ${year} (01 Jan ${year} to 31 Dec ${year})`
      };
    }

    default:
      return { start: todayStr, end: todayStr, label: todayStr };
  }
};

const StarRating = ({ value, onChange, disabled }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s}
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange(s)}
        className={`transition ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
      >
        <Star className={`w-5 h-5 ${s <= (value || 0) ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
      </button>
    ))}
  </div>
);

const MetricCard = ({ icon: Icon, label, value, sub, color = 'cyan' }) => {
  const colorMap = {
    cyan: 'text-amber-700',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    amber: 'text-amber-700',
    rose: 'text-rose-700',
    purple: 'text-purple-700'
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-1 shadow-xs">
      <div className="flex items-center space-x-2 text-stone-500 text-[11px] font-semibold uppercase tracking-wider">
        <Icon className={`w-3.5 h-3.5 ${colorMap[color] || 'text-amber-700'}`} />
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-black ${colorMap[color] || 'text-amber-700'}`}>{value}</div>
      {sub && <div className="text-[11px] text-stone-400 font-medium">{sub}</div>}
    </div>
  );
};

const getScoreColor = (score) => {
  if (score >= 4) return 'text-emerald-700';
  if (score >= 3) return 'text-blue-700';
  if (score >= 2) return 'text-amber-700';
  return 'text-rose-700';
};

const getScoreBg = (score) => {
  if (score >= 4) return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  if (score >= 3) return 'bg-blue-50 border-blue-200 text-blue-800';
  if (score >= 2) return 'bg-amber-50 border-amber-200 text-amber-800';
  return 'bg-rose-50 border-rose-200 text-rose-800';
};

const getAttBg = (pct) => {
  if (pct >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (pct >= 75) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (pct >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};

const Performance = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager';

  // Preset: 'today' | 'week' | 'month' | 'year' | 'custom'
  const [timePreset, setTimePreset] = useState('today');

  // Custom date inputs
  const todayStr = formatDateStr(new Date());
  const [customStart, setCustomStart] = useState(todayStr);
  const [customEnd, setCustomEnd] = useState(todayStr);

  // Active calculated range
  const [activeRange, setActiveRange] = useState(getRangeDates('today'));

  // Data states
  const [teamData, setTeamData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [myMetrics, setMyMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Review modal
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    productivity: 3, quality: 3, punctuality: 3, teamwork: 3, initiative: 3, managerComments: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  const handlePresetSelect = (preset) => {
    setTimePreset(preset);
    if (preset !== 'custom') {
      const r = getRangeDates(preset);
      setActiveRange(r);
    }
  };

  const applyCustomRange = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setActiveRange({
      start: customStart,
      end: customEnd,
      label: `Custom: ${customStart} to ${customEnd}`
    });
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setErrorMsg('');

      if (isAdmin) {
        const res = await API.get(`/performance/team?startDate=${activeRange.start}&endDate=${activeRange.end}`);
        setTeamData(res.data.team || []);
        setSummaryData(res.data.summary || null);
      } else {
        const res = await API.get(`/performance/metrics/${user._id}?startDate=${activeRange.start}&endDate=${activeRange.end}`);
        setMyMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to connect to performance service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id, user?.role, activeRange, timePreset]);

  const openReviewModal = (item) => {
    setReviewTarget(item);
    if (item.review?.ratings) {
      setReviewForm({
        productivity: item.review.ratings.productivity || 3,
        quality: item.review.ratings.quality || 3,
        punctuality: item.review.ratings.punctuality || 3,
        teamwork: item.review.ratings.teamwork || 3,
        initiative: item.review.ratings.initiative || 3,
        managerComments: item.review.managerComments || ''
      });
    } else {
      setReviewForm({ productivity: 3, quality: 3, punctuality: 3, teamwork: 3, initiative: 3, managerComments: '' });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;
    setReviewLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const { managerComments, ...ratings } = reviewForm;

      await API.post('/performance/review', {
        employeeId: reviewTarget.employee._id,
        month,
        year,
        ratings,
        managerComments
      });
      setReviewTarget(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Quick Role Switcher Banner */}
      <QuickLoginBanner />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <span>Workforce Performance Analytics</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {isAdmin 
              ? 'Multi-period factory performance tracking, working hours & supervisor appraisals' 
              : `Personal performance scorecard for ${user?.name}`}
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 bg-[#F8F5EE] hover:bg-[#EFEAE1] text-stone-700 rounded-xl border border-stone-200 transition text-xs font-semibold shadow-2xs"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* TIME FILTER BAR */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 bg-[#F8F5EE] p-1.5 rounded-2xl border border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-400 uppercase px-2">Period:</span>
            
            {[
              { id: 'today', label: 'Today', icon: Clock },
              { id: 'week',  label: 'This Week', icon: CalendarDays },
              { id: 'month', label: 'This Month', icon: Calendar },
              { id: 'year',  label: 'This Year', icon: BarChart3 },
              { id: 'custom', label: 'Custom Range', icon: CalendarRange }
            ].map(p => {
              const Icon = p.icon;
              const active = timePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Period Label */}
          <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Active Range: <strong className="text-stone-900 font-mono">{activeRange.label}</strong></span>
          </div>

        </div>

        {/* Custom Range Picker Form */}
        {timePreset === 'custom' && (
          <form onSubmit={applyCustomRange} className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-stone-100 text-xs">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-stone-500 font-semibold">From:</span>
              <input
                type="date"
                required
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-1.5 text-stone-800 focus:bg-white focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-stone-500 font-semibold">To:</span>
              <input
                type="date"
                required
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-1.5 text-stone-800 focus:bg-white focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-xs transition"
            >
              Apply Filter
            </button>
          </form>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center space-x-3 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div className="py-20 text-center text-stone-400 text-sm flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
          <span>Calculating performance metrics for selected period...</span>
        </div>
      ) : isAdmin ? (
        /* ADMIN & MANAGER DASHBOARD VIEW */
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard 
              icon={Users} 
              label="Total Workers" 
              value={summaryData?.totalWorkforce || teamData.length} 
              sub="Active Factory Staff"
              color="cyan" 
            />
            <MetricCard 
              icon={BarChart3} 
              label="Avg Attendance Rate" 
              value={`${summaryData?.avgAttendance || (teamData.length > 0 ? Math.round(teamData.reduce((a, t) => a + t.autoMetrics.attendancePercent, 0) / teamData.length) : 0)}%`} 
              sub="For selected timeframe"
              color="emerald" 
            />
            <MetricCard 
              icon={Clock} 
              label="Total Hours Worked" 
              value={`${summaryData?.factoryTotalHours || Math.round(teamData.reduce((a, t) => a + t.autoMetrics.totalWorkingHours, 0) * 10) / 10}h`} 
              sub="Factory aggregate output"
              color="blue" 
            />
            <MetricCard 
              icon={Zap} 
              label="Total Overtime" 
              value={`${summaryData?.factoryTotalOvertime || Math.round(teamData.reduce((a, t) => a + t.autoMetrics.overtimeHours, 0) * 10) / 10}h`} 
              sub="Beyond 8-hr standard shift"
              color="purple" 
            />
          </div>

          {/* Period Aggregate Performance Table */}
          <div className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#F8F5EE] border-b border-stone-200/80 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Performance Scorecard — {activeRange.label}
              </span>
              <span className="text-[10px] text-stone-600 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200 font-semibold">
                {teamData.length} Workers Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-center">Days Present</th>
                    <th className="px-4 py-3 text-center">Attendance %</th>
                    <th className="px-4 py-3 text-center">Hours Worked</th>
                    <th className="px-4 py-3 text-center">Overtime</th>
                    <th className="px-4 py-3 text-center">Late Days</th>
                    <th className="px-4 py-3 text-center">Punctuality</th>
                    <th className="px-4 py-3 text-center">Rating</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {teamData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-stone-400">
                        No performance records recorded for this selected time window.
                      </td>
                    </tr>
                  ) : (
                    teamData.map(item => (
                      <tr key={item.employee._id} className="hover:bg-[#FAF7F2] transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-stone-900">{item.employee.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            <span className="text-amber-700 font-semibold">{item.employee.employeeId}</span> • {item.employee.designation}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-600 font-medium">{item.employee.department}</td>
                        <td className="px-4 py-3 text-center font-mono text-stone-800 font-semibold">
                          {item.autoMetrics.daysPresent} <span className="text-stone-400 text-[10px]">/ {item.autoMetrics.totalWorkingDays}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getAttBg(item.autoMetrics.attendancePercent)}`}>
                            {item.autoMetrics.attendancePercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-stone-700 font-mono font-semibold">
                          {item.autoMetrics.totalWorkingHours}h
                        </td>
                        <td className="px-4 py-3 text-center font-mono">
                          {item.autoMetrics.overtimeHours > 0 ? (
                            <span className="text-purple-700 font-bold">+{item.autoMetrics.overtimeHours}h</span>
                          ) : (
                            <span className="text-stone-400">0h</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={item.autoMetrics.daysLate > 0 ? 'text-amber-700 font-bold' : 'text-stone-400'}>
                            {item.autoMetrics.daysLate}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-stone-700 font-mono font-semibold">
                          {item.autoMetrics.punctualityScore}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.review?.overallScore ? (
                            <span className={`font-black text-sm ${getScoreColor(item.review.overallScore)}`}>
                              {item.review.overallScore}<span className="text-[10px] text-stone-400">/5</span>
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openReviewModal(item)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-xl transition shadow-2xs"
                          >
                            {item.review?.status === 'Reviewed' ? 'Edit Rating' : 'Rate Worker'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* EMPLOYEE SELF-VIEW */
        myMetrics ? (
          <div className="space-y-6">
            {/* Employee Aggregate Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard 
                icon={UserCheck} 
                label="Days Present" 
                value={myMetrics.autoMetrics.daysPresent}
                sub={`of ${myMetrics.autoMetrics.totalWorkingDays} recorded`} 
                color="emerald" 
              />
              <MetricCard 
                icon={CalendarOff} 
                label="Absent Days" 
                value={myMetrics.autoMetrics.daysAbsent} 
                color="rose" 
              />
              <MetricCard 
                icon={Timer} 
                label="Late Days" 
                value={myMetrics.autoMetrics.daysLate} 
                color="amber" 
              />
              <MetricCard 
                icon={Clock} 
                label="Total Hours" 
                value={`${myMetrics.autoMetrics.totalWorkingHours}h`} 
                color="cyan" 
              />
              <MetricCard 
                icon={Zap} 
                label="Overtime" 
                value={`${myMetrics.autoMetrics.overtimeHours}h`} 
                color="purple" 
              />
              <MetricCard 
                icon={BarChart3} 
                label="Attendance Rate" 
                value={`${myMetrics.autoMetrics.attendancePercent}%`} 
                color="blue" 
              />
            </div>

            {/* Manager Review Card */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Manager Performance Review Scorecard</span>
              </h3>

              {myMetrics.review?.status === 'Reviewed' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['productivity', 'quality', 'punctuality', 'teamwork', 'initiative'].map(key => (
                      <div key={key} className={`rounded-2xl border p-3.5 text-center ${getScoreBg(myMetrics.review.ratings[key] || 0)}`}>
                        <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 font-semibold">{key}</div>
                        <div className="text-xl font-black">
                          {myMetrics.review.ratings[key] || '—'}<span className="text-[10px] opacity-70">/5</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 pt-2">
                    <span className="text-stone-500 text-xs font-semibold">Overall Score:</span>
                    <span className={`text-2xl font-black ${getScoreColor(myMetrics.review.overallScore)}`}>
                      {myMetrics.review.overallScore}<span className="text-sm text-stone-400">/5.0</span>
                    </span>
                  </div>

                  {myMetrics.review.managerComments && (
                    <div className="bg-[#F8F5EE] border border-stone-200/80 rounded-2xl p-4">
                      <div className="text-[10px] uppercase text-stone-400 font-semibold mb-1">Supervisor Comments</div>
                      <p className="text-sm text-stone-700">{myMetrics.review.managerComments}</p>
                    </div>
                  )}

                  {myMetrics.review.reviewedBy && (
                    <div className="text-[11px] text-stone-500">
                      Reviewed by: <span className="text-stone-800 font-semibold">{myMetrics.review.reviewedBy.name}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-stone-400 text-sm bg-[#FAF7F2] rounded-2xl border border-stone-200">
                  <Star className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  No formal review submitted for this period yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-stone-400 bg-white border border-stone-200/80 rounded-3xl">
            No performance metrics found for this period.
          </div>
        )
      )}

      {/* SUBMIT REVIEW MODAL */}
      <Modal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title={`Supervisor Performance Review — ${reviewTarget?.employee?.name || ''}`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-5 text-xs">
          {/* Quick Stats Summary */}
          {reviewTarget && (
            <div className="grid grid-cols-3 gap-2 bg-[#F8F5EE] rounded-2xl p-3 border border-stone-200/80">
              <div className="text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">Attendance</div>
                <div className="text-lg font-black text-amber-700">{reviewTarget.autoMetrics.attendancePercent}%</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">Hours</div>
                <div className="text-lg font-black text-blue-700">{reviewTarget.autoMetrics.totalWorkingHours}h</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">Punctuality</div>
                <div className="text-lg font-black text-emerald-700">{reviewTarget.autoMetrics.punctualityScore}%</div>
              </div>
            </div>
          )}

          {/* Rating Categories */}
          <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
            {['productivity', 'quality', 'punctuality', 'teamwork', 'initiative'].map(key => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-stone-700 font-semibold capitalize w-28">{key}</label>
                <StarRating
                  value={reviewForm[key]}
                  onChange={v => setReviewForm(f => ({ ...f, [key]: v }))}
                />
              </div>
            ))}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Supervisor Comments</label>
            <textarea
              rows="3"
              placeholder="Feedback on worker output, machine handling, precision, punctuality..."
              value={reviewForm.managerComments}
              onChange={e => setReviewForm(f => ({ ...f, managerComments: e.target.value }))}
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:bg-white focus:border-amber-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setReviewTarget(null)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewLoading}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition"
            >
              {reviewLoading ? 'Saving...' : 'Save Performance Review'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Performance;
