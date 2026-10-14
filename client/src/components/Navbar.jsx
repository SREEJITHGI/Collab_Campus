import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  FolderKanban, 
  FileText, 
  Briefcase, 
  Calendar, 
  ShoppingBag, 
  LifeBuoy, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Collab<span className="text-emerald-600">Campus</span></span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">v1.0</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">Smart Collaboration Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link to="/projects" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors">
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              <span>Projects</span>
            </Link>
            <Link to="/notes" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Notes Hub</span>
            </Link>
            <Link to="/internships" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Internships</span>
            </Link>
            <Link to="/events" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Events</span>
            </Link>
            <Link to="/tickets" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors">
              <LifeBuoy className="w-4 h-4 text-emerald-600" />
              <span>Services</span>
            </Link>
            <Link to="/marketplace" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Marketplace</span>
            </Link>
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/notifications" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors relative" title="Notifications">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </Link>
                <div className="h-6 w-px bg-slate-200"></div>
                <Link 
                  to={user?.role === 'admin' ? '/admin' : user?.role === 'faculty' ? '/faculty' : '/dashboard'} 
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name?.split(' ')[0]}</p>
                    <p className="text-[10px] font-medium text-emerald-600 capitalize leading-tight">{user?.role}</p>
                  </div>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <Link 
            to="/projects" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
          >
            <FolderKanban className="w-4 h-4 text-emerald-600" />
            Projects
          </Link>
          <Link 
            to="/notes" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            Notes Hub
          </Link>
          <Link 
            to="/internships" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
          >
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Internships
          </Link>
          <Link 
            to="/events" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            Campus Events
          </Link>
          <Link 
            to="/tickets" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
          >
            <LifeBuoy className="w-4 h-4 text-emerald-600" />
            Service Tickets
          </Link>
          <Link 
            to="/marketplace" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            Marketplace
          </Link>

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={user?.role === 'admin' ? '/admin' : user?.role === 'faculty' ? '/faculty' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  My Dashboard ({user?.role})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
