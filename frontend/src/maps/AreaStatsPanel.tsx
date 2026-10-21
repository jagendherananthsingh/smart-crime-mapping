import React from 'react';
import { Shield, MapPin, TrendingUp, AlertTriangle, X } from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

interface AreaStatsProps {
  districtName: string | null;
  stats: {
    district: string;
    totalIncidents: number;
    mostCommonCrime: string;
    mostCommonCrimeCount: number;
    categoryBreakdown: { category: string; count: number; percentage: number }[];
    severityBreakdown: { severity: string; count: number }[];
    topLocations: { location: string; count: number }[];
  } | null;
  isLoading: boolean;
  onClose: () => void;
}

export const AreaStatsPanel: React.FC<AreaStatsProps> = ({
  districtName,
  stats,
  isLoading,
  onClose,
}) => {
  if (!districtName) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-2xl flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg border border-brand-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{districtName}</h3>
            <p className="text-[11px] text-slate-400">Selected Area Deep-Dive</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : stats ? (
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Incidents</span>
              <p className="text-xl font-bold text-slate-100 mt-0.5">{stats.totalIncidents}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Most Common</span>
              <p className="text-sm font-bold text-brand-400 mt-1 truncate">{stats.mostCommonCrime}</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Category Distribution</h4>
            <div className="space-y-2">
              {stats.categoryBreakdown.slice(0, 5).map((cat) => (
                <div key={cat.category} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{cat.category}</span>
                    <span className="font-medium text-slate-400">{cat.count} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations within District */}
          {stats.topLocations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">High Activity Sectors</h4>
              <ul className="space-y-1.5">
                {stats.topLocations.map((loc, idx) => (
                  <li
                    key={loc.location}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300"
                  >
                    <span className="truncate pr-2">{loc.location}</span>
                    <span className="font-mono text-slate-400 shrink-0 font-medium">{loc.count} events</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-500">No data found for this district.</div>
      )}
    </div>
  );
};
