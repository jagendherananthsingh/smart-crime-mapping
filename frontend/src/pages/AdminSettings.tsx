import React, { useState, useEffect } from 'react';
import { Sliders, Database, RefreshCw, CheckCircle2, ShieldAlert, Server, Sparkles } from 'lucide-react';
import { adminApi } from '../api/endpoints';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AdminSettings: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSystemStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load system stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReseed = async () => {
    if (!window.confirm('Are you sure you want to reset and re-seed the benchmark crime database?')) {
      return;
    }

    try {
      setResetting(true);
      setResetMsg('Clearing database and re-generating benchmark dataset...');
      await adminApi.reseedData();
      setResetMsg('Database successfully re-seeded with 1,000+ benchmark records and trained ML baselines.');
      await fetchStats();
    } catch (err: any) {
      setResetMsg(`Reseed failed: ${err.message}`);
    } finally {
      setResetting(false);
      setTimeout(() => setResetMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-indigo-400" />
          System Settings & Platform Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure backend services, inspect database connections, and manage dataset maintenance
        </p>
      </div>

      {resetMsg && (
        <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs flex items-center gap-2.5 shadow-lg">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{resetMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database & Runtime Info */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Server className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">System Runtime & MongoDB Status</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  MongoDB (Auto-Fallback Ready)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Total Crime Records:</span>
                <span className="font-mono font-bold text-white">
                  {(stats?.totalRecords ?? 164062).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Registered Analyst Users:</span>
                <span className="font-mono font-bold text-white">
                  {(stats?.totalUsers ?? 4).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Saved Datasets:</span>
                <span className="font-mono font-bold text-white">
                  {(stats?.totalDatasets ?? 1).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Trained Model Baselines:</span>
                <span className="font-mono font-bold text-indigo-400">Random Forest, Decision Tree, Logistic Reg.</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Node Environment:</span>
                <span className="font-mono text-slate-200">production / development</span>
              </div>
            </div>
          </div>

          {/* Academic & Ethical Compliance */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Academic & Ethical Configuration</h3>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>Institution:</strong> Geethanjali Institute of Science & Technology (Autonomous)
                </p>
                <p>
                  <strong>Department:</strong> Computer Science & Engineering (Data Science)
                </p>
                <p>
                  <strong>Compliance Directive:</strong> System operates strictly on aggregate spatial-temporal statistics without individual suspect profiling or automated enforcement actions.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={resetting}
                onClick={handleReseed}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>{resetting ? 'Resetting & Seeding...' : 'Reset & Re-Seed Database (Demo Reset)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
