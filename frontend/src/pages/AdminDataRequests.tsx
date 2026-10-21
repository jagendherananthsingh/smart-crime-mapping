import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Building2,
  FileText,
  BadgeCheck,
  ExternalLink,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { dataRequestApi } from '../api/endpoints';
import { IPoliceDataRequest } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AdminDataRequests: React.FC = () => {
  const [requests, setRequests] = useState<IPoliceDataRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<IPoliceDataRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [grantPoliceRole, setGrantPoliceRole] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [reqsRes, statsRes] = await Promise.all([
        dataRequestApi.getAll({
          status: statusFilter,
          search: searchQuery,
        }),
        dataRequestApi.getStats(),
      ]);

      if (reqsRes.data) {
        setRequests(reqsRes.data);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load requisitions for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, searchQuery]);

  const handleOpenReview = (req: IPoliceDataRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(req);
    setReviewAction(action);
    setAdminRemarks(
      action === 'APPROVED'
        ? 'Verified credentials against AP Police State Personnel Database. Police investigator clearance approved.'
        : 'Request declined due to inadequate verification details or invalid FIR reference.'
    );
    setGrantPoliceRole(true);
    setActionMessage(null);
  };

  const handleExecuteReview = async () => {
    if (!selectedRequest || !reviewAction) return;
    try {
      setActionLoading(true);
      const res = await dataRequestApi.review(selectedRequest._id, {
        status: reviewAction,
        adminRemarks,
        grantPoliceRole: reviewAction === 'APPROVED' ? grantPoliceRole : false,
      });

      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Requisition successfully ${reviewAction.toLowerCase()}!`,
        });
        setTimeout(() => {
          setSelectedRequest(null);
          setReviewAction(null);
          fetchRequests();
        }, 1200);
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to process decision.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Official Police Data Requisition Governance
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin Control
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and authorize formal investigative data access requests from Andhra Pradesh Police officers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer self-start md:self-auto"
        >
          Refresh Queue
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Requisitions</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{stats.total}</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
          <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Action
          </span>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">{stats.pending}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Authorized Police Access
          </span>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">{stats.approved}</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
          <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Declined / Rejected
          </span>
          <div className="text-2xl font-black text-rose-300 font-mono mt-1">{stats.rejected}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search officer, badge, FIR, station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-64"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{requests.length}</strong> applications
        </span>
      </div>

      {/* Requests List */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} height="160px" />
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white">No Requisitions Found</h4>
          <p className="text-xs text-slate-400">No police requests match your active filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req._id}
                className={`p-6 rounded-3xl border transition-all ${
                  isPending
                    ? 'bg-slate-900 border-slate-800 hover:border-amber-500/40 shadow-lg'
                    : isApproved
                    ? 'bg-emerald-950/15 border-emerald-500/20'
                    : 'bg-rose-950/15 border-rose-500/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-white">{req.officerName}</span>
                      <span className="text-xs font-mono font-black text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                        {req.badgeNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          req.urgencyLevel === 'ACTIVE_INVESTIGATION_EMERGENCY'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                        }`}
                      >
                        {req.urgencyLevel.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {req.rank} • {req.policeStation} • <strong>{(req.districts || []).join(', ') || (req as any).district} District(s)</strong> • Contact: {req.contactPhone}
                    </p>
                  </div>

                  {/* Actions or Status */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReview(req, 'APPROVED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve &amp; Grant Access</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenReview(req, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{req.status}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence & Case Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">FIR / Case Number:</span>
                    <span className="font-mono font-bold text-white text-sm">{req.firNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Verification Proof Document:</span>
                    <span className="font-mono text-slate-200 block font-semibold">
                      {req.idProofType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-indigo-400 font-mono">
                      Ref: {req.idProofNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Requested Scope:</span>
                    <span className="font-semibold text-indigo-300 block">
                      {req.requestedDataScope.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Proof Token Attachment:</span>
                    <span className="font-mono text-slate-300 text-[11px] block truncate">
                      {req.idProofAttachment || 'officer_id_verification_token.pdf'}
                    </span>
                  </div>
                </div>

                {/* Purpose Description */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750 text-xs text-slate-300">
                  <span className="font-bold text-slate-200 block mb-0.5">
                    Official Investigative Purpose:
                  </span>
                  <p className="leading-relaxed">{req.purposeDescription}</p>
                </div>

                {/* Admin Remarks if reviewed */}
                {req.adminRemarks && (
                  <div className="mt-3 p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300">
                    <span className="font-bold text-indigo-400 block mb-0.5">
                      Admin Decision Remarks:
                    </span>
                    <p>{req.adminRemarks}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DECISION REVIEW MODAL */}
      {selectedRequest && reviewAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    reviewAction === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {reviewAction === 'APPROVED' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-black text-white">
                  {reviewAction === 'APPROVED' ? 'Authorize Police Data Access' : 'Decline Requisition'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Officer:</span>
                  <span className="font-bold text-white">{selectedRequest.officerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Badge &amp; Rank:</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {selectedRequest.badgeNumber} ({selectedRequest.rank})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Police Station:</span>
                  <span className="text-slate-200">{selectedRequest.policeStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FIR Reference:</span>
                  <span className="font-mono text-white font-bold">{selectedRequest.firNumber}</span>
                </div>
              </div>

              {reviewAction === 'APPROVED' && (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <input
                    id="grantRole"
                    type="checkbox"
                    checked={grantPoliceRole}
                    onChange={(e) => setGrantPoliceRole(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="grantRole" className="text-xs text-slate-200 cursor-pointer">
                    <strong>Elevate User Account to POLICE:</strong> Automatically upgrade this officer&apos;s account permissions to access Deep Analytics &amp; Predictive ML modules.
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Administrative Remarks / Approval Notice:
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              {actionMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    actionMessage.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {actionMessage.text}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteReview}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                  reviewAction === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
