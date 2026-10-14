import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid academic or personal email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['student', 'faculty', 'admin'], {
    errorMap: () => ({ message: 'Role must be student, faculty, or admin' }),
  }),
  // Student-specific fields
  department: z.string().min(2, 'Department is required').optional(),
  semester: z.number().int().min(1).max(10).optional(),
  rollNumber: z.string().optional(),
  skills: z.array(z.string()).optional(),
  // Faculty-specific fields
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  department: z.string().optional(),
  semester: z.number().int().min(1).max(10).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  skills: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});
