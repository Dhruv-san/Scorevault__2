import { PrismaClient, InstitutionType as PrismaType, OwnershipType as PrismaOwnership, ReviewerRelationship, ReviewStatus, ReportReason } from '@prisma/client';
import { CityInfo, Institution, Review, ReviewReport, SearchFilterParams, User } from '../../types';
import { ICityRepository, IInstitutionRepository, IReviewRepository, IUserRepository } from './interfaces';

export const prisma = new PrismaClient();

export class PrismaInstitutionRepository implements IInstitutionRepository {
  private mapToInstitution(raw: any): Institution {
    return {
      id: raw.id,
      slug: raw.slug,
      name: raw.name,
      shortName: raw.shortName,
      type: raw.type as any,
      category: raw.category as any,
      city: raw.city?.name || 'Unknown',
      state: raw.stateName || raw.city?.state?.name || 'India',
      address: raw.address,
      pinCode: raw.pinCode,
      locality: raw.locality,
      coordinates: { lat: raw.lat, lng: raw.lng },
      establishedYear: raw.establishedYear,
      ownership: (raw.ownership === 'Government_Aided' ? 'Government-Aided' : raw.ownership) as any,
      affiliation: raw.affiliation,
      boardOrUniversity: raw.boardOrUniversity,
      nirfRank: raw.nirfRank || undefined,
      naacGrade: raw.naacGrade || undefined,
      cbseAffiliationNo: raw.cbseAffiliationNo || undefined,
      rating: raw.rating,
      reviewCount: raw.reviewCount,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      categoryRatings: raw.ratings?.reduce((acc: any, r: any) => {
        acc[r.categoryName] = r.score;
        return acc;
      }, {}) || { academics: raw.rating, infrastructure: raw.rating, faculty: raw.rating },
      categoryScores: raw.ratings?.reduce((acc: any, r: any) => {
        acc[r.categoryName] = r.score;
        return acc;
      }, {}) || { academics: raw.rating, infrastructure: raw.rating, faculty: raw.rating },
      feeRange: {
        min: raw.minFee,
        max: raw.maxFee,
        displayText: raw.feeDisplayText
      },
      hostelAvailable: raw.hostelAvailable,
      hostelFees: raw.hostelFees || undefined,
      hostelDetails: raw.hostelDetails || undefined,
      campusSize: raw.campusSize,
      studentFacultyRatio: raw.studentFacultyRatio,
      averagePlacement: raw.averagePlacement || undefined,
      highestPlacement: raw.highestPlacement || undefined,
      facilities: raw.facilities?.map((f: any) => f.name) || [],
      highlights: [
        `Est. ${raw.establishedYear} (${raw.ownership})`,
        `Affiliated with ${raw.boardOrUniversity}`,
        raw.nirfRank ? `NIRF Ranked #${raw.nirfRank}` : 'Government Accredited Campus'
      ],
      admissionsOverview: raw.admissionsOverview || undefined,
      heroImage: raw.heroImage,
      galleryImages: raw.photos?.map((p: any) => p.url) || [],
      description: raw.description,
      website: raw.website || '',
      phone: raw.phone || '',
      email: raw.email || '',
      contactInfo: {
        phone: raw.phone || undefined,
        email: raw.email || undefined,
        website: raw.website || undefined
      },
      featured: raw.featured,
      trending: raw.trending,
      verifiedInstitution: raw.verifiedInstitution,
      claimedByRep: raw.claimedByRep,
      courses: raw.courses?.map((c: any) => ({
        id: c.id,
        name: c.name,
        degree: c.degree,
        duration: c.duration,
        annualFee: c.annualFee,
        feePerYear: c.feePerYear,
        seats: c.seats || undefined,
        seatsAvailable: c.seatsAvailable || undefined,
        eligibility: c.eligibility
      })) || []
    };
  }

