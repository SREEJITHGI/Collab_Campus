import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  BookOpen, 
  Layers, 
  Briefcase, 
  ArrowRight, 
  AlertCircle, 
  Plus, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student-specific fields
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(4);
  const [rollNumber, setRollNumber] = useState('');
  const [skills, setSkills] = useState(['React', 'JavaScript', 'PostgreSQL']);
  const [newSkill, setNewSkill] = useState('');

  // Faculty-specific fields
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [specialization, setSpecialization] = useState('Software Engineering & Cloud Computing');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      role,
      fullName,
      email,
      password,
      department,
      ...(role === 'student' && {
        semester: Number(semester),
        rollNumber: rollNumber || undefined,
        skills,
      }),
      ...(role === 'faculty' && {
        employeeId: employeeId || undefined,
        designation,
        specialization,
      }),
    };

    try {
      const res = await api.post('/auth/register', payload);
      if (res.data?.success && res.data.data?.token) {
        const { token, user } = res.data.data;
        login(token, user);
        if (user.role === 'faculty') navigate('/faculty');
        else navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed. Please check your details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Campus Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Join the centralized collaboration network for your university
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              role === 'student'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              role === 'faculty'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Faculty Account</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field" htmlFor="reg-name">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-field" htmlFor="reg-email">Campus / Personal Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="reg-password">Password (min. 6 characters) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field" htmlFor="reg-dept">Academic Department *</label>
              <select
                id="reg-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Management & Business Studies">Management & Business Studies</option>
              </select>
            </div>

            {/* Student Specific: Semester & Roll Number */}
            {role === 'student' ? (
              <div>
                <label className="label-field" htmlFor="reg-sem">Current Semester (1-8) *</label>
                <select
                  id="reg-sem"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="label-field" htmlFor="reg-desig">Faculty Designation *</label>
                <input
                  id="reg-desig"
                  type="text"
                  required
                  placeholder="e.g. Associate Professor"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="input-field"
                />
              </div>
            )}
          </div>

          {/* Role specific secondary row */}
          {role === 'student' ? (
            <div>
              <label className="label-field" htmlFor="reg-roll">Roll Number / Student ID</label>
              <input
                id="reg-roll"
                type="text"
                placeholder="e.g. 21CS042"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="input-field"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field" htmlFor="reg-empid">Employee / Faculty ID</label>
                <input
                  id="reg-empid"
                  type="text"
                  placeholder="e.g. FAC-2024-88"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field" htmlFor="reg-spec">Research Specialization</label>
                <input
                  id="reg-spec"
                  type="text"
                  placeholder="e.g. Deep Learning, Distributed Systems"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Student Skills Tag Builder */}
          {role === 'student' && (
            <div>
              <label className="label-field">Technical Skills (For Project Team Finder)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a skill (e.g. Python, Docker, Figma)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                  className="input-field py-1.5"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-secondary px-3 py-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {skills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No skills added yet. Add skills to match with campus projects.</span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-emerald-950"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-4 font-semibold shadow-md shadow-emerald-600/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Complete Registration
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
          Already registered on CollabCampus?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
