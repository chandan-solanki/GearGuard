import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model.js';
import { RefreshTokenModel } from '../models/RefreshToken.model.js';
import { config } from '../config/env.config.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  static async register(userData) {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
    });

    // Get created user (without password)
    const user = await UserModel.findById(userId);

    // Generate JWT tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await RefreshTokenModel.create(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(email, password) {
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Delete old refresh tokens
    await RefreshTokenModel.deleteByUserId(user.id);

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshTokenModel.create(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken) {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if refresh token exists in database
    const storedToken = await RefreshTokenModel.findByToken(refreshToken);
    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Get user
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    // Update refresh token in database
    await RefreshTokenModel.deleteByToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshTokenModel.create(user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken) {
    if (refreshToken) {
      await RefreshTokenModel.deleteByToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  static generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  static generateRefreshToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async updateProfile(userId, profileData) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (profileData.email && profileData.email !== user.email) {
      const emailExists = await UserModel.emailExists(profileData.email, userId);
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Hash new password if provided
    if (profileData.password) {
      const saltRounds = 10;
      profileData.password = await bcrypt.hash(profileData.password, saltRounds);
    }

    await UserModel.update(userId, profileData);
    return await UserModel.findById(userId);
  }
}

