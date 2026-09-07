import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Bookmark, 
  Scale, 
  Share2, 
  Edit3, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ThumbsUp, 
  Flag, 
  Sparkles, 
  ExternalLink, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft, 
  Building
} from 'lucide-react';
import { Institution, Review } from '../../types';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import { WriteReviewModal } from './WriteReviewModal';
import { ReportReviewModal } from './ReportReviewModal';
import { ClaimInstitutionModal } from './ClaimInstitutionModal';
import { askScorevaultAdvisor } from '../../services/aiService';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { updatePageSeo, generateEducationalOrganizationJsonLd } from '../../utils/seo';

interface InstitutionProfileViewProps {
  institution: Institution;
  onBack: () => void;
  onRequireAuth: () => void;
  onCompareNavigate?: () => void;
}

export const InstitutionProfileView: React.FC<InstitutionProfileViewProps> = ({
  institution: initialInstitution,
  onBack,
  onRequireAuth,
  onCompareNavigate
}) => {
  const [institution, setInstitution] = useState<Institution>(initialInstitution);
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'info' | 'reviews' | 'ai_factcheck'>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSort, setReviewSort] = useState<string>('most_helpful');
  const [reviewerTypeFilter, setReviewerTypeFilter] = useState<string>('All');
  
  const [isSaved, setIsSaved] = useState(dataService.isSaved(institution.id));
  const [inCompare, setInCompare] = useState(dataService.isInComparison(institution.id));
  const [showShareToast, setShowShareToast] = useState(false);

  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);

  // AI Fact Check state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Dynamic SEO Update for Crawlers & Browsers
  useEffect(() => {
    updatePageSeo({
      title: `${institution.name} (${institution.city}) - Reviews, Fees, Admissions`,
      description: `Read verified student reviews, fees structure, NIRF ranking, hostel details, and admission criteria for ${institution.name} in ${institution.city}, ${institution.state}.`,
      ogImage: institution.heroImage,
      type: 'article',
      jsonLd: generateEducationalOrganizationJsonLd(institution)
    });
  }, [institution]);

  const loadReviews = () => {
    const list = dataService.getReviews(institution.id, {
      sort: reviewSort,
      reviewerType: reviewerTypeFilter
    });
    setReviews(list);
  };

  useEffect(() => {
    loadReviews();
    setIsSaved(dataService.isSaved(institution.id));
    setInCompare(dataService.isInComparison(institution.id));
  }, [institution.id, reviewSort, reviewerTypeFilter]);

  const handleToggleSave = () => {
    const saved = dataService.toggleSave(institution.id);
    setIsSaved(saved);
  };

  const handleToggleCompare = () => {
    const res = dataService.toggleComparison(institution.id);
    if (res.error) {
      alert(res.error);
    } else {
      setInCompare(res.active);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const handleHelpfulVote = (reviewId: string) => {
    dataService.voteHelpful(reviewId);
    loadReviews();
  };

  const handleReviewSubmitted = (newReview: Review) => {
    const updated = dataService.getInstitutionById(institution.id);
    if (updated) {
      setInstitution({ ...updated });
    }
    loadReviews();
  };

  const handleRunAiFactCheck = async () => {
    setAiLoading(true);
    try {
      const res = await askScorevaultAdvisor({
        prompt: `Provide a real-time, verified institutional dossier for ${institution.name} located in ${institution.city}, India.
Verify NIRF accreditation, authentic placement stats, entrance exam cutoffs (JEE/NEET/CAT/CBSE), hostel realities, and student satisfaction. Ground in Google Search data.`,
        institutionContext: institution
      });
      setAiAnalysis(res.reply);
      setAiSources(res.sources || []);
    } catch (e: any) {
      setAiAnalysis('Verification intelligence temporarily unavailable. Please refer to official NIRF and board disclosures.');
    } finally {
      setAiLoading(false);
    }
  };

  const totalDistributionReviews = Math.max(1, institution.reviewCount);
  const ratingDist = institution.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <article className="min-h-screen bg-slate-50/60 pb-20" itemscope itemType="https://schema.org/EducationalOrganization">
      
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      {/* Top Back Nav & Quick Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Breadcrumbs
            onHomeClick={onBack}
            items={[
              { label: institution.type === 'School' ? 'Schools' : 'Colleges', onClick: onBack },
              { label: institution.city, onClick: onBack },
              { label: institution.shortName }
            ]}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setClaimModalOpen(true)}
              className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>Claim Representative Profile</span>
            </button>

            <button
              onClick={handleToggleCompare}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                inCompare
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{inCompare ? 'In Comparison' : 'Compare'}</span>
            </button>

            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (!authService.isAuthenticated()) {
                  onRequireAuth();
                } else {
                  setWriteReviewOpen(true);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <header className="relative bg-white border-b border-slate-200">
        <div className="relative h-48 sm:h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src={institution.heroImage}
            alt={institution.name}
            className="w-full h-full object-cover opacity-85"
            itemProp="image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md font-bold tracking-wide uppercase bg-slate-900/90 text-white backdrop-blur-xs border border-white/20">
                {institution.type} • {institution.category}
              </span>
              {institution.nirfRank && (
                <span className="px-2.5 py-1 rounded-md font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  NIRF #{institution.nirfRank}
                </span>
              )}
            </div>
            <span className="text-white/80 font-medium">Est. {institution.establishedYear}</span>
          </div>
        </div>

        {/* Institution Identity Block */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {institution.ownership} Institution • {institution.boardOrUniversity}
                </span>
                {institution.verifiedInstitution && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Scorevault Verified Profile
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 font-display" itemProp="name">
                {institution.name}
              </h1>

              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600 flex-wrap">
                <div className="flex items-center gap-1 text-slate-700" itemProp="address">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{institution.address}</span>
                </div>
                <span>•</span>
                <span className="text-slate-500">Affiliation: {institution.affiliation}</span>
              </div>
            </div>

            {/* Scorecard Hero Block */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-2xs">
              <div className="text-center pr-4 border-r border-slate-200">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display">
                  {institution.rating}
                </div>
                <div className="flex justify-center text-amber-400 text-sm mt-0.5">
                  ★★★★★
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Scorevault Rating</p>
                <p className="text-[11px] text-slate-500">Based on {institution.reviewCount} verified reviews</p>
                <button
                  onClick={() => {
                    if (!authService.isAuthenticated()) {
                      onRequireAuth();
                    } else {
                      setWriteReviewOpen(true);
                    }
                  }}
                  className="mt-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  Rate this institution →
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'ratings', label: 'Ratings & Rubrics' },
              { id: 'info', label: 'Admissions & Info' },
              { id: 'reviews', label: `Reviews (${institution.reviewCount})` },
              { id: 'ai_factcheck', label: 'AI Fact-Check & Live Dossier', isAi: true }
            ].map(tab => (
              <button
                key={tab.id}
                id={`profile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.isAi && <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* Main Tab Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block">Annual Fees</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block truncate">
                    {institution.feeRange.displayText}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {institution.type === 'School' ? 'Student-Faculty' : 'Average Package'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block truncate">
                    {institution.type === 'School' 
                      ? `${institution.studentFacultyRatio} Ratio` 
                      : (institution.averagePlacement || 'Top Corporate Ties')}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block">Campus Area</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block truncate">
                    {institution.campusSize}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block">Hostel Facility</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block truncate">
                    {institution.hostelAvailable ? 'Available on campus' : 'Day Scholars Only'}
                  </span>
                </div>
              </div>

              {/* About Section */}
              <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
                <h2 className="text-lg font-bold text-slate-950 mb-3 font-display">
                  About {institution.name}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed" itemProp="description">
                  {institution.description}
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                    Institutional Highlights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {institution.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Campus Amenities & Facilities */}
              <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
                <h2 className="text-lg font-bold text-slate-950 mb-4 font-display">
                  Facilities & Infrastructure
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {institution.facilities.map((facility, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/70"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </section>

              {/* Campus Gallery */}
              {institution.galleryImages && institution.galleryImages.length > 0 && (
                <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
                  <h2 className="text-lg font-bold text-slate-950 mb-4 font-display">
                    Campus Visuals
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {institution.galleryImages.map((img, i) => (
                      <div key={i} className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={img} alt="Campus" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Right Col: Quick Info Sidebar */}
            <aside className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Direct Verification Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{institution.address}</span>
                  </div>

                  {institution.contactInfo.phone && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{institution.contactInfo.phone}</span>
                    </div>
                  )}

                  {institution.contactInfo.email && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{institution.contactInfo.email}</span>
                    </div>
                  )}

                  {institution.contactInfo.website && (
                    <div className="pt-2">
                      <a
                        href={institution.contactInfo.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-xl font-semibold transition-colors"
                        itemProp="url"
                      >
                        <span className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Visit Official Website
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 p-6 rounded-2xl border border-blue-200 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Admission Counselor</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Have questions about cutoffs or life at {institution.shortName}?
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Ask our Google Search-grounded AI advisor for live JEE cutoffs, hostel rules, or placement realities.
                </p>
                <button
                  onClick={() => setActiveTab('ai_factcheck')}
                  className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Inspect Live Dossier
                </button>
              </div>

            </aside>

          </div>
        )}

        {/* TAB 2: RATINGS & RUBRICS */}
        {activeTab === 'ratings' && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-950 font-display">
                Scorevault Ratings Methodology & Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every rating is weighted against reviewer verification status to prevent astroturfing and fake reviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-slate-100">
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-5xl font-extrabold text-slate-950 font-display">
                  {institution.rating}
                </div>
                <div className="flex justify-center text-amber-400 text-base my-1">
                  ★★★★★
                </div>
                <p className="text-xs font-bold text-slate-800">Aggregate Score</p>
                <p className="text-[11px] text-slate-400">out of 5.0 from {institution.reviewCount} reviews</p>
              </div>

              <div className="md:col-span-2 space-y-2.5">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ratingDist[stars as 1|2|3|4|5] || 0;
                  const pct = Math.round((count / totalDistributionReviews) * 100);
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                        {stars} <span className="text-amber-500">★</span>
                      </span>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        />
                      </div>
                      <span className="w-10 text-right text-slate-400 font-mono text-[11px]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 font-display">
                Detailed Category Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(institution.categoryScores).map(([category, score]) => (
                  <div key={category} className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="capitalize text-slate-800">
                        {category.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-blue-600">{Number(score).toFixed(1)} ★</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(Number(score) / 5) * 100}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* TAB 3: ADMISSIONS & INFORMATION */}
        {activeTab === 'info' && (
          <section className="space-y-8">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-950 mb-3 font-display">
                Admission Criteria & Application
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {institution.admissionsOverview}
              </p>
              
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <span className="font-bold">Official Verification Notice: </span>
                  Admissions to this institution are conducted strictly through authorized government counseling and institutional entrance tests. Beware of fraudulent agents claiming backdoor seats.
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-950 mb-4 font-display">
                Courses Offered & Estimated Fee Structure
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Course / Degree</th>
                      <th className="py-3 px-4">Degree Level</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Seats</th>
                      <th className="py-3 px-4">Annual Tuition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {institution.courses.map(course => (
                      <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{course.name}</td>
                        <td className="py-3.5 px-4">{course.degree}</td>
                        <td className="py-3.5 px-4">{course.duration}</td>
                        <td className="py-3.5 px-4">{course.seatsAvailable || 'Varies'}</td>
                        <td className="py-3.5 px-4 text-emerald-700 font-bold">
                          ₹{course.feePerYear.toLocaleString('en-IN')}/year
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-950 mb-2 font-display">
                Hostel & Residential Life
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {institution.hostelDetails || 'Hostel availability and accommodation rules are set by the residential warden committee.'}
              </p>
            </div>

          </section>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <section className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950 font-display">
                  Authentic Community Reviews ({reviews.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Read unfiltered experiences from current students, alumni, and verified parents.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={reviewerTypeFilter}
                  onChange={e => setReviewerTypeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="All">All Reviewers</option>
                  <option value="Student">Current Students</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Parent">Parents</option>
                  <option value="Teacher">Faculty</option>
                </select>

                <select
                  value={reviewSort}
                  onChange={e => setReviewSort(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="most_helpful">Most Helpful</option>
                  <option value="most_recent">Most Recent</option>
                  <option value="highest_rated">Highest Rated</option>
                  <option value="lowest_rated">Lowest Rated</option>
                </select>

                <button
                  onClick={() => {
                    if (!authService.isAuthenticated()) {
                      onRequireAuth();
                    } else {
                      setWriteReviewOpen(true);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  Write Review
                </button>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    id={`review-card-${review.id}`}
                    className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{review.userName}</span>
                            {review.verifiedStatus && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Verified {review.reviewerType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {review.courseOrGrade} • Batch of {review.yearOfPassingOrCurrent}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          <span className="text-xs font-bold text-amber-900">{review.rating}.0</span>
                          <span className="text-amber-500 text-xs">★</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                        {review.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {review.content}
                      </p>
                    </div>

                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {review.pros.length > 0 && (
                          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-950">
                            <span className="font-bold text-emerald-800 block mb-1">PROS</span>
                            <ul className="space-y-1">
                              {review.pros.map((p, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-emerald-600 font-bold">✓</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons.length > 0 && (
                          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-rose-950">
                            <span className="font-bold text-rose-800 block mb-1">CONS</span>
                            <ul className="space-y-1">
                              {review.cons.map((c, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-rose-600 font-bold">✕</span>
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {review.photos.map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            alt="Campus by reviewer"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <button
                        onClick={() => handleHelpfulVote(review.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors ${
                          review.userVotedHelpful
                            ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                            : 'hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({review.helpfulCount})</span>
                      </button>

                      <button
                        onClick={() => setReportingReview(review)}
                        className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <p className="text-sm font-bold text-slate-700">No reviews found matching your filter.</p>
                <p className="text-xs text-slate-400 mt-1">Be the first verified reviewer to share your experience!</p>
              </div>
            )}

          </section>
        )}

        {/* TAB 5: AI FACT CHECK & DOSSIER */}
        {activeTab === 'ai_factcheck' && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Google Search-Grounded AI Verification</span>
                </div>
                <h2 className="text-xl font-bold text-slate-950 font-display">
                  Live Institutional Intelligence Dossier
                </h2>
                <p className="text-xs text-slate-500">
                  Cross-referencing NIRF ranks, government accreditation portals, and verified placement releases.
                </p>
              </div>

              <button
                onClick={handleRunAiFactCheck}
                disabled={aiLoading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
              >
                <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Auditing Web Sources...' : 'Generate Live Audit'}</span>
              </button>
            </div>

            {aiLoading ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-900">Conducting Search-Grounded Verification...</p>
                <p className="text-xs text-slate-500 mt-1">Analyzing official AICTE, CBSE, and NIRF disclosures for {institution.name}...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {aiAnalysis}
                </div>

                {aiSources.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Verified Reference Sources (Google Grounding)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {aiSources.map((s, idx) => s.web?.uri ? (
                        <a
                          key={idx}
                          href={s.web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-lg text-xs text-blue-600 truncate flex items-center justify-between"
                        >
                          <span className="truncate">{s.web.title || s.web.uri}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 ml-2" />
                        </a>
                      ) : null)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
                <Sparkles className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Ready to audit {institution.shortName}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  Click below to trigger a real-time web verification analysis covering admissions cutoffs, median CTC reports, and campus controversies.
                </p>
                <button
                  onClick={handleRunAiFactCheck}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs"
                >
                  Start Live AI Fact-Check
                </button>
              </div>
            )}

          </section>
        )}

      </main>

      {/* Modals */}
      {writeReviewOpen && (
        <WriteReviewModal
          institution={institution}
          isOpen={writeReviewOpen}
          onClose={() => setWriteReviewOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
          onRequireAuth={onRequireAuth}
        />
      )}

      {claimModalOpen && (
        <ClaimInstitutionModal
          institution={institution}
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          onRequireAuth={onRequireAuth}
        />
      )}

      {reportingReview && (
        <ReportReviewModal
          review={reportingReview}
          isOpen={!!reportingReview}
          onClose={() => setReportingReview(null)}
          onReportSuccess={loadReviews}
        />
      )}

    </article>
  );
};
