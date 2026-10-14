import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  FolderKanban, 
  FileText, 
  Briefcase, 
  LifeBuoy, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Search, 
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import api from '../services/api';

export default function LandingPage() {
  const [healthStatus, setHealthStatus] = useState({ connected: false, loading: true });

  useEffect(() => {
    api.get('/health')
      .then(res => {
        if (res.data?.success) {
          setHealthStatus({
            connected: true,
            loading: false,
            dbType: res.data.database?.type,
            latency: res.data.database?.latencyMs,
          });
        }
      })
      .catch(() => {
        setHealthStatus({ connected: false, loading: false });
      });
  }, []);

  const [activeTab, setActiveTab] = useState('student');

  const roleDetails = {
    student: {
      title: 'For Students',
      badge: 'Learn & Build',
      desc: 'Form project squads, build verified portfolios, access academic notes by semester, track internship applications, and report campus facility issues seamlessly.',
      features: [
        'Kanban project boards & skill-based teammate finder',
        'Download verified notes & exam study guides',
        'Track job applications from Interested to Selected',
        'One-click Wi-Fi & facility service requests',
      ],
      ctaLink: '/register',
      ctaText: 'Join as a Student',
    },
    faculty: {
      title: 'For Faculty & Mentors',
      badge: 'Guide & Inspect',
      desc: 'Supervise final-year student projects, upload authenticated subject materials, broadcast urgent department announcements, and review student progress.',
      features: [
        'Mentor & supervise academic project deliverables',
        'Upload course syllabus & lecture PDF slides',
        'Publish official department notices & schedules',
        'Review technical submissions & student capabilities',
      ],
      ctaLink: '/register',
      ctaText: 'Faculty Sign Up',
    },
    admin: {
      title: 'For Campus Administrators',
      badge: 'Manage & Monitor',
      desc: 'Oversee university-wide analytics, assign IT/facilities service tickets to staff, moderate academic materials, and coordinate placement coordinator posts.',
      features: [
        'Real-time analytics across users, projects & tickets',
        'Campus service desk dispatch & status workflow',
        'User management & role authorization controls',
        'Placement and campus announcement moderation',
      ],
      ctaLink: '/login',
      ctaText: 'Admin Portal Login',
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
      {/* System Status Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${healthStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span>
              CollabCampus PostgreSQL Backend: 
              <strong className="text-white ml-1">
                {healthStatus.loading ? 'Verifying status...' : healthStatus.connected ? `Operational (${healthStatus.dbType || 'Postgres'}, ${healthStatus.latency || '<10'}ms)` : 'Offline / Standalone Mode'}
              </strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>MVC RESTful Architecture</span>
            <span>•</span>
            <span>JWT & RBAC Secured</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-200/40 to-teal-100/30 blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Generation Campus Collaboration Suite</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Where Campus Minds <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy underline-offset-4">Connect, Build & Thrive</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A unified campus ecosystem connecting students, faculty, and administrators. Manage team projects, share academic notes, track internship placements, and resolve campus service requests effortlessly.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/register" className="btn-primary text-base px-6 py-3 shadow-lg shadow-emerald-600/25 w-full sm:w-auto">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto">
                Sign In to Campus Portal
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-14 pt-8 border-t border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <FolderKanban className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Projects Hub</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">100% Active</div>
                <p className="text-xs text-slate-500">Kanban & skills finder</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Notes</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">8 Semesters</div>
                <p className="text-xs text-slate-500">PDFs, branches, subjects</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Placements</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">Real Tracking</div>
                <p className="text-xs text-slate-500">Applied, interview, offers</p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <LifeBuoy className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Campus Helpdesk</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">Fast Dispatch</div>
                <p className="text-xs text-slate-500">Wi-Fi, Labs & Facilities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Navigation Showcase */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tailored Experiences For Every Campus Role
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Role-based authorization and customized dashboards engineered specifically for university workflows.
            </p>

            {/* Role Tabs */}
            <div className="inline-flex p-1 mt-6 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('student')}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'student'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'faculty'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faculty
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Administrator
              </button>
            </div>
          </div>

          {/* Active Role Content Card */}
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <span className="badge-emerald text-xs mb-2">{roleDetails[activeTab].badge}</span>
                <h3 className="text-2xl font-bold text-slate-900">{roleDetails[activeTab].title}</h3>
                <p className="mt-2 text-sm text-slate-600 max-w-xl">{roleDetails[activeTab].desc}</p>
              </div>
              <Link to={roleDetails[activeTab].ctaLink} className="btn-primary whitespace-nowrap self-start md:self-center">
                {roleDetails[activeTab].ctaText}
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {roleDetails[activeTab].features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-slate-800">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge-emerald mb-2">All-in-One Architecture</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">The 6 Core Campus Pillars</h2>
            <p className="mt-3 text-sm text-slate-600">
              Explore the functional modules built into CollabCampus to eliminate disconnected tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Projects */}
            <div className="card p-6 flex flex-col justify-between group hover:border-emerald-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Project Collaboration & Kanban</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Create academic projects, invite teammates with skill filtering (React, Python, Machine Learning), assign tasks, and track statuses on a Kanban board.
                </p>
              </div>
              <Link to="/projects" className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
                Explore Projects <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Notes Hub */}
            <div className="card p-6 flex flex-col justify-between group hover:border-emerald-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Campus Notes Hub</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Upload and download verified academic materials, filtered by department, semester, and subject code with download counters and size limits.
                </p>
              </div>
              <Link to="/notes" className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
                Access Notes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Internships */}
            <div className="card p-6 flex flex-col justify-between group hover:border-emerald-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Internships & Placement Hub</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Browse company drives, stipends, eligibility criteria, and track your personal application pipeline (Interested, Applied, Interview, Selected).
                </p>
              </div>
              <Link to="/internships" className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
                Browse Opportunities <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Campus Service Tickets */}
            <div className="card p-6 flex flex-col justify-between group hover:border-emerald-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Service Ticket Desk</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Report Wi-Fi drops, broken projectors, electrical issues, or lab equipment downtime. Track lifecycle from Open to In Progress to Resolved with full audit logs.
                </p>
              </div>
              <Link to="/tickets" className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
                Submit a Ticket <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. Campus Community & Events */}
            <div className="card p-6 flex flex-col justify-between group hover:border-emerald-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Events & Hackathons</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Discover technical symposiums, workshops, and guest lectures with seat capacity management, instant student RSVPs, and live announcements.
                </p>
              </div>
              <Link to="/events" className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
                View Campus Events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. Student Marketplace */}
            <div className="card p-6 flex flex-col justify-between group hover:border-emerald-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Student Marketplace & Lost & Found</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Buy, sell, or donate textbooks, calculators, and engineering kits securely within verified campus peers, plus retrieve lost keys or ID cards.
                </p>
              </div>
              <Link to="/marketplace" className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
                Browse Marketplace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-emerald-300 mb-4" />
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Ready to upgrade your campus collaboration experience?
          </h2>
          <p className="mt-4 text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            Join students and faculty already collaborating on real-world projects and accelerating academic growth.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-6 py-3 rounded-lg bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-md">
              Create Student Account
            </Link>
            <Link to="/login" className="px-6 py-3 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-sm border border-emerald-500/40 transition-colors">
              Access Existing Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
