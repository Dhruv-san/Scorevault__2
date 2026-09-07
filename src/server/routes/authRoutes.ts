import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../repositories/prismaRepositories';
import { generateToken, authenticateJwt, AuthenticatedRequest } from '../middleware/auth';
import { sendError, sendSuccess, validateBody } from '../middleware/apiHelpers';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'parent', 'alumni', 'teacher', 'institution_rep', 'moderator', 'admin']).default('student'),
  city: z.string().optional().default('Delhi NCR'),
  institutionName: z.string().optional()
});

// POST /api/auth/signup
router.post('/signup', validateBody(signupSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, city, institutionName } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as any,
        cityName: city,
        institutionName,
        isVerified: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.cityName || 'Delhi NCR',
        avatar: user.avatar,
        isVerified: user.isVerified,
        joinedDate: user.joinedDate.toISOString().split('T')[0]
      }
    }, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create account');
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return sendError(res, 'Invalid email or password.', 401);
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.cityName || 'Delhi NCR',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
        isVerified: user.isVerified,
        joinedDate: user.joinedDate.toISOString().split('T')[0]
      }
    });
  } catch (error: any) {
    sendError(res, error.message || 'Login failed');
  }
});

// GET /api/auth/me
router.get('/me', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      return sendError(res, 'User session invalid', 404);
    }

    sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.cityName || 'Delhi NCR',
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
      isVerified: user.isVerified,
      joinedDate: user.joinedDate.toISOString().split('T')[0]
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to verify session');
  }
});

export default router;
