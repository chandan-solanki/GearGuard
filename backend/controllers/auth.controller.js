import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      // Extract and normalize inputs
      let { name, email, password, role } = req.body;

      // Basic presence checks
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
      }

      name = String(name).trim();
      email = String(email).trim().toLowerCase();

      // Name validation
      if (name.length < 2) {
        return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long' });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      // Password complexity: min 8 chars, mixed case, and at least one digit
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(String(password))) {
        return res.status(400).json({
          success: false,
          message:
            'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
        });
      }

      // Role validation (optional). Allowed roles: admin, manager, technician, employee
      const allowedRoles = ['admin', 'manager', 'technician', 'employee'];
      if (role) {
        role = String(role).trim().toLowerCase();
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ success: false, message: 'Invalid role' });
        }
      }

      const result = await AuthService.register({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const result = await AuthService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const profileData = {};

      if (name) profileData.name = name;
      if (email) profileData.email = email;
      if (password) profileData.password = password;

      const user = await AuthService.updateProfile(req.user.id, profileData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}


