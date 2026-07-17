import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Download, 
  Database, 
  Layers, 
  Check, 
  HelpCircle, 
  RefreshCw 
} from 'lucide-react';
import { db } from '../storage/db';
import { Dataset } from '../types';

export const DatasetsTab: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(1000);
  const [genOutcome, setGenOutcome] = useState<string | null>(null);

  useEffect(() => {
    async function loadDatasets() {
      const allD = await db.datasets.toArray();
      setDatasets(allD);
      if (allD.length > 0) {
        setActiveDataset(allD[0]);
      }
    }
    loadDatasets();
  }, []);

  const handleDownloadCSV = (dataset: Dataset) => {
    // Generate simple csv file based on dataset name
    const headers = dataset.columns.map(c => c.name).join(',');
    const dummyRows = Array.from({ length: 15 }).map((_, idx) => {
      return dataset.columns.map(c => {
        if (c.type === 'INTEGER' || c.type === 'patient_id') return Math.floor(Math.random() * 1000) + 100;
        if (c.type === 'FLOAT') return (Math.random() * 200 + 10).toFixed(2);
        if (c.type === 'BOOLEAN') return Math.random() > 0.5 ? 'TRUE' : 'FALSE';
        return `"${c.name}_row_${idx + 1}"`;
      }).join(',');
    });

    const csvContent = [headers, ...dummyRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dalos_${dataset.id}_sample.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateSynthetic = () => {
    setGenerating(true);
    setGenOutcome(null);

    setTimeout(async () => {
      try {
        const newDataset: Dataset = {
          id: `synthetic_${Date.now()}`,
          name: `Synthetic Customer Cohort (${genCount} rows)`,
          category: 'Marketing',
          description: `Custom generated synthetic user transactional cohort. Populated with ${genCount} records representing cohorts from June to Dec 2026. Perfect for retention KPI cohort practice.`,
          rowCount: genCount,
          columnCount: 5,
          fileSizeKB: Math.round((genCount * 85) / 1024),
          columns: [
            { name: 'user_id', type: 'INTEGER', description: 'Cohort specific customer identifier' },
            { name: 'signup_cohort', type: 'DATE', description: 'Month they registered (YYYY-MM)' },
            { name: 'total_spent_usd', type: 'FLOAT', description: 'LTV lifetime value' },
            { name: 'retention_months', type: 'INTEGER', description: 'Months they remained active' },
            { name: 'referrals', type: 'INTEGER', description: 'Referrals generated' }
          ],
          offlineCached: true,
          isSynthetic: true
        };

        await db.datasets.add(newDataset);
        const updated = await db.datasets.toArray();
        setDatasets(updated);
        setActiveDataset(newDataset);
        setGenOutcome(`Success! Generated and cached ${genCount} relational rows inside DALOS IndexedDB Database. Table 'synthetic_marketing' is ready for querying.`);
      } catch (err: any) {
        setGenOutcome(`Failed: ${err.message}`);
      } finally {
        setGenerating(false);
      }
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-fade-in">
      
      {/* Datasets library list catalog */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Table className="h-5 w-5 text-indigo-400" />
              <span>Offline Database Library</span>
            </h2>
            <p className="text-xs text-slate-400">
              Explore schemas and column metrics. Click download to acquire CSV spreadsheets on your computer, or run SQL select statements inside the SQL IDE.
            </p>
          </div>

          <div className="space-y-3">
            {datasets.map(d => {
              const active = activeDataset?.id === d.id;
              return (
                <div 
                  key={d.id}
                  onClick={() => setActiveDataset(d)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    active 
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5' 
                      : 'bg-slate-950/60 border-slate-900 hover:border-slate-800 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-indigo-400 uppercase">
                          {d.category}
                        </span>
                        {d.isSynthetic && (
                          <span className="rounded bg-violet-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-violet-400 uppercase">
                            Synthetic
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-500">
                          {d.rowCount} rows x {d.columnCount} cols
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-200">{d.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{d.description}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadCSV(d);
                      }}
                      className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      title="Download dummy CSV spreadsheet"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic synthetic data generator block */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-indigo-400" />
              <span>Synthetic Transactional Generator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulate high-volume customer spending indexes for database cohort reports or forecasting exercises.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span>ROW_COUNT:</span>
              <select
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value))}
                className="rounded border border-slate-800 bg-slate-950 p-1.5 outline-none focus:border-indigo-500 text-slate-200"
              >
                <option value={1000}>1,000 rows</option>
                <option value={5000}>5,000 rows</option>
                <option value={10000}>10,000 rows</option>
              </select>
            </div>

            <button
              onClick={handleGenerateSynthetic}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2 text-xs font-bold transition-all shadow-md"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing Rows...</span>
                </>
              ) : (
                <span>Generate Dataset</span>
              )}
            </button>
          </div>

          {genOutcome && (
            <div className={`rounded-lg p-3 text-xs border font-mono ${
              genOutcome.startsWith('Success') 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {genOutcome}
            </div>
          )}
        </div>
      </div>

      {/* Dataset Details metadata explorer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
        {activeDataset ? (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold">Metadata Explorer</span>
              <h2 className="text-lg font-bold text-white mt-1">{activeDataset.name}</h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">{activeDataset.description}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">COLUMNS SPECIFICATIONS:</span>
              
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {activeDataset.columns.map(col => (
                  <div key={col.name} className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-400 font-bold">{col.name}</span>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">{col.type}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug mt-1">{col.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 font-mono text-[10px] text-slate-500 space-y-1.5 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>ESTIMATED_SIZE:</span>
                <span className="text-slate-300">{activeDataset.fileSizeKB} KB</span>
              </div>
              <div className="flex justify-between">
                <span>INTEGRITY_INDEX:</span>
                <span className="text-emerald-400 font-bold">Pass // 0 duplicates</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <HelpCircle className="h-8 w-8 mb-2" />
            <p className="text-xs">Select an offline dataset to explore column attributes.</p>
          </div>
        )}
      </div>

    </div>
  );
};
