import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap, 
  Plus, 
  X, 
  AlertCircle,
  FileDown,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotesPage() {
  const { user, isAuthenticated } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [uploadDept, setUploadDept] = useState('Computer Science & Engineering');
  const [uploadSem, setUploadSem] = useState(4);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const departments = [
    'All Departments',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Management & Business Studies',
  ];

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (department && department !== 'All Departments') params.department = department;
      if (semester) params.semester = semester;

      const res = await api.get('/notes', { params });
      if (res.data?.success) {
        setNotes(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [department, semester]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleDownload = async (noteId, fileName, fileUrl) => {
    try {
      const res = await api.get(`/notes/${noteId}/download`);
      if (res.data?.success) {
        // Increment download count locally
        setNotes(notes.map(n => n.id === noteId ? { ...n, download_count: (n.download_count || 0) + 1 } : n));
        
        // Trigger browser download or preview
        const link = document.createElement('a');
        link.href = res.data.downloadUrl || fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert('Could not download file: ' + err.message);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('department', uploadDept);
      formData.append('semester', uploadSem);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setShowUploadModal(false);
        setTitle('');
        setSubject('');
        setSelectedFile(null);
        fetchNotes();
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload notes material');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <span className="badge-emerald text-xs">Module C: Knowledge Sharing</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campus Notes Hub
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access curated lecture notes, exam guides, and reference slides organized by department and semester.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary self-start md:self-center shadow-md shadow-emerald-600/20 px-5 py-2.5 font-semibold"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Notes</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject or note title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-xs sm:text-sm"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            {departments.map((d) => (
              <option key={d} value={d === 'All Departments' ? '' : d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="input-field py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <button type="button" onClick={fetchNotes} className="btn-secondary py-2 text-xs px-3">
            Refresh
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="mt-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500 font-medium">Loading academic notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Notes Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              No notes match the selected department and semester criteria. Be the first to share learning materials!
            </p>
            {isAuthenticated && (
              <button onClick={() => setShowUploadModal(true)} className="btn-primary text-xs px-4 py-2">
                Upload New Notes
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="card p-6 flex flex-col justify-between hover:border-emerald-300 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="badge-emerald text-[11px] font-semibold">
                      Semester {note.semester}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {note.department}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{note.subject}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <p className="font-medium text-slate-700">{note.uploader_name}</p>
                    <p className="flex items-center gap-1 mt-0.5">
                      <FileDown className="w-3 h-3 text-slate-400" />
                      <span>{note.download_count || 0} downloads</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownload(note.id, note.file_name, note.file_url)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Notes Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Upload Learning Material</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="label-field">Material Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Networks - OSI & TCP/IP Layer Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">Subject / Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Networks (CS-402)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Department</label>
                  <select
                    value={uploadDept}
                    onChange={(e) => setUploadDept(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    {departments.filter(d => d !== 'All Departments').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Semester</label>
                  <select
                    value={uploadSem}
                    onChange={(e) => setUploadSem(Number(e.target.value))}
                    className="input-field text-xs py-2"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-field">Select PDF File (Max 15MB)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary text-xs py-2">
                  Cancel
                </button>
                <button type="submit" disabled={uploadLoading} className="btn-primary text-xs py-2 px-5 font-semibold">
                  {uploadLoading ? 'Uploading...' : 'Publish Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
