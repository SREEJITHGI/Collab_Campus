import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Ticket,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [rsvpLoadingId, setRsvpLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Host Event Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    eventDate: '',
    location: '',
    maxCapacity: 100,
    bannerUrl: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const categories = ['All', 'Workshop', 'Hackathon', 'Seminar', 'Tech Talk', 'Cultural', 'Sports'];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      if (res.data?.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleToggleRsvp = async (event) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setRsvpLoadingId(event.id);
    try {
      const res = await api.post(`/events/${event.id}/rsvp`);
      if (res.data?.success) {
        const isRegistered = res.data.registered;
        setToastMessage(isRegistered ? `Successfully registered for "${event.title}"!` : `Cancelled RSVP for "${event.title}".`);
        setTimeout(() => setToastMessage(null), 4000);
        
        // Optimistically update event
        setEvents((prev) =>
          prev.map((e) => {
            if (e.id === event.id) {
              const currentCount = parseInt(e.registered_count || 0, 10);
              return {
                ...e,
                is_registered: isRegistered,
                registered_count: isRegistered ? currentCount + 1 : Math.max(0, currentCount - 1),
              };
            }
            return e;
          })
        );
      }
    } catch (err) {
      console.error('RSVP error:', err);
      alert(err.response?.data?.message || 'Failed to update RSVP status.');
    } finally {
      setRsvpLoadingId(null);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        eventDate: new Date(formData.eventDate).toISOString(),
        location: formData.location.trim(),
        maxCapacity: parseInt(formData.maxCapacity, 10),
        bannerUrl: formData.bannerUrl.trim() || null,
      };

      const res = await api.post('/events', payload);
      if (res.data?.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          category: 'Workshop',
          eventDate: '',
          location: '',
          maxCapacity: 100,
          bannerUrl: '',
        });
        setToastMessage('Event published successfully!');
        setTimeout(() => setToastMessage(null), 4000);
        fetchEvents();
      }
    } catch (err) {
      console.error('Create event error:', err);
      setCreateError(err.response?.data?.message || 'Failed to create event. Please check required fields.');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === 'All' || ev.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      ev.title?.toLowerCase().includes(search.toLowerCase()) ||
      ev.description?.toLowerCase().includes(search.toLowerCase()) ||
      ev.location?.toLowerCase().includes(search.toLowerCase()) ||
      ev.organizer_name?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return {
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: d.getDate(),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        fullDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      };
    } catch {
      return { month: 'UPCOMING', day: '--', time: '--', fullDate: dateString };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-sm border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Campus Happenings & Registrations
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                Campus Events & Workshops
              </h1>
              <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
                Discover technical hackathons, guest seminars, career clinics, and cultural fests. Reserve your seat with one click.
              </p>
            </div>

            <div>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setShowCreateModal(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Host an Event
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, organizers, venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-sm text-slate-500 font-medium">Loading upcoming campus events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No events found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {search || selectedCategory !== 'All'
                ? 'Try adjusting your search query or category filters.'
                : 'No campus events are currently scheduled. Be the first to host one!'}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const dateInfo = formatDate(ev.event_date);
              const registered = parseInt(ev.registered_count || 0, 10);
              const maxCap = parseInt(ev.max_capacity || 100, 10);
              const isFull = registered >= maxCap;
              const fillPercent = Math.min(100, Math.round((registered / maxCap) * 100));

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Card Header / Banner */}
                  <div className="h-44 bg-gradient-to-br from-slate-800 to-slate-900 relative p-4 flex flex-col justify-between overflow-hidden">
                    {ev.banner_url ? (
                      <img
                        src={ev.banner_url}
                        alt={ev.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 opacity-90"></div>
                    )}
                    
                    {/* Top badging */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-white/90 text-slate-900 backdrop-blur-sm shadow-sm">
                        {ev.category || 'General'}
                      </span>
                      {ev.is_registered && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500 text-white shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          RSVP Confirmed
                        </span>
                      )}
                    </div>

                    {/* Date Block Overlay */}
                    <div className="relative z-10 flex items-end justify-between">
                      <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white">
                        <div className="text-center">
                          <span className="block text-[10px] font-bold text-emerald-400 tracking-wider">
                            {dateInfo.month}
                          </span>
                          <span className="block text-lg font-black leading-none">
                            {dateInfo.day}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-white/20"></div>
                        <div className="text-xs text-slate-200">
                          <span className="block font-medium">{dateInfo.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {ev.description}
                      </p>

                      <div className="space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-700 truncate">{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">Organized by <strong className="text-slate-700">{ev.organizer_name || 'Campus Faculty'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity and RSVP CTA */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 mb-1.5">
                          <span>Attendance Capacity</span>
                          <span className={isFull ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                            {registered} / {maxCap} {isFull ? '(FULL)' : 'seats'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              fillPercent >= 100
                                ? 'bg-rose-500'
                                : fillPercent > 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleRsvp(ev)}
                        disabled={rsvpLoadingId === ev.id || (!ev.is_registered && isFull)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                          ev.is_registered
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.01]'
                        }`}
                      >
                        {rsvpLoadingId === ev.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : ev.is_registered ? (
                          <>
                            <X className="w-3.5 h-3.5" />
                            Cancel My RSVP
                          </>
                        ) : isFull ? (
                          'Event Fully Booked'
                        ) : (
                          <>
                            <Ticket className="w-4 h-4" />
                            RSVP / Reserve Spot
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Host Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Host Campus Event</h3>
                    <p className="text-xs text-slate-500">Publish workshop, hackathon, or seminar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Generative AI Hands-on Workshop"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    >
                      {categories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      required
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Venue / Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS Lab 2 or Auditorium"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Description *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Provide workshop overview, prerequisites, what participants will build..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
                  >
                    {createLoading ? 'Publishing...' : 'Publish Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
