import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  Clock,
  MapPin,
  Calendar,
  Layers,
  Copy,
  Check,
  Compass,
  BarChart3,
  Shield,
  Activity,
} from 'lucide-react';
import { mlApi, crimeApi } from '../api/endpoints';
import { IPredictionResult } from '../types';
import { getCategoryColor, getSeverityBadgeProps } from '../utils/colors';
import { getDayName, getMonthName, formatPercent, formatHour } from '../utils/formatters';

export const Predictions: React.FC = () => {
  // Input features state
  const [district, setDistrict] = useState('Alluri Sitharama Raju');
  const [year, setYear] = useState(2023);
  const [month, setMonth] = useState(9); // September as in user's prompt
  const [dayOfWeek, setDayOfWeek] = useState(0); // Sunday as in user's prompt
  const [hour, setHour] = useState(20); // 20:00 (PM)
  const [historicalCount, setHistoricalCount] = useState(15);
  const [modelType, setModelType] = useState<'RandomForest' | 'DecisionTree' | 'LogisticRegression'>(
    'RandomForest'
  );

  const [districts, setDistricts] = useState<string[]>([
    'Alluri Sitharama Raju',
    'Anakapalli',
    'Ananthapuramu',
    'Annamayya',
    'Bapatla',
    'Chittoor',
    'Dr.B.R.Ambedkar Konaseema',
    'East Godavari',
    'Eluru',
    'Guntakal Railway',
    'Guntur',
    'Kakinada',
    'Krishna',
    'Kurnool',
    'NTR',
    'Nandyal',
    'Palnadu',
    'Parvathipuram Manyam',
    'Prakasam',
    'Rajamahendravaram',
    'SPS Nellore',
    'Sri Sathya Sai',
    'Srikakulam',
    'Tirupathi',
    'Vijayawada Railway',
    'Visakhapatnam',
    'Vizianagaram',
    'West Godavari',
    'YSR',
  ]);

  const [prediction, setPrediction] = useState<IPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch official districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await crimeApi.getFilterOptions();
        if (res.data.districts && res.data.districts.length > 0) {
          const sorted = [...res.data.districts].sort();
          setDistricts(sorted);
          // Preserve current selection if valid
          setDistrict((prev) => (prev && sorted.includes(prev) ? prev : sorted[0]));
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    };
    fetchDistricts();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const modelName =
      modelType === 'RandomForest'
        ? 'Random Forest'
        : modelType === 'DecisionTree'
        ? 'Decision Tree'
        : 'Logistic Regression';

    try {
      const res = await mlApi.predict({
        district,
        year: Number(year),
        month: Number(month),
        dayOfWeek: Number(dayOfWeek),
        hour: Number(hour),
        historicalCount: Number(historicalCount),
        modelName,
      });

      // Normalize prediction object so inputFeatures is always present
      const predData = res.data || (res as any);
      if (predData) {
        if (!predData.inputFeatures) {
          predData.inputFeatures = {
            district,
            year: Number(year),
            month: Number(month),
            dayOfWeek: Number(dayOfWeek),
            hour: Number(hour),
            historicalCount: Number(historicalCount),
          };
        }
        if (!predData.modelVersion) {
          predData.modelVersion = '1.0';
        }
        setPrediction(predData);
      }
    } catch (err: any) {
      console.error('Prediction inference failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!prediction) return;
    const text = `AP Smart Crime Analysis - ML Inference Report\n` +
      `Model: ${prediction.modelName} (v${prediction.modelVersion || '1.0'})\n` +
      `Predicted Category: ${prediction.prediction}\n` +
      `Confidence: ${formatPercent(prediction.confidence)}\n` +
      `Location: ${prediction.inputFeatures?.district || district}\n` +
      `Temporal: Month ${prediction.inputFeatures?.month || month}, Day ${getDayName(prediction.inputFeatures?.dayOfWeek ?? dayOfWeek)} @ ${prediction.inputFeatures?.hour ?? hour}:00\n` +
      `Historical Area Baseline: ${prediction.inputFeatures?.historicalCount ?? historicalCount} incidents`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preset time helpers
  const setHourPreset = (h: number) => setHour(h);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
          Aggregate Machine Learning Predictive Insights
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Generate non-identifying spatial-temporal crime classification and probability distributions using trained ML classifiers
        </p>
      </div>

      {/* Ethical Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 shadow-md">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold block text-amber-300">
            Mandatory Academic Research &amp; Ethical Disclaimer
          </span>
          Predictions generated by this tool are aggregate statistical estimates based purely on historical geographic, temporal, and category trends. They are designed exclusively for academic research and educational evaluation. This system does not profile individuals, track suspects, or determine legal guilt or policing actions.
        </div>
      </div>

      {/* Main Grid: Form (Left) & Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Form (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Spatial-Temporal Feature Input</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">6 Features</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Model Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Machine Learning Algorithm
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'RandomForest', label: 'Random Forest', badge: 'Ensemble' },
                  { id: 'DecisionTree', label: 'Decision Tree', badge: 'Rule-Based' },
                  { id: 'LogisticRegression', label: 'Logistic Reg.', badge: 'Softmax' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelType(m.id as any)}
                    className={`py-2 px-2 rounded-xl text-center text-xs font-semibold border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      modelType === m.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className={`text-[9px] font-normal ${modelType === m.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* District & Year Selection Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Target District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Target Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {[2023, 2022, 2021, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y} {y <= 2023 ? '(Data)' : '(Forecast)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month & Day of Week Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Month of Year
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {getMonthName(idx + 1)} ({idx + 1})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      {getDayName(idx)} {idx === 0 || idx === 6 ? '• Weekend' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hour of Day Slider with Quick Presets */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Hour of Day (24-Hour)
                </label>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                  {formatHour(hour)} ({hour < 10 ? `0${hour}` : hour}:00)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>00:00 (Midnight)</span>
                <span>12:00 (Noon)</span>
                <span>23:00 (Late Night)</span>
              </div>
              {/* Quick Hour Chips */}
              <div className="flex gap-1.5 pt-1">
                {[
                  { label: 'Morning', h: 8 },
                  { label: 'Afternoon', h: 14 },
                  { label: 'Evening', h: 20 },
                  { label: 'Late Night', h: 2 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setHourPreset(preset.h)}
                    className={`flex-1 py-1 text-[10px] font-medium rounded-lg border transition cursor-pointer ${
                      hour === preset.h
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label} ({preset.h}h)
                  </button>
                ))}
              </div>
            </div>

            {/* Historical Incident Density Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Historical Area Baseline Volume
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    historicalCount > 30 ? 'bg-rose-500/20 text-rose-300' :
                    historicalCount > 15 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {historicalCount > 30 ? 'Dense Hotspot' : historicalCount > 15 ? 'Moderate Volume' : 'Low Baseline'}
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {historicalCount} recorded
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={historicalCount}
                onChange={(e) => setHistoricalCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Statistical Inference Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Statistical ML Inference</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & Distribution (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction ? (
            <>
              {/* Primary Prediction Result Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-800/60 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Primary Predicted Crime Category
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-3">
                      <span
                        className="inline-block w-4 h-4 rounded-full shrink-0 shadow-lg"
                        style={{ backgroundColor: getCategoryColor(prediction.prediction) }}
                      />
                      {prediction.prediction}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Evaluated using <span className="font-semibold text-white">{prediction.modelName}</span> (v{prediction.modelVersion || '1.0'})
                    </p>
                  </div>

                  {/* Confidence Pill & Copy Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-center sm:text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Model Confidence
                      </span>
                      <span className="text-2xl font-black text-indigo-400 block mt-0.5">
                        {formatPercent(prediction.confidence)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Copy Inference Summary"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copied ? 'Copied' : 'Export Report'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Target District</span>
                    <span className="font-semibold text-white truncate block">
                      {prediction.inputFeatures?.district || district}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Temporal Window</span>
                    <span className="font-semibold text-white block">
                      {getMonthName(prediction.inputFeatures?.month || month)}, {getDayName(prediction.inputFeatures?.dayOfWeek ?? dayOfWeek)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Hour of Day</span>
                    <span className="font-semibold text-white block">
                      {formatHour(prediction.inputFeatures?.hour ?? hour)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Baseline Volume</span>
                    <span className="font-semibold text-white block">
                      {prediction.inputFeatures?.historicalCount ?? historicalCount} incidents
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature Importance Attribution */}
              {prediction.featureImportance && Array.isArray(prediction.featureImportance) && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Feature Importance Attribution ($W_i$)
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Relative Influence Weight</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {prediction.featureImportance.slice(0, 6).map((item) => {
                      const weight = item.importance > 1 ? item.importance / 100 : item.importance;
                      const percent = Math.round(weight * 100);
                      return (
                        <div key={item.feature} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{item.feature}</span>
                            <span className="font-mono text-cyan-400 font-bold">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Class Probability Distribution */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Multi-Class Categorical Probability Distribution
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {prediction.probabilities?.length || 0} classes
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                  {prediction.probabilities?.map((p) => {
                    const color = getCategoryColor(p.category);
                    const probValue = p.probability > 1.0 ? p.probability : p.probability * 100;
                    const percent = Math.min(100, Math.max(0, Math.round(probValue)));
                    const isTop = p.category === prediction.prediction;

                    return (
                      <div key={p.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-semibold flex items-center gap-2 ${
                              isTop ? 'text-white font-bold' : 'text-slate-300'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {p.category}
                            {isTop && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Most Probable
                              </span>
                            )}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {formatPercent(p.probability)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center flex flex-col items-center justify-center min-h-[440px]">
              <div className="p-4 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-4">
                <BrainCircuit className="w-12 h-12 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-slate-200">Ready for Machine Learning Inference</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
                Select your target spatial district, time parameters, and algorithm on the left, then click <strong>Execute Statistical ML Inference</strong> to generate probability vectors and feature importance attributions.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Random Forest, Decision Tree &amp; Logistic Regression models active
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
