import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Compass, 
  Play, 
  ArrowRight, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  BookMarked,
  Layers
} from 'lucide-react';
import { db } from '../storage/db';
import { LearningEngine } from '../learning-engine/engine';
import { TopicMetadata, ProgressState } from '../types';
import { TabId } from './Sidebar';

interface DashboardTabProps {
  progress: ProgressState;
  onNavigate: (tab: TabId) => void;
  onSelectTopicForQuiz: (topicId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ 
  progress, 
  onNavigate,
  onSelectTopicForQuiz
}) => {
  const [recommendations, setRecommendations] = useState<Array<{ topic: TopicMetadata; reason: string }>>([]);
  const [analytics, setAnalytics] = useState<{
    coveragePercent: number;
    averageMastery: number;
    jobReadinessScore: number;
    weakTopics: string[];
    strongTopics: string[];
  } | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      const recs = await LearningEngine.getNextRecommendations();
      setRecommendations(recs);

      const stats = await LearningEngine.computeAnalytics();
      setAnalytics(stats);

      // Sum estimated minutes of all topics completed
      const allKg = await db.knowledgeGraph.toArray();
      const allTopics = await db.topics.toArray();
      let minutes = 0;
      for (const node of allKg) {
        if (node.mastery >= 75) {
          const t = allTopics.find(x => x.id === node.topicId);
          if (t) minutes += t.estimatedMinutes;
        }
      }
      setTotalMinutes(minutes);
    }
    loadDashboardData();
  }, [progress]);

  // Analyst Motivational Quotes
  const QUOTES = [
    "No data is clean. Clean data is a beautiful lie.",
    "Without data, you're just another person with an opinion. — W. Edwards Deming",
    "P-values are guides, not absolute truths.",
    "A clean group-by statement solves 90% of business reporting issues.",
    "The most important skill is translating numbers into business recommendations."
  ];
  const activeQuote = QUOTES[progress.xp % QUOTES.length];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Welcome Hero Area */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 to-indigo-950/40 p-6 md:p-8">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest">Active System Status: Live</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Ready to code, Analyst?</h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              "Your one-year personal path to professional status is fully configured. Review your spaced repetition cards and practice local SQL or Python to unlock subsequent curriculum nodes."
            </p>
            <div className="pt-2 font-mono text-xs italic text-indigo-300/80">
              "{activeQuote}"
            </div>
          </div>
          
          {/* Quick-action Launch pad */}
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
            <button
              onClick={() => onNavigate('curriculum')}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span>Syllabus Map</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('notebook')}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Layers className="h-4 w-4" />
              <span>Open Notebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core OS KPIs Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Job Readiness Indicator */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium tracking-wide">Estimated Job Readiness</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white">
              {analytics?.jobReadinessScore ?? 0}%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
              style={{ width: `${analytics?.jobReadinessScore ?? 0}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400 leading-snug">
            Based on completed projects, Pandas mastery, and advanced statistics. Target: 85%
          </p>
        </div>

        {/* Knowledge Coverage */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium tracking-wide">Curriculum Coverage</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white">
              {analytics?.coveragePercent ?? 0}%
            </span>
            <span className="text-xs text-slate-400">mastered</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500" 
              style={{ width: `${analytics?.coveragePercent ?? 0}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400 leading-snug">
            {progress.lessonsCompleted} out of 12 topic clusters completed with passing marks.
          </p>
        </div>

        {/* Learning Minutes */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium tracking-wide">Completed Study Time</span>
            <BookMarked className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white">
              {Math.round(totalMinutes + progress.learningMinutes)}
            </span>
            <span className="text-xs text-slate-400">minutes</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-300">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span>Target completion: 6,000 mins</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 leading-snug">
            Calculated study hours automatically registered across active lessons.
          </p>
        </div>

        {/* Level Up Progress Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium tracking-wide">Developer Level</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white">Lvl {progress.level}</span>
            <span className="text-[10px] text-slate-400 font-mono">({progress.xp} XP total)</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="text-amber-400 font-mono">Unlocked Medals:</span>
            <span>{progress.achievements.filter(a => a.unlockedAt).length} / 4 unlocked</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 leading-snug">
            Practice SQL & Python coding challenges to generate high-volume XP.
          </p>
        </div>

      </div>

      {/* Dynamic Sequencer: Adaptive Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Recommended Lessons */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Intelligence Engine Sequencing</h3>
            <p className="text-xs text-slate-400">No AI-dependency. Strictly sequenced based on mastery thresholds and spacing interval decay.</p>
          </div>

          <div className="flex flex-col gap-3">
            {recommendations.length > 0 ? (
              recommendations.map(({ topic, reason }) => (
                <div 
                  key={topic.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-400 uppercase">
                        {topic.category.split(' ')[0]}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ({topic.difficulty})
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{topic.title}</h4>
                    <p className="text-xs text-slate-300">{reason}</p>
                  </div>
                  
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => onSelectTopicForQuiz(topic.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white px-3 py-2 text-xs font-semibold text-indigo-400 transition-all"
                    >
                      <Play className="h-3 w-3" />
                      <span>Take Quiz</span>
                    </button>
                    <button
                      onClick={() => onNavigate('notebook')}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-all"
                    >
                      <span>Code</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 py-12 text-slate-500">
                <CheckCircle2 className="h-8 w-8 text-indigo-500 mb-2" />
                <p className="text-sm font-semibold">All recommendations synchronized!</p>
                <p className="text-xs">Go to the Syllabus tab to explore subsequent nodes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Review & Streaks details */}
        <div className="space-y-6">
          
          {/* Active Spaced repetition summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Spaced Repetition Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Your Leitner box system categorizes flashcards from 1 to 5 based on recall difficulty. Pass cards correctly to extend review delay.
            </p>
            <button
              onClick={() => onNavigate('flashcards')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white px-4 py-2.5 text-xs font-semibold text-indigo-400 transition-all"
            >
              <span>Launch Flashcards</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Quick Stats table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 font-mono text-xs text-slate-400 space-y-3">
            <h4 className="text-white font-sans font-semibold text-sm">System Variables</h4>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>ACTIVE_STREAK:</span>
              <span className="text-amber-500 font-bold">{progress.dailyStreak} days</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>UNLOCKED_NODES:</span>
              <span className="text-indigo-400">{analytics?.coveragePercent}% coverage</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span>CHALLENGES_SOLVED:</span>
              <span className="text-white">{progress.challengesSolved}</span>
            </div>
            <div className="flex justify-between">
              <span>OFFLINE_INTEGRITY:</span>
              <span className="text-emerald-400">100% compliant</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
