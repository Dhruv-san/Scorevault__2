import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Review } from '../../types';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';

interface ReportReviewModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
  onReportSuccess: () => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  review,
  isOpen,
  onClose,
  onReportSuccess
}) => {
  const [reason, setReason] = useState<any>('defamation');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = authService.getCurrentUser();

    dataService.reportReview({
      reviewId: review.id,
      institutionId: review.institutionId,
      reportedByUserId: currentUser?.id || 'anon',
      reportedByUserName: currentUser?.name || 'Anonymous User',
      reason,
      notes
    });

    setSubmitted(true);
    setTimeout(() => {
      onReportSuccess();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 font-display">Report Received</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Our trust and safety moderation team will audit this review against Scorevault Community Guidelines.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Report Inappropriate Content
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              Help us maintain authentic, objective, and safe reviews for Indian education.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Violation Category</label>
                <div className="space-y-2">
                  {[
                    { id: 'defamation', label: 'Unsubstantiated Defamation or Slander' },
                    { id: 'harassment', label: 'Targeted Harassment of Staff/Students' },
                    { id: 'private_info', label: 'Exposes Private Phone / Address / WhatsApp' },
                    { id: 'false_claims', label: 'Factually False Placement / Accreditations' },
                    { id: 'spam_or_promo', label: 'Commercial Coaching / Agent Promotion' }
                  ].map(item => (
                    <label key={item.id} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="reportReason"
                        checked={reason === item.id}
                        onChange={() => setReason(item.id)}
                        className="text-rose-600"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Context (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this content violates community standards..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Submit Flag for Audit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
