import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { User, IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  supabaseUser?: any;
}

const ALLOWED_DEMO_TOKENS = new Set(['demo-bearer-token']);

export const isDemoToken = (token: string): boolean => {
  return ALLOWED_DEMO_TOKENS.has(token);
};

export const isDemoAuthenticationPermitted = (): boolean => {
  // If NODE_ENV is production, NEVER permit demo tokens under any circumstances, even if ALLOW_DEMO_TOKENS is true
  if (process.env.NODE_ENV === 'production' || env.NODE_ENV === 'production') {
    return false;
  }
  // In development and test environments, check explicit configuration
  if (process.env.ALLOW_DEMO_TOKENS !== undefined) {
    return process.env.ALLOW_DEMO_TOKENS === 'true';
  }
  return env.ALLOW_DEMO_TOKENS !== false;
};

export const verifySupabaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header. Expected Bearer token.',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Handle demo tokens with strict environment enforcement
    if (isDemoToken(token)) {
      if (!isDemoAuthenticationPermitted()) {
        res.status(401).json({
          success: false,
          error: {
            code: 'DEMO_TOKENS_FORBIDDEN',
            message: 'Demo authentication is forbidden in production environments.',
          },
        });
        return;
      }

      const demoId = 'demo-student-id-001';
      let demoUser: any = null;
      try {
        demoUser = await User.findOne({ supabaseUserId: demoId });
        if (!demoUser) {
          demoUser = await User.create({
            _id: new mongoose.Types.ObjectId('650000000000000000000001'),
            supabaseUserId: demoId,
            email: 'student@syllabix.edu',
            name: 'Aarav Mehta (Student)',
            role: 'student',
            reputationPoints: 120,
          }).catch(() => null);
        }
      } catch {
        // Database offline in unit tests / startup
      }
      req.supabaseUser = { id: demoId, email: 'student@syllabix.edu' };
      req.user = demoUser || ({ _id: new mongoose.Types.ObjectId('650000000000000000000001'), name: 'Aarav Mehta (Student)', role: 'student', reputationPoints: 120 } as any);
      next();
      return;
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error?.message || 'Invalid or expired Supabase authentication token.',
        },
      });
      return;
    }

    req.supabaseUser = user;

    // Synchronize / find user in MongoDB
    let dbUser = await User.findOne({ supabaseUserId: user.id });

    if (!dbUser) {
      // First-time user bootstrap
      dbUser = await User.create({
        supabaseUserId: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        avatarUrl: user.user_metadata?.avatar_url || '',
        role: 'student',
        reputationPoints: 0,
      });
    }

    req.user = dbUser;
    next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Error verifying Supabase token:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_AUTH_ERROR',
        message: 'Internal error during authentication check.',
      },
    });
  }
};

// Optional auth middleware (for public endpoints that can be enriched if user is logged in)
export const optionalSupabaseToken = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (isDemoToken(token)) {
        if (!isDemoAuthenticationPermitted()) {
          return next();
        }
        let demoUser: any = null;
        try {
          demoUser = await User.findOne({ supabaseUserId: 'demo-student-id-001' });
          if (!demoUser) {
            demoUser = await User.create({
              _id: new mongoose.Types.ObjectId('650000000000000000000001'),
              supabaseUserId: 'demo-student-id-001',
              email: 'student@syllabix.edu',
              name: 'Aarav Mehta (Student)',
              role: 'student',
              reputationPoints: 120,
            }).catch(() => null);
          }
        } catch {
          // DB offline fallback
        }
        req.user = demoUser || ({ _id: new mongoose.Types.ObjectId('650000000000000000000001'), name: 'Aarav Mehta (Student)', role: 'student', reputationPoints: 120 } as any);
        return next();
      }
      try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          req.supabaseUser = user;
          let dbUser = await User.findOne({ supabaseUserId: user.id });
          if (!dbUser) {
            dbUser = await User.create({
              supabaseUserId: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
              avatarUrl: user.user_metadata?.avatar_url || '',
              role: 'student',
              reputationPoints: 0,
            }).catch(() => null);
          }
          if (dbUser) req.user = dbUser;
        }
      } catch {
        // Token was invalid, continue gracefully
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
        },
      });
      return;
    }
    next();
  };
};
