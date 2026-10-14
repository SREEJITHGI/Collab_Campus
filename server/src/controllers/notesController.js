import { notesRepository } from '../repositories/notesRepository.js';
import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  department: z.string().min(2, 'Department is required'),
  semester: z.number().int().min(1).max(10),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSizeBytes: z.number().optional(),
});

export const notesController = {
  async getAll(req, res, next) {
    try {
      const { department, semester, subject, search, limit = 50, offset = 0 } = req.query;
      const notes = await notesRepository.findAll({
        department,
        semester,
        subject,
        search,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      res.status(200).json({
        success: true,
        count: notes.length,
        data: notes,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const note = await notesRepository.findById(parseInt(req.params.id, 10));
      if (!note) {
        return res.status(404).json({ success: false, message: 'Notes material not found' });
      }
      res.status(200).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      // If file was uploaded via multer, use file properties
      const file = req.file;
      const body = { ...req.body };
      if (body.semester) body.semester = parseInt(body.semester, 10);

      const validated = createNoteSchema.parse(body);

      const noteData = {
        title: validated.title,
        subject: validated.subject,
        department: validated.department,
        semester: validated.semester,
        fileUrl: file ? `/uploads/${file.filename}` : validated.fileUrl || '/uploads/sample_notes.pdf',
        fileName: file ? file.originalname : validated.fileName || 'lecture_notes.pdf',
        fileSizeBytes: file ? file.size : validated.fileSizeBytes || 1024 * 1024 * 2,
        fileType: file ? file.mimetype : 'application/pdf',
        uploadedBy: req.user.id,
      };

      const created = await notesRepository.create(noteData);
      res.status(201).json({
        success: true,
        message: 'Academic notes uploaded successfully',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  },

  async download(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const note = await notesRepository.findById(id);
      if (!note) {
        return res.status(404).json({ success: false, message: 'Notes not found' });
      }

      await notesRepository.incrementDownload(id);
      res.status(200).json({
        success: true,
        downloadUrl: note.file_url,
        fileName: note.file_name,
        downloadCount: (note.download_count || 0) + 1,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const note = await notesRepository.findById(id);
      if (!note) {
        return res.status(404).json({ success: false, message: 'Notes not found' });
      }

      const isUploader = note.uploaded_by === req.user.id;
      const isAdmin = req.user.role === 'admin';
      if (!isUploader && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only uploader or admin can delete notes' });
      }

      await notesRepository.delete(id);
      res.status(200).json({ success: true, message: 'Notes deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
