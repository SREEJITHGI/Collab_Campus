import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  ArrowLeft, 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  ExternalLink, 
  Code, 
  UserPlus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Calendar,
  X,
  Search,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task Creation Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Add Member Modal & Skill Search
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [memberRole, setMemberRole] = useState('member');

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data?.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details');
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/projects/${id}/tasks`);
      if (res.data?.success) {
        setTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProjectDetails(), fetchTasks()]);
      setLoading(false);
    };
    init();
  }, [id]);

  // Task Status Mover
  const handleMoveTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      fetchProjectDetails(); // update progress stats
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // Task Creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskSubmitting(true);
    try {
      const payload = {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        assignedTo: taskAssignee ? Number(taskAssignee) : null,
        dueDate: taskDueDate || null,
      };

      await api.post(`/projects/${id}/tasks`, payload);
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      setTaskDueDate('');
      fetchTasks();
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to remove this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Search teammates by skill / name
  const handleSearchUsers = async (e) => {
    e?.preventDefault();
    setSearchLoading(true);
    try {
      const res = await api.get('/users', {
        params: { search: memberSearch, role: 'student' },
      });
      if (res.data?.success) {
        // filter out users already in project
        const memberIds = (project?.members || []).map(m => m.user_id);
        const available = (res.data.data || []).filter(u => !memberIds.includes(u.id));
        setSearchedUsers(available);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await api.post(`/projects/${id}/members`, {
        userId,
        role: memberRole,
      });
      setShowMemberModal(false);
      setMemberSearch('');
      setSearchedUsers([]);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this teammate from the squad?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const isOwner = project && user && project.owner_id === user.id;
  const isLeader = project?.members?.some(m => m.user_id === user?.id && m.project_role === 'leader');
  const isMember = project?.members?.some(m => m.user_id === user?.id) || isOwner;

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-3 text-xs text-slate-500">Loading project details & Kanban board...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'This project may have been deleted.'}</p>
        <Link to="/projects" className="btn-primary text-xs">
          Return to Projects
        </Link>
      </div>
    );
  }

  const techList = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? JSON.parse(project.technologies || '[]')
      : [];

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Navigation Breadcrumb */}
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Hub</span>
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-emerald text-xs font-semibold">{project.category}</span>
              <span className="badge-slate text-xs font-semibold uppercase">{project.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {project.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {techList.map((tech, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links & Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {project.github_repo && (
              <a
                href={project.github_repo}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                <Code className="w-3.5 h-3.5 text-emerald-600" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {project.live_demo && (
              <a
                href={project.live_demo}
                target="_blank"
                rel="noreferrer"
                className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Project Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Progress & Meta Bar */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
              <span>Overall Deliverable Progress</span>
              <span className="font-bold text-emerald-700">
                {project.task_stats?.progress_percent || 0}% Complete ({project.task_stats?.completed || 0}/{project.task_stats?.total || 0} tasks)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${project.task_stats?.progress_percent || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-slate-500">
            <div>
              Created by: <strong className="text-slate-800">{project.owner_name}</strong>
            </div>
            <div>•</div>
            <div>
              Date: <strong className="text-slate-800">{new Date(project.created_at).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Team Squad & Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Team Squad Roster */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Project Squad</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {project.members?.length || 1}/{project.max_members}
              </span>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {(project.members || []).map((m) => (
                <div key={m.membership_id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {m.full_name?.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate">{m.full_name}</p>
                      <p className="text-[10px] text-emerald-600 font-medium capitalize">{m.project_role}</p>
                    </div>
                  </div>

                  {(isOwner || isLeader) && m.user_id !== project.owner_id && (
                    <button
                      onClick={() => handleRemoveMember(m.user_id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Invite Button */}
            {(isOwner || isLeader) && (project.members?.length || 0) < project.max_members && (
              <button
                onClick={() => {
                  setShowMemberModal(true);
                  handleSearchUsers();
                }}
                className="btn-outline w-full mt-4 text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Teammate</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Kanban Task Board */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Kanban Task Board</h2>
            </div>
            {isMember && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            )}
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. To Do Column */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  To Do
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-xs font-bold shadow-2xs">
                  {todoTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
                {todoTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                    No pending tasks
                  </div>
                ) : (
                  todoTasks.map((t) => (
                    <div key={t.id} className="card p-3.5 bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          t.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                          t.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-slate-500 leading-normal">{t.description}</p>
                      )}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{t.assigned_name ? `Assigned: ${t.assigned_name.split(' ')[0]}` : 'Unassigned'}</span>
                        <div className="flex items-center gap-1">
                          {isMember && (
                            <button
                              onClick={() => handleMoveTaskStatus(t.id, 'in_progress')}
                              className="p-1 hover:bg-slate-100 rounded text-emerald-600 font-bold"
                              title="Move to In Progress"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isMember && (
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. In Progress Column */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  In Progress
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-xs font-bold shadow-2xs">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
                {inProgressTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                    Nothing in progress
                  </div>
                ) : (
                  inProgressTasks.map((t) => (
                    <div key={t.id} className="card p-3.5 bg-white border border-indigo-100 shadow-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          t.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                          t.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                          'bg-indigo-50 text-indigo-700'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-slate-500 leading-normal">{t.description}</p>
                      )}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{t.assigned_name ? `Assigned: ${t.assigned_name.split(' ')[0]}` : 'Unassigned'}</span>
                        <div className="flex items-center gap-1">
                          {isMember && (
                            <button
                              onClick={() => handleMoveTaskStatus(t.id, 'todo')}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                              title="Move back to To Do"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isMember && (
                            <button
                              onClick={() => handleMoveTaskStatus(t.id, 'completed')}
                              className="p-1 hover:bg-slate-100 rounded text-emerald-600 font-bold"
                              title="Mark as Completed"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Completed Column */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-emerald-700 text-xs font-bold shadow-2xs">
                  {completedTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
                {completedTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                    No completed tasks yet
                  </div>
                ) : (
                  completedTasks.map((t) => (
                    <div key={t.id} className="card p-3.5 bg-emerald-50/50 border border-emerald-100 shadow-xs space-y-2 opacity-90">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 line-through text-slate-500">{t.title}</h4>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Done</span>
                        {isMember && (
                          <button
                            onClick={() => handleMoveTaskStatus(t.id, 'in_progress')}
                            className="p-1 hover:bg-white rounded text-slate-600 text-[10px]"
                            title="Re-open task"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Add Project Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="label-field">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design relational database schema"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="label-field">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details, checklist, or deliverable criteria..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="input-field text-xs py-2 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="label-field">Assign To</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    <option value="">Unassigned</option>
                    {(project.members || []).map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.full_name} ({m.project_role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary text-xs py-1.5">
                  Cancel
                </button>
                <button type="submit" disabled={taskSubmitting} className="btn-primary text-xs py-1.5 px-4">
                  {taskSubmitting ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Invite Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Invite Campus Teammate</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchUsers} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or technical skills..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="input-field pl-9 py-2 text-xs"
              />
            </form>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Assign Role:</span>
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs"
              >
                <option value="member">Squad Member</option>
                <option value="mentor">Project Mentor</option>
              </select>
            </div>

            {/* Search Results List */}
            <div className="space-y-2 mt-2">
              {searchLoading ? (
                <div className="text-center py-6 text-xs text-slate-400">Searching students...</div>
              ) : searchedUsers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No new students found. Try searching for "React" or a student's name.
                </div>
              ) : (
                searchedUsers.map((u) => {
                  const skills = Array.isArray(u.skills) 
                    ? u.skills 
                    : typeof u.skills === 'string' 
                      ? JSON.parse(u.skills || '[]') 
                      : [];

                  return (
                    <div key={u.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">{u.full_name}</p>
                        <p className="text-[10px] text-slate-500">{u.student_department || u.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {skills.slice(0, 3).map((sk, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9px] font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(u.id)}
                        className="btn-primary py-1 px-3 text-xs shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
