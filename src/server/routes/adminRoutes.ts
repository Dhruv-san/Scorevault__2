import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../repositories/prismaRepositories';
import { authenticateJwt, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { sendError, sendSuccess, validateBody, validateQuery } from '../middleware/apiHelpers';

const router = Router();

// Apply auth & admin/moderator guard to all routes in this router
router.use(authenticateJwt);
router.use(requireRole(['admin', 'moderator']));

// Utility function to log administrative actions
async function logAuditAction(adminId: string, action: string, targetType: string, targetId: string, details?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details || ''
      }
    });
  } catch (e) {
    console.warn('Failed to record administrative audit log', e);
  }
}

// 1. USER MANAGEMENT
// GET /api/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const users = await prisma.user.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cityName: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
        _count: { select: { reviews: true, reports: true } }
      }
    });

    sendSuccess(res, users);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch users list');
  }
});

// PATCH /api/admin/users/:id/status (Suspend / Restore)
const userStatusSchema = z.object({
  isSuspended: z.boolean()
});

router.patch('/users/:id/status', validateBody(userStatusSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isSuspended }
    });

    await logAuditAction(
      req.user!.userId,
      isSuspended ? 'USER_SUSPENDED' : 'USER_RESTORED',
      'USER',
      id,
      `User ${user.email} suspended state set to ${isSuspended}`
    );

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update user status');
  }
});

// 2. INSTITUTION MANAGEMENT
// POST /api/admin/institutions (Create Institution)
const createInstSchema = z.object({
  name: z.string().min(3),
  shortName: z.string().min(2),
  type: z.enum(['School', 'College', 'University']),
  category: z.string().min(2),
  cityName: z.string().min(2),
  address: z.string().min(5),
  locality: z.string().min(2),
  pinCode: z.string().min(6),
  establishedYear: z.number().int(),
  ownership: z.enum(['Private', 'Public', 'Government_Aided']),
  affiliation: z.string(),
  boardOrUniversity: z.string(),
  description: z.string().min(10)
});

router.post('/institutions', validateBody(createInstSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    let city = await prisma.city.findFirst({ where: { name: { equals: body.cityName, mode: 'insensitive' } } });
    if (!city) {
      const state = await prisma.state.findFirst() || await prisma.state.create({ data: { name: 'Delhi', code: 'DL' } });
      city = await prisma.city.create({
        data: {
          name: body.cityName,
          stateId: state.id,
          description: `Educational center in ${body.cityName}`
        }
      });
    }

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const inst = await prisma.institution.create({
      data: {
        slug,
        name: body.name,
        shortName: body.shortName,
        type: body.type,
        category: body.category,
        cityId: city.id,
        stateName: city.name,
        locality: body.locality,
        address: body.address,
        pinCode: body.pinCode,
        lat: 28.6139,
        lng: 77.2090,
        establishedYear: body.establishedYear,
        ownership: body.ownership,
        affiliation: body.affiliation,
        boardOrUniversity: body.boardOrUniversity,
        feeDisplayText: 'Fee details upon request',
        campusSize: '20 Acres',
        studentFacultyRatio: '15:1',
        heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        description: body.description,
        verifiedInstitution: true
      }
    });

    await logAuditAction(req.user!.userId, 'INSTITUTION_CREATED', 'INSTITUTION', inst.id, `Created ${inst.name}`);

    sendSuccess(res, inst, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create institution');
  }
});

// DELETE /api/admin/institutions/:id/archive (Archive Institution)
router.delete('/institutions/:id/archive', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const inst = await prisma.institution.update({
      where: { id },
      data: { isArchived: true }
    });

    await logAuditAction(req.user!.userId, 'INSTITUTION_ARCHIVED', 'INSTITUTION', id, `Archived ${inst.name}`);

    sendSuccess(res, inst);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to archive institution');
  }
});

// 3. AUDIT LOGS
// GET /api/admin/audit-logs
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    sendSuccess(res, logs);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch administrative audit logs');
  }
});

export default router;
