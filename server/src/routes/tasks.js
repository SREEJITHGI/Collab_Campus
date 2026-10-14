import express from 'express';
import { taskController } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Direct task actions
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

export default router;
