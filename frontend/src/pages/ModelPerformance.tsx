import React, { useState, useEffect } from 'react';
import {
  Award,
  RefreshCw,
  Zap,
  CheckCircle,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { mlApi } from '../api/endpoints';
import { ModelResult } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatPercent } from '../utils/formatters';

export const ModelPerformance: React.FC = () => {
  const [results, setResults] = useState<ModelResult[]>([]);
  const [bestModel, setBestModel] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);

  const fetchModelResults = async () => {
    try {
      setLoading(true);
      const res = await mlApi.getResults();
      const models: ModelResult[] = (res.data as any)?.models || (res.data as any)?.results || [];
      setResults(models);
      const bm = (res.data as any)?.bestModel || models[0]?.modelName || '';
      setBestModel(bm);
      setSelectedModel(bm || models[0]?.modelName || '');
    } catch (err) {
      console.error('Failed to fetch model results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelResults();
  }, []);

  const handleTrainAll = async () => {
    try {
      setTraining(true);
      setTrainStatus('Training Random Forest, Decision Tree & Logistic Regression models...');
      await mlApi.trainAll();
      setTrainStatus('Training completed! Refreshing benchmarks...');
      await fetchModelResults();
    } catch (err: any) {
      setTrainStatus(`Training error: ${err.message}`);
    } finally {
      setTraining(false);
      setTimeout(() => setTrainStatus(null), 4000);
    }
  };

  const currentResult = results.find((r) => r.modelName === selectedModel) || results[0];

  // Normalize featureImportance to Record<string, number>
  const featureImportanceMap: Record<string, number> = (() => {
    if (!currentResult?.featureImportance) return {};
    if (Array.isArray(currentResult.featureImportance)) {
      return Object.fromEntries(
        currentResult.featureImportance.map((f: any) => [f.feature, f.importance])
      );
    }
    return currentResult.featureImportance as Record<string, number>;
  })();

  // Normalize confusion matrix
  const cm = currentResult?.confusionMatrix;
  const cmClasses = cm?.classes || cm?.labels || [];
  const cmMatrix = cm?.matrix || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-indigo-400" />
            Machine Learning Benchmark & Evaluation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comparative metrics (Accuracy, Precision, Recall, Macro-F1) across trained classifiers
          </p>
        </div>

        <button
          type="button"
          onClick={handleTrainAll}
          disabled={training}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${training ? 'animate-spin' : ''}`} />
          {training ? 'Training...' : 'Retrain All Models'}
        </button>
      </div>

      {trainStatus && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{trainStatus}</span>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : results.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No Trained Models Found</p>
          <p className="text-xs text-slate-400">Click "Retrain All Models" to train the baseline classifiers.</p>
        </div>
      ) : (
        <>
          {/* Model Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((res) => {
              const isBest = res.modelName === bestModel;
              const isSelected = res.modelName === selectedModel;
              return (
                <div
                  key={res.modelName}
                  onClick={() => setSelectedModel(res.modelName)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-2xl ring-2 ring-indigo-500/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isBest && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Top Performing
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-base font-bold text-white">{res.modelName}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-4">
                    {res.modelName === 'RandomForest' || res.modelName === 'Random Forest'
                      ? 'Bagging Ensemble (Gini Feature Sampling)'
                      : res.modelName === 'DecisionTree' || res.modelName === 'Decision Tree'
                      ? 'CART Classifier (Gini Impurity Split)'
                      : 'Multinomial Softmax with L2 Regularization'}
                  </p>

                  <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                    {[
                      { label: 'Accuracy', value: res.accuracy },
                      { label: 'Macro Precision', value: res.precision },
                      { label: 'Macro Recall', value: res.recall },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-slate-400">{label}:</span>
                        <span className="font-mono font-bold text-slate-200">{formatPercent(value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Macro F1-Score:</span>
                      <span className="font-mono font-bold text-indigo-400 text-sm">{formatPercent(res.f1Score)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Training Latency:</span>
                      <span>{res.trainingTimeMs || 0} ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Importance + Confusion Matrix */}
          {currentResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Feature Importance */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Feature Importance Weights
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input dimension contribution — {selectedModel}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {Object.entries(featureImportanceMap)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([feat, weight]) => {
                      const w = weight as number;
                      return (
                        <div key={feat} className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-200 capitalize">
                              {feat.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-mono font-bold text-indigo-400">{formatPercent(w)}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                              style={{ width: `${Math.round(w * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(featureImportanceMap).length === 0 && (
                    <p className="text-xs text-slate-500 py-4 text-center">Feature importance unavailable for this model.</p>
                  )}
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Confusion Matrix — {selectedModel}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rows = Ground Truth • Columns = Predicted Classes
                  </p>
                </div>

                {cmMatrix.length > 0 && cmClasses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="text-[10px] border-collapse w-full">
                      <thead>
                        <tr>
                          <th className="p-1 text-slate-400 text-left">True↓ Pred→</th>
                          {cmClasses.map((cls: string) => (
                            <th key={cls} className="p-1 text-slate-300 font-semibold text-center truncate max-w-[60px]" title={cls}>
                              {cls.slice(0, 5)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cmMatrix.map((row: number[], rIdx: number) => (
                          <tr key={rIdx}>
                            <td className="p-1 text-slate-300 font-semibold truncate max-w-[60px]" title={cmClasses[rIdx]}>
                              {cmClasses[rIdx]?.slice(0, 5)}
                            </td>
                            {row.map((val: number, cIdx: number) => {
                              const isDiag = rIdx === cIdx;
                              return (
                                <td
                                  key={cIdx}
                                  title={`True: ${cmClasses[rIdx]}, Pred: ${cmClasses[cIdx]} = ${val}`}
                                  className={`p-1.5 text-center font-mono font-bold rounded transition ${
                                    isDiag && val > 0
                                      ? 'bg-indigo-600/80 text-white'
                                      : val > 0
                                      ? 'bg-rose-500/20 text-rose-300'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Confusion matrix will appear after model evaluation.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
