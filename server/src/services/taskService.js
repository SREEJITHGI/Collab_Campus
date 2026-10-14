import { taskRepository } from '../repositories/taskRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';

export const taskService = {
  async getTasksByProject(projectId, filters) {
    return await taskRepository.findByProject(projectId, filters);
  },

  async createTask(projectId, data, currentUser) {
    // Verify user is project member or owner
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    const isMember = await projectRepository.isMember(projectId, currentUser.id);
    const isOwner = project.owner_id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isMember && !isOwner && !isAdmin) {
      const err = new Error('Forbidden: Only project members can create tasks in this project');
      err.statusCode = 403;
      throw err;
    }

    return await taskRepository.create({
      ...data,
      projectId,
      createdBy: currentUser.id,
    });
  },

  async updateTask(taskId, updateData, currentUser) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    // Check project membership
    const isMember = await projectRepository.isMember(task.project_id, currentUser.id);
    const isOwner = task.project_owner_id === currentUser.id;
    const isAssigned = task.assigned_to === currentUser.id;
    const isCreator = task.created_by === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isMember && !isOwner && !isAssigned && !isCreator && !isAdmin) {
      const err = new Error('Forbidden: Only project members can update this task');
      err.statusCode = 403;
      throw err;
    }

    return await taskRepository.update(taskId, updateData);
  },

  async deleteTask(taskId, currentUser) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    const membership = await projectRepository.isMember(task.project_id, currentUser.id);
    const isOwner = task.project_owner_id === currentUser.id;
    const isLeader = membership && membership.role === 'leader';
    const isCreator = task.created_by === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isLeader && !isCreator && !isAdmin) {
      const err = new Error('Forbidden: Only project leaders, task creators, or admins can delete this task');
      err.statusCode = 403;
      throw err;
    }

    return await taskRepository.delete(taskId);
  }
};
