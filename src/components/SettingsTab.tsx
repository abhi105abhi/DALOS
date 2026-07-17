import React, { useState } from 'react';
import { 
  Settings, 
  Trash2, 
  Database, 
  Key, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { db } from '../storage/db';

export const SettingsTab: React.FC = () => {
  const [outcome, setOutcome] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Backup entire IndexedDB database to single JSON file
  const handleBackup = async () => {
    setBackingUp(true);
    setOutcome(null);

    setTimeout(async () => {
      try {
        const topics = await db.topics.toArray();
        const knowledgeGraph = await db.knowledgeGraph.toArray();
        const progress = await db.progress.toArray();
        const flashcards = await db.flashcards.toArray();
        const datasets = await db.datasets.toArray();
        const notebooks = await db.notebooks.toArray();

        const backupData = {
          topics,
          knowledgeGraph,
          progress,
          flashcards,
          datasets,
          notebooks,
          exportedAt: new Date().toISOString()
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dalos_os_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setOutcome('Success: Exported completed DALOS OS backup database payload.');
      } catch (err: any) {
        setOutcome(`Export Error: ${err.message}`);
      } finally {
        setBackingUp(false);
      }
    }, 800);
  };

  // Restore database from JSON
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setOutcome(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.progress || !json.knowledgeGraph) {
          throw new Error('Invalid backup file. Missing critical curriculum fields.');
        }

        // Clear existing tables
        await db.topics.clear();
        await db.knowledgeGraph.clear();
        await db.progress.clear();
        await db.flashcards.clear();
        await db.datasets.clear();
        await db.notebooks.clear();

        // Restore tables
        if (json.topics) await db.topics.bulkAdd(json.topics);
        if (json.knowledgeGraph) await db.knowledgeGraph.bulkAdd(json.knowledgeGraph);
        if (json.progress) await db.progress.bulkAdd(json.progress);
        if (json.flashcards) await db.flashcards.bulkAdd(json.flashcards);
        if (json.datasets) await db.datasets.bulkAdd(json.datasets);
        if (json.notebooks) await db.notebooks.bulkAdd(json.notebooks);

        setOutcome('Success: Database restored successfully. Reloading OS context.');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        setOutcome(`Restore failed: ${err.message}`);
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  // Clear learning progress database
  const handleClearProgress = async () => {
    if (!confirm('Are you absolutely sure you want to reset your DALOS system progress? This will reset all mastery ratings, completed lessons, flashcard due boxes, and scores back to initial state.')) {
      return;
    }

    try {
      // Restore initial seed stats
      await db.knowledgeGraph.clear();
      await db.progress.clear();
      await db.notebooks.clear();

      // Seed initial setup values again
      const initialProgress = {
        id: 'user_progress',
        level: 1,
        xp: 0,
        lessonsCompleted: 0,
        challengesSolved: 0,
        dailyStreak: 1,
        learningMinutes: 0,
        lastActiveDate: null,
        projectsCompleted: 0,
        heatmap: {} as Record<string, number>,
        achievements: [
          { id: 'ach_hello', title: 'Compiler Genesis', description: 'Run a python execution code script successfully.', icon: 'Terminal', targetValue: 1, currentValue: 0, threshold: 1, xpReward: 200, unlockedAt: null, category: 'ide' as const },
          { id: 'ach_streak', title: 'Calculated Consistency', description: 'Log code runs or complete quizzes across 3 consecutive days.', icon: 'Flame', targetValue: 3, currentValue: 1, threshold: 3, xpReward: 500, unlockedAt: null, category: 'streak' as const },
          { id: 'ach_pandas', title: 'Pandas Wrangling Guru', description: 'Reach 80%+ mastery on the Pandas curriculum node.', icon: 'Code', targetValue: 80, currentValue: 0, threshold: 80, xpReward: 600, unlockedAt: null, category: 'curriculum' as const },
          { id: 'ach_quiz', title: 'Quiz Whiz', description: 'Complete 3 quiz modules with perfect 100% scores.', icon: 'CheckSquare', targetValue: 3, currentValue: 0, threshold: 3, xpReward: 400, unlockedAt: null, category: 'accuracy' as const }
        ]
      };
      await db.progress.add(initialProgress);

      const allTopics = await db.topics.toArray();
      const initialKg = allTopics.map(t => ({
        topicId: t.id,
        mastery: 0,
        confidence: 1,
        memoryDecay: 0.0,
        hintUsageCount: 0,
        errorFrequency: 0,
        speedScore: 0,
        revisionScore: 0,
        dependencyScore: 0,
        lastPracticedAt: null,
        nextReviewAt: null
      }));
      await db.knowledgeGraph.bulkAdd(initialKg);

      const initialNotebook = {
        id: 'primary_nb',
        title: 'Core Data Analytics Sandbox',
        cells: [
          { id: 'cell_1', type: 'markdown' as const, content: '## Core Analytics Workbook\nUse this cell to catalog statistics findings, group queries, and data cleaning scripts.' },
          { id: 'cell_2', type: 'python' as const, content: '# Write python calculations here\nprint("Hello World, Analyst")' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.notebooks.add(initialNotebook);

      setOutcome('Success: Learning OS progress has been cleared. Restarting core components.');
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setOutcome(`Failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto rounded-xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-8 animate-fade-in">
      
      {/* Title section */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-400" />
          <span>Personal OS Preferences</span>
        </h2>
        <p className="text-xs text-slate-400">Manage local-first cache payloads and system keys.</p>
      </div>

      {/* Backup and restore engine database */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Database className="h-4.5 w-4.5 text-indigo-400" />
          <span>Local Data Storage Engine</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          DALOS stores curriculum, flashcards, notebook scripts, and mastery ratings inside your browser's IndexedDB storage cache. Back up your work as a single standalone JSON file to restore progress across devices or browsers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleBackup}
            disabled={backingUp}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-2.5 text-xs font-bold transition-all shadow shadow-indigo-500/10"
          >
            <Download className="h-4 w-4" />
            <span>{backingUp ? 'Exporting...' : 'Export Backup JSON'}</span>
          </button>

          <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 px-5 py-2.5 text-xs font-bold transition-all cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>{restoring ? 'Restoring...' : 'Restore Backup JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={restoring}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Gemini API key configuration */}
      <div className="space-y-4 border-t border-slate-800/80 pt-6">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Key className="h-4.5 w-4.5 text-indigo-400" />
          <span>Gemini AI Mentor Integration</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          AI assistant tools are fully optional in DALOS. The core syllabus engine operates 100% offline-first. To enable smart coding completions, explain-query explanations, and automated portfolio reviews, provide a Gemini API key inside the Secrets panel of the AI Studio workspace interface.
        </p>
        <div className="rounded-lg bg-indigo-500/5 p-3.5 border border-indigo-500/10 text-xs font-mono text-indigo-300 flex items-start gap-2.5">
          <RefreshCw className="h-4 w-4 shrink-0 mt-0.5 animate-pulse text-indigo-400" />
          <div>
            <span className="font-bold">STATUS: Server Auto-Inject Active</span>
            <p className="mt-1 font-sans text-[11px] text-slate-400">
              The platform dynamically binds the GEMINI_API_KEY environment variable. Do not expose this variable inside frontend components.
            </p>
          </div>
        </div>
      </div>

      {/* Destructive Clear Reset block */}
      <div className="space-y-4 border-t border-slate-800/80 pt-6">
        <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-1.5">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-slate-400">
          Resetting database clears all local changes, completed study modules, flashcards, achievements, and custom notebooks.
        </p>
        <div>
          <button
            onClick={handleClearProgress}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-5 py-2.5 text-xs font-bold text-rose-400 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Reset Learning OS Database</span>
          </button>
        </div>
      </div>

      {/* Notifications and Outcome status messages */}
      {outcome && (
        <div className={`rounded-xl p-4 border font-mono text-xs flex items-center gap-2 animate-fade-in ${
          outcome.startsWith('Success') 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{outcome}</span>
        </div>
      )}

    </div>
  );
};
