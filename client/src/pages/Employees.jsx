import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  UserX, 
  UserCheck, 
  Tag, 
  Mail, 
  Phone, 
  Briefcase, 
  ShieldCheck 
} from 'lucide-react';

const Employees = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsCatalog, setSkillsCatalog] = useState([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering',
    designation: '',
    shift: 'Morning Shift (08:00 - 16:00)',
    contactNumber: '',
    skills: []
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (departmentFilter) params.department = departmentFilter;
      if (roleFilter) params.role = roleFilter;
      if (shiftFilter) params.shift = shiftFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/employees', { params });
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillsCatalog = async () => {
    try {
      const res = await API.get('/skills/catalog');
      setSkillsCatalog(res.data);
    } catch (err) {
      console.error('Failed to fetch skills catalog:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSkillsCatalog();
  }, [search, departmentFilter, roleFilter, shiftFilter, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      employeeId: `EMP-${1001 + employees.length}`,
      name: '',
      email: '',
      password: 'password123',
      role: 'Employee',
      department: 'Engineering',
      designation: '',
      shift: 'Morning Shift (08:00 - 16:00)',
      contactNumber: '',
      skills: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      password: '',
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      shift: emp.shift,
      contactNumber: emp.contactNumber || '',
      skills: emp.skills || []
    });
    setIsModalOpen(true);
  };

  const handleToggleSkill = (skillName, category) => {
    const existingIndex = formData.skills.findIndex(s => s.skillName === skillName);
    if (existingIndex > -1) {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s.skillName !== skillName)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { skillName, category, proficiency: 'Intermediate' }]
      }));
    }
  };

  const handleProficiencyChange = (skillName, proficiency) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.skillName === skillName ? { ...s, proficiency } : s)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await API.put(`/employees/${editingEmployee._id}`, formData);
      } else {
        await API.post('/employees', formData);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleStatus = async (empId) => {
    try {
      await API.delete(`/employees/${empId}`);
      fetchEmployees();
    } catch (err) {
      alert('Failed to change status');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized Manpower Database • Total Listed: {employees.length}
          </p>
        </div>

        {user?.role === 'Admin' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID, email, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Operations">Operations</option>
            <option value="Quality">Quality</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Logistics">Logistics</option>
            <option value="HR">HR</option>
          </select>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Shifts</option>
            <option value="Morning Shift (08:00 - 16:00)">Morning Shift</option>
            <option value="Evening Shift (16:00 - 00:00)">Evening Shift</option>
            <option value="Night Shift (00:00 - 08:00)">Night Shift</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-lg backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3.5">Employee ID & Name</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Shift Schedule</th>
                <th className="px-4 py-3.5">Skills Tagged</th>
                <th className="px-4 py-3.5">Status</th>
                {user?.role === 'Admin' && <th className="px-4 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    Loading employee directory...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    No employees matching the criteria found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-700/20 transition">
                    <td className="px-4 py-3 font-medium text-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                            <span className="font-mono text-cyan-400">{emp.employeeId}</span>
                            <span>•</span>
                            <span>{emp.designation}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        emp.role === 'Admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        emp.role === 'Manager' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        'bg-slate-700/60 text-slate-300 border-slate-600'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{emp.department}</td>
                    <td className="px-4 py-3 text-slate-300">{emp.shift}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {emp.skills && emp.skills.length > 0 ? (
                          emp.skills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-900 text-cyan-300 border border-slate-700 rounded text-[10px]">
                              {s.skillName} ({s.proficiency.charAt(0)})
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No skills assigned</span>
                        )}
                        {emp.skills && emp.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">+{emp.skills.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        emp.status === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 rounded-lg transition"
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp._id)}
                          className={`p-1.5 rounded-lg transition ${
                            emp.status === 'Active' 
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-700' 
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                          }`}
                          title={emp.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
                        >
                          {emp.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee Record' : 'Add New Employee Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Employee ID</label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {editingEmployee ? 'Password (Leave blank to keep existing)' : 'Password'}
              </label>
              <input
                type="password"
                required={!editingEmployee}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Quality">Quality</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Logistics">Logistics</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Designation / Title</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Automation Engineer"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Morning Shift (08:00 - 16:00)">Morning Shift (08:00 - 16:00)</option>
                <option value="Evening Shift (16:00 - 00:00)">Evening Shift (16:00 - 00:00)</option>
                <option value="Night Shift (00:00 - 08:00)">Night Shift (00:00 - 08:00)</option>
              </select>
            </div>
          </div>

          {/* Skill Tagging Selection */}
          <div className="pt-2">
            <label className="block text-slate-300 font-medium mb-2">Tag Employee Skills</label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
              {skillsCatalog.map((sk) => {
                const assigned = formData.skills.find(s => s.skillName === sk.name);
                return (
                  <div key={sk._id} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={!!assigned}
                        onChange={() => handleToggleSkill(sk.name, sk.category)}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-0"
                      />
                      <span>{sk.name} <span className="text-[10px] text-slate-500">({sk.category})</span></span>
                    </label>
                    {assigned && (
                      <select
                        value={assigned.proficiency}
                        onChange={(e) => handleProficiencyChange(sk.name, e.target.value)}
                        className="bg-slate-950 text-cyan-300 text-[10px] border border-slate-700 rounded px-2 py-0.5"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow"
            >
              {editingEmployee ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