  async getInstitutions(params?: SearchFilterParams): Promise<Institution[]> {
    const where: any = {};

    if (params?.query && params.query.trim()) {
      const q = params.query.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { shortName: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { boardOrUniversity: { contains: q, mode: 'insensitive' } },
        { city: { name: { contains: q, mode: 'insensitive' } } }
      ];
    }

    if (params?.city && params.city !== 'All') {
      where.city = { name: { contains: params.city, mode: 'insensitive' } };
    }

    if (params?.type && params.type !== 'All') {
      where.type = params.type as PrismaType;
    }

    if (params?.category && params.category !== 'All') {
      where.category = { equals: params.category, mode: 'insensitive' };
    }

    if (params?.board && params.board !== 'All') {
      where.OR = [
        { affiliation: { contains: params.board, mode: 'insensitive' } },
        { boardOrUniversity: { contains: params.board, mode: 'insensitive' } }
      ];
    }

    if (params?.ownership && params.ownership !== 'All') {
      const dbOwnership = params.ownership === 'Government-Aided' ? 'Government_Aided' : params.ownership;
      where.ownership = dbOwnership as PrismaOwnership;
    }

    if (params?.minRating && params.minRating > 0) {
      where.rating = { gte: params.minRating };
    }

    if (params?.hostel) {
      where.hostelAvailable = true;
    }

    if (params?.verifiedOnly) {
      where.verifiedInstitution = true;
    }

    if (params?.maxFee && params.maxFee > 0) {
      where.minFee = { lte: params.maxFee };
    }

    let orderBy: any = { rating: 'desc' };
    switch (params?.sortBy) {
      case 'highest_rated':
        orderBy = { rating: 'desc' };
        break;
      case 'most_reviewed':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'lowest_fees':
        orderBy = { minFee: 'asc' };
        break;
      case 'established':
        orderBy = { establishedYear: 'asc' };
        break;
      case 'recommended':
      default:
        orderBy = [{ featured: 'desc' }, { rating: 'desc' }];
        break;
    }

    const records = await prisma.institution.findMany({
      where,
      orderBy,
      include: {
        city: { include: { state: true } },
        facilities: true,
        courses: true,
        photos: true,
        ratings: true
      }
    });

    return records.map(r => this.mapToInstitution(r));
  }

  async getInstitutionById(id: string): Promise<Institution | null> {
    const raw = await prisma.institution.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        city: { include: { state: true } },
        facilities: true,
        courses: true,
        photos: true,
        ratings: true
      }
    });
    return raw ? this.mapToInstitution(raw) : null;
  }

  async getInstitutionBySlug(slug: string): Promise<Institution | null> {
    return this.getInstitutionById(slug);
  }

  async getFeaturedInstitutions(): Promise<Institution[]> {
    const records = await prisma.institution.findMany({
      where: { featured: true },
      include: {
        city: { include: { state: true } },
        facilities: true,
        courses: true,
        photos: true,
        ratings: true
      }
    });
    return records.map(r => this.mapToInstitution(r));
  }

  async getTrendingInstitutions(): Promise<Institution[]> {
    const records = await prisma.institution.findMany({
      where: { OR: [{ trending: true }, { reviewCount: { gte: 50 } }] },
      take: 10,
      include: {
        city: { include: { state: true } },
        facilities: true,
        courses: true,
        photos: true,
        ratings: true
      }
    });
    return records.map(r => this.mapToInstitution(r));
  }

  async getInstitutionsByCity(cityName: string): Promise<Institution[]> {
    const records = await prisma.institution.findMany({
      where: { city: { name: { contains: cityName, mode: 'insensitive' } } },
      include: {
        city: { include: { state: true } },
        facilities: true,
        courses: true,
        photos: true,
        ratings: true
      }
    });
    return records.map(r => this.mapToInstitution(r));
  }

  async getInstitutionsByCategory(category: string): Promise<Institution[]> {
    const records = await prisma.institution.findMany({
      where: {
        OR: [
          { category: { equals: category, mode: 'insensitive' } },
          category === 'Schools' ? { type: 'School' } : {},
          category === 'Colleges' ? { type: 'College' } : {}
        ]
      },
      include: {
        city: { include: { state: true } },
        facilities: true,
        courses: true,
        photos: true,
        ratings: true
      }
    });
    return records.map(r => this.mapToInstitution(r));
  }
}

