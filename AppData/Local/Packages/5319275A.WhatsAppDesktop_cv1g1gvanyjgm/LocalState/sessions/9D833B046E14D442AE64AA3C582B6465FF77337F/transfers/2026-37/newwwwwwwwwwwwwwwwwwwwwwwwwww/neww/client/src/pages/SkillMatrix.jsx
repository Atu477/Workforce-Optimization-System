import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Layers,
  Award,
  PlusCircle,
  Pencil,
  Trash2,
  UserCheck,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  Cpu,
  Package,
  FlameKindling,
  Cog
} from 'lucide-react';

// â”€â”€â”€ Factory-specific skill categories for Ludhiana mechanical factory â”€â”€â”€â”€â”€â”€â”€â”€
const SKILL_CATEGORIES = [
  { value: 'Machining & CNC',       label: 'Machining & CNC',       icon: Cog,           color: 'text-cyan-400'    },
  { value: 'Welding & Fabrication', label: 'Welding & Fabrication',  icon: FlameKindling, color: 'text-orange-400'  },
  { value: 'Electrical & Wiring',   label: 'Electrical & Wiring',   icon: Cpu,           color: 'text-yellow-400'  },
  { value: 'Quality Control',       label: 'Quality Control',        icon: CheckCircle2,  color: 'text-emerald-400' },
  { value: 'Safety & Compliance',   label: 'Safety & Compliance',    icon: ShieldCheck,   color: 'text-red-400'     },
  { value: 'Machinery & Tools',     label: 'Machinery & Tools',      icon: Wrench,        color: 'text-blue-400'    },
  { value: 'Logistics',             label: 'Logistics',              icon: Package,       color: 'text-purple-400'  },
  { value: 'Engineering',           label: 'Engineering',            icon: Layers,        color: 'text-indigo-400'  },
  { value: 'Software & IT',         label: 'Software & IT',          icon: BookOpen,      color: 'text-pink-400'    },
  { value: 'General',               label: 'General',                icon: Award,         color: 'text-slate-400'   },
];

const getCategoryMeta = (catValue) =>
  SKILL_CATEGORIES.find(c => c.value === catValue) || SKILL_CATEGORIES[SKILL_CATEGORIES.length - 1];

const getProficiencyBadge = (prof) => {
  switch (prof) {
    case 'Expert':       return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'Intermediate': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    default:             return 'bg-slate-700/60 text-slate-300 border-slate-600';
  }
};

