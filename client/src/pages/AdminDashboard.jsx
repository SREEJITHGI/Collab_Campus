import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  FolderKanban, 
  LifeBuoy, 
  FileText, 
  Activity, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/analytics');
        if (res.data?.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-3 text-xs text-slate-500 font-medium">Aggregating platform analytics...</p>
      </div>
    );
  }

  const usersData = analytics?.users || {};
  const projectsData = analytics?.projects || {};
  const ticketsData = analytics?.tickets || {};
  const notesData = analytics?.notes || {};
  const jobsData = analytics?.internships || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Control Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Centralized Control & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              University Operations Center
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time platform insights, facility dispatch monitoring, user role distribution, and cross-department collaboration metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/tickets" className="btn-primary text-xs px-4 py-2.5 font-bold shadow-md shadow-emerald-600/30">
              Manage Service Desk
            </Link>
            <Link to="/internships" className="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-4 py-2.5">
              Publish Career Drives
            </Link>
          </div>
        </div>
      </div>

      {/* Main Aggregated Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{usersData.total_users || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {usersData.total_students || 0} students • {usersData.total_faculty || 0} faculty
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Campus Projects</span>
            <FolderKanban className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{projectsData.total_projects || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {projectsData.active_projects || 0} in progress
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Service Tickets</span>
            <LifeBuoy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{ticketsData.total_tickets || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {ticketsData.open_tickets || 0} open • {ticketsData.resolved_tickets || 0} resolved
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Notes & Downloads</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{notesData.count || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {notesData.total_downloads || 0} total student downloads
          </p>
        </div>
      </div>

      {/* Two-Column Grid: Recent Tickets & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Tickets Dispatch Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-emerald-600" />
              <span>Campus Maintenance & Service Desk</span>
            </h3>
            <Link to="/tickets" className="text-xs font-semibold text-emerald-700 hover:underline">
              View Desk ({ticketsData.total_tickets || 0})
            </Link>
          </div>

          <div className="space-y-3">
            {(ticketsData.recent || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No recent service requests.</p>
            ) : (
              ticketsData.recent.map((tick) => (
                <div key={tick.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">{tick.ticket_code}</span>
                      <span className="badge-emerald text-[10px]">{tick.category}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">Priority: {tick.priority}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tick.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                    tick.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {tick.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Innovation Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              <span>Recent Academic Projects</span>
            </h3>
            <Link to="/projects" className="text-xs font-semibold text-emerald-700 hover:underline">
              Browse All ({projectsData.total_projects || 0})
            </Link>
          </div>

          <div className="space-y-3">
            {(projectsData.recent || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No projects registered yet.</p>
            ) : (
              projectsData.recent.map((proj) => (
                <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="truncate">
                    <h4 className="font-bold text-slate-900 truncate">{proj.title}</h4>
                    <span className="text-[11px] text-slate-500">{proj.category}</span>
                  </div>
                  <Link to={`/projects/${proj.id}`} className="btn-secondary text-[11px] py-1 px-2.5 shrink-0">
                    Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
