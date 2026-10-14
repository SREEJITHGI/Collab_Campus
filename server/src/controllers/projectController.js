import { projectService } from '../services/projectService.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../validators/projectValidator.js';

export const projectController = {
  async getAll(req, res, next) {
    try {
      const { category, status, search, myProjects, limit = 50, offset = 0 } = req.query;

      const filters = {
        category,
        status,
        search,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      };

      if (myProjects === 'true' && req.user) {
        filters.memberUserId = req.user.id;
      }

      const projects = await projectService.getAllProjects(filters);
      res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const project = await projectService.getProjectById(id);

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const validatedData = createProjectSchema.parse(req.body);
      const project = await projectService.createProject(validatedData, req.user);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateProjectSchema.parse(req.body);
      const updated = await projectService.updateProject(id, validatedData, req.user);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await projectService.deleteProject(id, req.user);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async addMember(req, res, next) {
    try {
      const projectId = parseInt(req.params.id, 10);
      const validatedData = addMemberSchema.parse(req.body);
      const updatedProject = await projectService.addMember(projectId, validatedData, req.user);

      res.status(200).json({
        success: true,
        message: 'Team member added successfully',
        data: updatedProject,
      });
    } catch (err) {
      next(err);
    }
  },

  async removeMember(req, res, next) {
    try {
      const projectId = parseInt(req.params.id, 10);
      const userId = parseInt(req.params.userId, 10);
      const updatedProject = await projectService.removeMember(projectId, userId, req.user);

      res.status(200).json({
        success: true,
        message: 'Team member removed successfully',
        data: updatedProject,
      });
    } catch (err) {
      next(err);
    }
  }
};
