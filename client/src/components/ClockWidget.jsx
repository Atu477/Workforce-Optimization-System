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
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 bg-stone-100 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-stone-100 rounded w-1/2"></div>
      </div>
    );
  }

  const isClockedIn = todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut;
  const isClockedOut = todayAttendance && todayAttendance.clockOut;

  return (
    <div className="bg-gradient-to-br from-white to-[#FAF6EE] border border-stone-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Section: Live Time & Status */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Clock className="w-4 h-4" />
            <span>Self-Service Attendance</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <h2 className="text-3xl font-black text-stone-900 font-mono tracking-tight">
              {liveTime.toLocaleTimeString()}
            </h2>
            <span className="text-xs text-stone-500 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{liveTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-stone-500 font-medium">Today's Status:</span>
            {!todayAttendance && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Not Clocked In</span>
              </span>
            )}
            {isClockedIn && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clocked In ({todayAttendance.workType})</span>
              </span>
            )}
            {isClockedOut && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Shift Completed</span>
              </span>
            )}
          </div>

          <div className="text-xs text-stone-500">
            Assigned Shift: <span className="text-stone-800 font-semibold">{user?.shift}</span>
          </div>
        </div>

        {/* Middle Section: Inputs (Work Type & Notes) when not yet completed */}
        {!isClockedOut && (
          <div className="w-full lg:w-auto space-y-3 bg-[#F8F5EE] p-4 rounded-2xl border border-stone-200/80">
            <div className="flex items-center space-x-2 text-xs text-stone-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Work Mode:</span>
              <div className="flex space-x-1 bg-white p-1 rounded-xl border border-stone-200">
                {['On-Site', 'Remote', 'Field'].map(type => (
                  <button
                    key={type}
                    disabled={isClockedIn}
                    onClick={() => setWorkType(type)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      workType === type 
                        ? 'bg-amber-500 text-white shadow-xs font-semibold' 
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {!isClockedIn && (
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Add optional shift notes or tasks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500 placeholder-stone-400"
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
              className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-md shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{actionLoading ? 'Clocking In...' : 'Clock In Now'}</span>
            </button>
          ) : isClockedIn ? (
            <button
              onClick={handleClockOut}
              disabled={actionLoading}
              className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-md shadow-rose-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>{actionLoading ? 'Clocking Out...' : 'Clock Out Now'}</span>
            </button>
          ) : (
            <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs">
              Clocked In: <span className="font-mono font-bold text-stone-900">{new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <br />
              Clocked Out: <span className="font-mono font-bold text-stone-900">{new Date(todayAttendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClockWidget;
