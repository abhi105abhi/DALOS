import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  BookmarkCheck,
  Terminal, 
  Play, 
  Layers, 
  HelpCircle, 
  AlertCircle, 
  Cpu, 
  History,
  FileText
} from 'lucide-react';
import { LIBRARY_DOCS, DocItem } from '../data/documentationData';
import { PythonRuntime } from '../python-runtime/pyodide-client';
import { SQLRuntime } from '../sql-runtime/sql-client';
import { LearningEngine } from '../learning-engine/engine';

interface DocumentationTabProps {
  initialDocId?: string | null;
}

export const DocumentationTab: React.FC<DocumentationTabProps> = ({ initialDocId }) => {
  const [selectedLibrary, setSelectedLibrary] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDoc, setActiveDoc] = useState<DocItem>(LIBRARY_DOCS[0]);
  
  // Sync deep link from search
  useEffect(() => {
    if (initialDocId) {
      const matched = LIBRARY_DOCS.find(doc => doc.id === initialDocId);
      if (matched) {
        setActiveDoc(matched);
        setSelectedLibrary('All'); // Reset active filters
      }
    }
  }, [initialDocId]);
  
  // Sandbox state
  const [editableCode, setEditableCode] = useState<string>(LIBRARY_DOCS[0].exampleCode);
  const [sandboxOutput, setSandboxOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sandboxError, setSandboxError] = useState<string>('');

  // Bookmarks & Notes persistence state
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [userNote, setUserNote] = useState<string>('');

  useEffect(() => {
    // Load Bookmarks
    const savedBookmarks = localStorage.getItem('dalos_doc_bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Update notes & code when active doc changes
  useEffect(() => {
    setEditableCode(activeDoc.exampleCode);
    setSandboxOutput('');
    setSandboxError('');
    
    const savedNotes = localStorage.getItem(`dalos_doc_note_${activeDoc.id}`);
    setUserNote(savedNotes || '');
  }, [activeDoc]);

  const handleToggleBookmark = () => {
    let updated: string[];
    if (bookmarks.includes(activeDoc.id)) {
      updated = bookmarks.filter(id => id !== activeDoc.id);
    } else {
      updated = [...bookmarks, activeDoc.id];
    }
    setBookmarks(updated);
    localStorage.setItem('dalos_doc_bookmarks', JSON.stringify(updated));
  };

  const handleSaveNote = (text: string) => {
    setUserNote(text);
    localStorage.setItem(`dalos_doc_note_${activeDoc.id}`, text);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setSandboxOutput('');
    setSandboxError('');
    
    await LearningEngine.recordCodeRun();

    try {
      if (activeDoc.library === 'SQL') {
        const queryResult = await SQLRuntime.runQuery(editableCode);
        if (queryResult.error) {
          setSandboxError(queryResult.error);
        } else {
          // Format SQL output beautifully
          const headers = queryResult.columns.join(' | ');
          const rows = queryResult.rows.map(r => {
            return queryResult.columns.map(c => String(r[c] ?? 'NULL')).join(' | ');
          }).join('\n');
          setSandboxOutput(`Execution Plan: ${queryResult.executionPlan}\n\n${headers}\n${'-'.repeat(headers.length)}\n${rows}`);
        }
      } else {
        // Run Python
        const pyResult = await PythonRuntime.runCode(editableCode);
        if (pyResult.stderr) {
          setSandboxError(pyResult.stderr);
        } else {
          setSandboxOutput(pyResult.stdout || pyResult.outputValue || 'Script completed with no output.');
        }
      }
    } catch (err: any) {
      setSandboxError(err.message || 'Execution error.');
    } finally {
      setIsRunning(false);
    }
  };

  // Filter items
  const filteredDocs = LIBRARY_DOCS.filter(doc => {
    const matchesLib = selectedLibrary === 'All' || doc.library === selectedLibrary;
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.library.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.relatedTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLib && matchesSearch;
  });

  const LIBRARIES = ['All', 'Python', 'NumPy', 'Pandas', 'Polars', 'DuckDB', 'PyArrow', 'SciPy', 'Statsmodels', 'Matplotlib', 'Seaborn', 'Plotly', 'SQL'];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 animate-fade-in h-[calc(100vh-10rem)]">
      
      {/* Index list column sidebar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col h-full overflow-hidden">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5 shrink-0">
          <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
          <span>API Reference Docs</span>
        </h3>

        {/* Quick Search */}
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search API methods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 font-mono text-[11px] text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Library Filter tabs row */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-3 shrink-0 no-scrollbar border-b border-slate-800/60 text-[9px] font-mono">
          {LIBRARIES.map(lib => (
            <button
              key={lib}
              onClick={() => setSelectedLibrary(lib)}
              className={`px-2 py-1 rounded shrink-0 font-bold ${
                selectedLibrary === lib 
                  ? 'bg-indigo-600/10 border border-indigo-500/35 text-indigo-400' 
                  : 'bg-slate-950 border border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {lib}
            </button>
          ))}
        </div>

        {/* APIs Listing */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => {
              const isActive = activeDoc.id === doc.id;
              const isBookmarked = bookmarks.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                    isActive 
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300' 
                      : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[8px] uppercase font-mono font-bold bg-slate-900 px-1 py-0.5 rounded text-slate-500">
                        {doc.library}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold truncate">{doc.name}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-normal">{doc.purpose}</p>
                  </div>
                  {isBookmarked && (
                    <Bookmark className="h-3.5 w-3.5 text-indigo-400 fill-current shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 font-mono text-xs text-slate-500">No matching APIs found.</div>
          )}
        </div>
      </div>

      {/* API specification viewer block */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
        
        {/* Left Side: Documentation Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col h-full overflow-y-auto no-scrollbar gap-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                  {activeDoc.library} API PAGE
                </span>
                {bookmarks.includes(activeDoc.id) && (
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400 uppercase">
                    Bookmarked
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5 font-mono">{activeDoc.name}</h2>
            </div>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg border transition-colors ${
                bookmarks.includes(activeDoc.id)
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
              }`}
              title="Toggle API Bookmark"
            >
              {bookmarks.includes(activeDoc.id) ? (
                <BookmarkCheck className="h-4.5 w-4.5" />
              ) : (
                <Bookmark className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          {/* Description Purpose */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">PURPOSE</span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{activeDoc.purpose}</p>
          </div>

          {/* Syntax Code-box */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">SYNTAX</span>
            <pre className="rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-indigo-400 overflow-x-auto leading-normal">
              <code>{activeDoc.syntax}</code>
            </pre>
          </div>

          {/* Parameters specifications */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">PARAMETERS</span>
            <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2 w-1/4">Name</th>
                    <th className="p-2 w-1/4">Type</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/20 text-[11px] text-slate-300">
                  {activeDoc.parameters.map((param, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40">
                      <td className="p-2 font-bold text-indigo-300">{param.name}</td>
                      <td className="p-2 text-slate-500 font-bold uppercase">{param.type}</td>
                      <td className="p-2 leading-relaxed text-slate-400">{param.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Return Value */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">RETURN VALUE</span>
            <p className="text-xs text-slate-300 font-mono font-bold">{activeDoc.returnValue}</p>
          </div>

          {/* Under the Hood / Complexity */}
          <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">PERFORMANCE & SCALABILITY</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{activeDoc.performance}</p>
          </div>

          {/* Related topics */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {activeDoc.relatedTopics.map(tag => (
              <span key={tag} className="rounded bg-slate-950 px-2 py-0.5 border border-slate-900 font-mono text-[9px] text-slate-500 font-bold">
                #{tag}
              </span>
            ))}
          </div>

        </div>

        {/* Right Side: Interactive Sandbox & Notes */}
        <div className="flex flex-col h-full gap-4">
          
          {/* Live sandbox editor card */}
          <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/30 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-4.5 w-4.5 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-200">Interactive API Playground</span>
              </div>
              
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-1.5 text-[11px] font-bold transition-all shadow"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>{isRunning ? 'Compiling...' : 'Run in Sandbox'}</span>
              </button>
            </div>

            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-100 outline-none focus:border-indigo-500 resize-none leading-relaxed"
              placeholder="Type API example code to run..."
            />

            {/* Sandbox Output Console */}
            <div className="h-36 rounded-lg bg-slate-950 border border-slate-900 p-3 mt-3 overflow-y-auto no-scrollbar font-mono text-[11px] leading-relaxed">
              {sandboxError ? (
                <div className="text-rose-400 flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap">{sandboxError}</pre>
                </div>
              ) : sandboxOutput ? (
                <pre className="text-emerald-400 whitespace-pre-wrap">{sandboxOutput}</pre>
              ) : (
                <span className="text-slate-600 italic">Playground outputs will render here...</span>
              )}
            </div>
          </div>

          {/* Quick Notes Pad */}
          <div className="h-40 rounded-xl border border-slate-800 bg-slate-900/30 p-4 flex flex-col gap-2 shrink-0">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 shrink-0">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Personal Study Notes</span>
            </h4>
            
            <textarea
              value={userNote}
              onChange={(e) => handleSaveNote(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-sans text-slate-200 outline-none focus:border-indigo-500 resize-none leading-normal"
              placeholder="Write down personal notes, tips, or bookmarks for this API (auto-saves)..."
            />
          </div>

        </div>

      </div>

    </div>
  );
};
