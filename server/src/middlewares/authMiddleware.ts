import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUserDocument } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

export const authenticateJWT: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Authentication Required',
          message: 'Missing or invalid Authorization header. Please login to continue.',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Session Invalid',
          message: 'The authenticated user session no longer exists.',
        },
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        alert: {
          type: 'warning',
          title: 'Session Expired',
          message: 'Your access token has expired. Automatic session renewal in progress.',
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Authentication Failed',
        message: 'Invalid access token provided.',
      },
    });
  }
};
