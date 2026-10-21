import React from 'react';

interface ConfusionMatrixProps {
  labels: string[];
  matrix: number[][];
}

export const ConfusionMatrixHeatmap: React.FC<ConfusionMatrixProps> = ({ labels, matrix }) => {
  if (!matrix || matrix.length === 0 || !labels || labels.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/60 rounded-xl">
        No confusion matrix data available for this model.
      </div>
    );
  }

  // Calculate max value for color scaling
  let maxValue = 1;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < (matrix[r]?.length || 0); c++) {
      if (matrix[r][c] > maxValue) maxValue = matrix[r][c];
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="text-center text-xs font-semibold text-slate-400 mb-2">
          Predicted Crime Category &rarr;
        </div>

        <div className="flex items-center">
          {/* Vertical Actual Axis Label */}
          <div className="writing-mode-vertical -rotate-180 text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            &larr; Actual Category
          </div>

          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 text-slate-500 font-normal"></th>
                {labels.map((lbl, idx) => (
                  <th
                    key={`head-${idx}`}
                    className="p-2 text-[10px] font-semibold text-slate-300 max-w-[70px] truncate text-center"
                    title={lbl}
                  >
                    {lbl.length > 8 ? `${lbl.slice(0, 7)}.` : lbl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rIdx) => (
                <tr key={`row-${rIdx}`}>
                  <td
                    className="p-2 text-[10px] font-semibold text-slate-300 text-right pr-3 max-w-[80px] truncate"
                    title={labels[rIdx] || `Class ${rIdx}`}
                  >
                    {labels[rIdx] || `Class ${rIdx}`}
                  </td>
                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    const intensity = Math.min(1, val / maxValue);
                    const bgStyle = isDiagonal
                      ? `rgba(16, 185, 129, ${0.15 + intensity * 0.75})` // Greenish for TP
                      : val > 0
                      ? `rgba(244, 63, 94, ${0.1 + intensity * 0.6})` // Rose for errors
                      : 'rgba(30, 41, 59, 0.4)';

                    return (
                      <td
                        key={`cell-${rIdx}-${cIdx}`}
                        className="p-2 text-center font-mono border border-slate-800 transition-colors"
                        style={{ backgroundColor: bgStyle }}
                        title={`Actual: ${labels[rIdx]}, Predicted: ${labels[cIdx]} (${val} records)`}
                      >
                        <span
                          className={`font-medium ${
                            isDiagonal && val > 0 ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
