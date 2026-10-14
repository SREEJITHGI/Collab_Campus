import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  LifeBuoy, 
  FileText, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  Bell, 
  Plus, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();

  const [myProjects, setMyProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [projRes, appRes, tickRes, annRes] = await Promise.all([
          api.get('/projects?myProjects=true'),
          api.get('/internships/applications'),
          api.get('/tickets?myTickets=true'),
          api.get('/announcements'),
        ]);

        if (projRes.data?.success) setMyProjects(projRes.data.data || []);
        if (appRes.data?.success) setMyApplications(appRes.data.data || []);
        if (tickRes.data?.success) setMyTickets(tickRes.data.data || []);
        if (annRes.data?.success) setAnnouncements(annRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading your student dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Student Academic Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {user?.student_department || 'Computer Science'} • Semester {user?.semester || 6} • Roll No: {user?.roll_number || '21CS042'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/projects" className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm">
              Explore Projects
            </Link>
            <Link to="/profile" className="px-4 py-2.5 rounded-xl bg-emerald-600/60 hover:bg-emerald-600 text-white font-semibold text-xs border border-emerald-400/30 transition-colors">
              Manage Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Projects</span>
            <FolderKanban className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{myProjects.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active squads</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Job Pipeline</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{myApplications.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tracked opportunities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Tickets</span>
            <LifeBuoy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{myTickets.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Campus service requests</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CGPA</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{user?.cgpa || '8.85'}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Academic Standing</p>
        </div>
      </div>

      {/* Main Grid: My Projects & Job Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Project Squads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">My Project Collaboration Squads</h2>
            </div>
            <Link to="/projects" className="text-xs font-semibold text-emerald-700 hover:underline">
              View All Projects
            </Link>
          </div>

          {myProjects.length === 0 ? (
            <div className="card p-8 text-center bg-white border border-slate-200">
              <p className="text-xs text-slate-500 mb-4">You have not joined or started any projects yet.</p>
              <Link to="/projects" className="btn-primary text-xs px-4 py-2">
                Browse Campus Projects
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myProjects.map((proj) => (
                <div key={proj.id} className="card p-5 bg-white border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="badge-emerald text-[10px] font-semibold">{proj.category}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{proj.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{proj.description}</p>
                    </div>
                    <Link
                      to={`/projects/${proj.id}`}
                      className="btn-secondary text-xs py-1.5 px-3 shrink-0 flex items-center gap-1"
                    >
                      <span>Kanban Board</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Task Progress: <strong className="text-slate-800">{proj.progress_percent || 0}%</strong>
                    </div>
                    <div>
                      Squad: <strong className="text-slate-800">{proj.member_count || 1} members</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Application Pipeline & Notices */}
        <div className="space-y-6">
          {/* Applications Pipeline Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Job Applications Tracker</span>
              </h3>
              <Link to="/internships" className="text-xs font-semibold text-emerald-700 hover:underline">
                Explore Jobs
              </Link>
            </div>

            {myApplications.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No active applications in pipeline yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myApplications.slice(0, 4).map((app) => (
                  <div key={app.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{app.role_title}</p>
                      <p className="text-[11px] text-slate-500">{app.company_name}</p>
                    </div>
                    <span className="badge-emerald text-[10px] font-bold shrink-0">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 pb-3 border-b border-slate-200 mb-3">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Campus Notices</span>
            </h3>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="text-xs">
                  <h4 className="font-bold text-slate-800">{a.title}</h4>
                  <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{a.content}</p>
                  <p className="text-slate-400 text-[10px] mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
