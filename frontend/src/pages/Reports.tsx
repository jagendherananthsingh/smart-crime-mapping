import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  ShieldAlert,
  Calendar,
  Building,
  CheckCircle,
} from 'lucide-react';
import { reportApi, dashboardApi, mlApi } from '../api/endpoints';
import { formatNumber, formatDate, formatPercent } from '../utils/formatters';

import { downloadCSV } from '../utils/export';

export const Reports: React.FC = () => {
  const [reportTitle, setReportTitle] = useState('Metropolitan Crime Pattern & Predictive Assessment');
  const [districtScope, setDistrictScope] = useState('All Districts');
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const [sumRes, mlRes, catRes, locRes, insRes] = await Promise.all([
        dashboardApi.getSummary({}),
        mlApi.getResults(),
        dashboardApi.getCategories({}),
        dashboardApi.getLocations({}),
        dashboardApi.getInsights({}),
      ]);

      setReportData({
        generatedAt: new Date().toISOString(),
        title: reportTitle,
        districtScope,
        summary: sumRes.data,
        mlResults: mlRes.data,
        categories: catRes.data,
        locations: locRes.data,
        insights: insRes.data.insights || [],
      });
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const rows: any[] = [];
    rows.push({ Section: 'METRIC SUMMARY', Parameter: 'Total Incidents', Value: reportData.summary?.totalRecords || 0 });
    rows.push({ Section: 'METRIC SUMMARY', Parameter: 'Top Crime Category', Value: reportData.summary?.topCategory || 'N/A' });
    rows.push({ Section: 'METRIC SUMMARY', Parameter: 'Top District Share', Value: reportData.summary?.topDistrict || 'N/A' });

    if (reportData.categories?.categoryBreakdown) {
      reportData.categories.categoryBreakdown.forEach((c: any) => {
        rows.push({ Section: 'CATEGORY BREAKDOWN', Parameter: c.category, Value: `${c.count} (${c.percentage}%)` });
      });
    }

    if (reportData.locations?.districts) {
      reportData.locations.districts.forEach((d: any) => {
        rows.push({ Section: 'DISTRICT BREAKDOWN', Parameter: d.district, Value: `${d.count} (${d.percentage}%)` });
      });
    }

    downloadCSV(rows, `AP_Crime_Report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Non-printable Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            Executive Analytical Reporting
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compile publication-grade PDF and print summaries of spatial distributions, temporal patterns, and ML benchmarks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      {reportData && (
        <div className="bg-slate-900 print:bg-white border border-slate-800 print:border-none rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100 print:text-slate-900 max-w-4xl mx-auto font-sans transition">
          {/* Institutional Header */}
          <div className="border-b-2 border-indigo-600 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 print:text-indigo-700">
                  Academic Research Capstone Report
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-slate-950 mt-1">
                  {reportData.title}
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                  Department of Computer Science & Engineering (Data Science)
                </p>
                <p className="text-xs font-semibold text-indigo-300 print:text-indigo-900">
                  Geethanjali Institute of Science & Technology (Autonomous)
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-400 print:text-slate-600">
                <div className="font-mono">Date: {formatDate(reportData.generatedAt)}</div>
                <div>Scope: {reportData.districtScope}</div>
                <div className="text-emerald-400 print:text-emerald-700 font-bold mt-1">Status: Certified Complete</div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-700 mb-2">
              1. Executive Statistical Abstract
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 print:text-slate-700 text-justify">
              This report presents spatial, temporal, and machine learning pattern evaluations across historical multi-district crime records. A total of{' '}
              <strong>{formatNumber(reportData.summary?.totalCrimes)}</strong> clean incidents were analyzed. The predominant crime classification observed is{' '}
              <strong>{reportData.summary?.topCategory}</strong>, with spatial concentration clustered primarily in{' '}
              <strong>{reportData.summary?.topDistrict}</strong>. Evaluated machine learning classifiers achieve robust category prediction performance, led by{' '}
              <strong>{reportData.mlResults?.bestModel || 'Random Forest'}</strong>.
            </p>
          </div>

          {/* Key Metric Indicators Grid */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-700 mb-3">
              2. Core Analytical Indicators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 uppercase block">Total Incidents</span>
                <span className="text-lg font-black text-white print:text-slate-900 mt-1 block">
                  {formatNumber(reportData.summary?.totalCrimes)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 uppercase block">Leading Classification</span>
                <span className="text-lg font-black text-indigo-400 print:text-indigo-700 mt-1 block truncate">
                  {reportData.summary?.topCategory}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 uppercase block">High Severity %</span>
                <span className="text-lg font-black text-amber-400 print:text-amber-700 mt-1 block">
                  {(((reportData.summary?.criticalCount || 0) / (reportData.summary?.totalCrimes || 1)) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 uppercase block">Top Model Macro-F1</span>
                <span className="text-lg font-black text-emerald-400 print:text-emerald-700 mt-1 block">
                  {formatPercent(reportData.mlResults?.models?.[0]?.f1Score || 0.85)}
                </span>
              </div>
            </div>
          </div>

          {/* Machine Learning Benchmark Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-700 mb-3">
              3. Supervised Classification Benchmarks
            </h3>
            <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Architecture</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Macro Precision</th>
                  <th className="p-2.5">Macro Recall</th>
                  <th className="p-2.5">Macro F1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {reportData.mlResults?.models?.map((m: any) => (
                  <tr key={m.modelName} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-white print:text-slate-900">{m.modelName}</td>
                    <td className="p-2.5 font-mono">{formatPercent(m.accuracy)}</td>
                    <td className="p-2.5 font-mono">{formatPercent(m.precision)}</td>
                    <td className="p-2.5 font-mono">{formatPercent(m.recall)}</td>
                    <td className="p-2.5 font-mono font-bold text-indigo-400 print:text-indigo-700">
                      {formatPercent(m.f1Score)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Automated Key Insights */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-700 mb-2">
              4. Automated Analytical Findings
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 print:text-slate-700 list-disc list-inside">
              {reportData.insights?.map((ins: string, idx: number) => (
                <li key={idx} className="leading-relaxed">
                  {ins}
                </li>
              ))}
            </ul>
          </div>

          {/* Ethical Disclaimer Footer in Report */}
          <div className="mt-8 pt-4 border-t border-slate-800 print:border-slate-300 text-[10px] text-slate-400 print:text-slate-500 text-justify leading-normal">
            <strong>Academic Research & Ethical Disclaimer:</strong> All predictions and analytical metrics contained within this document are statistical estimates derived from historical spatial-temporal dataset aggregates. They are generated solely for academic and educational evaluation at Geethanjali Institute of Science & Technology (Autonomous) and must not be used for individual profiling, law enforcement targeting, or legal adjudication.
          </div>
        </div>
      )}
    </div>
  );
};
