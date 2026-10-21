export const CATEGORY_COLORS: Record<string, string> = {
  'Murder': '#ef4444',                    // Red
  'Rape': '#f43f5e',                      // Rose
  'Kidnapping (Women & Girls)': '#a855f7',// Purple
  'Kidnapping (Others)': '#8b5cf6',       // Violet
  'Dowry Deaths': '#ec4899',              // Pink
  'Molestation & Harassment': '#d946ef',  // Fuchsia
  'Dacoity': '#dc2626',                   // Dark Red
  'Robbery': '#f97316',                   // Orange
  'Burglary': '#3b82f6',                  // Blue
  'Theft': '#f59e0b',                     // Amber
  'Riots': '#14b8a6',                     // Teal
  'Cheatings': '#06b6d4',                 // Cyan
  'Other IPC Crimes': '#64748b',          // Slate
  'Other Crimes': '#84cc16',              // Lime
};

export const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string; badgeBg: string }> = {
  LOW: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    badgeBg: '#10b981',
  },
  MEDIUM: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
    badgeBg: '#f59e0b',
  },
  HIGH: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-500/30',
    badgeBg: '#f97316',
  },
  CRITICAL: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/30',
    badgeBg: '#ef4444',
  },
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || '#64748b';
};

export const getSeverityBadgeProps = (severity: string) => {
  return (
    SEVERITY_COLORS[severity?.toUpperCase()] || {
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-700 dark:text-slate-400',
      border: 'border-slate-500/30',
      badgeBg: '#64748b',
    }
  );
};
