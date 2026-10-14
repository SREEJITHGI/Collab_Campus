import { ticketRepository } from '../repositories/ticketRepository.js';
import { z } from 'zod';

const createTicketSchema = z.object({
  category: z.enum([
    'Wi-Fi & Network',
    'Classroom Audio/Visual',
    'Laboratory Equipment',
    'Electrical & Power',
    'Hostel & Facility',
    'Other',
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required (e.g. CS Lab 3, Block B)'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
});

const updateStatusSchema = z.object({
  status: z.enum(['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']),
  note: z.string().optional().default(''),
});

const assignStaffSchema = z.object({
  staffId: z.number().int().positive('Valid staff user ID is required'),
});

const addCommentSchema = z.object({
  comment: z.string().min(1, 'Comment text is required'),
});

export const ticketController = {
  async getAll(req, res, next) {
    try {
      const { category, status, priority, myTickets } = req.query;
      const filters = { category, status, priority };

      // If student, default to their tickets unless requested
      if (req.user.role === 'student' || myTickets === 'true') {
        filters.createdBy = req.user.id;
      }

      const tickets = await ticketRepository.findAll(filters);
      res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const ticket = await ticketRepository.findById(id);

      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      // Check permission: student can only view their own ticket; faculty and admin can view all
      if (req.user.role === 'student' && ticket.created_by !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot view tickets submitted by other students' });
      }

      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const validated = createTicketSchema.parse(req.body);
      const ticket = await ticketRepository.create({
        ...validated,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Campus service ticket created successfully',
        data: ticket,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const validated = updateStatusSchema.parse(req.body);

      // Only staff, faculty, admin, or ticket owner (for closing) can update status
      const ticket = await ticketRepository.findById(id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      const isStaffOrAdmin = ['admin', 'faculty'].includes(req.user.role);
      const isOwnerClosing = ticket.created_by === req.user.id && validated.status === 'Closed';

      if (!isStaffOrAdmin && !isOwnerClosing) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only authorized campus staff or admins can update ticket workflow status',
        });
      }

      const updated = await ticketRepository.updateStatus(id, validated.status, req.user.id, validated.note);
      res.status(200).json({
        success: true,
        message: `Ticket status moved to '${validated.status}'`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async assign(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const validated = assignStaffSchema.parse(req.body);

      // Only admin or faculty can dispatch/assign tickets
      if (!['admin', 'faculty'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only staff and admin can assign tickets' });
      }

      const updated = await ticketRepository.assignStaff(id, validated.staffId, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Ticket dispatched and assigned to staff successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async addComment(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const validated = addCommentSchema.parse(req.body);

      const ticket = await ticketRepository.findById(id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      // Check access
      if (req.user.role === 'student' && ticket.created_by !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot comment on this ticket' });
      }

      const comment = await ticketRepository.addComment(id, req.user.id, validated.comment);
      res.status(201).json({
        success: true,
        message: 'Comment posted',
        data: comment,
      });
    } catch (err) {
      next(err);
    }
  }
};
