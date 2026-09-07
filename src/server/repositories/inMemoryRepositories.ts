import { CITIES_DATA, INITIAL_INSTITUTIONS, INITIAL_REVIEWS } from '../../data/seedData';
import { CityInfo, Institution, Review, ReviewReport, SearchFilterParams, User } from '../../types';
import { ICityRepository, IInstitutionRepository, IReviewRepository, IUserRepository } from './interfaces';

export class InMemoryInstitutionRepository implements IInstitutionRepository {
  private institutions: Institution[] = [...INITIAL_INSTITUTIONS];

  async getInstitutions(params?: SearchFilterParams): Promise<Institution[]> {
    let result = [...this.institutions];
    if (!params) return result;

    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.boardOrUniversity.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.courses.some(c => c.name.toLowerCase().includes(q) || c.degree.toLowerCase().includes(q))
      );
    }

    if (params.city && params.city !== 'All') {
      result = result.filter(item => item.city.toLowerCase().includes(params.city!.toLowerCase()));
    }

    if (params.type && params.type !== 'All') {
      result = result.filter(item => item.type === params.type);
    }

    if (params.category && params.category !== 'All') {
      result = result.filter(item => item.category === params.category);
    }

    if (params.board && params.board !== 'All') {
      result = result.filter(item =>
        item.affiliation.toLowerCase().includes(params.board!.toLowerCase()) ||
        item.boardOrUniversity.toLowerCase().includes(params.board!.toLowerCase())
      );
    }

    if (params.ownership && params.ownership !== 'All') {
      result = result.filter(item => item.ownership === params.ownership);
    }

    if (params.minRating && params.minRating > 0) {
      result = result.filter(item => item.rating >= params.minRating!);
    }

    if (params.hostel) {
      result = result.filter(item => item.hostelAvailable);
    }

    if (params.verifiedOnly) {
      result = result.filter(item => item.verifiedInstitution);
    }

    if (params.maxFee && params.maxFee > 0) {
      result = result.filter(item => item.feeRange.min <= params.maxFee!);
    }

    switch (params.sortBy) {
      case 'highest_rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'most_reviewed':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'lowest_fees':
        result.sort((a, b) => a.feeRange.min - b.feeRange.min);
        break;
      case 'established':
        result.sort((a, b) => a.establishedYear - b.establishedYear);
        break;
      case 'recommended':
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating * Math.log(b.reviewCount + 2) - a.rating * Math.log(a.reviewCount + 2);
        });
        break;
    }

    return result;
  }

  async getInstitutionById(id: string): Promise<Institution | null> {
    return this.institutions.find(item => item.id === id || item.slug === id) || null;
  }

  async getInstitutionBySlug(slug: string): Promise<Institution | null> {
    return this.institutions.find(item => item.slug === slug || item.id === slug) || null;
  }

  async getFeaturedInstitutions(): Promise<Institution[]> {
    return this.institutions.filter(item => item.featured);
  }

  async getTrendingInstitutions(): Promise<Institution[]> {
    return this.institutions.filter(item => item.trending || item.reviewCount > 200);
  }

  async getInstitutionsByCity(cityName: string): Promise<Institution[]> {
    return this.institutions.filter(item => item.city.toLowerCase().includes(cityName.toLowerCase()));
  }

  async getInstitutionsByCategory(category: string): Promise<Institution[]> {
    return this.institutions.filter(item =>
      item.category.toLowerCase() === category.toLowerCase() ||
      (category === 'Schools' && item.type === 'School') ||
      (category === 'Colleges' && item.type === 'College')
    );
  }
}

export class InMemoryCityRepository implements ICityRepository {
  async getCities(): Promise<CityInfo[]> {
    return CITIES_DATA;
  }

  async getCityById(cityId: string): Promise<CityInfo | null> {
    return CITIES_DATA.find(c => c.id.toLowerCase() === cityId.toLowerCase() || c.name.toLowerCase() === cityId.toLowerCase()) || null;
  }
}

export class InMemoryReviewRepository implements IReviewRepository {
  private reviews: Review[] = [...INITIAL_REVIEWS];
  private reports: ReviewReport[] = [];

  async getReviews(institutionId: string, options?: { sort?: string; reviewerType?: string }): Promise<Review[]> {
    let list = this.reviews.filter(r => r.institutionId === institutionId && r.status !== 'rejected');

    if (options?.reviewerType && options.reviewerType !== 'All') {
      list = list.filter(r => r.reviewerType === options.reviewerType);
    }

    switch (options?.sort) {
      case 'most_helpful':
        list.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'highest_rated':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest_rated':
        list.sort((a, b) => a.rating - b.rating);
        break;
      case 'most_recent':
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return list;
  }

  async addReview(reviewInput: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'reported' | 'status'>): Promise<Review> {
    const newReview: Review = {
      ...reviewInput,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      reported: false,
      status: 'approved'
    };

    this.reviews.unshift(newReview);
    return newReview;
  }

  async voteHelpful(reviewId: string): Promise<{ helpfulCount: number; userVotedHelpful: boolean }> {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userVotedHelpful) {
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      review.userVotedHelpful = false;
    } else {
      review.helpfulCount += 1;
      review.userVotedHelpful = true;
    }

    return {
      helpfulCount: review.helpfulCount,
      userVotedHelpful: !!review.userVotedHelpful
    };
  }

  async reportReview(reportData: { reviewId: string; institutionId: string; reportedByUserId: string; reportedByUserName: string; reason: any; notes: string }): Promise<ReviewReport> {
    const report: ReviewReport = {
      id: `rep-${Date.now()}`,
      reviewId: reportData.reviewId,
      institutionId: reportData.institutionId,
      reportedByUserId: reportData.reportedByUserId,
      reportedByUserName: reportData.reportedByUserName,
      reason: reportData.reason,
      notes: reportData.notes,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.reports.push(report);

    const review = this.reviews.find(r => r.id === reportData.reviewId);
    if (review) {
      review.reported = true;
      review.reportCount = (review.reportCount || 0) + 1;
      if (review.reportCount >= 3) {
        review.status = 'flagged';
      }
    }

    return report;
  }

  async getReportedReviews(): Promise<{ report: ReviewReport; review?: Review }[]> {
    return this.reports.map(rep => ({
      report: rep,
      review: this.reviews.find(r => r.id === rep.reviewId)
    }));
  }

  async moderateReview(reviewId: string, action: 'approve' | 'reject' | 'flag'): Promise<boolean> {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return false;

    review.status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged';
    if (action === 'approve') {
      review.reported = false;
    }
    return true;
  }
}

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async createUser(user: Omit<User, 'id' | 'joinedDate'>): Promise<User> {
    const created: User = {
      ...user,
      id: `usr-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    this.users.set(created.id, created);
    return created;
  }
}
