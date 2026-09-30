import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  Clock, 
  Calendar, 
  Filter, 
  PlusCircle, 
  FileSpreadsheet, 
  UserCheck, 
  MapPin,
  CheckCircle2
} from 'lucide-react';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeesList, setEmployeesList] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Admin Override Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    workType: 'On-Site',
    shift: 'Morning Shift (08:00 - 16:00)',
    notes: 'Admin manual entry'
  });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (shiftFilter) params.shift = shiftFilter;
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;

      const res = await API.get('/attendance/history', { params });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    if (user?.role === 'Admin' || user?.role === 'Manager') {
      try {
        const res = await API.get('/employees');
        setEmployeesList(res.data);
        if (res.data.length > 0) {
          setAdminFormData(prev => ({ ...prev, employeeId: res.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to fetch employees list:', err);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchEmployeesList();
  }, [startDate, endDate, shiftFilter, statusFilter, departmentFilter]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/attendance/admin-mark', adminFormData);
      setIsModalOpen(false);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record attendance');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            <span>Attendance & Shift Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical Attendance Logs & Shift Monitoring • Total Records: {history.length}
          </p>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manual Attendance Entry</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Shift</label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Shifts</option>
              <option value="Morning Shift (08:00 - 16:00)">Morning Shift</option>
              <option value="Evening Shift (16:00 - 00:00)">Evening Shift</option>
              <option value="Night Shift (00:00 - 08:00)">Night Shift</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations">Operations</option>
              <option value="Quality">Quality</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Logistics">Logistics</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-lg backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Shift</th>
                <th className="px-4 py-3.5">Clock In</th>
                <th className="px-4 py-3.5">Clock Out</th>
                <th className="px-4 py-3.5">Work Mode</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    Loading attendance history logs...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    No attendance logs found matching filters.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-700/20 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-200">
                      {record.date}
                    </td>
                    <td className="px-4 py-3">
                      {record.employee ? (
                        <div>
                          <div className="font-bold text-slate-100">{record.employee.name}</div>
                          <div className="text-[10px] text-slate-400">{record.employee.employeeId} • {record.employee.department}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">System Employee</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{record.shift?.split(' ')[0]}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {record.clockIn 
                        ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : '--:--'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {record.clockOut 
                        ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : '--:--'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px]">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{record.workType || 'On-Site'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        record.status === 'Late' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        record.status === 'On Leave' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic text-[11px]">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Admin Attendance Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Admin Manual Attendance Entry"
      >
        <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Employee</label>
            <select
              required
              value={adminFormData.employeeId}
              onChange={(e) => setAdminFormData({ ...adminFormData, employeeId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
            >
              {employeesList.map(e => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.employeeId} - {e.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Date</label>
              <input
                type="date"
                required
                value={adminFormData.date}
                onChange={(e) => setAdminFormData({ ...adminFormData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Attendance Status</label>
              <select
                value={adminFormData.status}
                onChange={(e) => setAdminFormData({ ...adminFormData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Work Mode</label>
              <select
                value={adminFormData.workType}
                onChange={(e) => setAdminFormData({ ...adminFormData, workType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="On-Site">On-Site</option>
                <option value="Remote">Remote</option>
                <option value="Field">Field</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Shift</label>
              <select
                value={adminFormData.shift}
                onChange={(e) => setAdminFormData({ ...adminFormData, shift: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Morning Shift (08:00 - 16:00)">Morning Shift</option>
                <option value="Evening Shift (16:00 - 00:00)">Evening Shift</option>
                <option value="Night Shift (00:00 - 08:00)">Night Shift</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Admin Notes</label>
            <input
              type="text"
              value={adminFormData.notes}
              onChange={(e) => setAdminFormData({ ...adminFormData, notes: e.target.value })}
              placeholder="e.g. Approved shift swap or supervisor override"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow"
            >
              Record Attendance
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Attendance;
