import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { repositoryFactory } from '../repositories';
import { sendError, sendSuccess, validateBody, validateQuery } from '../middleware/apiHelpers';
import { authenticateJwt, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const instRepo = repositoryFactory.getInstitutionRepository();
const cityRepo = repositoryFactory.getCityRepository();
const reviewRepo = repositoryFactory.getReviewRepository();
const userRepo = repositoryFactory.getUserRepository();

// Search Filter & Pagination Validation Schema
const searchFilterSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(['School', 'College', 'University', 'All']).optional(),
  category: z.string().optional(),
  board: z.string().optional(),
  minRating: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  maxFee: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  ownership: z.enum(['Private', 'Public', 'Government-Aided', 'All']).optional(),
  hostel: z.string().optional().transform(v => v === 'true'),
  verifiedOnly: z.string().optional().transform(v => v === 'true'),
  sortBy: z.enum(['recommended', 'highest_rated', 'most_reviewed', 'lowest_fees', 'established']).optional(),
  page: z.string().optional().transform(v => v ? parseInt(v, 10) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v, 10) : 20)
});

// GET /api/institutions
router.get('/institutions', validateQuery(searchFilterSchema), async (req: Request, res: Response) => {
  try {
    const params = req.query as any;
    const results = await instRepo.getInstitutions(params);
    sendSuccess(res, results);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch institutions');
  }
});

// GET /api/institutions/featured
router.get('/institutions/featured', async (req: Request, res: Response) => {
  try {
    const results = await instRepo.getFeaturedInstitutions();
    sendSuccess(res, results);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch featured institutions');
  }
});

// GET /api/institutions/trending
router.get('/institutions/trending', async (req: Request, res: Response) => {
  try {
    const results = await instRepo.getTrendingInstitutions();
    sendSuccess(res, results);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch trending institutions');
  }
});

// GET /api/institutions/:id
router.get('/institutions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inst = await instRepo.getInstitutionById(id);
    if (!inst) {
      return sendError(res, 'Institution not found', 404);
    }
    sendSuccess(res, inst);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch institution profile');
  }
});

// GET /api/cities
router.get('/cities', async (req: Request, res: Response) => {
  try {
    const cities = await cityRepo.getCities();
    sendSuccess(res, cities);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch cities');
  }
});

// GET /api/cities/:id
router.get('/cities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const city = await cityRepo.getCityById(id);
    if (!city) {
      return sendError(res, 'City not found', 404);
    }
    sendSuccess(res, city);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch city details');
  }
});

// GET /api/institutions/:id/reviews
router.get('/institutions/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sort = req.query.sort as string | undefined;
    const reviewerType = req.query.reviewerType as string | undefined;
    const reviews = await reviewRepo.getReviews(id, { sort, reviewerType });
    sendSuccess(res, reviews);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch reviews');
  }
});

// POST Review Validation Schema
const addReviewSchema = z.object({
  institutionId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  userAvatar: z.string().optional(),
  reviewerType: z.enum(['Current student', 'Former student', 'Student', 'Parent', 'Alumni', 'Teacher', 'Other']),
  isVerifiedReviewer: z.boolean().optional(),
  rating: z.number().min(1).max(5),
  categoryRatings: z.record(z.string(), z.number()),
  title: z.string().min(3).max(120),
  content: z.string().min(10).max(3000),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  photos: z.array(z.string()).optional(),
  courseOrGrade: z.string().optional(),
  yearOfPassingOrCurrent: z.number().optional()
});

// POST /api/reviews
router.post('/reviews', validateBody(addReviewSchema), async (req: Request, res: Response) => {
  try {
    const created = await reviewRepo.addReview(req.body);
    sendSuccess(res, created, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit review');
  }
});

// POST /api/reviews/:id/vote
router.post('/reviews/:id/vote', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await reviewRepo.voteHelpful(id);
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to process vote');
  }
});

// POST Report Review Schema
const reportSchema = z.object({
  reviewId: z.string().min(1),
  institutionId: z.string().min(1),
  reportedByUserId: z.string().min(1),
  reportedByUserName: z.string().min(1),
  reason: z.enum(['harassment', 'defamation', 'spam', 'private_info', 'fake_review', 'other']),
  notes: z.string().max(1000)
});

// POST /api/reports
router.post('/reports', validateBody(reportSchema), async (req: Request, res: Response) => {
  try {
    const report = await reviewRepo.reportReview(req.body);
    sendSuccess(res, report, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit report');
  }
});

// Protected Admin Endpoints
// GET /api/admin/reports
router.get('/admin/reports', authenticateJwt, requireRole(['admin', 'moderator']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await reviewRepo.getReportedReviews();
    sendSuccess(res, reports);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch moderation queue');
  }
});

// PATCH /api/admin/reviews/:id
const moderateSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag'])
});

router.patch('/admin/reviews/:id', authenticateJwt, requireRole(['admin', 'moderator']), validateBody(moderateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const success = await reviewRepo.moderateReview(id, action);
    if (!success) {
      return sendError(res, 'Review not found', 404);
    }
    sendSuccess(res, { reviewId: id, action, status: 'updated' });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update review moderation status');
  }
});

// GET /api/users/:id
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepo.getUserById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch user profile');
  }
});

// Institution Claim Request Schema
const claimSchema = z.object({
  institutionId: z.string().min(1),
  userId: z.string().min(1),
  officialEmail: z.string().email(),
  designation: z.string().min(2),
  documentUrl: z.string().optional()
});

// POST /api/claims
router.post('/claims', validateBody(claimSchema), async (req: Request, res: Response) => {
  try {
    sendSuccess(res, {
      claimId: `claim-${Date.now()}`,
      status: 'pending',
      message: 'Institution representative claim submitted for administrative verification.'
    }, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit institution claim');
  }
});

export default router;