export class PrismaCityRepository implements ICityRepository {
  async getCities(): Promise<CityInfo[]> {
    const records = await prisma.city.findMany({
      include: { state: true },
      orderBy: { name: 'asc' }
    });

    return records.map(c => ({
      id: c.id,
      name: c.name,
      state: c.state.name,
      popular: c.popular,
      tagLine: c.tagLine || `Educational Hub in ${c.state.name}`,
      image: c.image || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
      institutionCount: c.institutionCount,
      schoolCount: c.schoolCount,
      collegeCount: c.collegeCount,
      description: c.description || `${c.name} offers accredited schools, engineering colleges, and top universities.`
    }));
  }

  async getCityById(cityId: string): Promise<CityInfo | null> {
    const c = await prisma.city.findFirst({
      where: { OR: [{ id: cityId }, { name: { equals: cityId, mode: 'insensitive' } }] },
      include: { state: true }
    });
    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      state: c.state.name,
      popular: c.popular,
      tagLine: c.tagLine || `Educational Hub in ${c.state.name}`,
      image: c.image || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
      institutionCount: c.institutionCount,
      schoolCount: c.schoolCount,
      collegeCount: c.collegeCount,
      description: c.description || `${c.name} offers accredited schools, engineering colleges, and top universities.`
    };
  }
}

export class PrismaReviewRepository implements IReviewRepository {
  async getReviews(institutionId: string, options?: { sort?: string; reviewerType?: string }): Promise<Review[]> {
    const where: any = {
      institutionId,
      status: { not: 'rejected' as ReviewStatus }
    };

    if (options?.reviewerType && options.reviewerType !== 'All') {
      where.reviewerType = options.reviewerType.replace(' ', '_') as ReviewerRelationship;
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (options?.sort) {
      case 'most_helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'highest_rated':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest_rated':
        orderBy = { rating: 'asc' };
        break;
      case 'most_recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const records = await prisma.review.findMany({
      where,
      orderBy,
      include: { user: true }
    });

    return records.map(r => ({
      id: r.id,
      institutionId: r.institutionId,
      userId: r.userId,
      userName: r.user.name,
      userAvatar: r.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      reviewerType: (r.reviewerType.replace('_', ' ')) as any,
      isVerifiedReviewer: r.isVerifiedReviewer,
      verifiedStatus: r.isVerifiedReviewer,
      rating: r.rating,
      categoryRatings: { academics: r.rating, infrastructure: r.rating, faculty: r.rating },
      title: r.title,
      content: r.content,
      pros: r.pros,
      cons: r.cons,
      photos: r.photos,
      createdAt: r.createdAt.toISOString(),
      helpfulCount: r.helpfulCount,
      userVotedHelpful: false,
      reported: r.reported,
      reportCount: r.reportCount,
      status: r.status as any,
      courseOrGrade: r.courseOrGrade || undefined,
      yearOfPassingOrCurrent: r.yearOfPassingOrCurrent || undefined
    }));
  }

  async addReview(reviewInput: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'reported' | 'status'>): Promise<Review> {
    const created = await prisma.review.create({
      data: {
        institutionId: reviewInput.institutionId,
        userId: reviewInput.userId,
        reviewerType: (reviewInput.reviewerType.replace(' ', '_')) as ReviewerRelationship,
        isVerifiedReviewer: !!reviewInput.isVerifiedReviewer,
        rating: reviewInput.rating,
        title: reviewInput.title,
        content: reviewInput.content,
        pros: reviewInput.pros,
        cons: reviewInput.cons,
        photos: reviewInput.photos || [],
        courseOrGrade: reviewInput.courseOrGrade,
        yearOfPassingOrCurrent: reviewInput.yearOfPassingOrCurrent,
        status: 'approved'
      },
      include: { user: true }
    });

    return {
      id: created.id,
      institutionId: created.institutionId,
      userId: created.userId,
      userName: created.user.name,
      userAvatar: created.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      reviewerType: reviewInput.reviewerType,
      isVerifiedReviewer: created.isVerifiedReviewer,
      verifiedStatus: created.isVerifiedReviewer,
      rating: created.rating,
      categoryRatings: reviewInput.categoryRatings,
      title: created.title,
      content: created.content,
      pros: created.pros,
      cons: created.cons,
      photos: created.photos,
      createdAt: created.createdAt.toISOString(),
      helpfulCount: 0,
      userVotedHelpful: false,
      reported: false,
      status: 'approved'
    };
  }

