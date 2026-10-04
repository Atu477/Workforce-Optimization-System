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

// Factory-specific skill categories
const SKILL_CATEGORIES = [
  { value: 'Machining & CNC',       label: 'Machining & CNC',       icon: Cog,           color: 'text-amber-600'   },
  { value: 'Welding & Fabrication', label: 'Welding & Fabrication',  icon: FlameKindling, color: 'text-orange-600' },
  { value: 'Electrical & Wiring',   label: 'Electrical & Wiring',   icon: Cpu,           color: 'text-amber-500'  },
  { value: 'Quality Control',       label: 'Quality Control',        icon: CheckCircle2,  color: 'text-emerald-600'},
  { value: 'Safety & Compliance',   label: 'Safety & Compliance',    icon: ShieldCheck,   color: 'text-rose-600'    },
  { value: 'Machinery & Tools',     label: 'Machinery & Tools',      icon: Wrench,        color: 'text-blue-600'   },
  { value: 'Logistics',             label: 'Logistics',              icon: Package,       color: 'text-purple-600' },
  { value: 'Engineering',           label: 'Engineering',            icon: Layers,        color: 'text-indigo-600' },
  { value: 'Software & IT',         label: 'Software & IT',          icon: BookOpen,      color: 'text-pink-600'   },
  { value: 'General',               label: 'General',                icon: Award,         color: 'text-stone-600'  },
];

const getCategoryMeta = (catValue) =>
  SKILL_CATEGORIES.find(c => c.value === catValue) || SKILL_CATEGORIES[SKILL_CATEGORIES.length - 1];

const getProficiencyBadge = (prof) => {
  switch (prof) {
    case 'Expert':       return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
    default:             return 'bg-stone-100 text-stone-700 border-stone-200';
  }
};

const EMPTY_SKILL = { name: '', category: 'Machining & CNC', description: '' };

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

  // Fetchers
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
  }, [activeTab, selectedSkill, selectedCategory, selectedProficiency, selectedDepartment]);

  // Catalog CRUD
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

  // Filtered & grouped catalog
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

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-amber-600" />
            <span>Skill &amp; Workforce Matrix</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Workforce skill catalog management • Real-time competency tracking
          </p>
        </div>
        {isAdmin && activeTab === 'catalog' && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-md shadow-amber-500/20 text-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Skill</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1.5 bg-[#F8F5EE] border border-stone-200/80 rounded-2xl p-1.5 w-fit">
        {[
          { key: 'catalog', label: 'Skill Catalog', icon: BookOpen },
          { key: 'matrix',  label: 'Workforce Matrix', icon: UserCheck },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SKILL CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search skills by name or description..."
              value={searchCatalog}
              onChange={e => setSearchCatalog(e.target.value)}
              className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="sm:w-64 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
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
            <div className="py-12 text-center text-stone-400 text-sm">Loading skill catalog...</div>
          ) : Object.keys(groupedCatalog).length === 0 ? (
            <div className="py-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-200/80 shadow-xs">
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
                  <div key={category} className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-xs">
                    {/* Category Header */}
                    <div className="flex items-center space-x-3 px-5 py-3.5 bg-[#F8F5EE] border-b border-stone-200/80">
                      <CatIcon className={`w-4 h-4 ${meta.color}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{category}</span>
                      <span className="ml-auto text-[10px] text-stone-400 font-semibold">
                        {skills.length} skill{skills.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Skills list */}
                    <div className="divide-y divide-stone-100">
                      {skills.map(skill => (
                        <div
                          key={skill._id}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAF7F2] transition group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-stone-800">{skill.name}</span>
                            {skill.description && (
                              <p className="text-[11px] text-stone-500 mt-0.5 truncate">{skill.description}</p>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => openEditModal(skill)}
                                title="Edit skill"
                                className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded-xl transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(skill)}
                                title="Delete skill"
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-xl transition"
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
            <div className="text-center text-[11px] text-stone-500">
              {skillsCatalog.length} total skills across{' '}
              {new Set(skillsCatalog.map(s => s.category)).size} categories
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WORKFORCE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">

          {/* Filter Bar */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Filter By Skill</label>
                <select
                  value={selectedSkill}
                  onChange={e => setSelectedSkill(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:border-amber-500"
                >
                  <option value="">All Skills ({skillsCatalog.length})</option>
                  {skillsCatalog.map(sk => (
                    <option key={sk._id} value={sk.name}>{sk.name} ({sk.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Required Proficiency</label>
                <select
                  value={selectedProficiency}
                  onChange={e => setSelectedProficiency(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:border-amber-500"
                >
                  <option value="">Any Level</option>
                  <option value="Expert">Expert Level Only</option>
                  <option value="Intermediate">Intermediate &amp; Above</option>
                  <option value="Beginner">Beginner Level</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:border-amber-500"
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
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matrixLoading ? (
              <div className="col-span-full py-12 text-center text-stone-400">Loading workforce skill inventory...</div>
            ) : matrixData.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-200/80 shadow-xs">
                No workforce members found matching the selected skill criteria.
              </div>
            ) : (
              matrixData.map(emp => (
                <div
                  key={emp._id}
                  className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-400/60 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm">{emp.name}</h3>
                        <div className="text-[11px] text-stone-500">
                          <span className="font-mono text-amber-700 font-semibold">{emp.employeeId}</span> • {emp.designation}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-[#F8F5EE] text-stone-700 rounded-lg border border-stone-200 text-[10px] font-semibold">
                        {emp.department}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500">
                      Shift: <span className="text-stone-800 font-medium">{emp.shift.split(' ')[0]}</span>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                        Skills ({emp.allSkills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {emp.allSkills && emp.allSkills.length > 0 ? (
                          emp.allSkills.map((sk, idx) => {
                            const isMatch = emp.matchedSkills.some(m => m.skillName === sk.skillName);
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded-xl text-[10px] font-medium border flex items-center space-x-1.5 ${
                                  isMatch
                                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/30 font-semibold'
                                    : 'bg-[#F8F5EE] text-stone-700 border-stone-200/80'
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
                          <span className="text-stone-400 italic text-[11px]">No skills assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center text-[11px] text-emerald-700 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>Available for Assignment</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT SKILL MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormError(''); }}
        title={editingSkill ? `Edit Skill — ${editingSkill.name}` : 'Add New Skill to Catalog'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">

          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Skill Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CNC Lathe Operation, Arc Welding, Gear Cutting..."
              value={formSkill.name}
              onChange={e => setFormSkill({ ...formSkill, name: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:bg-white focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formSkill.category}
              onChange={e => setFormSkill({ ...formSkill, category: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:bg-white focus:border-amber-500"
            >
              {SKILL_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <p className="text-stone-400 mt-1">Choose the category that best matches this skill.</p>
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Description <span className="text-stone-400">(optional)</span>
            </label>
            <textarea
              rows="3"
              placeholder="Machine type, required certification, safety standard, etc."
              value={formSkill.description}
              onChange={e => setFormSkill({ ...formSkill, description: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:bg-white focus:border-amber-500 resize-none"
            />
          </div>

          {formError && (
            <div className="flex items-center space-x-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setFormError(''); }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition"
            >
              {formLoading ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Skill from Catalog"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start space-x-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-800 font-bold mb-1">
                Delete &ldquo;<span className="text-rose-700">{deleteTarget?.name}</span>&rdquo;?
              </p>
              <p className="text-stone-600">
                This skill will be permanently removed from the catalog and will also be{' '}
                <span className="text-rose-700 font-semibold">
                  automatically removed from all employee profiles
                </span>{' '}
                that have this skill assigned.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-xl shadow transition"
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
