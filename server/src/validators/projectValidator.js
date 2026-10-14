import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  technologies: z.array(z.string()).default([]),
  status: z.enum(['planning', 'in_progress', 'completed', 'archived']).default('in_progress'),
  githubRepo: z.string().url().optional().or(z.literal('')),
  liveDemo: z.string().url().optional().or(z.literal('')),
  maxMembers: z.number().int().min(1).max(20).default(5),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  status: z.enum(['planning', 'in_progress', 'completed', 'archived']).optional(),
  githubRepo: z.string().url().optional().or(z.literal('')),
  liveDemo: z.string().url().optional().or(z.literal('')),
  maxMembers: z.number().int().min(1).max(20).optional(),
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive('User ID must be valid'),
  role: z.enum(['member', 'mentor', 'leader']).default('member'),
});
