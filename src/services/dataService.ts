import { CITIES_DATA, INITIAL_INSTITUTIONS, INITIAL_REVIEWS } from '../data/seedData';
import { CityInfo, Institution, Review, ReviewReport, SearchFilterParams } from '../types';

const STORAGE_KEYS = {
  INSTITUTIONS: 'scorevault_institutions_v1',
  REVIEWS: 'scorevault_reviews_v1',
  SAVED_IDS: 'scorevault_saved_ids_v1',
  REPORTS: 'scorevault_reports_v1',
  COMPARISON_IDS: 'scorevault_comparison_ids_v1'
};

class DataService {
  private institutions: Institution[] = [];
  private reviews: Review[] = [];
  private savedIds: Set<string> = new Set();
  private reports: ReviewReport[] = [];
  private comparisonIds: Set<string> = new Set();

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    try {
      const storedInst = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
      if (storedInst) {
        this.institutions = JSON.parse(storedInst);
      } else {
        this.institutions = [...INITIAL_INSTITUTIONS];
        localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(this.institutions));
      }

      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedReviews) {
        this.reviews = JSON.parse(storedReviews);
      } else {
        this.reviews = [...INITIAL_REVIEWS];
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
      }

      const storedSaved = localStorage.getItem(STORAGE_KEYS.SAVED_IDS);
      if (storedSaved) {
        this.savedIds = new Set(JSON.parse(storedSaved));
      } else {
        this.savedIds = new Set(['iit-bombay', 'la-martiniere-lucknow']);
        this.persistSavedIds();
      }

      const storedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (storedReports) {
        this.reports = JSON.parse(storedReports);
      } else {
        this.reports = [];
      }

      const storedCompare = localStorage.getItem(STORAGE_KEYS.COMPARISON_IDS);
      if (storedCompare) {
        this.comparisonIds = new Set(JSON.parse(storedCompare));
      } else {
        this.comparisonIds = new Set(['iit-bombay', 'iit-delhi']);
        this.persistComparisonIds();
      }
    } catch {
      this.institutions = [...INITIAL_INSTITUTIONS];
      this.reviews = [...INITIAL_REVIEWS];
      this.savedIds = new Set(['iit-bombay', 'la-martiniere-lucknow']);
      this.comparisonIds = new Set(['iit-bombay', 'iit-delhi']);
    }
  }

  private persistInstitutions() {
    try {
      localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(this.institutions));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }

  private persistReviews() {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }

  private persistSavedIds() {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify(Array.from(this.savedIds)));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }

  private persistReports() {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }

  private persistComparisonIds() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPARISON_IDS, JSON.stringify(Array.from(this.comparisonIds)));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }

  // Institutions Query API
  public getInstitutions(params?: SearchFilterParams): Institution[] {
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
      result = result.filter(item => 
        item.city.toLowerCase().includes(params.city!.toLowerCase())
      );
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

    // Sorting
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

  public getInstitutionById(id: string): Institution | undefined {
    return this.institutions.find(item => item.id === id || item.slug === id);
  }

  public getInstitutionBySlug(slug: string): Institution | undefined {
    return this.institutions.find(item => item.slug === slug || item.id === slug);
  }

  public getFeaturedInstitutions(): Institution[] {
    return this.institutions.filter(item => item.featured);
  }

  public getTrendingInstitutions(): Institution[] {
    return this.institutions.filter(item => item.trending || item.reviewCount > 200);
  }

  public getInstitutionsByCity(cityName: string): Institution[] {
    return this.institutions.filter(item => 
      item.city.toLowerCase().includes(cityName.toLowerCase())
    );
  }

  public getInstitutionsByCategory(category: string): Institution[] {
    return this.institutions.filter(item => 
      item.category.toLowerCase() === category.toLowerCase() ||
      (category === 'Schools' && item.type === 'School') ||
      (category === 'Colleges' && item.type === 'College')
    );
  }

  // Cities API
  public getCities(): CityInfo[] {
    return CITIES_DATA;
  }

  public getCityById(cityId: string): CityInfo | undefined {
    return CITIES_DATA.find(c => c.id.toLowerCase() === cityId.toLowerCase() || c.name.toLowerCase() === cityId.toLowerCase());
  }

  // Reviews API
  public getReviews(institutionId: string, options?: { sort?: string; reviewerType?: string }): Review[] {
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

  public addReview(reviewInput: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'reported' | 'status'>): Review {
    const newReview: Review = {
      ...reviewInput,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      reported: false,
      status: 'approved'
    };

    this.reviews.unshift(newReview);
    this.persistReviews();

    // Recompute institution overall score and counts
    const inst = this.institutions.find(i => i.id === newReview.institutionId);
    if (inst) {
      const instReviews = this.reviews.filter(r => r.institutionId === inst.id && r.status === 'approved');
      const totalReviews = instReviews.length;
      const sumRatings = instReviews.reduce((sum, r) => sum + r.rating, 0);
      inst.rating = Number((sumRatings / (totalReviews || 1)).toFixed(1));
      inst.reviewCount = totalReviews;

      const roundedStar = Math.min(5, Math.max(1, Math.round(newReview.rating))) as 1 | 2 | 3 | 4 | 5;
      inst.ratingDistribution[roundedStar] = (inst.ratingDistribution[roundedStar] || 0) + 1;

      this.persistInstitutions();
    }

    return newReview;
  }

  public voteHelpful(reviewId: string): boolean {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return false;

    if (review.userVotedHelpful) {
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      review.userVotedHelpful = false;
    } else {
      review.helpfulCount += 1;
      review.userVotedHelpful = true;
    }

    this.persistReviews();
    return !!review.userVotedHelpful;
  }

  public reportReview(reportData: { reviewId: string; institutionId: string; reportedByUserId: string; reportedByUserName: string; reason: any; notes: string }): ReviewReport {
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
    this.persistReports();

    const review = this.reviews.find(r => r.id === reportData.reviewId);
    if (review) {
      review.reported = true;
      review.reportCount = (review.reportCount || 0) + 1;
      if (review.reportCount >= 3) {
        review.status = 'flagged';
      }
      this.persistReviews();
    }

    return report;
  }

  public getReportedReviews(): { report: ReviewReport; review?: Review }[] {
    return this.reports.map(rep => ({
      report: rep,
      review: this.reviews.find(r => r.id === rep.reviewId)
    }));
  }

  public moderateReview(reviewId: string, action: 'approve' | 'reject' | 'flag'): boolean {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return false;

    review.status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged';
    if (action === 'approve') {
      review.reported = false;
    }
    this.persistReviews();
    return true;
  }

  // Saved Institutions (Bookmarks)
  public isSaved(institutionId: string): boolean {
    return this.savedIds.has(institutionId);
  }

  public toggleSave(institutionId: string): boolean {
    if (this.savedIds.has(institutionId)) {
      this.savedIds.delete(institutionId);
      this.persistSavedIds();
      return false;
    } else {
      this.savedIds.add(institutionId);
      this.persistSavedIds();
      return true;
    }
  }

  public getSavedInstitutions(): Institution[] {
    return this.institutions.filter(item => this.savedIds.has(item.id));
  }

  // Comparison Management
  public getComparisonIds(): string[] {
    return Array.from(this.comparisonIds);
  }

  public isInComparison(id: string): boolean {
    return this.comparisonIds.has(id);
  }

  public toggleComparison(id: string): { active: boolean; error?: string } {
    if (this.comparisonIds.has(id)) {
      this.comparisonIds.delete(id);
      this.persistComparisonIds();
      return { active: false };
    } else {
      if (this.comparisonIds.size >= 4) {
        return { active: false, error: 'You can compare up to 4 institutions simultaneously.' };
      }
      this.comparisonIds.add(id);
      this.persistComparisonIds();
      return { active: true };
    }
  }

  public clearComparison() {
    this.comparisonIds.clear();
    this.persistComparisonIds();
  }

  public getComparisonInstitutions(): Institution[] {
    return this.institutions.filter(item => this.comparisonIds.has(item.id));
  }
}

export const dataService = new DataService();
