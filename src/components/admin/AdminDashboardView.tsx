import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Building,
  Search,
  Database
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import { ReviewReport, Review } from '../../types';
import { DataSourcesAdminView } from './DataSourcesAdminView';

interface AdminDashboardViewProps {
  onBack: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'claims' | 'users' | 'datasources' | 'audit'>('moderation');
  const [reportsWithReview, setReportsWithReview] = useState<{ report: ReviewReport; review?: Review }[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const token = authService.getToken();

  const loadReports = () => {
    setReportsWithReview(dataService.getReportedReviews());
  };

  const loadClaims = () => {
    if (!token) return;
    fetch('/api/admin/claims', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(json => json.success && Array.isArray(json.data) && setClaims(json.data))
      .catch(() => {});
  };

  const loadUsers = () => {
    if (!token) return;
    fetch(`/api/admin/users?q=${encodeURIComponent(userSearch)}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(json => json.success && Array.isArray(json.data) && setUsers(json.data))
      .catch(() => {});
  };

  const loadAuditLogs = () => {
    if (!token) return;
    fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(json => json.success && Array.isArray(json.data) && setAuditLogs(json.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadReports();
    loadClaims();
    loadUsers();
    loadAuditLogs();
  }, [userSearch]);

  const handleModerate = (reviewId: string, action: 'approve' | 'reject' | 'flag') => {
    dataService.moderateReview(reviewId, action);
    loadReports();
    setFeedback(`Review status updated to: ${action.toUpperCase()}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEvaluateClaim = (claimId: string, status: 'approved' | 'rejected' | 'more_information_required') => {
    if (!token) return;
    fetch(`/api/admin/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setFeedback(`Claim evaluated: ${status.toUpperCase()}`);
          loadClaims();
          loadAuditLogs();
          setTimeout(() => setFeedback(null), 3000);
        }
      });
  };

  const handleToggleUserSuspension = (userId: string, currentStatus: boolean) => {
    if (!token) return;
    fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isSuspended: !currentStatus })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setFeedback(`User account ${!currentStatus ? 'suspended' : 'restored'}`);
          loadUsers();
          loadAuditLogs();
          setTimeout(() => setFeedback(null), 3000);
        }
      });
  };

  if (activeTab === 'datasources') {
    return <DataSourcesAdminView onBack={() => setActiveTab('moderation')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
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
              Scorevault Admin & Governance Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Server-enforced user management, claims evaluation, review moderation, and data source registry.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'moderation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Reports ({reportsWithReview.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'claims' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Claims ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab('datasources')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'datasources' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Data Sources Registry
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. MODERATION QUEUE TAB */}
      {activeTab === 'moderation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">Content Audit & Report Resolution</h3>
          {reportsWithReview.length > 0 ? (
            <div className="space-y-4">
              {reportsWithReview.map(({ report, review }) => (
                <div key={report.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-rose-700 uppercase">{report.reason.replace('_', ' ')}</span>
                    <span className="text-slate-400">{new Date(report.timestamp).toLocaleString()}</span>
                  </div>
                  {review && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                      <p className="font-bold text-slate-900">{review.title}</p>
                      <p className="text-slate-600">{review.content}</p>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => handleModerate(review!.id, 'reject')} className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                      Reject Review
                    </button>
                    <button onClick={() => handleModerate(review!.id, 'approve')} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                      Approve Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">No pending content flags.</div>
          )}
        </div>
      )}

      {/* 2. CLAIMS QUEUE TAB */}
      {activeTab === 'claims' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">Representative Verification Queue</h3>
          {claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map(claim => (
                <div key={claim.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{claim.institution?.name}</span>
                    <span className="uppercase text-blue-600">{claim.status}</span>
                  </div>
                  <p className="text-slate-600">Applicant: {claim.user?.name} ({claim.officialEmail}) • {claim.designation}</p>
                  {claim.status === 'pending' && (
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => handleEvaluateClaim(claim.id, 'rejected')} className="px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200">Reject</button>
                      <button onClick={() => handleEvaluateClaim(claim.id, 'approved')} className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg">Approve & Verify</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">No pending claims.</div>
          )}
        </div>
      )}

      {/* 3. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 font-display">Registered User Directory</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 uppercase text-[10px] font-bold text-blue-700">{u.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUserSuspension(u.id, u.isSuspended)}
                        className={`px-3 py-1 rounded text-xs font-bold ${u.isSuspended ? 'bg-emerald-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
                      >
                        {u.isSuspended ? 'Restore' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">Server Audit Trail</h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-700 uppercase mr-2">{log.action}</span>
                  <span className="text-slate-800">{log.details}</span>
                  <span className="block text-[10px] text-slate-400">By Admin: {log.admin?.name} ({log.admin?.email})</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
