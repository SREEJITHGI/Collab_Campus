import { communityRepository } from '../repositories/communityRepository.js';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  eventDate: z.string(),
  location: z.string().min(2),
  maxCapacity: z.number().int().min(1).default(100),
  bannerUrl: z.string().optional().nullable(),
});

const createAnnouncementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.string().default('General'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

const createMarketplaceSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.enum(['Books', 'Electronics', 'Stationery', 'Lost & Found', 'Other']),
  price: z.number().min(0).default(0),
  isFreeOrLost: z.boolean().default(false),
  contactInfo: z.string().min(3),
  imageUrl: z.string().optional().nullable(),
});

export const communityController = {
  // Events
  async getEvents(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const events = await communityRepository.findAllEvents(userId);
      res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
      next(err);
    }
  },

  async createEvent(req, res, next) {
    try {
      const validated = createEventSchema.parse(req.body);
      const event = await communityRepository.createEvent({
        ...validated,
        organizerId: req.user.id,
      });
      res.status(201).json({ success: true, message: 'Event published', data: event });
    } catch (err) {
      next(err);
    }
  },

  async toggleRsvp(req, res, next) {
    try {
      const eventId = parseInt(req.params.id, 10);
      const result = await communityRepository.toggleEventRsvp(eventId, req.user.id);
      res.status(200).json({
        success: true,
        registered: result.registered,
        message: result.registered ? 'RSVP registered' : 'RSVP cancelled',
      });
    } catch (err) {
      next(err);
    }
  },

  // Announcements
  async getAnnouncements(req, res, next) {
    try {
      const announcements = await communityRepository.findAllAnnouncements();
      res.status(200).json({ success: true, count: announcements.length, data: announcements });
    } catch (err) {
      next(err);
    }
  },

  async createAnnouncement(req, res, next) {
    try {
      const validated = createAnnouncementSchema.parse(req.body);
      const announcement = await communityRepository.createAnnouncement({
        ...validated,
        authorId: req.user.id,
      });
      res.status(201).json({ success: true, message: 'Announcement posted', data: announcement });
    } catch (err) {
      next(err);
    }
  },

  // Marketplace
  async getMarketplace(req, res, next) {
    try {
      const { category, search, status = 'available' } = req.query;
      const items = await communityRepository.findAllMarketplace({ category, search, status });
      res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  },

  async createMarketplace(req, res, next) {
    try {
      const validated = createMarketplaceSchema.parse(req.body);
      const item = await communityRepository.createMarketplaceListing({
        ...validated,
        sellerId: req.user.id,
      });
      res.status(201).json({ success: true, message: 'Listing posted', data: item });
    } catch (err) {
      next(err);
    }
  },

  // Notifications
  async getNotifications(req, res, next) {
    try {
      const notifs = await communityRepository.getNotifications(req.user.id);
      res.status(200).json({ success: true, count: notifs.length, data: notifs });
    } catch (err) {
      next(err);
    }
  },

  async markNotificationRead(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await communityRepository.markNotificationRead(id, req.user.id);
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  },

  // Analytics
  async getAnalytics(req, res, next) {
    try {
      const analytics = await communityRepository.getPlatformAnalytics();
      res.status(200).json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
};
