import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  CheckCircle2, 
  FolderKanban, 
  LifeBuoy, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Sparkles,
  Inbox,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    try {
      await Promise.all(unread.map((n) => api.put(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-5 h-5 text-emerald-600" />;
      case 'ticket':
        return <LifeBuoy className="w-5 h-5 text-amber-600" />;
      case 'career':
      case 'internship':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Notifications Center
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Track project invites, ticket status transitions, deadlines, and announcements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Activity ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">Fetching activity alerts...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'You have responded to all recent notifications.'
                : 'Updates regarding projects, service requests, and campus events will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  notif.is_read
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className={`p-2.5 rounded-xl shrink-0 ${notif.is_read ? 'bg-slate-100' : 'bg-white shadow-xs'}`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${notif.is_read ? 'text-slate-800' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          className="font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="shrink-0 p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
