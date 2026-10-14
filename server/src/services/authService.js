import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_collabcampus_at_least_32_characters_long';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const authService = {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name || user.fullName,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await userRepository.createUser({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role,
    });

    // Create role-specific profile
    if (data.role === 'student') {
      await userRepository.createStudentProfile({
        userId: user.id,
        rollNumber: data.rollNumber,
        department: data.department || 'Computer Science & Engineering',
        semester: data.semester || 1,
        skills: data.skills || [],
      });
    } else if (data.role === 'faculty') {
      await userRepository.createFacultyProfile({
        userId: user.id,
        employeeId: data.employeeId,
        department: data.department || 'Computer Science & Engineering',
        designation: data.designation || 'Assistant Professor',
        specialization: data.specialization || 'Software Engineering',
      });
    }

    const fullProfile = await userRepository.findById(user.id);
    const token = this.generateToken(fullProfile);

    return { user: fullProfile, token };
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Strip password_hash before returning
    const { password_hash, ...safeUser } = user;
    const token = this.generateToken(safeUser);

    return { user: safeUser, token };
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  async updateProfile(userId, updateData) {
    await userRepository.updateUser(userId, updateData);
    if (updateData.department || updateData.semester || updateData.skills || updateData.cgpa || updateData.githubUrl) {
      await userRepository.updateStudentProfile(userId, updateData);
    }
    return await userRepository.findById(userId);
  }
};
