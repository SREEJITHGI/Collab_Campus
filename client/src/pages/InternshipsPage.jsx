import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Plus, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Clock, 
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InternshipsPage() {
  const { user, isAuthenticated } = useAuth();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workType, setWorkType] = useState('');

  // Application Tracking Modal
  const [trackingItem, setTrackingItem] = useState(null);
  const [appStatus, setAppStatus] = useState('Interested');
  const [appNotes, setAppNotes] = useState('');
  const [savingApp, setSavingApp] = useState(false);

  // My Applications Drawer / View
  const [myApplications, setMyApplications] = useState([]);
  const [showMyApps, setShowMyApps] = useState(false);

  // Post Opportunity Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('');
  const [postWorkType, setPostWorkType] = useState('Hybrid');
  const [stipendSalary, setStipendSalary] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState(['Python', 'SQL']);
  const [applicationLink, setApplicationLink] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (workType) params.workType = workType;

      const res = await api.get('/internships', { params });
      if (res.data?.success) {
        setInternships(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/internships/applications');
      if (res.data?.success) {
        setMyApplications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchMyApplications();
  }, [workType]);

  const handleToggleSave = async (id) => {
    if (!isAuthenticated) return alert('Please sign in to bookmark opportunities');
    try {
      const res = await api.post(`/internships/${id}/save`);
      if (res.data?.success) {
        setInternships(internships.map(i => i.id === id ? { ...i, is_saved: res.data.is_saved } : i));
      }
    } catch (err) {
      alert('Failed to save opportunity');
    }
  };

  const handleOpenTrackingModal = (item) => {
    if (!isAuthenticated) return alert('Please sign in to track your job application pipeline');
    setTrackingItem(item);
    setAppStatus(item.application?.status || 'Interested');
    setAppNotes(item.application?.notes || '');
  };

  const handleSaveApplicationStatus = async (e) => {
    e.preventDefault();
    setSavingApp(true);
    try {
      await api.post('/internships/applications', {
        internshipId: trackingItem.id,
        status: appStatus,
        notes: appNotes,
      });
      setTrackingItem(null);
      fetchInternships();
      fetchMyApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application');
    } finally {
      setSavingApp(false);
    }
  };

  const handlePostOpportunity = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    try {
      const payload = {
        companyName,
        roleTitle,
        location,
        workType: postWorkType,
        stipendSalary,
        eligibility,
        requiredSkills,
        applicationLink,
      };

      await api.post('/internships', payload);
      setShowPostModal(false);
      setCompanyName('');
      setRoleTitle('');
      setLocation('');
      setStipendSalary('');
      setEligibility('');
      setApplicationLink('');
      fetchInternships();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish listing');
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <span className="badge-emerald text-xs">Module D: Placements & Career</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Internship & Placement Hub
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Discover verified campus job openings, track application pipelines, and prepare with required skill sets.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {isAuthenticated && (
            <button
              onClick={() => setShowMyApps(true)}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>My Applications ({myApplications.length})</span>
            </button>
          )}

          {isAuthenticated && ['admin', 'faculty'].includes(user?.role) && (
            <button
              onClick={() => setShowPostModal(true)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Post Opportunity</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, role title, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchInternships(); }}
            className="input-field pl-10 py-2 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="input-field py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            <option value="">All Work Types</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
          </select>

          <button type="button" onClick={fetchInternships} className="btn-secondary py-2 text-xs px-3">
            Refresh
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500 font-medium">Loading opportunities...</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Listings Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Check back soon as placement coordinators publish fresh university recruitments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((item) => {
              const skills = Array.isArray(item.required_skills)
                ? item.required_skills
                : typeof item.required_skills === 'string'
                  ? JSON.parse(item.required_skills || '[]')
                  : [];

              const currentAppStatus = item.application?.status;

              return (
                <div key={item.id} className="card p-6 flex flex-col justify-between hover:border-emerald-300 group">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="badge-emerald text-[11px] font-semibold">{item.work_type}</span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
                          {item.role_title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600">{item.company_name}</p>
                      </div>

                      <button
                        onClick={() => handleToggleSave(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.is_saved
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title={item.is_saved ? 'Bookmarked' : 'Save opportunity'}
                      >
                        {item.is_saved ? <BookmarkCheck className="w-4 h-4 fill-amber-600" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.stipend_salary}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {item.eligibility}
                    </p>

                    {/* Required Skills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {currentAppStatus ? (
                        <button
                          onClick={() => handleOpenTrackingModal(item)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                        >
                          Status: {currentAppStatus}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenTrackingModal(item)}
                          className="text-xs text-slate-500 hover:text-emerald-700 font-medium"
                        >
                          + Track Status
                        </button>
                      )}
                    </div>

                    <a
                      href={item.application_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Tracking Modal */}
      {trackingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Application Pipeline Tracker</h3>
                <p className="text-xs text-slate-500">{trackingItem.company_name} — {trackingItem.role_title}</p>
              </div>
              <button onClick={() => setTrackingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApplicationStatus} className="space-y-4">
              <div>
                <label className="label-field">Current Application Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Interested', 'Applied', 'Interview', 'Selected', 'Rejected'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAppStatus(status)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        appStatus === status
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">Notes & Next Steps</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Submitted resume on portal, online assessment due by Friday..."
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  className="input-field text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setTrackingItem(null)} className="btn-secondary text-xs py-1.5">
                  Cancel
                </button>
                <button type="submit" disabled={savingApp} className="btn-primary text-xs py-1.5 px-4 font-semibold">
                  {savingApp ? 'Updating...' : 'Save Pipeline Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Applications Drawer */}
      {showMyApps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">My Application Pipeline</h3>
              </div>
              <button onClick={() => setShowMyApps(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {myApplications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                You haven't tracked any applications yet. Click "+ Track Status" on an internship card!
              </div>
            ) : (
              <div className="space-y-3">
                {myApplications.map((app) => (
                  <div key={app.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{app.role_title}</h4>
                      <p className="text-[11px] text-slate-600">{app.company_name}</p>
                      {app.notes && (
                        <p className="text-[10px] text-slate-500 mt-1 italic">"{app.notes}"</p>
                      )}
                    </div>
                    <span className="badge-emerald text-[10px] font-bold shrink-0">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Publish Campus Opportunity</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostOpportunity} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microsoft"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="label-field">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Intern"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="label-field">Work Type</label>
                  <select
                    value={postWorkType}
                    onChange={(e) => setPostWorkType(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-field">Stipend or Compensation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹50,000 / month or $35/hr"
                  value={stipendSalary}
                  onChange={(e) => setStipendSalary(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="label-field">Eligibility Criteria *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Final or Pre-final year students, CS/IT branches, CGPA > 7.0"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="input-field text-xs py-2 resize-none"
                />
              </div>

              <div>
                <label className="label-field">Application URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://company.com/apply"
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary text-xs py-1.5">
                  Cancel
                </button>
                <button type="submit" disabled={postLoading} className="btn-primary text-xs py-1.5 px-4 font-semibold">
                  {postLoading ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
