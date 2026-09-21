import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Clock, 
  Layers, 
  Save, 
  CheckCircle, 
  Award,
  ShieldCheck 
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [userSkills, setUserSkills] = useState(user?.skills || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await API.get('/skills/catalog');
        setSkillsCatalog(res.data);
      } catch (err) {
        console.error('Failed to fetch skills catalog:', err);
      }
    };
    fetchSkills();
  }, []);

  const handleToggleSkill = (skillName, category) => {
    const existingIndex = userSkills.findIndex(s => s.skillName === skillName);
    if (existingIndex > -1) {
      setUserSkills(prev => prev.filter(s => s.skillName !== skillName));
    } else {
      setUserSkills(prev => [...prev, { skillName, category, proficiency: 'Intermediate' }]);
    }
  };

  const handleProficiencyChange = (skillName, proficiency) => {
    setUserSkills(prev => prev.map(s => s.skillName === skillName ? { ...s, proficiency } : s));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await API.put('/auth/profile', {
        contactNumber,
        skills: userSkills
      });
      updateUser(res.data.user);
      setMessage('Profile & skill ratings saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-cyan-500/20">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{user?.name}</h1>
          <p className="text-xs text-slate-400">
            {user?.designation} • <span className="text-cyan-400 font-mono">{user?.employeeId}</span>
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Role: {user?.role}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Department: {user?.department}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Profile & Skills Editor */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Contact & Shift Specs */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg backdrop-blur space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Personal & Employment Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Assigned Shift Schedule</label>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{user?.shift}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Account Status</label>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{user?.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Skill Ratings Editor */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg backdrop-blur space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>My Skill Ratings & Competency Tags</span>
          </h3>
          <p className="text-xs text-slate-400">
            Select skills from company catalog and set your self-assessed proficiency levels (Beginner, Intermediate, Expert)
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {skillsCatalog.map((sk) => {
              const assigned = userSkills.find(s => s.skillName === sk.name);
              return (
                <div key={sk._id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <label className="flex items-center space-x-3 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={!!assigned}
                      onChange={() => handleToggleSkill(sk.name, sk.category)}
                      className="rounded border-slate-700 text-cyan-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="font-semibold">{sk.name}</div>
                      <div className="text-[10px] text-slate-500">{sk.category} • {sk.description}</div>
                    </div>
                  </label>

                  {assigned && (
                    <select
                      value={assigned.proficiency}
                      onChange={(e) => handleProficiencyChange(sk.name, e.target.value)}
                      className="bg-slate-950 text-cyan-300 text-xs border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
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

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default Profile;
