import React, { useState } from 'react';
import { 
  Play, 
  Terminal as TermIcon, 
  Layers, 
  RefreshCw, 
  Info, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { PythonRuntime } from '../python-runtime/pyodide-client';
import { LearningEngine } from '../learning-engine/engine';

export const PythonIDETab: React.FC = () => {
  const [code, setCode] = useState<string>(
    `# Write a Python script to analyze daily analyst tasks\ntasks_completed = [12, 15, 8, 22, 19]\ntarget_quota = 15\n\nabove_quota = [t for t in tasks_completed if t >= target_quota]\nprint("Days exceeding quota:", len(above_quota))\nprint("Average tasks solved:", sum(tasks_completed) / len(tasks_completed))`
  );
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Idle');
  const [variables, setVariables] = useState<Array<{ name: string; type: string; value: string }>>([]);
  const [packages, setPackages] = useState<Array<{ name: string; status: 'Installed' | 'Not Installed' }>>([
    { name: 'numpy', status: 'Installed' },
    { name: 'pandas', status: 'Installed' },
    { name: 'scipy', status: 'Not Installed' },
    { name: 'scikit-learn', status: 'Not Installed' }
  ]);

  const handleRun = async () => {
    setIsRunning(true);
    setError('');
    setOutput('');
    setStatusMsg('Spinning up environment...');
    
    // Track stats
    await LearningEngine.recordCodeRun();

    try {
      const result = await PythonRuntime.runCode(code, (msg) => {
        setStatusMsg(msg);
      });

      setOutput(result.stdout || `Script completed with return value: ${result.outputValue}`);
      setError(result.stderr);
      setVariables(result.variables);
      setStatusMsg('Execution Success');
    } catch (err: any) {
      setError(err.message);
      setStatusMsg('Compilation Failed');
    } finally {
      setIsRunning(false);
    }
  };

  const togglePackage = (pkgName: string) => {
    setPackages(prev => prev.map(p => {
      if (p.name === pkgName) {
        return { ...p, status: p.status === 'Installed' ? 'Not Installed' : 'Installed' };
      }
      return p;
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 animate-fade-in h-[calc(100vh-10rem)]">
      
      {/* Editor & Console Block */}
      <div className="lg:col-span-3 flex flex-col h-full gap-4">
        
        {/* Editor Wrapper */}
        <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <TermIcon className="h-4.5 w-4.5 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-200">main.py</span>
            </div>
            
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2 text-xs font-bold transition-all shadow-md"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRunning ? 'Running...' : 'Execute Script'}</span>
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-800/80 rounded-lg p-4 text-xs md:text-sm font-mono text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 resize-none leading-relaxed"
            placeholder="Write python code..."
          />
        </div>

        {/* Terminal/Console Output Log */}
        <div className="h-48 rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-slate-400">
              <div className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-indigo-400'}`} />
              <span>Output Console Logs</span>
            </div>
            <span className="font-mono text-[9px] text-slate-500">Status: {statusMsg}</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-xs leading-relaxed">
            {error ? (
              <div className="text-rose-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <pre className="whitespace-pre-wrap font-sans">{error}</pre>
              </div>
            ) : output ? (
              <pre className="text-slate-300 whitespace-pre-wrap">{output}</pre>
            ) : (
              <span className="text-slate-600 italic">No console logs output yet. Click Execute Script above to run python code.</span>
            )}
          </div>
        </div>

      </div>

      {/* Package manager and variable explorer sidebar */}
      <div className="flex flex-col gap-6 h-full">
        
        {/* Package manager card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Analytical Libraries</span>
          </h3>
          <p className="text-[10px] text-slate-400 mb-3 leading-snug">
            Import pre-compiled WebAssembly libraries inside Pyodide sandbox environment.
          </p>

          <div className="space-y-2">
            {packages.map(p => (
              <div key={p.name} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-900 text-xs font-mono">
                <span className="text-slate-300 font-bold">{p.name}</span>
                <button
                  onClick={() => togglePackage(p.name)}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-all ${
                    p.status === 'Installed' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {p.status}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global variables table */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-2">Scope variables</h3>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {variables.length > 0 ? (
              variables.map(v => (
                <div key={v.name} className="rounded-lg bg-slate-950 p-2 border border-slate-900/80 font-mono text-[10px] text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-indigo-400 font-bold">{v.name}</span>
                    <span className="text-slate-500">type: {v.type}</span>
                  </div>
                  <div className="text-slate-300 mt-1 truncate max-w-full font-bold">{v.value}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-[10px] leading-relaxed">
                <Info className="h-5 w-5 mx-auto text-slate-600 mb-1" />
                <span>No variables in local global dict namespace.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
