import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ExternalLink,
  Search,
  ArrowLeft,
  Filter,
  Check
} from 'lucide-react';
import { authService } from '../../services/authService';

interface DataSourcesAdminViewProps {
  onBack: () => void;
}

export const DataSourcesAdminView: React.FC<DataSourcesAdminViewProps> = ({ onBack }) => {
  const [sources, setSources] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState<any | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'VERIFIED' | 'READY_FOR_INGESTION' | 'BLOCKED' | 'UNDER_REVIEW'>('READY_FOR_INGESTION');
  const [verifyReason, setVerifyReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const token = authService.getToken();

  const loadSources = () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (sectorFilter !== 'ALL') params.append('sector', sectorFilter);
    if (statusFilter !== 'ALL') params.append('status', statusFilter);

    fetch(`/api/admin/data-sources?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => json.success && Array.isArray(json.data) && setSources(json.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadSources();
  }, [search, sectorFilter, statusFilter]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource || !token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data-sources/${selectedSource.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: verifyStatus,
          statusReason: verifyReason,
          licensingEvidenceUrl: evidenceUrl
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback(`Data Source status updated to ${verifyStatus}`);
        setVerifyModalOpen(false);
        setSelectedSource(null);
        setVerifyReason('');
        loadSources();
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      alert('Verification submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Top Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Moderation</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
                Scorevault Data Source Registry & Governance
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Authority auditing, licensing evidence, CAPTCHA restrictions, and explicit ingestion control.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search data source by name, organization, or identifier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none font-medium"
          >
            <option value="ALL">All Sectors</option>
            <option value="school_education">School Education</option>
            <option value="higher_education">Higher Education</option>
            <option value="professional_regulatory">Professional Regulators</option>
            <option value="open_data">Open Data Platforms</option>
            <option value="state_admission">State Admission Cells</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="DISCOVERED">DISCOVERED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="READY_FOR_INGESTION">READY_FOR_INGESTION</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Source & Organization</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Licensing</th>
                <th className="py-3 px-4">Access & Captcha</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sources.map(src => (
                <tr key={src.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-blue-600">
                    P{src.ingestionPriority}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 line-clamp-1">{src.sourceName}</div>
                    <div className="text-[11px] text-slate-400">{src.organization}</div>
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-500">
                    {src.sector.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    {src.overallScore.toFixed(1)} / 100
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      src.licensingStatus === 'OPEN_LICENSE' || src.licensingStatus === 'REUSE_ALLOWED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : src.licensingStatus === 'REUSE_RESTRICTED' || src.licensingStatus === 'REUSE_STATUS_UNCLEAR'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {src.licensingStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span>{src.accessMethod}</span>
                      {src.captchaRequired && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-200">
                          CAPTCHA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      src.status === 'READY_FOR_INGESTION' ? 'bg-emerald-600 text-white' :
                      src.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                      src.status === 'BLOCKED' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {src.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSource(src);
                        setVerifyStatus(src.status === 'VERIFIED' ? 'READY_FOR_INGESTION' : src.status);
                        setVerifyModalOpen(true);
                      }}
                      className="px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Audit / Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit & Status Transition Modal */}
      {verifyModalOpen && selectedSource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Audit & Verify {selectedSource.sourceName}
              </h3>
              <button onClick={() => setVerifyModalOpen(false)}>
                <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Target Verification Status</label>
                <select
                  value={verifyStatus}
                  onChange={e => setVerifyStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white font-bold"
                >
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Requires Investigation)</option>
                  <option value="VERIFIED">VERIFIED (Source Authority Confirmed)</option>
                  <option value="READY_FOR_INGESTION">READY_FOR_INGESTION (Explicit Ingestion Approval)</option>
                  <option value="BLOCKED">BLOCKED (CAPTCHA / Legal Reuse Restriction)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Verification Evidence & Legal Audit Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record evidence of official government registry status, licensing terms URL, and access safety..."
                  value={verifyReason}
                  onChange={e => setVerifyReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Licensing Terms Evidence URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://data.gov.in/terms-and-conditions"
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-950 leading-relaxed text-[11px]">
                <span className="font-bold">Strict Governance Rule: </span>
                A source cannot be marked <code className="font-mono bg-white px-1 py-0.5 rounded">READY_FOR_INGESTION</code> automatically. Explicit admin verification and recorded evidence are required.
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  {loading ? 'Recording Audit...' : 'Save Audit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
