import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  ArrowLeft, 
  Building2, 
  Plus, 
  UserCheck, 
  AlertTriangle 
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { ReviewReport, Review } from '../../types';

interface AdminDashboardViewProps {
  onBack: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBack }) => {
  const [reportsWithReview, setReportsWithReview] = useState<{ report: ReviewReport; review?: Review }[]>([]);
  const [activeTab, setActiveTab] = useState<'moderation' | 'institutions'>('moderation');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadReports = () => {
    setReportsWithReview(dataService.getReportedReviews());
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleModerate = (reviewId: string, action: 'approve' | 'reject' | 'flag') => {
    dataService.moderateReview(reviewId, action);
    loadReports();
    setFeedback(`Review status updated to: ${action.toUpperCase()}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
              Scorevault Trust & Moderation Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Internal community compliance, anti-defamation auditing, and directory management.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'moderation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Reported Reviews ({reportsWithReview.length})
          </button>
          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'institutions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Directory Summary
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Moderation Queue Tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Content Audit Queue
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Review user-flagged content for violations of Indian cyber laws, personal contact exposure, and unsubstantiated defamation.
            </p>

            {reportsWithReview.length > 0 ? (
              <div className="space-y-4">
                {reportsWithReview.map(({ report, review }) => (
                  <div
                    key={report.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                          {report.reason.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          Reported by: <span className="font-semibold text-slate-800">{report.reportedByUserName}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {report.notes && (
                      <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                        Reporter note: "{report.notes}"
                      </p>
                    )}

                    {/* Review content under review */}
                    {review ? (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{review.title}</span>
                          <span className="text-xs font-bold text-amber-600">{review.rating} ★</span>
                        </div>
                        <p className="text-xs text-slate-600">{review.content}</p>
                        <p className="text-[10px] text-slate-400">Author: {review.userName} ({review.reviewerType})</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Review content was deleted or unavailable.</p>
                    )}

                    {/* Moderation Actions */}
                    {review && (
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => handleModerate(review.id, 'reject')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors"
                        >
                          Reject & Hide Review
                        </button>
                        <button
                          onClick={() => handleModerate(review.id, 'flag')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 transition-colors"
                        >
                          Flag for Legal Review
                        </button>
                        <button
                          onClick={() => handleModerate(review.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                        >
                          Approve Review (Dismiss Report)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">All Clear!</h4>
                <p className="text-xs text-slate-400 mt-1">There are no pending flagged reviews in the queue right now.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Directory Summary Tab */}
      {activeTab === 'institutions' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Active Institutions</span>
            <span className="text-3xl font-extrabold text-slate-950 font-display block mt-1">
              {dataService.getInstitutions().length}
            </span>
            <p className="text-xs text-slate-500 mt-1">Schools, colleges, and national institutes</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Reviews Published</span>
            <span className="text-3xl font-extrabold text-slate-950 font-display block mt-1">
              4,180+
            </span>
            <p className="text-xs text-slate-500 mt-1">Authentic student & parent entries</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Neutrality Audit Rating</span>
            <span className="text-3xl font-extrabold text-emerald-600 font-display block mt-1">
              100%
            </span>
            <p className="text-xs text-slate-500 mt-1">Zero sponsored ratings accepted</p>
          </div>
        </div>
      )}

    </div>
  );
};
