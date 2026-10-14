import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  History, 
  X, 
  Send,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TicketsPage() {
  const { user, isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // Submit Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Wi-Fi & Network');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketLocation, setTicketLocation] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Detail & Audit Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusTransition, setStatusTransition] = useState('');

  const categories = [
    'All Categories',
    'Wi-Fi & Network',
    'Classroom Audio/Visual',
    'Laboratory Equipment',
    'Electrical & Power',
    'Hostel & Facility',
    'Other',
  ];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All Categories') params.category = category;
      if (status) params.status = status;

      const res = await api.get('/tickets', { params });
      if (res.data?.success) {
        setTickets(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const res = await api.get(`/tickets/${id}`);
      if (res.data?.success) {
        setSelectedTicket(res.data.data);
      }
    } catch (err) {
      alert('Failed to load ticket details: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [category, status, isAuthenticated]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        category: ticketCategory,
        description: ticketDesc,
        location: ticketLocation,
        priority: ticketPriority,
      };

      await api.post('/tickets', payload);
      setShowCreateModal(false);
      setTicketDesc('');
      setTicketLocation('');
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      await api.put(`/tickets/${selectedTicket.id}/status`, {
        status: newStatus,
        note: `Status updated by ${user?.full_name}`,
      });
      fetchTicketDetails(selectedTicket.id);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;
    setCommentLoading(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/comments`, {
        comment: newComment,
      });
      setNewComment('');
      fetchTicketDetails(selectedTicket.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <span className="badge-emerald text-xs">Module F: Facilities & IT Desk</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campus Service Ticket Desk
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Report Wi-Fi drops, classroom projectors, laboratory equipment faults, and track dispatch status.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary self-start md:self-center shadow-md shadow-emerald-600/20 px-5 py-2.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Service Request</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            {categories.map((c) => (
              <option key={c} value={c === 'All Categories' ? '' : c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <button type="button" onClick={fetchTickets} className="btn-secondary py-2 text-xs px-3">
          Refresh Tickets
        </button>
      </div>

      {/* Tickets List */}
      <div className="mt-8">
        {!isAuthenticated ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <LifeBuoy className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Sign in to Access Campus Helpdesk</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Please log in to report facility issues and view the progress of your service requests.
            </p>
            <a href="/login" className="btn-primary text-xs px-4 py-2">
              Sign In
            </a>
          </div>
        ) : loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500 font-medium">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Active Service Tickets</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              All campus facilities are currently reported operational!
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary text-xs px-4 py-2">
              Report an Issue
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => fetchTicketDetails(t.id)}
                className="card p-5 cursor-pointer hover:border-emerald-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {t.ticket_code}
                    </span>
                    <span className="badge-emerald text-[11px] font-semibold">{t.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800' :
                        t.status === 'Assigned' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 mt-1">{t.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {t.location}
                    </span>
                    <span>•</span>
                    <span>Priority: <strong className="text-slate-700">{t.priority}</strong></span>
                    <span>•</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="btn-secondary text-xs py-1.5 px-3">
                    View Audit Timeline
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details & Timeline Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {selectedTicket.ticket_code}
                  </span>
                  <span className="badge-emerald text-xs">{selectedTicket.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTicket.description}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedTicket.location}</span>
                  <span>•</span>
                  <span>Reported by {selectedTicket.creator_name}</span>
                </p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Transition Control (for staff or closure) */}
            {['admin', 'faculty'].includes(user?.role) && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Staff Workflow Dispatch:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Assigned', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`text-xs py-1 px-3 rounded-lg font-semibold transition-all ${
                        selectedTicket.status === st
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Move to {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Status History Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
                <History className="w-3.5 h-3.5 text-emerald-600" />
                Status History & Audit Trail
              </h4>
              <div className="space-y-2.5 border-l-2 border-emerald-500/30 pl-4 ml-2">
                {(selectedTicket.history || []).map((h, i) => (
                  <div key={i} className="relative text-xs">
                    <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">{h.new_status}</strong>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(h.changed_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{h.note}</p>
                    <p className="text-slate-400 text-[10px]">By {h.changer_name} ({h.changer_role})</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments & Resolution Feed */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Service Notes & Comments ({selectedTicket.comments?.length || 0})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(selectedTicket.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes posted yet.</p>
                ) : (
                  selectedTicket.comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{c.commenter_name} ({c.commenter_role})</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(c.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add resolution note or comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input-field text-xs py-2 flex-1"
                />
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="btn-primary text-xs py-2 px-3 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submit Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Report Campus Service Issue</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="label-field">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="input-field text-xs py-2"
                >
                  {categories.filter(c => c !== 'All Categories').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Specific Campus Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block C, Room 304 / Library 2nd Floor"
                  value={ticketLocation}
                  onChange={(e) => setTicketLocation(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="label-field">Priority</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="input-field text-xs py-2"
                >
                  <option value="Low">Low - Minor inconvenience</option>
                  <option value="Medium">Medium - Regular attention</option>
                  <option value="High">High - Disrupting lab/lecture</option>
                  <option value="Urgent">Urgent - Immediate safety/power hazard</option>
                </select>
              </div>

              <div>
                <label className="label-field">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the issue, device symptoms, or when it started..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="input-field text-xs py-2 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-xs py-1.5">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="btn-primary text-xs py-1.5 px-4 font-semibold">
                  {submitLoading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
