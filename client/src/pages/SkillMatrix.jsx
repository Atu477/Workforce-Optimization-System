import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  Layers, 
  Search, 
  Award, 
  PlusCircle, 
  CheckCircle, 
  Sparkles, 
  Building2, 
  UserCheck 
} from 'lucide-react';

const SkillMatrix = () => {
  const { user } = useContext(AuthContext);
  const [matrixData, setMatrixData] = useState([]);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Add Skill Catalog Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical', description: '' });

  const fetchSkillMatrix = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSkill) params.skillName = selectedSkill;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedProficiency) params.proficiency = selectedProficiency;
      if (selectedDepartment) params.department = selectedDepartment;

      const res = await API.get('/skills/matrix', { params });
      setMatrixData(res.data);
    } catch (err) {
      console.error('Failed to fetch skill matrix:', err);
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
    fetchSkillMatrix();
    fetchSkillsCatalog();
  }, [selectedSkill, selectedCategory, selectedProficiency, selectedDepartment]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await API.post('/skills/catalog', newSkill);
      setIsModalOpen(false);
      setNewSkill({ name: '', category: 'Technical', description: '' });
      fetchSkillsCatalog();
      fetchSkillMatrix();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const getProficiencyBadge = (prof) => {
    switch (prof) {
      case 'Expert':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Intermediate':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Workforce Skill Matrix & Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search qualified workforce by skill competencies and proficiency ratings
          </p>
        </div>

        {user?.role === 'Admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Skill to Catalog</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Skill Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Filter By Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Skills Catalog ({skillsCatalog.length})</option>
              {skillsCatalog.map(sk => (
                <option key={sk._id} value={sk.name}>{sk.name} ({sk.category})</option>
              ))}
            </select>
          </div>

          {/* Proficiency Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Required Proficiency</label>
            <select
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Any Level</option>
              <option value="Expert">Expert Level Only</option>
              <option value="Intermediate">Intermediate Level & Above</option>
              <option value="Beginner">Beginner Level</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedSkill('');
                setSelectedCategory('');
                setSelectedProficiency('');
                setSelectedDepartment('');
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
            >
              Reset Skill Filters
            </button>
          </div>

        </div>
      </div>

      {/* Skill Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Loading workforce skill inventory...
          </div>
        ) : matrixData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800">
            No workforce members found matching the selected skill criteria.
          </div>
        ) : (
          matrixData.map((emp) => (
            <div 
              key={emp._id} 
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col justify-between hover:border-cyan-500/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{emp.name}</h3>
                    <div className="text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-400">{emp.employeeId}</span> • {emp.designation}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-700 text-[10px] font-medium">
                    {emp.department}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Assigned Shift: <span className="text-slate-200">{emp.shift.split(' ')[0]}</span>
                </div>

                {/* Skill Pills */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Skills Portfolio ({emp.allSkills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.allSkills && emp.allSkills.length > 0 ? (
                      emp.allSkills.map((sk, idx) => {
                        const isMatch = emp.matchedSkills.some(m => m.skillName === sk.skillName);
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium border flex items-center space-x-1 ${
                              isMatch 
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-500/30' 
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            <span>{sk.skillName}</span>
                            <span className={`px-1 rounded text-[9px] font-bold ${getProficiencyBadge(sk.proficiency)}`}>
                              {sk.proficiency}
                            </span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No skill tags</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Available for Assignment</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Skill to Catalog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Skill to Catalog"
      >
        <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Skill Name</label>
            <input
              type="text"
              required
              placeholder="e.g. High-Voltage Wiring or Python Data Analysis"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="Software & IT">Software & IT</option>
              <option value="Engineering">Engineering</option>
              <option value="Machinery & Tools">Machinery & Tools</option>
              <option value="Safety & Compliance">Safety & Compliance</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Logistics">Logistics</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="Brief summary of required competency..."
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
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
              Add to Catalog
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default SkillMatrix;
