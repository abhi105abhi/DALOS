import React from 'react';
import { 
  Compass, 
  BookOpen, 
  BrainCircuit, 
  Layers, 
  Terminal, 
  Database, 
  Table, 
  ClipboardList, 
  BarChart2, 
  Award, 
  Settings,
  FileText,
  Search
} from 'lucide-react';

export type TabId = 
  | 'dashboard' 
  | 'curriculum' 
  | 'practice' 
  | 'notebook' 
  | 'python_ide' 
  | 'sql_ide' 
  | 'datasets' 
  | 'flashcards' 
  | 'progress' 
  | 'achievements' 
  | 'settings'
  | 'documentation'
  | 'search';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
  category: 'core' | 'ide' | 'metrics';
}

const NAV_ITEMS: NavItem[] = [
  // Core
  { id: 'dashboard', label: 'Dashboard', icon: Compass, category: 'core' },
  { id: 'curriculum', label: 'Syllabus Graph', icon: BookOpen, category: 'core' },
  { id: 'practice', label: 'Lessons & Quiz', icon: BrainCircuit, category: 'core' },
  { id: 'notebook', label: 'Analytics Cells', icon: Layers, category: 'core' },
  { id: 'documentation', label: 'API Library', icon: FileText, category: 'core' },
  { id: 'search', label: 'Global Search', icon: Search, category: 'core' },
  
  // IDEs
  { id: 'python_ide', label: 'Python Compiler', icon: Terminal, category: 'ide' },
  { id: 'sql_ide', label: 'SQL Studio', icon: Database, category: 'ide' },
  { id: 'datasets', label: 'Dataset Library', icon: Table, category: 'ide' },
  { id: 'flashcards', label: 'Leitner Revision', icon: ClipboardList, category: 'ide' },

  // Metrics
  { id: 'progress', label: 'Progress Metrics', icon: BarChart2, category: 'metrics' },
  { id: 'achievements', label: 'Achievements', icon: Award, category: 'metrics' },
  { id: 'settings', label: 'OS Settings', icon: Settings, category: 'metrics' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-800 bg-slate-900/50 p-4 md:flex lg:w-72">
        <div className="flex flex-col gap-6">
          
          {/* Core Module Section */}
          <div>
            <h3 className="px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Core Learning</h3>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.filter(item => item.category === 'core').map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      active 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Practical IDE Sandboxes */}
          <div>
            <h3 className="px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Analytical IDEs</h3>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.filter(item => item.category === 'ide').map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      active 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Engine Metrics & Configuration */}
          <div>
            <h3 className="px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Metrics & Core</h3>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.filter(item => item.category === 'metrics').map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      active 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* System telemetry info */}
        <div className="mt-auto px-3 py-4 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
          <p className="flex justify-between"><span>Sandbox state:</span> <span className="text-indigo-400">Initialized</span></p>
          <p className="flex justify-between"><span>Node cache:</span> <span className="text-emerald-400">Offline Ready</span></p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (Visible only below md: viewport) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-800 bg-slate-900/95 px-2 pb-1 backdrop-blur md:hidden">
        {NAV_ITEMS.filter(item => ['dashboard', 'curriculum', 'practice', 'notebook', 'settings'].includes(item.id)).map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-md transition-colors ${
                active ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-medium tracking-tight">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
