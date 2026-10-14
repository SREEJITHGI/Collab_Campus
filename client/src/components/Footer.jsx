import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Shield, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">Collab<span className="text-emerald-400">Campus</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The unified smart collaboration platform designed to empower students, faculty, and administrators with modern academic and campus workflows.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PostgreSQL & Express API Operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Academic Hub</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/projects" className="hover:text-emerald-400 transition-colors">Projects & Teams</Link></li>
              <li><Link to="/notes" className="hover:text-emerald-400 transition-colors">Campus Notes Hub</Link></li>
              <li><Link to="/internships" className="hover:text-emerald-400 transition-colors">Internship Directory</Link></li>
              <li><Link to="/events" className="hover:text-emerald-400 transition-colors">Events & Workshops</Link></li>
            </ul>
          </div>

          {/* Campus Services */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Campus Life</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/tickets" className="hover:text-emerald-400 transition-colors">Service Desk & Wi-Fi Help</Link></li>
              <li><Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Marketplace & Accessories</Link></li>
              <li><Link to="/marketplace?filter=lost" className="hover:text-emerald-400 transition-colors">Lost & Found Portal</Link></li>
              <li><Link to="/announcements" className="hover:text-emerald-400 transition-colors">Official Announcements</Link></li>
            </ul>
          </div>

          {/* Tech & Roles */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Security & Platform</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Role-based Access Control</li>
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL Relational Schema</li>
              <li><span className="text-slate-500">JWT Authentication & Zod Validation</span></li>
              <li><span className="text-slate-500">RESTful Architecture</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CollabCampus — Built for University Excellence.</p>
          <div className="flex items-center gap-2">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for seamless campus synergy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
