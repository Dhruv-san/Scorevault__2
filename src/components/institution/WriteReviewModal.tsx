import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Plus, 
  Trash2, 
  UploadCloud, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Institution, Review, User } from '../../types';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';

interface WriteReviewModalProps {
  institution: Institution;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (newReview: Review) => void;
  onRequireAuth: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  institution,
  isOpen,
  onClose,
  onReviewSubmitted,
  onRequireAuth
}) => {
  const currentUser = authService.getCurrentUser();

  const [reviewerType, setReviewerType] = useState<Review['reviewerType']>('Student');
  const [courseOrGrade, setCourseOrGrade] = useState('');
  const [passingYear, setPassingYear] = useState<number>(2025);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Category specific ratings
  const [academicsRating, setAcademicsRating] = useState<number>(4);
  const [facultyRating, setFacultyRating] = useState<number>(4);
  const [infraRating, setInfraRating] = useState<number>(4);
  const [campusLifeRating, setCampusLifeRating] = useState<number>(4);
  const [valueRating, setValueRating] = useState<number>(4);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [proInput, setProInput] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [conInput, setConInput] = useState('');
  const [cons, setCons] = useState<string[]>([]);

  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddPro = () => {
    if (proInput.trim() && pros.length < 5) {
      setPros([...pros, proInput.trim()]);
      setProInput('');
    }
  };

  const handleAddCon = () => {
    if (conInput.trim() && cons.length < 5) {
      setCons([...cons, conInput.trim()]);
      setConInput('');
    }
  };

  const handlePhotoUploadSim = () => {
    const sampleCampusImages = [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80'
    ];
    if (photos.length < 3) {
      setPhotos([...photos, sampleCampusImages[photos.length % sampleCampusImages.length]]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    // Strict safety & anti-defamation validation checks
    if (!title.trim() || title.length < 5) {
      setError('Review title must be at least 5 characters.');
      return;
    }

    if (!content.trim() || content.length < 40) {
      setError('Please provide a detailed review of at least 40 characters explaining your honest experience.');
      return;
    }

    // Phone number detection regex for India (10 digits)
    const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{9}/g;
    if (phoneRegex.test(content) || phoneRegex.test(title)) {
      setError('Security violation: Reviews cannot contain personal phone numbers or contact details.');
      return;
    }

    // Defamatory or offensive trigger word check
    const prohibitedWords = ['fraudsters', 'thieves', 'scammers', 'bloody', 'idiots'];
    const lowerContent = content.toLowerCase();
    if (prohibitedWords.some(w => lowerContent.includes(w))) {
      setError('Your review contains flagged unconstructive language. Please criticize constructively based on factual experiences.');
      return;
    }

    setSubmitting(true);

    try {
      const createdReview = dataService.addReview({
        institutionId: institution.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        reviewerType,
        isVerifiedReviewer: true,
        rating,
        title,
        content,
        pros,
        cons,
        categoryRatings: {
          academics: academicsRating,
          faculty: facultyRating,
          infrastructure: infraRating,
          campusLife: campusLifeRating,
          valueForMoney: valueRating
        },
        yearOfPassingOrCurrent: passingYear,
        courseOrGrade: courseOrGrade || (institution.type === 'School' ? 'Class 12' : 'B.Tech / Degree'),
        photos: photos.length > 0 ? photos : undefined
      });

      onReviewSubmitted(createdReview);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            Verified Review Submission
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1 font-display">
            Write a Review for {institution.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Help prospective students and parents by sharing authentic, factual insights.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cannot publish: </span>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Reviewer Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Relationship</label>
              <select
                value={reviewerType}
                onChange={e => setReviewerType(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="Student">Current Student</option>
                <option value="Alumni">Alumni / Graduate</option>
                <option value="Parent">Parent</option>
                <option value="Teacher">Faculty / Teacher</option>
                <option value="Other">Other Verified Observer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {institution.type === 'School' ? 'Class / Grade' : 'Course / Department'}
              </label>
              <input
                type="text"
                placeholder={institution.type === 'School' ? 'e.g. Class 11 Science' : 'e.g. B.Tech Computer Science'}
                value={courseOrGrade}
                onChange={e => setCourseOrGrade(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Passing / Target Year</label>
              <input
                type="number"
                min={1980}
                max={2032}
                value={passingYear}
                onChange={e => setPassingYear(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Overall Star Rating */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
            <label className="block font-bold text-slate-900 text-sm mb-2">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2">
              {rating === 5 && 'Outstanding Experience (5.0)'}
              {rating === 4 && 'Very Good (4.0)'}
              {rating === 3 && 'Average / Needs Improvement (3.0)'}
              {rating === 2 && 'Disappointing (2.0)'}
              {rating === 1 && 'Poor Experience (1.0)'}
            </p>
          </div>

          {/* Category Rubric Sliders */}
          <div className="border-t border-b border-slate-100 py-4 space-y-3">
            <h4 className="font-bold text-slate-900">Detailed Category Ratings (1-5)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Academics & Curriculum</span>
                  <span className="font-bold text-blue-600">{academicsRating}.0 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={academicsRating}
                  onChange={e => setAcademicsRating(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Faculty & Teachers</span>
                  <span className="font-bold text-blue-600">{facultyRating}.0 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={facultyRating}
                  onChange={e => setFacultyRating(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Infrastructure & Labs</span>
                  <span className="font-bold text-blue-600">{infraRating}.0 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={infraRating}
                  onChange={e => setInfraRating(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Campus Life & Extracurriculars</span>
                  <span className="font-bold text-blue-600">{campusLifeRating}.0 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={campusLifeRating}
                  onChange={e => setCampusLifeRating(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Title & Review Content */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Review Headline</label>
            <input
              type="text"
              required
              placeholder="e.g. Honest review of faculty, competitive coding culture, and hostel life"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Your Detailed Experience</label>
            <textarea
              required
              rows={4}
              placeholder="Share specific details about classes, attendance policies, lab equipments, peer atmosphere, canteen food, and placements..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 leading-relaxed text-xs sm:text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">Minimum 40 characters. Be truthful, balanced, and constructive.</p>
          </div>

          {/* Pros & Cons Bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Pros */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <label className="block font-bold text-emerald-800 mb-1.5">What are the Pros?</label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  placeholder="e.g. World-class alumni network"
                  value={proInput}
                  onChange={e => setProInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPro(); }}}
                  className="flex-1 p-1.5 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPro}
                  className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {pros.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-emerald-900 bg-white p-1.5 rounded border border-emerald-200/60">
                    <span className="truncate">✓ {p}</span>
                    <button type="button" onClick={() => setPros(pros.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
              <label className="block font-bold text-rose-800 mb-1.5">What are the Cons / Areas to improve?</label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Mess food quality varies"
                  value={conInput}
                  onChange={e => setConInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCon(); }}}
                  className="flex-1 p-1.5 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCon}
                  className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {cons.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-rose-900 bg-white p-1.5 rounded border border-rose-200/60">
                    <span className="truncate">✕ {c}</span>
                    <button type="button" onClick={() => setCons(cons.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Photo attachments */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Campus Photos (Optional)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePhotoUploadSim}
                className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>Upload Photos (Max 3)</span>
              </button>
              <div className="flex gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                    <img src={src} alt="Upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Guidelines disclaimer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              By publishing, you certify that this review is based on your genuine experience. Defamatory statements, personal attacks against named individuals, and disclosure of personal private contacts are strictly prohibited under Scorevault Moderation Guidelines.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {submitting ? 'Submitting...' : 'Publish Verified Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
