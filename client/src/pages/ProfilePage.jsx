import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  ExternalLink, 
  Code,
  Save, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.student_department || user?.faculty_department || '');
  const [semester, setSemester] = useState(user?.semester || 1);
  const [cgpa, setCgpa] = useState(user?.cgpa || '');
  const [githubUrl, setGithubUrl] = useState(user?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  
  // Skills parsing
  const initialSkills = Array.isArray(user?.skills) 
    ? user.skills 
    : typeof user?.skills === 'string' 
      ? JSON.parse(user.skills || '[]') 
      : [];
  const [skills, setSkills] = useState(initialSkills);
  const [newSkill, setNewSkill] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setDepartment(user.student_department || user.faculty_department || '');
      setSemester(user.semester || 1);
      setCgpa(user.cgpa || '');
      setGithubUrl(user.github_url || '');
      setLinkedinUrl(user.linkedin_url || '');
      const parsed = Array.isArray(user.skills) 
        ? user.skills 
        : typeof user.skills === 'string' 
          ? JSON.parse(user.skills || '[]') 
          : [];
      setSkills(parsed);
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        fullName,
        bio,
        phone,
        department,
        semester: Number(semester),
        cgpa: cgpa ? Number(cgpa) : undefined,
        skills,
        githubUrl: githubUrl || '',
        linkedinUrl: linkedinUrl || '',
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setSuccessMsg('Your profile has been updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please check input formats.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden mb-8">
        {/* Cover / Header Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-800 relative">
          <div className="absolute top-4 right-4">
            <span className="badge-emerald bg-white/95 text-emerald-800 shadow-xs font-semibold px-3 py-1">
              Role: <strong className="uppercase ml-1">{user?.role}</strong>
            </span>
          </div>
        </div>

        {/* Profile Avatar & Info Row */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 border-b border-slate-200/80">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md shadow-slate-200">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-3xl font-extrabold uppercase">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
            </div>
            <div className="pb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.full_name}</h1>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="capitalize text-emerald-600 font-semibold">{user?.role}</span>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 pb-1">
            Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label-field" htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field" htmlFor="prof-phone">Contact Phone</label>
              <input
                id="prof-phone"
                type="text"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="prof-bio">Bio & Academic Interests</label>
            <textarea
              id="prof-bio"
              rows={3}
              placeholder="Tell campus teammates and professors about your interests, project passions, and focus areas..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="label-field" htmlFor="prof-dept">Department</label>
              <input
                id="prof-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field"
              />
            </div>

            {user?.role === 'student' && (
              <>
                <div>
                  <label className="label-field" htmlFor="prof-sem">Current Semester</label>
                  <select
                    id="prof-sem"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field" htmlFor="prof-cgpa">CGPA (0.00 - 10.00)</label>
                  <input
                    id="prof-cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.75"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="input-field"
                  />
                </div>
              </>
            )}
          </div>

          {/* Social & Portfolio Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-200">
            <div>
              <label className="label-field" htmlFor="prof-github">GitHub Profile URL</label>
              <input
                id="prof-github"
                type="url"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field" htmlFor="prof-linkedin">LinkedIn Profile URL</label>
              <input
                id="prof-linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Skills Management */}
          {user?.role === 'student' && (
            <div className="pt-2 border-t border-slate-200">
              <label className="label-field">Skills & Tech Stack Tags</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add skill (e.g. React, PostgreSQL, PyTorch)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                  className="input-field py-1.5"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-secondary px-4 py-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[46px]">
                {skills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No skills listed yet. Add skills to be discovered in the project team finder!</span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-emerald-700 hover:text-emerald-950"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 font-semibold shadow-md shadow-emerald-600/20"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Saving changes...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="w-4 h-4" />
                  Save Profile Changes
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
