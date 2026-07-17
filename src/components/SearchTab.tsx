import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Database, 
  HelpCircle, 
  ClipboardList, 
  FileText, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { db } from '../storage/db';
import { LESSONS_DATABASE } from '../data/lessonsData';
import { LIBRARY_DOCS } from '../data/documentationData';
import { TabId } from './Sidebar';

interface SearchTabProps {
  onNavigateToTab: (tabId: string, param?: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'Lesson' | 'API Doc' | 'Dataset' | 'Flashcard' | 'Study Note';
  description: string;
  category: string;
  targetTab: TabId;
  param?: string;
}

export const SearchTab: React.FC<SearchTabProps> = ({ onNavigateToTab }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    async function executeSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const q = query.toLowerCase();
      const accum: SearchResult[] = [];

      // 1. Search Lessons
      Object.values(LESSONS_DATABASE).forEach(lesson => {
        if (
          lesson.title.toLowerCase().includes(q) ||
          lesson.explanation.toLowerCase().includes(q) ||
          lesson.objectives.some(o => o.toLowerCase().includes(q))
        ) {
          accum.push({
            id: lesson.id,
            title: lesson.title,
            type: 'Lesson',
            description: lesson.summary || lesson.explanation.slice(0, 100) + '...',
            category: 'Curriculum',
            targetTab: 'practice', // PracticeTab handles lessons as well now!
            param: lesson.id
          });
        }
      });

      // 2. Search API Docs
      LIBRARY_DOCS.forEach(doc => {
        if (
          doc.name.toLowerCase().includes(q) ||
          doc.purpose.toLowerCase().includes(q) ||
          doc.library.toLowerCase().includes(q) ||
          doc.relatedTopics.some(t => t.toLowerCase().includes(q))
        ) {
          accum.push({
            id: doc.id,
            title: `${doc.library}: ${doc.name}`,
            type: 'API Doc',
            description: doc.purpose,
            category: doc.library,
            targetTab: 'settings', // We can route or pre-load
            param: doc.id
          });
        }
      });

      // 3. Search Datasets
      try {
        const allDatasets = await db.datasets.toArray();
        allDatasets.forEach(d => {
          if (
            d.name.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            d.columns.some(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
          ) {
            accum.push({
              id: d.id,
              title: d.name,
              type: 'Dataset',
              description: d.description,
              category: d.category,
              targetTab: 'datasets',
              param: d.id
            });
          }
        });
      } catch (err) {
        console.warn('Dataset search failed:', err);
      }

      // 4. Search Flashcards
      try {
        const allCards = await db.flashcards.toArray();
        allCards.forEach(c => {
          if (
            c.prompt.toLowerCase().includes(q) ||
            c.answer.toLowerCase().includes(q) ||
            c.tags.some(t => t.toLowerCase().includes(q))
          ) {
            accum.push({
              id: c.id,
              title: `Flashcard: ${c.prompt.slice(0, 45)}...`,
              type: 'Flashcard',
              description: c.answer.slice(0, 120) + '...',
              category: c.type.toUpperCase(),
              targetTab: 'flashcards',
              param: c.id
            });
          }
        });
      } catch (err) {
        console.warn('Flashcard search failed:', err);
      }

      // 5. Search Study Notes
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dalos_doc_note_')) {
          const noteText = localStorage.getItem(key) || '';
          if (noteText.toLowerCase().includes(q)) {
            const apiId = key.replace('dalos_doc_note_', '');
            const matchingDoc = LIBRARY_DOCS.find(d => d.id === apiId);
            if (matchingDoc) {
              accum.push({
                id: key,
                title: `My Note on ${matchingDoc.name}`,
                type: 'Study Note',
                description: noteText.slice(0, 120) + '...',
                category: matchingDoc.library,
                targetTab: 'settings', // Reroute to documentation tab
                param: matchingDoc.id
              });
            }
          }
        }
      }

      setResults(accum);
    }

    const delayDebounceFn = setTimeout(() => {
      executeSearch();
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const filteredResults = results.filter(r => {
    if (activeFilter === 'All') return true;
    return r.type === activeFilter;
  });

  const FILTERS = ['All', 'Lesson', 'API Doc', 'Dataset', 'Flashcard', 'Study Note'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Lesson': return <BookOpen className="h-4 w-4 text-indigo-400" />;
      case 'API Doc': return <FileText className="h-4 w-4 text-sky-400" />;
      case 'Dataset': return <Database className="h-4 w-4 text-emerald-400" />;
      case 'Flashcard': return <ClipboardList className="h-4 w-4 text-amber-400" />;
      case 'Study Note': return <FileText className="h-4 w-4 text-rose-400" />;
      default: return <HelpCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 animate-fade-in space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-400" />
          <span>Global OS Search Hub</span>
        </h2>
        <p className="text-xs text-slate-400 leading-normal">
          Query the entire learning operating system instantaneously. Search over syllabus modules, syntax libraries, notes, and datasets offline.
        </p>
      </div>

      {/* Input query field */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type keywords (e.g. groupby, standard error, numpy, csv, list comprehensions)..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm md:text-base font-mono text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
        />
      </div>

      {/* Filter strip */}
      {query && (
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 shrink-0 no-scrollbar font-mono text-xs border-b border-slate-800/60">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                activeFilter === f 
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold' 
                  : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f} ({f === 'All' ? results.length : results.filter(r => r.type === f).length})
            </button>
          ))}
        </div>
      )}

      {/* Results viewport */}
      <div className="space-y-3">
        {query ? (
          filteredResults.length > 0 ? (
            filteredResults.map((res, idx) => (
              <div 
                key={idx}
                className="group rounded-xl border border-slate-900 bg-slate-950/40 p-4 hover:border-slate-800 hover:bg-slate-950 transition-all flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-[9px] uppercase font-bold text-slate-400">
                      {getTypeIcon(res.type)}
                      <span>{res.type}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">•</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{res.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                    {res.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToTab(res.targetTab, res.param)}
                  className="flex items-center gap-1 shrink-0 rounded bg-indigo-600/10 border border-indigo-500/20 px-3 py-1.5 font-mono text-[10px] font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all"
                >
                  <span>Go to Tab</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 font-mono text-xs text-slate-500 italic">
              No index matches found matching "{query}". Try checking search filters.
            </div>
          )
        ) : (
          <div className="text-center py-14 space-y-3 border border-slate-900/60 rounded-xl bg-slate-950/20">
            <Search className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="text-xs font-mono text-slate-500">
              Enter search keywords above to scan all DALOS system records.
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-md mx-auto pt-2">
              {['groupby', 'p-value', 'array', 'Titanic', 'Z-score', 'window'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="rounded bg-slate-950 px-2 py-1 border border-slate-900 font-mono text-[10px] text-indigo-400/80 hover:text-indigo-400"
                >
                  "{tag}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
