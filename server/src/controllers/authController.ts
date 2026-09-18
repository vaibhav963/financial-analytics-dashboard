import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Invalid Credentials',
          message: 'No account found with this email address.',
        },
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Invalid Credentials',
          message: 'Incorrect password entered. Please check and try again.',
        },
      });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
        user: user.toJSON(),
      },
      alert: {
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back, ${user.name}!`,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'An unexpected error occurred during login.',
      },
    });
  }
};

export const refreshSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Session Expired',
          message: 'No active refresh session found. Please log in again.',
        },
      });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Invalid Session',
          message: 'Refresh token signature is invalid or expired.',
        },
      });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Session Revoked',
          message: 'This refresh session is no longer valid.',
        },
      });
      return;
    }

    // Token Rotation
    const tokens = generateTokens(user.id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        user: user.toJSON(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Refresh Failed',
        message: error.message || 'Failed to rotate refresh token.',
      },
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
        if (decoded?.userId) {
          await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
        }
      } catch {
        // Ignore token verify error on logout
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });

    res.json({
      success: true,
      alert: {
        type: 'info',
        title: 'Logged Out',
        message: 'You have been securely logged out.',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Logout Error',
        message: error.message || 'Error occurred during logout.',
      },
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Not Authenticated',
        message: 'No active user found in request context.',
      },
    });
    return;
  }

  res.json({
    success: true,
    data: req.user.toJSON(),
  });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Not Authenticated',
          message: 'Active session required to update profile.',
        },
      });
      return;
    }

    const {
      name,
      department,
      title,
      phone,
      timezone,
      currency,
      bio,
      avatarUrl,
      notifications,
      twoFactorEnabled,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        alert: {
          type: 'error',
          title: 'User Not Found',
          message: 'The requested user account does not exist.',
        },
      });
      return;
    }

    if (name && typeof name === 'string') user.name = name.trim();
    if (department !== undefined) user.department = department;
    if (title !== undefined) user.title = title;
    if (phone !== undefined) user.phone = phone;
    if (timezone !== undefined) user.timezone = timezone;
    if (currency !== undefined) user.currency = currency;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (notifications !== undefined) user.notifications = notifications;
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;

    await user.save();

    res.json({
      success: true,
      data: user.toJSON(),
      alert: {
        type: 'success',
        title: 'Profile Saved',
        message: 'Your personal preferences and workspace settings have been updated.',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Update Error',
        message: error.message || 'Failed to update user profile.',
      },
    });
  }
};
