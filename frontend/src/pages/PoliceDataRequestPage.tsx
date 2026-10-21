import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Send,
  Lock,
  Building2,
  BadgeCheck,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { dataRequestApi, crimeApi } from '../api/endpoints';
import { IPoliceDataRequest, IdProofType, UrgencyLevel } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const PoliceDataRequestPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'my-requests'>('submit');

  // Form State
  const [officerName, setOfficerName] = useState(user?.name || '');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [rank, setRank] = useState('Sub-Inspector of Police');
  const [policeStation, setPoliceStation] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['Visakhapatnam']);
  const [contactPhone, setContactPhone] = useState('');
  const [officialEmail, setOfficialEmail] = useState(user?.email || '');
  const [idProofType, setIdProofType] = useState<IdProofType>('POLICE_ID_CARD');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [idProofAttachment, setIdProofAttachment] = useState<string>('police_service_id_card_scan.pdf');
  const [firNumber, setFirNumber] = useState('');
  const [requestedDataScope, setRequestedDataScope] = useState('FULL_GIS_MAP_ACCESS');
  const [purposeDescription, setPurposeDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('HIGH_PRIORITY');
  const [statutoryDeclaration, setStatutoryDeclaration] = useState(false);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // District options
  const [districts, setDistricts] = useState<string[]>([]);

  // My requests state
  const [myRequests, setMyRequests] = useState<IPoliceDataRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Fetch districts & my requests
  useEffect(() => {
    const init = async () => {
      try {
        const [filtersRes, myReqsRes] = await Promise.all([
          crimeApi.getFilterOptions(),
          user ? dataRequestApi.getMyRequests() : Promise.resolve({ data: [] }),
        ]);
        if (filtersRes.data?.districts) {
          setDistricts(filtersRes.data.districts);
        }
        if (myReqsRes.data) {
          setMyRequests(myReqsRes.data);
          if (myReqsRes.data.length > 0 && user?.role === 'USER') {
            // If they already have pending or approved requests, default to viewing them
            // setActiveTab('my-requests');
          }
        }
      } catch (err) {
        console.error('Failed to initialize requisition portal:', err);
      }
    };
    init();
  }, [user]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!statutoryDeclaration) {
      setErrorMessage('You must accept the Statutory Legal Oath under the Police & IT Act to proceed.');
      return;
    }

    if (!badgeNumber.trim() || !idProofNumber.trim() || !firNumber.trim() || !policeStation.trim()) {
      setErrorMessage('Badge Number, Police Station, Official ID Proof, and FIR Reference are strictly required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await dataRequestApi.create({
        officerName,
        badgeNumber: badgeNumber.trim().toUpperCase(),
        rank,
        policeStation: policeStation.trim(),
        districts: selectedDistricts,
        contactPhone: contactPhone.trim(),
        officialEmail: officialEmail.trim(),
        idProofType,
        idProofNumber: idProofNumber.trim().toUpperCase(),
        idProofAttachment,
        firNumber: firNumber.trim(),
        requestedDataScope,
        purposeDescription: purposeDescription.trim(),
        urgencyLevel,
        statutoryDeclaration: true,
      });

      if (res.success && res.data) {
        setSubmitSuccess(true);
        setMyRequests((prev) => [res.data, ...prev]);
        // Reset specific fields
        setFirNumber('');
        setPurposeDescription('');
        setBadgeNumber('');
        setIdProofNumber('');
      } else {
        setErrorMessage(res.message || 'Failed to submit official requisition.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Official Government Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Government of Andhra Pradesh • Police Department
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Restricted Data Governance
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
                Official Law Enforcement Crime Data Requisition Portal
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                In compliance with state public safety guidelines and the Digital Personal Data Protection framework, coordinate-level crime maps, granular victim data, and predictive engines require verified Police Identity Proof and Case/FIR justification.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>New Requisition</span>
            </button>
            {user && (
              <button
                type="button"
                onClick={() => setActiveTab('my-requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'my-requests'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Track My Requests ({myRequests.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SUCCESS CONFIRMATION SCREEN */}
      {submitSuccess && (
        <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Official Requisition Submitted to Department Administrator
              </h3>
              <p className="text-xs text-emerald-300">
                Your request has been officially recorded under administrative review. The System Administrator will verify your badge credentials and police station jurisdiction.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(false);
                setActiveTab('my-requests');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
            >
              View Application Status
            </button>
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: SUBMIT FORM */}
      {activeTab === 'submit' && !submitSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Officer Identification */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <BadgeCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Section 1: Police Officer Credentials &amp; Jurisdiction
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Officer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Inspector K. Surya Rao"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Department Badge / General No. (Service ID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  placeholder="e.g. AP-POL-48210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Rank / Designation <span className="text-rose-400">*</span>
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="Sub-Inspector of Police (SI)">Sub-Inspector of Police (SI)</option>
                  <option value="Circle Inspector (CI)">Circle Inspector (CI)</option>
                  <option value="Deputy Superintendent of Police (DSP)">Deputy Superintendent of Police (DSP)</option>
                  <option value="Superintendent of Police (SP)">Superintendent of Police (SP)</option>
                  <option value="Crime Investigation Dept (CID) Officer">Crime Investigation Dept (CID) Officer</option>
                  <option value="Cybercrime Detective / Analyst">Cybercrime Detective / Analyst</option>
                  <option value="Station House Officer (SHO)">Station House Officer (SHO)</option>
                  <option value="Accredited Academic Police Liaison">Accredited Academic Police Liaison</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Police Station / Unit Jurisdiction <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  placeholder="e.g. Visakhapatnam City Central Law & Order PS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  District Jurisdiction <span className="text-rose-400">*</span>
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white max-h-32 overflow-y-auto space-y-1">
                  {districts.map((d) => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer hover:bg-slate-750 px-2 py-1 rounded transition">
                      <input
                        type="checkbox"
                        checked={selectedDistricts.includes(d)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDistricts([...selectedDistricts, d]);
                          else setSelectedDistricts(selectedDistricts.filter(sd => sd !== d));
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Contact Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98480 22334"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Valid Verification Proof */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Section 2: Verification Proof &amp; Legal Authorization
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ID Proof Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value as IdProofType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="POLICE_ID_CARD">Department Official Police ID Card</option>
                  <option value="COURT_ORDER">Judicial Court Order / Subpoena</option>
                  <option value="DEPT_MEMO">Official Department Authorization Memo</option>
                  <option value="OFFICIAL_WARRANT">Judicial Search &amp; Seizure Warrant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Document Reference / Card Registration No. <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  placeholder="e.g. AP-POL-ID-2018-9382"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Proof File Verification Token / Attachment Reference
                </label>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-dashed border-slate-700">
                  <UploadCloud className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs text-white font-mono block">
                      {idProofAttachment}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Validated department certificate / cryptographically signed document
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdProofAttachment(`verified_ap_police_proof_${Date.now()}.pdf`)}
                    className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
                  >
                    Refresh Token
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Requisition Context & Data Scope */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Section 3: Case / FIR Reference &amp; Requested Data Scope
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  FIR / Case Crime Reference Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  placeholder="e.g. Crime No. 248/2023 u/s 379 IPC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Urgency / Investigation Priority <span className="text-rose-400">*</span>
                </label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer font-bold"
                >
                  <option value="ROUTINE">Routine (Standard Police Analytical Assessment)</option>
                  <option value="HIGH_PRIORITY">High Priority (Charge Sheet &amp; Ongoing Probe)</option>
                  <option value="ACTIVE_INVESTIGATION_EMERGENCY">
                    Active Investigation Emergency (Immediate Response)
                  </option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Requested Law Enforcement Data Scope <span className="text-rose-400">*</span>
                </label>
                <select
                  value={requestedDataScope}
                  onChange={(e) => setRequestedDataScope(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer font-semibold"
                >
                  <option value="FULL_GIS_MAP_ACCESS">
                    Coordinate-Level Spatial Crime Map &amp; Real-time Marker Pins
                  </option>
                  <option value="DISTRICT_RAW_FIR_DATASET">
                    Granular District Crime Incidents (Filtered by Active PS Jurisdiction)
                  </option>
                  <option value="CRIME_HOTSPOT_COORDINATES">
                    Hotspot Risk Density Index (HRDI) Spatial Clusters &amp; Patrolling Directives
                  </option>
                  <option value="PREDICTIVE_ML_MODELS">
                    Multi-Model ML Inference Engine (Random Forest / Decision Tree)
                  </option>
                  <option value="ALL_OFFICIAL_DATA">
                    Comprehensive Police Investigator Clearance (All Modules Unlocked)
                  </option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Investigative Purpose &amp; Justification <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={purposeDescription}
                  onChange={(e) => setPurposeDescription(e.target.value)}
                  placeholder="Detail the official necessity for accessing restricted spatial/predictive crime intelligence..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Legal Statutory Oath */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="declaration"
                type="checkbox"
                checked={statutoryDeclaration}
                onChange={(e) => setStatutoryDeclaration(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="declaration" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
                <strong className="text-white">STATUTORY UNDERTAKING &amp; LEGAL OATH:</strong> I solemnly affirm under the Andhra Pradesh Police Code, Section 72 of the Information Technology Act 2000, and the Official Secrets Act that I am an authorized officer. I undertake that all intelligence obtained will strictly be utilized for lawful investigative purposes and not shared with unauthorized third parties.
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black tracking-wider uppercase transition shadow-xl shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting Official Requisition...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Formal Request to Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: MY SUBMITTED REQUESTS */}
      {activeTab === 'my-requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Your Official Data Requisition History</span>
            </h3>
            <span className="text-xs text-slate-400">
              {myRequests.length} applications recorded
            </span>
          </div>

          {loadingRequests ? (
            <LoadingSkeleton type="card" count={2} height="120px" />
          ) : myRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Requisitions Submitted Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Police officers and investigative personnel can submit formal data requests using the &quot;New Requisition&quot; tab above.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Create First Request</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                const isRejected = req.status === 'REJECTED';

                return (
                  <div
                    key={req._id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isApproved
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : isRejected
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{req.officerName}</span>
                          <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            {req.badgeNumber}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {req.rank} • {req.policeStation} ({(req.districts || []).join(', ') || (req as any).district})
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isRejected && <XCircle className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        <span>{req.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">FIR / Crime Ref:</span>
                        <span className="font-mono font-bold text-white">{req.firNumber}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">ID Proof:</span>
                        <span className="font-mono text-slate-200">
                          {req.idProofType.replace(/_/g, ' ')} ({req.idProofNumber})
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Requested Scope:</span>
                        <span className="font-semibold text-indigo-300">{req.requestedDataScope.replace(/_/g, ' ')}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Submitted:</span>
                        <span className="text-slate-300">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-750 text-xs text-slate-300">
                      <span className="font-bold text-slate-200 block mb-0.5">Investigative Justification:</span>
                      {req.purposeDescription}
                    </div>

                    {/* Admin Remarks if reviewed */}
                    {req.adminRemarks && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                        <span className="font-bold text-indigo-400 block mb-0.5">
                          Admin Review Notice:
                        </span>
                        <p className="text-slate-300">{req.adminRemarks}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
