import { authService } from '../services/authService.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator.js';

export const authController = {
  async register(req, res, next) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData.email, validatedData.password);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      // req.user is set by authenticate middleware
      res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await authService.updateProfile(req.user.id, validatedData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }
};
