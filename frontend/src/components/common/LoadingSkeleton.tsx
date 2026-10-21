import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  count?: number;
  height?: string;
  className?: string;
  type?: 'card' | 'chart' | 'list' | 'default';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows,
  count,
  height,
  className = '',
  type = 'default',
}) => {
  const numItems = count || rows || 4;

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: numItems }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse">
            <div className="flex justify-between items-center mb-3">
              <div className="h-3 bg-slate-800 rounded w-2/3" />
              <div className="w-8 h-8 bg-slate-800 rounded-xl" />
            </div>
            <div className="h-8 bg-slate-800 rounded w-3/4 mb-2" />
            <div className="h-2.5 bg-slate-800/60 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div
        className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse ${className}`}
        style={height ? { height } : {}}
      >
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
        <div className="h-3 bg-slate-800/60 rounded w-1/4 mb-6" />
        <div className={`bg-slate-800/40 rounded-xl w-full ${height ? '' : 'h-64'}`} style={height ? { height: `calc(${height} - 80px)` } : {}} />
      </div>
    );
  }

  // Default list skeleton
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: numItems }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-slate-800/60 rounded-lg ${height || 'h-6'} ${idx % 2 === 0 ? 'w-full' : 'w-4/5'}`}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return <LoadingSkeleton type="card" count={count} />;
};
