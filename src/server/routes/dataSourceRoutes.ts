import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../repositories/prismaRepositories';
import { authenticateJwt, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { sendError, sendSuccess, validateBody } from '../middleware/apiHelpers';

const router = Router();

// Secure all data source governance endpoints behind admin/moderator authentication
router.use(authenticateJwt);
router.use(requireRole(['admin', 'moderator']));

// Utility function to log administrative audit trail
async function logAudit(adminId: string, action: string, targetId: string, details: string) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetType: 'DATA_SOURCE',
        targetId,
        details
      }
    });
  } catch (e) {
    console.warn('Failed to write audit log', e);
  }
}

// 1. GET /api/admin/data-sources - List data sources with filtering and search
router.get('/data-sources', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, sector, status, priority } = req.query as any;

    const where: any = {};
    if (q) {
      where.OR = [
        { sourceName: { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } },
        { sourceId: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (sector && sector !== 'ALL') {
      where.sector = sector;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.ingestionPriority = parseInt(priority, 10);
    }

    const dataSources = await prisma.dataSource.findMany({
      where,
      orderBy: [{ ingestionPriority: 'asc' }, { overallScore: 'desc' }]
    });

    sendSuccess(res, dataSources);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch data sources');
  }
});

// 2. GET /api/admin/data-sources/:id - Get detailed metadata for a single data source
router.get('/data-sources/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const source = await prisma.dataSource.findFirst({
      where: { OR: [{ id }, { sourceId: id }] },
      include: {
        ingestionRuns: { take: 5, orderBy: { createdAt: 'desc' } },
        externalIdentifiers: { take: 10 }
      }
    });

    if (!source) {
      return sendError(res, 'Data source not found', 404);
    }

    sendSuccess(res, source);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch data source details');
  }
});

// 3. PATCH /api/admin/data-sources/:id - Update data source metadata / priority
const updateSourceSchema = z.object({
  organization: z.string().optional(),
  sourceName: z.string().optional(),
  licensingStatus: z.enum(['OPEN_LICENSE', 'REUSE_ALLOWED', 'REUSE_RESTRICTED', 'REUSE_STATUS_UNCLEAR', 'PERMISSION_REQUIRED', 'UNKNOWN', 'BLOCKED']).optional(),
  licensingEvidenceUrl: z.string().optional(),
  accessMethod: z.enum(['API', 'DIRECT_DOWNLOAD', 'SCRAPING', 'MANUAL_IMPORT', 'MANUAL_REVIEW']).optional(),
  apiAvailable: z.boolean().optional(),
  downloadAvailable: z.boolean().optional(),
  captchaRequired: z.boolean().optional(),
  authenticationRequired: z.boolean().optional(),
  ingestionPriority: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional()
});

router.patch('/data-sources/:id', validateBody(updateSourceSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const source = await prisma.dataSource.update({
      where: { id },
      data: {
        ...req.body,
        lastCheckedAt: new Date()
      }
    });

    await logAudit(
      req.user!.userId,
      'DATA_SOURCE_UPDATED',
      id,
      `Updated source metadata for ${source.sourceName}`
    );

    sendSuccess(res, source);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update data source');
  }
});

// 4. POST /api/admin/data-sources/:id/verify - Explicit admin verification & status transition
const verifySourceSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'VERIFIED', 'READY_FOR_INGESTION', 'BLOCKED', 'RETIRED']),
  statusReason: z.string().min(5, 'Provide explicit reason or legal evidence for status change'),
  licensingEvidenceUrl: z.string().optional()
});

router.post('/data-sources/:id/verify', validateBody(verifySourceSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, statusReason, licensingEvidenceUrl } = req.body;

    const source = await prisma.dataSource.update({
      where: { id },
      data: {
        status,
        statusReason,
        licensingEvidenceUrl,
        verifiedBy: req.user!.userId,
        verifiedAt: new Date(),
        lastCheckedAt: new Date()
      }
    });

    await logAudit(
      req.user!.userId,
      `DATA_SOURCE_STATUS_${status}`,
      id,
      `Changed status of ${source.sourceName} to ${status}: ${statusReason}`
    );

    sendSuccess(res, source);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to record source verification');
  }
});

// 5. POST /api/admin/external-identifiers - Explicit identifier mapping with confidence tracking
const mapIdentifierSchema = z.object({
  sourceId: z.string().min(1),
  institutionId: z.string().min(1),
  identifierType: z.enum(['UDISE_CODE', 'AISHE_CODE', 'UGC_ID', 'AICTE_ID', 'CBSE_ID', 'CISCE_CODE', 'NMC_ID', 'BCI_ID', 'PCI_ID', 'COA_ID', 'NCTE_ID', 'OTHER']),
  identifierValue: z.string().min(1),
  confidence: z.number().min(0.0).max(1.0).default(1.0)
});

router.post('/external-identifiers', validateBody(mapIdentifierSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sourceId, institutionId, identifierType, identifierValue, confidence } = req.body;

    const mapped = await prisma.externalIdentifier.upsert({
      where: {
        identifierType_identifierValue: {
          identifierType,
          identifierValue
        }
      },
      update: {
        institutionId,
        confidence,
        verificationStatus: 'verified'
      },
      create: {
        sourceId,
        institutionId,
        identifierType,
        identifierValue,
        confidence,
        verificationStatus: 'verified'
      }
    });

    await logAudit(
      req.user!.userId,
      'EXTERNAL_IDENTIFIER_MAPPED',
      mapped.id,
      `Mapped ${identifierType} (${identifierValue}) to Scorevault ID ${institutionId}`
    );

    sendSuccess(res, mapped, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to map external identifier');
  }
});

// 6. GET /api/admin/ingestion-runs - View ingestion job history
router.get('/ingestion-runs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const runs = await prisma.ingestionRun.findMany({
      include: { source: { select: { sourceName: true, sourceId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    sendSuccess(res, runs);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch ingestion runs');
  }
});

export default router;
