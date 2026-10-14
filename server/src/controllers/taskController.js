import { taskService } from '../services/taskService.js';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator.js';

export const taskController = {
  async getByProject(req, res, next) {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { status, priority, assignedTo } = req.query;

      const tasks = await taskService.getTasksByProject(projectId, {
        status,
        priority,
        assignedTo: assignedTo ? parseInt(assignedTo, 10) : undefined,
      });

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const validatedData = createTaskSchema.parse(req.body);
      const task = await taskService.createTask(projectId, validatedData, req.user);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const taskId = parseInt(req.params.id, 10);
      const validatedData = updateTaskSchema.parse(req.body);
      const updated = await taskService.updateTask(taskId, validatedData, req.user);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const taskId = parseInt(req.params.id, 10);
      await taskService.deleteTask(taskId, req.user);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
};
