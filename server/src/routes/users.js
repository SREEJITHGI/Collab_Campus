import express from 'express';
import { userRepository } from '../repositories/userRepository.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Search users by role, skills, or query (e.g. for team recruitment or faculty mentorship)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { role, skill, search, limit = 20, offset = 0 } = req.query;
    const users = await userRepository.searchUsers({
      role,
      skill,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// Get user profile by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await userRepository.findById(parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
