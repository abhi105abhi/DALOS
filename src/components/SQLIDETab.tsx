import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  FileSpreadsheet, 
  Eye, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SQLRuntime, SQLQueryResult } from '../sql-runtime/sql-client';
import { LearningEngine } from '../learning-engine/engine';

export const SQLIDETab: React.FC = () => {
  const [query, setQuery] = useState<string>(
    `SELECT category, SUM(quantity * price) as total_sales, COUNT(*) as txn_count\nFROM retail_sales\nGROUP BY category\nORDER BY total_sales DESC;`
  );
  const [result, setResult] = useState<SQLQueryResult | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'results' | 'explain'>('results');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<'retail_sales' | 'healthcare_patients' | 'finance_churn'>('retail_sales');

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    
    // Call engine stats
    await LearningEngine.recordCodeRun();

    setTimeout(async () => {
      try {
        const queryRes = await SQLRuntime.runQuery(query);
        setResult(queryRes);
        setActiveOutputTab(queryRes.error ? 'results' : 'results');
      } catch (err: any) {
        setResult({
          columns: [],
          rows: [],
          rowCount: 0,
          executionPlan: '',
          error: err.message
        });
      } finally {
        setIsRunning(false);
      }
    }, 400); // add subtle execution loading latency for high fidelity!
  };

  const handleExportCSV = () => {
    if (!result || result.rows.length === 0) return;
    
    // Compile CSV string
    const headers = result.columns.join(',');
    const rows = result.rows.map(row => {
      return result.columns.map(col => `"${String(row[col] ?? 'NULL')}"`).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql_query_output_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SCHEMAS = {
    retail_sales: [
      { name: 'transaction_id', type: 'VARCHAR', desc: 'Primary transactional reference identifier' },
      { name: 'product', type: 'VARCHAR', desc: 'Hardware product description label' },
      { name: 'category', type: 'VARCHAR', desc: 'E-commerce inventory segment index' },
      { name: 'quantity', type: 'INTEGER', desc: 'Volume of inventory items selected' },
      { name: 'price', type: 'FLOAT', desc: 'Individual item value in USD' },
      { name: 'timestamp', type: 'TIMESTAMP', desc: 'Exact billing database record log timestamp' }
    ],
    healthcare_patients: [
      { name: 'patient_id', type: 'INTEGER', desc: 'Anonymized medical admittance index key' },
      { name: 'age', type: 'INTEGER', desc: 'Age of patient' },
      { name: 'department', type: 'VARCHAR', desc: 'Internal clinic division' },
      { name: 'diagnosis', type: 'VARCHAR', desc: 'Diagnostic class log' },
      { name: 'admission_date', type: 'DATE', desc: 'Date of admittence' },
      { name: 'days_admitted', type: 'INTEGER', desc: 'Stay scale (length in days)' },
      { name: 'readmitted', type: 'BOOLEAN', desc: 'Flag indicating return within 30 days' }
    ],
    finance_churn: [
      { name: 'customer_id', type: 'VARCHAR', desc: 'Anonymized identity label key' },
      { name: 'credit_score', type: 'INTEGER', desc: 'FICO credit score indexing scale' },
      { name: 'balance', type: 'FLOAT', desc: 'Aggregate currency deposits in USD' },
      { name: 'tenure_months', type: 'INTEGER', desc: 'Span of active customer status' },
      { name: 'active_member', type: 'BOOLEAN', desc: 'Engagement flag parameter' },
      { name: 'churned', type: 'BOOLEAN', desc: 'Whether customer closed balance' }
    ]
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 animate-fade-in h-[calc(100vh-10rem)]">
      
      {/* Schema Browser sidebar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col h-full overflow-hidden">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5 shrink-0">
          <Database className="h-4.5 w-4.5 text-indigo-400" />
          <span>Table Schema Browser</span>
        </h3>
        
        {/* Table Selector tab strip */}
        <div className="grid grid-cols-3 gap-1 mb-4 shrink-0 font-mono text-[9px]">
          {['retail_sales', 'healthcare_patients', 'finance_churn'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedSchemaTable(t as any)}
              className={`py-1.5 px-1 rounded truncate text-center font-bold ${
                selectedSchemaTable === t 
                  ? 'bg-indigo-600/10 border border-indigo-500/35 text-indigo-400' 
                  : 'bg-slate-950 border border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.split('_')[0]}
            </button>
          ))}
        </div>

        {/* Column fields */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          <div className="font-mono text-[10px] text-slate-500 font-bold tracking-wider uppercase">
            COLUMNS FOR: {selectedSchemaTable.toUpperCase()}
          </div>
          
          <div className="space-y-2">
            {SCHEMAS[selectedSchemaTable].map(col => (
              <div key={col.name} className="p-2 rounded-lg bg-slate-950 border border-slate-900 font-mono text-[11px] hover:border-slate-800 transition-colors">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300 font-bold">{col.name}</span>
                  <span className="text-slate-500 text-[9px] uppercase">{col.type}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-[9px] text-slate-500 shrink-0 space-y-1">
          <div className="flex justify-between"><span>ENGINE:</span> <span className="text-indigo-400">DuckDB Core WASM</span></div>
          <div className="flex justify-between"><span>ROWS CACHED:</span> <span className="text-emerald-400">Local-First (Online/Offline)</span></div>
        </div>
      </div>

      {/* Compiler & Results block */}
      <div className="lg:col-span-3 flex flex-col h-full gap-4">
        
        {/* Query Editor container */}
        <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-200">query_console.sql</span>
            </div>
            
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2 text-xs font-bold transition-all shadow-md"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRunning ? 'Compiling...' : 'Run Query'}</span>
            </button>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-800/80 rounded-lg p-4 text-xs md:text-sm font-mono text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 resize-none leading-relaxed"
            placeholder="SELECT * FROM table..."
          />
        </div>

        {/* Results Visualizer block */}
        <div className="h-64 rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            
            {/* Tab selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveOutputTab('results')}
                className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border transition-colors ${
                  activeOutputTab === 'results' 
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold' 
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Output Results
              </button>
              <button
                onClick={() => setActiveOutputTab('explain')}
                className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border transition-colors ${
                  activeOutputTab === 'explain' 
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold' 
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Explain Query Plan
              </button>
            </div>

            {/* CSV Exporter trigger */}
            {result && result.rows.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 hover:text-white rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 transition-colors"
                title="Download rows to local computer as CSV spreadsheet"
              >
                <Eye className="h-3 w-3" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {/* Tab content area */}
          <div className="flex-1 overflow-auto no-scrollbar font-mono text-xs leading-relaxed">
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 animate-pulse">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
                <span className="text-[10px]">Evaluating AST indices on DuckDB...</span>
              </div>
            ) : result ? (
              result.error ? (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/15 p-3 text-rose-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap font-sans text-xs">{result.error}</pre>
                </div>
              ) : activeOutputTab === 'explain' ? (
                // EXPLAIN execution output
                <div className="space-y-2 py-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">Calculated compiler pathways:</div>
                  <pre className="text-indigo-400 font-bold border border-indigo-500/10 bg-indigo-500/5 p-3 rounded-lg leading-relaxed">{result.executionPlan}</pre>
                  <p className="text-[10px] font-sans text-slate-400 leading-normal">
                    The local SQL compiler processes the WHERE conditions prior to executing the GROUP BY aggregation. Aggregated values are subsequently processed under ORDER BY sort bounds.
                  </p>
                </div>
              ) : (
                // Table output rows grid
                result.rows.length > 0 ? (
                  <div className="rounded-lg border border-slate-800 overflow-x-auto">
                    <table className="w-full text-left text-slate-300">
                      <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase tracking-wide border-b border-slate-800">
                        <tr>
                          {result.columns.map(c => (
                            <th key={c} className="p-2 border-r border-slate-800">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {result.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/20">
                            {result!.columns.map(col => (
                              <td key={col} className="p-2 border-r border-slate-800 truncate max-w-xs">{String(row[col] ?? 'NULL')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-slate-500 italic py-6">Query succeeded but returned 0 rows matching filter conditions.</div>
                )
              )
            ) : (
              <span className="text-slate-600 italic">No query output available. Type a SELECT statement above and click Run Query.</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