const EMPTY_SKILL = { name: '', category: 'Machining & CNC', description: '' };

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SkillMatrix = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('catalog');

  // Catalog
  const [skillsCatalog, setSkillsCatalog]   = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [searchCatalog, setSearchCatalog]   = useState('');
  const [filterCat, setFilterCat]           = useState('');

  // Add / Edit modal
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formSkill, setFormSkill]       = useState(EMPTY_SKILL);
  const [formError, setFormError]       = useState('');
  const [formLoading, setFormLoading]   = useState(false);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Matrix
  const [matrixData, setMatrixData]             = useState([]);
  const [matrixLoading, setMatrixLoading]       = useState(false);
  const [selectedSkill, setSelectedSkill]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('');
  const [selectedDepartment, setSelectedDepartment]   = useState('');

  // â”€â”€ Fetchers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchCatalog = async () => {
    try {
      setCatalogLoading(true);
      const res = await API.get('/skills/catalog');
      setSkillsCatalog(res.data);
    } catch (err) {
      console.error('Failed to fetch skills catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchMatrix = async () => {
    try {
      setMatrixLoading(true);
      const params = {};
      if (selectedSkill)       params.skillName   = selectedSkill;
      if (selectedCategory)    params.category    = selectedCategory;
      if (selectedProficiency) params.proficiency = selectedProficiency;
      if (selectedDepartment)  params.department  = selectedDepartment;
      const res = await API.get('/skills/matrix', { params });
      setMatrixData(res.data);
    } catch (err) {
      console.error('Failed to fetch skill matrix:', err);
    } finally {
      setMatrixLoading(false);
    }
  };

  useEffect(() => { fetchCatalog(); }, []);
  useEffect(() => {
    if (activeTab === 'matrix') fetchMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedSkill, selectedCategory, selectedProficiency, selectedDepartment]);

  // â”€â”€ Catalog CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openAddModal = () => {
    setEditingSkill(null);
    setFormSkill(EMPTY_SKILL);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormSkill({ name: skill.name, category: skill.category, description: skill.description || '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingSkill) {
        await API.put(`/skills/catalog/${editingSkill._id}`, formSkill);
      } else {
        await API.post('/skills/catalog', formSkill);
      }
      setIsModalOpen(false);
      setFormSkill(EMPTY_SKILL);
      setEditingSkill(null);
      fetchCatalog();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/skills/catalog/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchCatalog();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed. Try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // â”€â”€ Filtered & grouped catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredCatalog = skillsCatalog.filter(sk => {
    const matchSearch = !searchCatalog
      || sk.name.toLowerCase().includes(searchCatalog.toLowerCase())
      || (sk.description || '').toLowerCase().includes(searchCatalog.toLowerCase());
    const matchCat = !filterCat || sk.category === filterCat;
    return matchSearch && matchCat;
  });

  const groupedCatalog = filteredCatalog.reduce((acc, sk) => {
    if (!acc[sk.category]) acc[sk.category] = [];
    acc[sk.category].push(sk);
    return acc;
  }, {});

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Skill &amp; Manpower Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Factory skill catalog management Â· Workforce proficiency tracking
          </p>
        </div>
        {isAdmin && activeTab === 'catalog' && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Skill</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {[
          { key: 'catalog', label: 'Skill Catalog', icon: BookOpen },
          { key: 'matrix',  label: 'Workforce Matrix', icon: UserCheck },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TAB 1: SKILL CATALOG â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search skills by name or description..."
              value={searchCatalog}
              onChange={e => setSearchCatalog(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="sm:w-60 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Categories ({skillsCatalog.length} skills)</option>
              {SKILL_CATEGORIES.map(c => {
                const count = skillsCatalog.filter(sk => sk.category === c.value).length;
                return count > 0 ? (
                  <option key={c.value} value={c.value}>{c.label} ({count})</option>
                ) : null;
              })}
            </select>
          </div>

          {/* Skill cards grouped by category */}
          {catalogLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading skill catalog...</div>
          ) : Object.keys(groupedCatalog).length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-800/40 rounded-2xl border border-slate-800">
              {searchCatalog || filterCat
                ? 'No skills match your filter.'
                : 'No skills in catalog yet. Add the first one!'}
            </div>
          ) : (
            Object.entries(groupedCatalog)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, skills]) => {
                const meta = getCategoryMeta(category);
                const CatIcon = meta.icon;
                return (
                  <div key={category} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    {/* Category Header */}
                    <div className="flex items-center space-x-3 px-5 py-3 bg-slate-800/60 border-b border-slate-700/60">
                      <CatIcon className={`w-4 h-4 ${meta.color}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{category}</span>
                      <span className="ml-auto text-[10px] text-slate-500 font-medium">
                        {skills.length} skill{skills.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Skills list */}
                    <div className="divide-y divide-slate-800/60">
                      {skills.map(skill => (
                        <div
                          key={skill._id}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-slate-100">{skill.name}</span>
                            {skill.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{skill.description}</p>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => openEditModal(skill)}
                                title="Edit skill"
                                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(skill)}
                                title="Delete skill"
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}

          {/* Stats */}
          {!catalogLoading && skillsCatalog.length > 0 && (
            <div className="text-center text-[11px] text-slate-600">
              {skillsCatalog.length} total skills across{' '}
              {new Set(skillsCatalog.map(s => s.category)).size} categories
            </div>
          )}
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TAB 2: WORKFORCE MATRIX â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">

          {/* Filter Bar */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Filter By Skill</label>
                <select
                  value={selectedSkill}
                  onChange={e => setSelectedSkill(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Skills ({skillsCatalog.length})</option>
                  {skillsCatalog.map(sk => (
                    <option key={sk._id} value={sk.name}>{sk.name} ({sk.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Required Proficiency</label>
                <select
                  value={selectedProficiency}
                  onChange={e => setSelectedProficiency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Any Level</option>
                  <option value="Expert">Expert Level Only</option>
                  <option value="Intermediate">Intermediate &amp; Above</option>
                  <option value="Beginner">Beginner Level</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
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
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matrixLoading ? (
              <div className="col-span-full py-12 text-center text-slate-400">Loading workforce skill inventory...</div>
            ) : matrixData.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800">
                No workforce members found matching the selected skill criteria.
              </div>
            ) : (
              matrixData.map(emp => (
                <div
                  key={emp._id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col justify-between hover:border-cyan-500/40 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{emp.name}</h3>
                        <div className="text-[11px] text-slate-400">
                          <span className="font-mono text-cyan-400">{emp.employeeId}</span> Â· {emp.designation}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-700 text-[10px] font-medium">
                        {emp.department}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Shift: <span className="text-slate-200">{emp.shift.split(' ')[0]}</span>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Skills ({emp.allSkills?.length || 0})
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
                          <span className="text-slate-500 italic text-[11px]">No skills assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center text-[11px] text-emerald-400">
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    <span>Available for Assignment</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• ADD / EDIT SKILL MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormError(''); }}
        title={editingSkill ? `Edit Skill â€” ${editingSkill.name}` : 'Add New Skill to Catalog'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Skill Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CNC Lathe Operation, Arc Welding, Gear Cutting..."
              value={formSkill.name}
              onChange={e => setFormSkill({ ...formSkill, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={formSkill.category}
              onChange={e => setFormSkill({ ...formSkill, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {SKILL_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <p className="text-slate-500 mt-1">Choose the category that best matches this factory skill.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              rows="3"
              placeholder="Machine type, required certification, safety standard, etc."
              value={formSkill.description}
              onChange={e => setFormSkill({ ...formSkill, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {formError && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setFormError(''); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold rounded-xl shadow transition"
            >
              {formLoading ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DELETE CONFIRM MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Skill from Catalog"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start space-x-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-200 font-semibold mb-1">
                Delete &ldquo;<span className="text-red-300">{deleteTarget?.name}</span>&rdquo;?
              </p>
              <p className="text-slate-400">
                This skill will be permanently removed from the catalog and will also be{' '}
                <span className="text-red-300 font-medium">
                  automatically removed from all employee profiles
                </span>{' '}
                that have this skill assigned.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold rounded-xl shadow transition"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete Skill'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default SkillMatrix;

