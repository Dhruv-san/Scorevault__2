import { Institution, CityInfo, Review, ReviewReport, SearchFilterParams, User } from '../../types';

export interface IInstitutionRepository {
  getInstitutions(params?: SearchFilterParams): Promise<Institution[]>;
  getInstitutionById(id: string): Promise<Institution | null>;
  getInstitutionBySlug(slug: string): Promise<Institution | null>;
  getFeaturedInstitutions(): Promise<Institution[]>;
  getTrendingInstitutions(): Promise<Institution[]>;
  getInstitutionsByCity(cityName: string): Promise<Institution[]>;
  getInstitutionsByCategory(category: string): Promise<Institution[]>;
}

export interface ICityRepository {
  getCities(): Promise<CityInfo[]>;
  getCityById(cityId: string): Promise<CityInfo | null>;
}

export interface IReviewRepository {
  getReviews(institutionId: string, options?: { sort?: string; reviewerType?: string }): Promise<Review[]>;
  addReview(reviewInput: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'reported' | 'status'>): Promise<Review>;
  voteHelpful(reviewId: string): Promise<{ helpfulCount: number; userVotedHelpful: boolean }>;
  reportReview(reportData: { reviewId: string; institutionId: string; reportedByUserId: string; reportedByUserName: string; reason: any; notes: string }): Promise<ReviewReport>;
  getReportedReviews(): Promise<{ report: ReviewReport; review?: Review }[]>;
  moderateReview(reviewId: string, action: 'approve' | 'reject' | 'flag'): Promise<boolean>;
}

export interface IUserRepository {
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'joinedDate'>): Promise<User>;
}
