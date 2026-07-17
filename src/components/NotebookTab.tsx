import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  FileJson, 
  Eye, 
  Edit, 
  Code, 
  Database, 
  AlignLeft, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { db } from '../storage/db';
import { PythonRuntime } from '../python-runtime/pyodide-client';
import { SQLRuntime, SQLQueryResult } from '../sql-runtime/sql-client';
import { NotebookCell, NotebookState } from '../types';
import { LearningEngine } from '../learning-engine/engine';

export const NotebookTab: React.FC = () => {
  const [notebook, setNotebook] = useState<NotebookState | null>(null);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [runProgress, setRunProgress] = useState<Record<string, string>>({});
  const [variables, setVariables] = useState<Array<{ name: string; type: string; value: string }>>([]);
  const [selectedCellOutputTab, setSelectedCellOutputTab] = useState<Record<string, 'console' | 'table' | 'plan'>>({});

  useEffect(() => {
    async function loadNotebook() {
      const allNb = await db.notebooks.toArray();
      if (allNb.length > 0) {
        setNotebook(allNb[0]);
      }
    }
    loadNotebook();
  }, []);

  const saveNotebook = async (updated: NotebookState) => {
    setNotebook(updated);
    await db.notebooks.put(updated);
  };

  const handleAddCell = async (type: 'markdown' | 'python' | 'sql') => {
    if (!notebook) return;
    const newCell: NotebookCell = {
      id: `cell_${Date.now()}`,
      type,
      content: type === 'markdown' ? '### Double click to edit title\nThis is a standard text section.' :
               type === 'python' ? '# Write Python code here\nx = 150\ny = 300\nprint(x + y)' :
               'SELECT * FROM retail_sales LIMIT 5;',
    };
    const updated = {
      ...notebook,
      cells: [...notebook.cells, newCell],
      updatedAt: new Date().toISOString()
    };
    await saveNotebook(updated);
    setEditingCellId(newCell.id);
  };

  const handleDeleteCell = async (id: string) => {
    if (!notebook) return;
    const updated = {
      ...notebook,
      cells: notebook.cells.filter(c => c.id !== id),
      updatedAt: new Date().toISOString()
    };
    await saveNotebook(updated);
  };

  const handleCellContentChange = async (id: string, content: string) => {
    if (!notebook) return;
    const updated = {
      ...notebook,
      cells: notebook.cells.map(c => c.id === id ? { ...c, content } : c),
      updatedAt: new Date().toISOString()
    };
    await saveNotebook(updated);
  };

  const handleRunCell = async (cell: NotebookCell) => {
    if (!notebook) return;
    
    // Toggle running state
    setNotebook(prev => prev ? {
      ...prev,
      cells: prev.cells.map(c => c.id === cell.id ? { ...c, isRunning: true } : c)
    } : null);

    // Call Engine stat increment
    await LearningEngine.recordCodeRun();

    if (cell.type === 'python') {
      try {
        setRunProgress(prev => ({ ...prev, [cell.id]: 'Spinning up WASM...' }));
        const result = await PythonRuntime.runCode(cell.content, (msg) => {
          setRunProgress(prev => ({ ...prev, [cell.id]: msg }));
        });

        // Save outcomes
        const updated = {
          ...notebook,
          cells: notebook.cells.map(c => c.id === cell.id ? { 
            ...c, 
            output: result.stdout || `Script finished. Return: ${result.outputValue}`, 
            error: result.stderr,
            isRunning: false 
          } : c)
        };
        await saveNotebook(updated);
        setVariables(result.variables);
        
      } catch (err: any) {
        const updated = {
          ...notebook,
          cells: notebook.cells.map(c => c.id === cell.id ? { 
            ...c, 
            output: '', 
            error: err.message, 
            isRunning: false 
          } : c)
        };
        await saveNotebook(updated);
      }
    } else if (cell.type === 'sql') {
      try {
        const result = await SQLRuntime.runQuery(cell.content);
        
        let outputStr = '';
        if (result.error) {
          outputStr = `SQL compilation error: ${result.error}`;
        } else {
          outputStr = JSON.stringify({
            columns: result.columns,
            rows: result.rows,
            executionPlan: result.executionPlan
          });
        }

        const updated = {
          ...notebook,
          cells: notebook.cells.map(c => c.id === cell.id ? { 
            ...c, 
            output: outputStr, 
            error: result.error, 
            isRunning: false 
          } : c)
        };
        await saveNotebook(updated);
        
        // Default select 'table' visualizer
        setSelectedCellOutputTab(prev => ({ ...prev, [cell.id]: 'table' }));
        
      } catch (err: any) {
        const updated = {
          ...notebook,
          cells: notebook.cells.map(c => c.id === cell.id ? { 
            ...c, 
            output: '', 
            error: err.message, 
            isRunning: false 
          } : c)
        };
        await saveNotebook(updated);
      }
    } else {
      // Toggle off markdown run
      setNotebook(prev => prev ? {
        ...prev,
        cells: prev.cells.map(c => c.id === cell.id ? { ...c, isRunning: false } : c)
      } : null);
      setEditingCellId(null);
    }
  };

  const exportNotebook = () => {
    if (!notebook) return;
    const str = JSON.stringify(notebook, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook.title.toLowerCase().replace(/\s+/g, '_')}_notebook.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 animate-fade-in">
      
      {/* Interactive Cells List Section */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Notebook header information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              {notebook ? notebook.title : 'Notebook Sandbox'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Last saved: {notebook ? new Date(notebook.updatedAt).toLocaleTimeString() : 'N/A'} // Client-side IndexedDB Cache
            </p>
          </div>
          
          <button
            onClick={exportNotebook}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white px-3 py-2 text-xs font-mono text-indigo-400 transition-all shrink-0"
            title="Download full notebook as raw JSON"
          >
            <FileJson className="h-4 w-4" />
            <span>Export Notebook (.json)</span>
          </button>
        </div>

        {/* Dynamic Cells */}
        <div className="space-y-6">
          {notebook && notebook.cells.map((cell, index) => {
            const isEditing = editingCellId === cell.id;
            const isSQL = cell.type === 'sql';
            const isPython = cell.type === 'python';

            // Decode SQL output if successful
            let parsedSql: SQLQueryResult | null = null;
            if (isSQL && cell.output && !cell.error) {
              try {
                parsedSql = JSON.parse(cell.output);
              } catch {
                parsedSql = null;
              }
            }

            return (
              <div 
                key={cell.id}
                className="group relative rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 hover:border-slate-700 transition-all"
              >
                {/* Cell label marker */}
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">[{index + 1}]</span>
                    <span className={`uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isPython ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' :
                      isSQL ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {cell.type}
                    </span>
                  </div>

                  {/* Cell operations toolbar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunCell(cell)}
                      disabled={cell.isRunning}
                      className="flex items-center gap-1 rounded bg-indigo-600/10 border border-indigo-500/25 px-2 py-0.5 hover:bg-indigo-600 hover:text-white text-indigo-400 text-[10px] transition-colors"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>{cell.isRunning ? 'Running...' : 'Run'}</span>
                    </button>
                    {cell.type === 'markdown' && (
                      <button
                        onClick={() => setEditingCellId(isEditing ? null : cell.id)}
                        className="p-1 hover:text-white"
                      >
                        {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCell(cell.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Content Workspace */}
                {cell.type === 'markdown' && !isEditing ? (
                  // Markdown output view
                  <div 
                    onDoubleClick={() => setEditingCellId(cell.id)}
                    className="prose prose-invert max-w-none text-sm text-slate-200 p-2 rounded bg-slate-950/40 border border-transparent hover:border-slate-800/40 cursor-text"
                  >
                    <h3 className="text-base font-bold text-white">{cell.content.split('\n')[0].replace('## ', '').replace('### ', '')}</h3>
                    <p className="text-xs text-slate-300 mt-1">{cell.content.split('\n').slice(1).join('\n')}</p>
                  </div>
                ) : (
                  // Editor code text block
                  <textarea
                    value={cell.content}
                    onChange={(e) => handleCellContentChange(cell.id, e.target.value)}
                    rows={Math.max(2, cell.content.split('\n').length)}
                    className="w-full font-mono text-xs md:text-sm bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-y no-scrollbar"
                    placeholder={cell.type === 'markdown' ? '# Markdown Heading' : 'Write code here...'}
                  />
                )}

                {/* Run progress bar */}
                {cell.isRunning && (
                  <div className="mt-2 font-mono text-[10px] text-indigo-400 animate-pulse flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>{runProgress[cell.id] || 'Processing execution context...'}</span>
                  </div>
                )}

                {/* Outputs & Consoles */}
                {cell.output && !cell.isRunning && (
                  <div className="mt-4 border-t border-slate-800/80 pt-3">
                    
                    {/* SQL Table output selector header */}
                    {isSQL && parsedSql && (
                      <div className="flex gap-2 mb-2 font-mono text-[9px] uppercase">
                        <button 
                          onClick={() => setSelectedCellOutputTab(prev => ({ ...prev, [cell.id]: 'table' }))}
                          className={`px-2 py-0.5 rounded border ${selectedCellOutputTab[cell.id] === 'table' ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          Table Output
                        </button>
                        <button 
                          onClick={() => setSelectedCellOutputTab(prev => ({ ...prev, [cell.id]: 'plan' }))}
                          className={`px-2 py-0.5 rounded border ${selectedCellOutputTab[cell.id] === 'plan' ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          Execution Plan
                        </button>
                      </div>
                    )}

                    {/* Rendering SQL Data table output */}
                    {isSQL && parsedSql && selectedCellOutputTab[cell.id] === 'table' ? (
                      <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-60 no-scrollbar">
                        <table className="w-full font-mono text-xs text-left text-slate-300">
                          <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 sticky top-0 border-b border-slate-800">
                            <tr>
                              {parsedSql.columns.map(c => (
                                <th key={c} className="p-2 border-r border-slate-800">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/20">
                            {parsedSql.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-900/40">
                                {parsedSql!.columns.map(col => (
                                  <td key={col} className="p-2 border-r border-slate-800 truncate max-w-xs">{String(row[col] ?? 'NULL')}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : isSQL && parsedSql && selectedCellOutputTab[cell.id] === 'plan' ? (
                      // Render EXPLAIN Query Plan
                      <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 font-mono text-xs text-indigo-400 leading-relaxed">
                        <div className="text-[10px] uppercase text-slate-500 mb-1">AST Compiler Engine Pathway:</div>
                        {parsedSql.executionPlan}
                      </div>
                    ) : (
                      // Plain text console outputs
                      <pre className="rounded-lg bg-slate-950 p-3 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-60 no-scrollbar">
                        <code>{cell.output}</code>
                      </pre>
                    )}
                  </div>
                )}

                {/* Error Console block */}
                {cell.error && !cell.isRunning && (
                  <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 flex items-start gap-2 text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider">Compilation Error:</div>
                      <pre className="font-mono text-xs leading-relaxed mt-1 whitespace-pre-wrap">{cell.error}</pre>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Bottom add-cell tools bar */}
        <div className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-800 rounded-xl p-4">
          <span className="text-xs font-mono text-slate-500">Insert new notebook block:</span>
          <button
            onClick={() => handleAddCell('markdown')}
            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 font-medium transition-colors"
          >
            <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
            <span>Markdown</span>
          </button>
          <button
            onClick={() => handleAddCell('python')}
            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-indigo-300 font-medium transition-colors"
          >
            <Code className="h-3.5 w-3.5 text-indigo-400" />
            <span>Python Cell</span>
          </button>
          <button
            onClick={() => handleAddCell('sql')}
            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-amber-300 font-medium transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-amber-400" />
            <span>SQL Cell</span>
          </button>
        </div>

      </div>

      {/* Variables Explorer Sidebar */}
      <div className="space-y-6">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">WASM Variable Explorer</h3>
            <p className="text-[11px] text-slate-400">Extracted from local Python standard global variables index.</p>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {variables.length > 0 ? (
              variables.map(v => (
                <div key={v.name} className="flex justify-between items-center rounded-lg bg-slate-950 p-2.5 border border-slate-900 font-mono text-[11px]">
                  <div>
                    <span className="text-indigo-400 font-bold">{v.name}</span>
                    <span className="text-slate-500 text-[10px] ml-1.5">({v.type})</span>
                  </div>
                  <span className="text-slate-300 text-right truncate max-w-[100px]" title={v.value}>{v.value}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-[11px] font-mono">
                No active python variables registered. Run a python cell above.
              </div>
            )}
          </div>
        </div>

        {/* Database Quick Information Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 font-mono text-[10px] text-slate-400 space-y-3">
          <h4 className="text-white font-sans font-semibold text-xs">Offline Tables Schema</h4>
          <div className="space-y-1">
            <div className="font-bold text-slate-300">retail_sales</div>
            <div className="text-slate-500">transaction_id (str), product (str), category (str), quantity (int), price (float), timestamp (str)</div>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-300">healthcare_patients</div>
            <div className="text-slate-500">patient_id (int), age (int), department (str), diagnosis (str), admission_date (str), days_admitted (int), readmitted (bool)</div>
          </div>
        </div>

      </div>

    </div>
  );
};
