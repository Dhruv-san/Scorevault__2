import { PrismaClient, InstitutionType as PrismaType, OwnershipType as PrismaOwnership, ReviewerRelationship, ReviewStatus, ReportReason } from '@prisma/client';
import { CityInfo, Institution, Review, ReviewReport, SearchFilterParams, User } from '../../types';
import { ICityRepository, IInstitutionRepository, IReviewRepository, IUserRepository } from './interfaces';

export const prisma = new PrismaClient();

export class PrismaInstitutionRepository implements IInstitutionRepository {
  private mapToInstitution(raw: any): Institution {
    const loc = raw.location;
    const ids = raw.identifiers;
    const fin = raw.financialInfo;
    const pl = raw.placementInfo;

    return {
      id: raw.id,
      slug: raw.slug,
      name: raw.displayName || raw.canonicalName,
      shortName: raw.shortName,
      type: (raw.type === 'Standalone_Institute' ? 'College' : raw.type) as any,
      category: raw.category as any,
      city: raw.city?.name || loc?.city?.name || 'Unknown',
      state: raw.city?.state?.name || loc?.stateName || 'India',
      address: loc?.address || 'India',
      pinCode: loc?.pincode || '',
      locality: loc?.locality || '',
      coordinates: { lat: loc?.latitude || 20.5937, lng: loc?.longitude || 78.9629 },
      establishedYear: raw.establishmentYear,
      ownership: (raw.ownership === 'Government_Aided' ? 'Government-Aided' : raw.ownership) as any,
      affiliation: raw.educationDetails?.universityAffiliations?.[0] || 'Aided',
      boardOrUniversity: raw.educationDetails?.boards?.[0] || 'Central Board',
      nirfRank: ids?.otherExternal?.nirf_id || undefined,
      naacGrade: ids?.otherExternal?.naac_id || undefined,
      cbseAffiliationNo: ids?.cbseId || undefined,
      rating: 4.8,
      reviewCount: raw.reviews?.length || 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      categoryRatings: { academics: 4.8, infrastructure: 4.7, faculty: 4.9 },
      categoryScores: { academics: 4.8, infrastructure: 4.7, faculty: 4.9 },
      feeRange: {
        min: fin?.tuitionFeeMin || 50000,
        max: fin?.tuitionFeeMax || 250000,
        displayText: fin ? `₹${(fin.tuitionFeeMin / 100000).toFixed(1)} Lakh - ₹${(fin.tuitionFeeMax / 100000).toFixed(1)} Lakh / year` : 'Fee details upon request'
      },
      hostelAvailable: true,
      campusSize: '50 Acres',
      studentFacultyRatio: '14:1',
      averagePlacement: pl?.averageSalary ? `₹${(pl.averageSalary / 100000).toFixed(1)} LPA` : undefined,
      highestPlacement: pl?.highestSalary ? `₹${(pl.highestSalary / 100000).toFixed(1)} LPA` : undefined,
      facilities: ['Hostel', 'Library', 'Sports Ground', 'WiFi', 'Laboratories'],
      highlights: [
        `Est. ${raw.establishmentYear} (${raw.ownership})`,
        `Government Recognized Education`
      ],
      admissionsOverview: raw.admissionInfo?.admissionProcess || 'Admissions based on entrance exam cutoffs and academic merit.',
      heroImage: raw.photos?.[0]?.url || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      galleryImages: raw.photos?.map((p: any) => p.url) || [],
      description: raw.description,
      website: raw.officialWebsite || '',
      phone: raw.officialPhone || '',
      email: raw.officialEmail || '',
      contactInfo: {
        phone: raw.officialPhone || undefined,
        email: raw.officialEmail || undefined,
        website: raw.officialWebsite || undefined
      },
      featured: true,
      trending: true,
      verifiedInstitution: true,
      claimedByRep: false,
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
    const where: any = { isDeleted: false };

    if (params?.query && params.query.trim()) {
      const q = params.query.trim();
      where.OR = [
        { canonicalName: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
        { shortName: { contains: q, mode: 'insensitive' } },
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

    const records = await prisma.institution.findMany({
      where,
      include: {
        city: { include: { state: true } },
        location: true,
        identifiers: true,
        financialInfo: true,
        placementInfo: true,
        admissionInfo: true,
        courses: true,
        photos: true,
        reviews: true
      }
    });

    return records.map(r => this.mapToInstitution(r));
  }

  async getInstitutionById(id: string): Promise<Institution | null> {
    const raw = await prisma.institution.findFirst({
      where: { OR: [{ id }, { slug: id }], isDeleted: false },
      include: {
        city: { include: { state: true } },
        location: true,
        identifiers: true,
        financialInfo: true,
        placementInfo: true,
        admissionInfo: true,
        courses: true,
        photos: true,
        reviews: true
      }
    });
    return raw ? this.mapToInstitution(raw) : null;
  }

  async getInstitutionBySlug(slug: string): Promise<Institution | null> {
    return this.getInstitutionById(slug);
  }

  async getFeaturedInstitutions(): Promise<Institution[]> {
    return this.getInstitutions();
  }

  async getTrendingInstitutions(): Promise<Institution[]> {
    return this.getInstitutions();
  }

  async getInstitutionsByCity(cityName: string): Promise<Institution[]> {
    return this.getInstitutions({ city: cityName });
  }

  async getInstitutionsByCategory(category: string): Promise<Institution[]> {
    return this.getInstitutions({ category });
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
      description: c.description || `${c.name} offers accredited schools, engineering colleges, and universities.`
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
      description: c.description || `${c.name} offers accredited schools, engineering colleges, and universities.`
    };
  }
}

export class PrismaReviewRepository implements IReviewRepository {
  async getReviews(institutionId: string, options?: { sort?: string; reviewerType?: string }): Promise<Review[]> {
    const where: any = {
      institutionId,
      status: { not: 'rejected' as ReviewStatus },
      isDeleted: false
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
    if (!u || u.isDeleted) return null;
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
    if (!u || u.isDeleted) return null;
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
