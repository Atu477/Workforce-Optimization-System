import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, Play, Square, MapPin, FileText, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const ClockWidget = ({ onAttendanceChange }) => {
  const { user } = useContext(AuthContext);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [workType, setWorkType] = useState('On-Site');
  const [notes, setNotes] = useState('');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await API.get('/attendance/today');
      setTodayAttendance(res.data.attendance);
      if (res.data.attendance?.workType) {
        setWorkType(res.data.attendance.workType);
      }
    } catch (err) {
      console.error('Failed to fetch today attendance status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      const res = await API.post('/attendance/clock-in', { workType, notes });
      setTodayAttendance(res.data.attendance);
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Clock in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      const res = await API.post('/attendance/clock-out');
      setTodayAttendance(res.data.attendance);
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Clock out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-700 rounded w-1/2"></div>
      </div>
    );
  }

  const isClockedIn = todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut;
  const isClockedOut = todayAttendance && todayAttendance.clockOut;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Section: Live Time & Status */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Clock className="w-4 h-4" />
            <span>Self-Service Attendance</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {liveTime.toLocaleTimeString()}
            </h2>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{liveTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-medium">Today's Status:</span>
            {!todayAttendance && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-300 border border-slate-600">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                <span>Not Clocked In</span>
              </span>
            )}
            {isClockedIn && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clocked In ({todayAttendance.workType})</span>
              </span>
            )}
            {isClockedOut && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Shift Completed</span>
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400">
            Assigned Shift: <span className="text-slate-200 font-medium">{user?.shift}</span>
          </div>
        </div>

        {/* Middle Section: Inputs (Work Type & Notes) when not yet completed */}
        {!isClockedOut && (
          <div className="w-full lg:w-auto space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Work Mode:</span>
              <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {['On-Site', 'Remote', 'Field'].map(type => (
                  <button
                    key={type}
                    disabled={isClockedIn}
                    onClick={() => setWorkType(type)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                      workType === type 
                        ? 'bg-cyan-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {!isClockedIn && (
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Add optional shift notes or tasks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Right Section: Action Buttons */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
          {!todayAttendance || !todayAttendance.clockIn ? (
            <button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{actionLoading ? 'Clocking In...' : 'Clock In Now'}</span>
            </button>
          ) : isClockedIn ? (
            <button
              onClick={handleClockOut}
              disabled={actionLoading}
              className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>{actionLoading ? 'Clocking Out...' : 'Clock Out Now'}</span>
            </button>
          ) : (
            <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
              Clocked In: <span className="font-mono font-bold text-white">{new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <br />
              Clocked Out: <span className="font-mono font-bold text-white">{new Date(todayAttendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClockWidget;
