import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  CalendarDays, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  FileText,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leave Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leaves', leaveForm);
      setIsModalOpen(false);
      setLeaveForm({
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      await API.put(`/leaves/${leaveId}/status`, { status });
      fetchLeaves();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const isAdminOrSupervisor = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-amber-400" />
            <span>{user?.role === 'Admin' ? 'Supervisory Leave Approvals Portal' : 'My Leave Applications'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'Admin' 
              ? 'Review, approve, or reject employee leave requests across departments' 
              : 'Apply for leave, view approval status, and manage your annual leave balance'}
          </p>
        </div>

        {/* Admins oversee/approve leaves and do NOT apply for leave; Employees can apply for leave */}
        {user?.role !== 'Admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Employee Leave Balance Summary Cards (Visible for Non-Admins) */}
      {user?.role !== 'Admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Casual Leave Balance</p>
              <h4 className="text-xl font-bold text-emerald-400 mt-1">8 Days Left</h4>
              <p className="text-[10px] text-slate-500">Out of 12 Annual Quota</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-bold text-sm">
              CL
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Sick Leave Balance</p>
              <h4 className="text-xl font-bold text-cyan-400 mt-1">5 Days Left</h4>
              <p className="text-[10px] text-slate-500">Out of 7 Annual Quota</p>
            </div>
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-sm">
              SL
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Annual Earned Leave</p>
              <h4 className="text-xl font-bold text-purple-400 mt-1">12 Days Left</h4>
              <p className="text-[10px] text-slate-500">Out of 15 Annual Quota</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 font-bold text-sm">
              AL
            </div>
          </div>
        </div>
      )}

      {/* Leaves List Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-lg backdrop-blur overflow-hidden">
        <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{isAdminOrSupervisor ? 'All Employee Leave Applications' : 'My Application History'}</span>
          </h3>
          <span className="text-xs text-slate-400">Total Applications: {leaves.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Leave Category</th>
                <th className="px-4 py-3.5">Start Date</th>
                <th className="px-4 py-3.5">End Date</th>
                <th className="px-4 py-3.5">Reason</th>
                <th className="px-4 py-3.5">Status</th>
                {isAdminOrSupervisor && (
                  <th className="px-4 py-3.5 text-right">Supervisor Approval Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    No leave applications found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-700/20 transition">
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {leave.employee ? (
                        <div>
                          <div className="font-bold text-slate-100">{leave.employee.name}</div>
                          <div className="text-[10px] text-slate-400">{leave.employee.employeeId} • {leave.employee.department}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Self Request</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-semibold">{leave.leaveType}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{leave.startDate}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{leave.endDate}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{leave.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        leave.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        leave.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    {isAdminOrSupervisor && (
                      <td className="px-4 py-3 text-right space-x-2">
                        {leave.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-medium transition"
                            >
                              Approve Leave
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[11px] font-medium transition"
                            >
                              Reject Leave
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Actioned by {leave.approvedBy?.name || 'Supervisor'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal (For Employees) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Leave Application"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Leave Category</label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Start Date</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">End Date</label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Reason for Leave</label>
            <textarea
              rows="3"
              required
              placeholder="State clear rationale for leave request..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Leaves;
