export type InstitutionType = 'School' | 'College' | 'University';

export type Category = 
  | 'Schools'
  | 'Colleges'
  | 'Engineering'
  | 'Management'
  | 'Medical'
  | 'Law'
  | 'Universities'
  | 'Science & Arts';

export type BoardType = 'CBSE' | 'ICSE' | 'State Board' | 'IB' | 'Cambridge (IGCSE)' | 'Autonomous' | 'AICTE / UGC';

export type OwnershipType = 'Private' | 'Public' | 'Government-Aided';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  popular: boolean;
  tagLine: string;
  image: string;
  institutionCount: number;
  schoolCount: number;
  collegeCount: number;
  description: string;
  popularLocalities?: string[];
}

export interface Course {
  id: string;
  name: string;
  degree: string;
  duration: string;
  annualFee: string;
  feePerYear?: number;
  seats?: number;
  seatsAvailable?: number;
  eligibility: string;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface OfficialResponse {
  responderName: string;
  responderRole: string;
  date: string;
  text: string;
}

export type ReviewerRelationship = 
  | 'Current student' 
  | 'Former student' 
  | 'Student'
  | 'Parent' 
  | 'Alumni' 
  | 'Teacher' 
  | 'Other';

export interface Review {
  id: string;
  institutionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  reviewerType: ReviewerRelationship;
  isVerifiedReviewer?: boolean;
  verifiedStatus?: boolean;
  verificationBadgeText?: string;
  rating: number; // 1 - 5
  categoryRatings: Record<string, number>;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  photos?: string[];
  createdAt: string;
  helpfulCount: number;
  userVotedHelpful?: boolean;
  reported: boolean;
  reportCount?: number;
  officialResponse?: OfficialResponse;
  status: 'approved' | 'pending' | 'flagged' | 'rejected';
  courseOrGrade?: string;
  yearOfPassingOrCurrent?: number;
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  type: InstitutionType;
  category: Category;
  city: string;
  state: string;
  address: string;
  pinCode: string;
  locality: string;
  coordinates: LocationCoordinates;
  establishedYear: number;
  ownership: OwnershipType;
  affiliation: string;
  boardOrUniversity: string;
  nirfRank?: number;
  naacGrade?: string;
  cbseAffiliationNo?: string;
  
  rating: number; // e.g. 4.6
  reviewCount: number;
  ratingDistribution: RatingDistribution;
  categoryRatings: Record<string, number>;
  categoryScores?: Record<string, number>;
  
  feeRange: {
    min: number; // in INR
    max: number; // in INR
    displayText: string; // e.g. "₹1.5 Lakh - ₹3.2 Lakh / year"
  };
  
  hostelAvailable: boolean;
  hostelFees?: string;
  hostelDetails?: string;
  campusSize: string; // e.g. "550 Acres"
  studentFacultyRatio: string; // e.g. "14:1"
  averagePlacement?: string; // e.g. "₹22.5 LPA"
  highestPlacement?: string; // e.g. "₹1.2 Cr PA"
  
  facilities: string[];
  highlights?: string[];
  admissionsOverview?: string;
  heroImage: string;
  galleryImages: string[];
  description: string;
  website: string;
  phone: string;
  email: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  featured: boolean;
  trending: boolean;
  verifiedInstitution: boolean;
  claimedByRep: boolean;
  courses: Course[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: 'student' | 'parent' | 'alumni' | 'teacher' | 'institution_rep' | 'admin';
  institutionName?: string;
  city: string;
  isVerified: boolean;
  joinedDate: string;
  savedInstitutionIds: string[];
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  institutionId: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reason: 'harassment' | 'defamation' | 'spam' | 'private_info' | 'fake_review' | 'other';
  notes: string;
  timestamp: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
}

export interface SearchFilterParams {
  query?: string;
  city?: string;
  type?: InstitutionType | 'All';
  category?: string;
  board?: string;
  minRating?: number;
  maxFee?: number;
  ownership?: OwnershipType | 'All';
  hostel?: boolean;
  verifiedOnly?: boolean;
  sortBy?: 'recommended' | 'highest_rated' | 'most_reviewed' | 'lowest_fees' | 'established';
}
