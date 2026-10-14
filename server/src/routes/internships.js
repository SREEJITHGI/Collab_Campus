import express from 'express';
import { internshipController } from '../controllers/internshipController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Publicly browse listings
router.get('/', (req, res, next) => {
  // If Bearer token present, authenticate softly to attach is_saved and application status
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, () => internshipController.getAll(req, res, next));
  }
  internshipController.getAll(req, res, next);
});

// Protected student bookmarks and applications
router.get('/saved', authenticate, internshipController.getSaved);
router.get('/applications', authenticate, internshipController.getApplications);
router.post('/applications', authenticate, internshipController.updateApplication);

// Internship details
router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, () => internshipController.getById(req, res, next));
  }
  internshipController.getById(req, res, next);
});

// Bookmark toggle
router.post('/:id/save', authenticate, internshipController.toggleSave);

// Publish internship (admin, faculty, or placement coordinators)
router.post('/', authenticate, authorize('admin', 'faculty', 'student'), internshipController.create);

export default router;
