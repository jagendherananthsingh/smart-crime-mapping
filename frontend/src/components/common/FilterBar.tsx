import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { FilterState, CrimeCategory, CrimeSeverity } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset?: () => void;
  showSearch?: boolean;
  districts?: string[];
  categories?: string[];
  years?: number[];
}

const DEFAULT_CATEGORIES: CrimeCategory[] = [
  'Murder', 'Rape', 'Kidnapping (Women & Girls)', 'Kidnapping (Others)',
  'Dowry Deaths', 'Molestation & Harassment', 'Dacoity', 'Robbery',
  'Burglary', 'Theft', 'Riots', 'Cheatings', 'Other IPC Crimes', 'Other Crimes',
];

const SEVERITIES: CrimeSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  showSearch = false,
  districts = [],
  categories = [],
  years = [2023, 2022, 2021],
}) => {
  const handleChange = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value === 'ALL' || value === '' ? undefined : value,
    });
  };

  const handleReset = () => {
    onFilterChange({});
    if (onReset) onReset();
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && v !== 'ALL'
  );

  const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const activeYears = years.length > 0 ? years : [2023, 2022, 2021];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 pr-2 border-r border-slate-700/60 shrink-0">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filters</span>
        </div>

        {/* Category Dropdown */}
        <select
          value={filters.crimeCategory || 'ALL'}
          onChange={(e) => handleChange('crimeCategory', e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {activeCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* District Dropdown */}
        {districts.length > 0 && (
          <select
            value={filters.district || 'ALL'}
            onChange={(e) => handleChange('district', e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        )}

        {/* Severity Dropdown */}
        <select
          value={filters.severity || 'ALL'}
          onChange={(e) => handleChange('severity', e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
        >
          <option value="ALL">All Severities</option>
          {SEVERITIES.map((sev) => (
            <option key={sev} value={sev}>{sev}</option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={filters.year || 'ALL'}
          onChange={(e) => handleChange('year', e.target.value === 'ALL' ? undefined as any : Number(e.target.value))}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
        >
          <option value="ALL">All Years</option>
          {activeYears.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
