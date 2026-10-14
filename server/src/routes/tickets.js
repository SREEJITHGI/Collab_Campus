import express from 'express';
import { ticketController } from '../controllers/ticketController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', ticketController.getAll);
router.post('/', ticketController.create);
router.get('/:id', ticketController.getById);
router.put('/:id/status', ticketController.updateStatus);
router.put('/:id/assign', ticketController.assign);
router.post('/:id/comments', ticketController.addComment);

export default router;
