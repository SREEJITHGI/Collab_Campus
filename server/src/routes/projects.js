import express from 'express';
import { projectController } from '../controllers/projectController.js';
import { taskController } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All project operations require authentication
router.use(authenticate);

// Project CRUD
router.get('/', projectController.getAll);
router.post('/', projectController.create);
router.get('/:id', projectController.getById);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

// Team Membership
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);

// Project Task Sub-routes
router.get('/:projectId/tasks', taskController.getByProject);
router.post('/:projectId/tasks', taskController.create);

export default router;
