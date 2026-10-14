import { internshipRepository } from '../repositories/internshipRepository.js';
import { z } from 'zod';

const createInternshipSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  roleTitle: z.string().min(2, 'Role title is required'),
  location: z.string().min(2, 'Location is required'),
  workType: z.enum(['Remote', 'On-site', 'Hybrid']).default('Hybrid'),
  stipendSalary: z.string().min(1, 'Stipend / Salary details are required'),
  eligibility: z.string().min(2, 'Eligibility criteria is required'),
  requiredSkills: z.array(z.string()).default([]),
  applicationLink: z.string().url('Application link must be a valid URL'),
  deadline: z.string().optional().nullable(),
});

const updateAppStatusSchema = z.object({
  internshipId: z.number().int().positive(),
  status: z.enum(['Interested', 'Applied', 'Interview', 'Selected', 'Rejected']),
  notes: z.string().optional().default(''),
});

export const internshipController = {
  async getAll(req, res, next) {
    try {
      const { workType, search, status = 'active', limit = 50, offset = 0 } = req.query;
      const userId = req.user ? req.user.id : null;

      const internships = await internshipRepository.findAll({
        workType,
        search,
        status,
        userId,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      res.status(200).json({
        success: true,
        count: internships.length,
        data: internships,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user ? req.user.id : null;
      const item = await internshipRepository.findById(id, userId);

      if (!item) {
        return res.status(404).json({ success: false, message: 'Internship listing not found' });
      }

      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const validated = createInternshipSchema.parse(req.body);
      const created = await internshipRepository.create({
        ...validated,
        postedBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Internship opportunity published successfully',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleSave(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await internshipRepository.toggleSave(req.user.id, id);

      res.status(200).json({
        success: true,
        is_saved: result.is_saved,
        message: result.is_saved ? 'Opportunity bookmarked' : 'Bookmark removed',
      });
    } catch (err) {
      next(err);
    }
  },

  async getSaved(req, res, next) {
    try {
      const items = await internshipRepository.getSavedOpportunities(req.user.id);
      res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  },

  async getApplications(req, res, next) {
    try {
      const applications = await internshipRepository.getUserApplications(req.user.id);
      res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
      next(err);
    }
  },

  async updateApplication(req, res, next) {
    try {
      const validated = updateAppStatusSchema.parse(req.body);
      const application = await internshipRepository.setApplicationStatus(
        req.user.id,
        validated.internshipId,
        validated.status,
        validated.notes
      );

      res.status(200).json({
        success: true,
        message: `Application status updated to '${validated.status}'`,
        data: application,
      });
    } catch (err) {
      next(err);
    }
  }
};