  async voteHelpful(reviewId: string): Promise<{ helpfulCount: number; userVotedHelpful: boolean }> {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } }
    });

    return {
      helpfulCount: review.helpfulCount,
      userVotedHelpful: true
    };
  }

  async reportReview(reportData: { reviewId: string; institutionId: string; reportedByUserId: string; reportedByUserName: string; reason: any; notes: string }): Promise<ReviewReport> {
    const report = await prisma.report.create({
      data: {
        reviewId: reportData.reviewId,
        institutionId: reportData.institutionId,
        userId: reportData.reportedByUserId,
        reason: reportData.reason as ReportReason,
        notes: reportData.notes,
        status: 'pending'
      }
    });

    await prisma.review.update({
      where: { id: reportData.reviewId },
      data: { reported: true, reportCount: { increment: 1 } }
    });

    return {
      id: report.id,
      reviewId: report.reviewId,
      institutionId: report.institutionId,
      reportedByUserId: report.userId,
      reportedByUserName: reportData.reportedByUserName,
      reason: report.reason as any,
      notes: report.notes || '',
      timestamp: report.createdAt.toISOString(),
      status: report.status as any
    };
  }

  async getReportedReviews(): Promise<{ report: ReviewReport; review?: Review }[]> {
    const reports = await prisma.report.findMany({
      include: { review: { include: { user: true } }, user: true },
      orderBy: { createdAt: 'desc' }
    });

    return reports.map(rep => ({
      report: {
        id: rep.id,
        reviewId: rep.reviewId,
        institutionId: rep.institutionId,
        reportedByUserId: rep.userId,
        reportedByUserName: rep.user.name,
        reason: rep.reason as any,
        notes: rep.notes || '',
        timestamp: rep.createdAt.toISOString(),
        status: rep.status as any
      },
      review: rep.review ? {
        id: rep.review.id,
        institutionId: rep.review.institutionId,
        userId: rep.review.userId,
        userName: rep.review.user.name,
        userAvatar: rep.review.user.avatar || '',
        reviewerType: (rep.review.reviewerType.replace('_', ' ')) as any,
        rating: rep.review.rating,
        categoryRatings: {},
        title: rep.review.title,
        content: rep.review.content,
        pros: rep.review.pros,
        cons: rep.review.cons,
        createdAt: rep.review.createdAt.toISOString(),
        helpfulCount: rep.review.helpfulCount,
        reported: rep.review.reported,
        status: rep.review.status as any
      } : undefined
    }));
  }

  async moderateReview(reviewId: string, action: 'approve' | 'reject' | 'flag'): Promise<boolean> {
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged'
    };

    await prisma.review.update({
      where: { id: reviewId },
      data: { status: statusMap[action] as ReviewStatus }
    });

    return true;
  }
}

export class PrismaUserRepository implements IUserRepository {
  async getUserById(id: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || undefined,
      avatar: u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.email,
      role: u.role as any,
      city: u.cityName || 'Delhi NCR',
      isVerified: u.isVerified,
      joinedDate: u.joinedDate.toISOString().split('T')[0],
      savedInstitutionIds: []
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || undefined,
      avatar: u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.email,
      role: u.role as any,
      city: u.cityName || 'Delhi NCR',
      isVerified: u.isVerified,
      joinedDate: u.joinedDate.toISOString().split('T')[0],
      savedInstitutionIds: []
    };
  }

  async createUser(user: Omit<User, 'id' | 'joinedDate'>): Promise<User> {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role as any,
        cityName: user.city,
        institutionName: user.institutionName,
        isVerified: user.isVerified
      }
    });

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone || undefined,
      avatar: created.avatar || '',
      role: created.role as any,
      city: created.cityName || 'Delhi NCR',
      isVerified: created.isVerified,
      joinedDate: created.joinedDate.toISOString().split('T')[0],
      savedInstitutionIds: []
    };
  }
}
