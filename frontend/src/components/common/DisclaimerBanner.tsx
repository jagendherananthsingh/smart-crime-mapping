import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-3.5 bg-brand-950/40 border border-brand-800/40 rounded-xl flex items-start gap-3 text-xs text-brand-200/90 ${className}`}
    >
      <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-brand-300">Academic & Statistical Disclaimer: </span>
        Predictions and hotspot metrics are statistical estimates derived from aggregate historical records and are intended exclusively for academic, research, and data science evaluation. They must not be used to make decisions about individual persons or to determine guilt, personal risk, or automated policing actions.
      </div>
    </div>
  );
};
