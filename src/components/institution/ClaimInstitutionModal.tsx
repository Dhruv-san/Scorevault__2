import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Building, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Institution } from '../../types';
import { authService } from '../../services/authService';

interface ClaimInstitutionModalProps {
  institution: Institution;
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const ClaimInstitutionModal: React.FC<ClaimInstitutionModalProps> = ({
  institution,
  isOpen,
  onClose,
  onRequireAuth
}) => {
  const [officialEmail, setOfficialEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!officialEmail.trim() || !designation.trim()) {
      setError('Please provide your official institutional email and designation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId: institution.id,
          userId: currentUser.id,
          officialEmail,
          designation,
          documentUrl
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccess(true);
      } else {
        throw new Error(json.error || 'Failed to submit representative claim');
      }
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-200/80">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-950 font-display">
            Claim {institution.shortName} Representative Profile
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Official principal, registrar, or admissions director verification workflow.
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900 font-display">Claim Submitted for Audit</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Our trust team will verify your official email domain ({officialEmail}) and administrative credentials.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 mb-1">Official Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. registrar@institution.edu.in"
                  value={officialEmail}
                  onChange={e => setOfficialEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Must use official domain matching institution affiliation</p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Official Designation / Role</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dean of Admissions / Principal / Registrar"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Affiliation Evidence / ID Card URL (Optional)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-auth-letter.pdf"
                  value={documentUrl}
                  onChange={e => setDocumentUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold">Scorevault Neutrality Guarantee: </span>
              Approved representatives may update official fees, facilities, and contact details, but CANNOT delete, hide, or alter community student reviews or star ratings.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting Claim...' : 'Submit Claim Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
