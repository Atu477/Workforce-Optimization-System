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
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-amber-500/20">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">{user?.name}</h1>
          <p className="text-xs text-stone-500">
            {user?.designation} • <span className="text-amber-700 font-mono font-semibold">{user?.employeeId}</span>
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
              Role: {user?.role}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Department: {user?.department}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Profile & Skills Editor */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Contact & Shift Specs */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-800 flex items-center space-x-2">
            <User className="w-4 h-4 text-amber-600" />
            <span>Personal & Employment Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-500 font-semibold mb-1">Email Address</label>
              <div className="flex items-center space-x-2 bg-[#F8F5EE] border border-stone-200/80 rounded-xl px-3 py-2 text-stone-700">
                <Mail className="w-4 h-4 text-stone-400" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-stone-500 font-semibold mb-1">Assigned Shift Schedule</label>
              <div className="flex items-center space-x-2 bg-[#F8F5EE] border border-stone-200/80 rounded-xl px-3 py-2 text-stone-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{user?.shift}</span>
              </div>
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Contact Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-500 font-semibold mb-1">Account Status</label>
              <div className="flex items-center space-x-2 bg-[#F8F5EE] border border-stone-200/80 rounded-xl px-3 py-2 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{user?.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Skill Ratings Editor */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-800 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>My Skill Ratings & Competency Tags</span>
          </h3>
          <p className="text-xs text-stone-500">
            Select skills from company catalog and set your self-assessed proficiency levels (Beginner, Intermediate, Expert)
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {skillsCatalog.map((sk) => {
              const assigned = userSkills.find(s => s.skillName === sk.name);
              return (
                <div key={sk._id} className="flex items-center justify-between bg-[#F8F5EE] p-3 rounded-2xl border border-stone-200/80">
                  <label className="flex items-center space-x-3 cursor-pointer text-xs text-stone-800">
                    <input
                      type="checkbox"
                      checked={!!assigned}
                      onChange={() => handleToggleSkill(sk.name, sk.category)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="font-semibold text-stone-900">{sk.name}</div>
                      <div className="text-[10px] text-stone-500">{sk.category} • {sk.description}</div>
                    </div>
                  </label>

                  {assigned && (
                    <select
                      value={assigned.proficiency}
                      onChange={(e) => handleProficiencyChange(sk.name, e.target.value)}
                      className="bg-white text-amber-800 text-xs border border-stone-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-500 font-semibold"
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
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-md shadow-amber-500/20 text-xs transition transform active:scale-95 disabled:opacity-50"
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
