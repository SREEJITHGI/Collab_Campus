import express from 'express';
import { communityController } from '../controllers/communityController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Events
router.get('/events', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, () => communityController.getEvents(req, res, next));
  }
  communityController.getEvents(req, res, next);
});
router.post('/events', authenticate, communityController.createEvent);
router.post('/events/:id/rsvp', authenticate, communityController.toggleRsvp);

// Announcements
router.get('/announcements', communityController.getAnnouncements);
router.post('/announcements', authenticate, authorize('admin', 'faculty'), communityController.createAnnouncement);

// Marketplace
router.get('/marketplace', communityController.getMarketplace);
router.post('/marketplace', authenticate, communityController.createMarketplace);

// Notifications
router.get('/notifications', authenticate, communityController.getNotifications);
router.put('/notifications/:id/read', authenticate, communityController.markNotificationRead);

// Platform Analytics Dashboard
router.get('/analytics', communityController.getAnalytics);

export default router;
