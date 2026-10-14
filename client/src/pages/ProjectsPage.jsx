import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ExternalLink, 
  Globe, 
  Code, 
  Sparkles,
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const { user, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [myProjectsOnly, setMyProjectsOnly] = useState(false);

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Full-Stack Web');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState(['React', 'Node.js', 'PostgreSQL']);
  const [maxMembers, setMaxMembers] = useState(4);
  const [githubRepo, setGithubRepo] = useState('');
  const [liveDemo, setLiveDemo] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const categories = [
    'All Categories',
    'Full-Stack Web',
    'AI & Machine Learning',
    'Internet of Things',
    'Mobile Application',
    'Cloud & DevOps',
    'Cybersecurity',
    'Robotics & Hardware',
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (myProjectsOnly) params.myProjects = 'true';

      const res = await api.get('/projects', { params });
      if (res.data?.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedStatus, myProjectsOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleAddTech = (e) => {
    e.preventDefault();
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const payload = {
        title,
        description,
        category,
        technologies,
        maxMembers: Number(maxMembers),
        githubRepo: githubRepo || undefined,
        liveDemo: liveDemo || undefined,
      };

      const res = await api.post('/projects', payload);
      if (res.data?.success) {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setGithubRepo('');
        setLiveDemo('');
        fetchProjects();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-emerald text-xs">Module B: Collaboration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Projects & Team Workspace
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Build and manage student innovation squads, assign Kanban tasks, and recruit peers by technical skills.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary self-start md:self-center shadow-md shadow-emerald-600/20 px-5 py-2.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Start a Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, stacks, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-xs sm:text-sm"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
          </select>

          {isAuthenticated && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none px-2">
              <input
                type="checkbox"
                checked={myProjectsOnly}
                onChange={(e) => setMyProjectsOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>My Squads</span>
            </label>
          )}

          <button
            type="button"
            onClick={fetchProjects}
            className="btn-secondary py-2 text-xs px-3"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500 font-medium">Loading campus projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              There are currently no projects matching your query. Be the first to initiate an academic project squad!
            </p>
            {isAuthenticated ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary text-xs px-4 py-2"
              >
                Create Project
              </button>
            ) : (
              <Link to="/login" className="btn-primary text-xs px-4 py-2">
                Sign in to Create Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const techList = Array.isArray(proj.technologies) 
                ? proj.technologies 
                : typeof proj.technologies === 'string' 
                  ? JSON.parse(proj.technologies || '[]') 
                  : [];

              return (
                <div
                  key={proj.id}
                  className="card p-6 flex flex-col justify-between hover:border-emerald-400 group"
                >
                  <div>
                    {/* Header: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="badge-emerald text-[11px] font-semibold">
                        {proj.category}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          proj.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proj.status === 'planning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {proj.status === 'in_progress' ? 'In Progress' : proj.status}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <Link
                      to={`/projects/${proj.id}`}
                      className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
                    >
                      {proj.title}
                    </Link>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Technologies tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {techList.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {techList.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                          +{techList.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Task Completion</span>
                        <span className="font-semibold text-slate-700">
                          {proj.progress_percent || 0}% ({proj.completed_tasks || 0}/{proj.total_tasks || 0})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${proj.progress_percent || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer: Owner & Members */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                          {proj.owner_name?.charAt(0) || 'U'}
                        </div>
                        <span className="truncate max-w-[100px]">{proj.owner_name?.split(' ')[0]}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {proj.member_count || 1}/{proj.max_members || 5}
                        </span>
                        <Link
                          to={`/projects/${proj.id}`}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                          title="Open Kanban Board"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Initiate New Project</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="label-field">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Autonomous Campus Shuttle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="Full-Stack Web">Full-Stack Web</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Internet of Things">Internet of Things</option>
                  <option value="Mobile Application">Mobile Application</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Robotics & Hardware">Robotics & Hardware</option>
                </select>
              </div>

              <div>
                <label className="label-field">Description & Objectives *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail what the project solves, planned architecture, and goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="label-field">Technologies & Frameworks</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. React, Docker, PyTorch"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddTech(e); }}
                    className="input-field py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="btn-secondary px-3 py-1 text-xs shrink-0"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-[36px]">
                  {technologies.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                    >
                      {t}
                      <button type="button" onClick={() => handleRemoveTech(t)}>
                        <X className="w-3 h-3 hover:text-emerald-950" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Max Squad Size</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">GitHub Repository (opt.)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn-primary py-2 text-xs font-semibold px-5"
                >
                  {createLoading ? 'Creating...' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
