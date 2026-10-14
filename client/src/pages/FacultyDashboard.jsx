import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  FolderKanban, 
  LifeBuoy, 
  FileText, 
  Bell, 
  Plus, 
  Users, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FacultyDashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      setLoading(true);
      try {
        const [projRes, tickRes, noteRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tickets'),
          api.get('/notes'),
        ]);

        if (projRes.data?.success) setProjects(projRes.data.data || []);
        if (tickRes.data?.success) setTickets(tickRes.data.data || []);
        if (noteRes.data?.success) setNotes(noteRes.data.data || []);
      } catch (err) {
        console.error('Failed to load faculty data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading faculty control center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Faculty & Academic Mentorship Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {user?.full_name}!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {user?.designation || 'Associate Professor'} • {user?.faculty_department || 'Computer Science & Engineering'} • Specialization: {user?.specialization || 'Distributed Systems & AI'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/notes" className="btn-primary bg-white text-emerald-900 hover:bg-emerald-50 text-xs px-4 py-2.5 font-bold shadow-sm">
              Upload Course Material
            </Link>
            <Link to="/projects" className="btn-secondary bg-emerald-600/60 hover:bg-emerald-600 text-white border-emerald-400/30 text-xs px-4 py-2.5">
              Supervise Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{projects.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Campus student teams</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Course Notes</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{notes.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Published syllabus guides</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Tickets</span>
            <LifeBuoy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {tickets.filter(t => t.status === 'Open' || t.status === 'Assigned').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending maintenance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Office Hours</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-bold text-slate-800 mt-1">Mon-Thu 2-4 PM</div>
          <p className="text-[11px] text-slate-500 mt-1">{user?.cabin_location || 'Block B, Cabin 204'}</p>
        </div>
      </div>

      {/* Supervised Student Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-600" />
            <span>Student Academic Innovation Projects</span>
          </h2>
          <Link to="/projects" className="text-xs font-semibold text-emerald-700 hover:underline">
            View All ({projects.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((proj) => (
            <div key={proj.id} className="card p-5 bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge-emerald text-[10px] font-semibold">{proj.category}</span>
                  <span className="text-[11px] font-semibold text-slate-500 capitalize">{proj.status}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{proj.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Lead: <strong className="text-slate-800">{proj.owner_name}</strong>
                </div>
                <Link to={`/projects/${proj.id}`} className="btn-secondary text-xs py-1 px-2.5">
                  Inspect Progress
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
