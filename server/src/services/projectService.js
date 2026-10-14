import { projectRepository } from '../repositories/projectRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const projectService = {
  async getAllProjects(filters) {
    return await projectRepository.findAll(filters);
  },

  async getProjectById(id) {
    const project = await projectRepository.findById(id);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }
    return project;
  },

  async createProject(data, currentUser) {
    return await projectRepository.create({
      ...data,
      ownerId: currentUser.id,
    });
  },

  async updateProject(id, updateData, currentUser) {
    const project = await this.getProjectById(id);

    // Permission check: only owner or leader or admin can edit project
    const membership = await projectRepository.isMember(id, currentUser.id);
    const isOwner = project.owner_id === currentUser.id;
    const isLeader = membership && membership.role === 'leader';
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isLeader && !isAdmin) {
      const err = new Error('Forbidden: Only the project owner, leader, or campus admin can modify this project');
      err.statusCode = 403;
      throw err;
    }

    return await projectRepository.update(id, updateData);
  },

  async deleteProject(id, currentUser) {
    const project = await this.getProjectById(id);

    // Only owner or admin can delete
    const isOwner = project.owner_id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      const err = new Error('Forbidden: Only the project owner or campus admin can delete this project');
      err.statusCode = 403;
      throw err;
    }

    return await projectRepository.delete(id);
  },

  async addMember(projectId, { userId, role }, currentUser) {
    const project = await this.getProjectById(projectId);

    // Permission: only owner, leader, or admin can add/invite members
    const membership = await projectRepository.isMember(projectId, currentUser.id);
    const isOwner = project.owner_id === currentUser.id;
    const isLeader = membership && membership.role === 'leader';
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isLeader && !isAdmin) {
      const err = new Error('Forbidden: Only project leaders or owners can add team members');
      err.statusCode = 403;
      throw err;
    }

    // Check capacity
    const currentCount = project.members.length;
    if (currentCount >= project.max_members) {
      const err = new Error(`Cannot add member: project has reached its maximum capacity of ${project.max_members} members`);
      err.statusCode = 400;
      throw err;
    }

    // Check if target user exists
    const targetUser = await userRepository.findById(userId);
    if (!targetUser) {
      const err = new Error('Target user does not exist');
      err.statusCode = 404;
      throw err;
    }

    // Check if already a member
    const existing = await projectRepository.isMember(projectId, userId);
    if (existing) {
      const err = new Error('This user is already a member of this project');
      err.statusCode = 409;
      throw err;
    }

    await projectRepository.addMember(projectId, userId, role);
    return await this.getProjectById(projectId);
  },

  async removeMember(projectId, targetUserId, currentUser) {
    const project = await this.getProjectById(projectId);

    // Owner cannot be removed from project
    if (project.owner_id === targetUserId) {
      const err = new Error('Cannot remove the project owner. Reassign ownership or delete the project instead.');
      err.statusCode = 400;
      throw err;
    }

    const membership = await projectRepository.isMember(projectId, currentUser.id);
    const isOwner = project.owner_id === currentUser.id;
    const isLeader = membership && membership.role === 'leader';
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.id === targetUserId;

    if (!isOwner && !isLeader && !isAdmin && !isSelf) {
      const err = new Error('Forbidden: You do not have permission to remove this member');
      err.statusCode = 403;
      throw err;
    }

    await projectRepository.removeMember(projectId, targetUserId);
    return await this.getProjectById(projectId);
  }
};
