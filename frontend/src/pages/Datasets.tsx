import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Eye,
} from 'lucide-react';
import { datasetApi } from '../api/endpoints';
import { IDataset, IPreprocessingSummary } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Modal } from '../components/common/Modal';
import { formatDate, formatNumber } from '../utils/formatters';

export const Datasets: React.FC = () => {
  const [datasets, setDatasets] = useState<IDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<IPreprocessingSummary | null>(null);

  // Upload state
  const [datasetName, setDatasetName] = useState('');
  const [datasetDesc, setDatasetDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await datasetApi.getDatasets();
      setDatasets(res.data.datasets || []);
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!datasetName) {
        setDatasetName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please choose a CSV file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', datasetName || 'Custom Crime Dataset');
    formData.append('description', datasetDesc || 'Imported crime analysis records');

    try {
      await datasetApi.uploadDataset(formData);
      setUploadModalOpen(false);
      setSelectedFile(null);
      setDatasetName('');
      setDatasetDesc('');
      await fetchDatasets();
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || 'Upload and preprocessing failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const res = await datasetApi.downloadSample();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'benchmark-sample-crime-data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download sample CSV:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-400" />
            Dataset Management & Automated Preprocessing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Import historical crime CSV files, execute validation pipelines, and inspect data cleaning summaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download Benchmark CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New CSV</span>
          </button>
        </div>
      </div>

      {/* Datasets Table */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Repository Datasets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Dataset Name</th>
                  <th className="pb-3 px-3">Filename</th>
                  <th className="pb-3 px-3">Records</th>
                  <th className="pb-3 px-3">Uploaded By</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Date Added</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {datasets.map((dataset) => (
                  <tr key={dataset._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{dataset.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {dataset.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{dataset.filename}</td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">
                      {formatNumber(dataset.recordCount)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{dataset.uploadedBy}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {dataset.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{formatDate(dataset.createdAt)}</td>
                    <td className="py-3 px-3 text-right">
                      {dataset.preprocessingSummary && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSummary(dataset.preprocessingSummary!);
                            setSummaryModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Pipeline Report</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload & Ingest Crime Dataset (CSV)"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Dataset Name
            </label>
            <input
              type="text"
              required
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="e.g. Nellore Metropolitan Crime Survey 2024"
              className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={datasetDesc}
              onChange={(e) => setDatasetDesc(e.target.value)}
              placeholder="Brief context on source and scope..."
              className="w-full py-2 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Drag & Drop Box */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Select CSV File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/60 hover:bg-slate-950"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileSpreadsheet className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-white">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for automated cleaning
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-300">Click to browse or drop CSV file</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Supports headers: date, crime_category, latitude, longitude, district, severity...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Preprocessing & Ingesting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ingest & Clean Dataset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preprocessing Summary Report Modal */}
      <Modal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title="Automated Preprocessing & Data Cleaning Report"
      >
        {selectedSummary && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Original Rows</span>
                <span className="text-base font-black text-white">
                  {formatNumber(selectedSummary.originalRows)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Clean Rows</span>
                <span className="text-base font-black text-emerald-400">
                  {formatNumber(selectedSummary.cleanRows)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Duplicates</span>
                <span className="text-base font-black text-amber-400">
                  {formatNumber(selectedSummary.duplicateRows)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Invalid/Removed</span>
                <span className="text-base font-black text-rose-400">
                  {formatNumber(selectedSummary.removedRows)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-400 font-semibold">Date Coverage:</span>{' '}
                <span className="text-white font-mono">
                  {selectedSummary.dateRange?.start || 'N/A'} to{' '}
                  {selectedSummary.dateRange?.end || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Categories Detected ({selectedSummary.categoriesFound?.length || 0}):</span>{' '}
                <span className="text-indigo-300 font-medium">
                  {selectedSummary.categoriesFound?.join(', ') || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Districts Identified ({selectedSummary.districtsFound?.length || 0}):</span>{' '}
                <span className="text-slate-200">
                  {selectedSummary.districtsFound?.join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
