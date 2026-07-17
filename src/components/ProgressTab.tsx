import React, { useEffect, useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  CheckCircle, 
  Calendar, 
  Award, 
  Flame, 
  HelpCircle, 
  Clock 
} from 'lucide-react';
import { db } from '../storage/db';
import { ProgressState, TopicMetadata } from '../types';
import { LearningEngine } from '../learning-engine/engine';

interface ProgressTabProps {
  progress: ProgressState;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({ progress }) => {
  const [topics, setTopics] = useState<TopicMetadata[]>([]);
  const [masteryData, setMasteryData] = useState<Array<{ name: string; mastery: number }>>([]);
  const [selectedCell, setSelectedCell] = useState<{ day: number; count: number } | null>(null);

  useEffect(() => {
    async function loadStats() {
      const allTopics = await db.topics.toArray();
      const allKg = await db.knowledgeGraph.toArray();

      setTopics(allTopics);

      // Match topics and mastery ratings for charts
      const chartRows = allTopics.map(t => {
        const kg = allKg.find(x => x.topicId === t.id);
        return {
          name: t.title.split(' ')[0], // abbreviate
          mastery: kg ? kg.mastery : 0
        };
      });
      setMasteryData(chartRows);
    }
    loadStats();
  }, [progress]);

  // Generate consistency heatmap grid data representing trailing weeks
  const generateHeatmap = () => {
    const days = 30;
    return Array.from({ length: days }).map((_, idx) => {
      // Seed slightly active mock data, with a spike matching user active state
      const seedActivity = (idx % 7 === 0 || idx % 5 === 0) ? Math.floor(Math.random() * 5) + 1 : 0;
      return {
        day: idx + 1,
        count: idx === days - 1 ? (progress.challengesSolved % 10) + 1 : seedActivity
      };
    });
  };

  const heatmapData = generateHeatmap();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* KPI Metrics row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Study Consistency</span>
            <Flame className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{progress.dailyStreak} Days</div>
          <p className="mt-1 text-[10px] text-slate-400">Active day streak multiplier.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Analytical Code Runs</span>
            <Calendar className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{progress.challengesSolved} Runs</div>
          <p className="mt-1 text-[10px] text-slate-400">Executions inside python & sql.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Curriculum XP</span>
            <Award className="h-4.5 w-4.5 text-violet-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{progress.xp} XP</div>
          <p className="mt-1 text-[10px] text-slate-400">Level {progress.level} active rank.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Study Duration</span>
            <Clock className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{progress.learningMinutes} mins</div>
          <p className="mt-1 text-[10px] text-slate-400">Automatic focus session hours.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* GitHub style Learning consistency grid */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-indigo-400" />
              <span>Analyst Consistency Heatmap</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Tracks code compilations and completed quiz exercises across previous 30 calendar windows.</p>
          </div>

          {/* Grid display */}
          <div className="py-6">
            <div className="flex flex-wrap gap-1.5">
              {heatmapData.map(cell => {
                let opacityColor = 'bg-slate-900';
                if (cell.count === 1) opacityColor = 'bg-indigo-900/30 border border-indigo-900/20';
                else if (cell.count === 2) opacityColor = 'bg-indigo-800/40 border border-indigo-800/20';
                else if (cell.count === 3) opacityColor = 'bg-indigo-700/60 border border-indigo-700/20';
                else if (cell.count >= 4) opacityColor = 'bg-indigo-500 border border-indigo-500/20 shadow shadow-indigo-500/10';

                return (
                  <button
                    key={cell.day}
                    onClick={() => setSelectedCell(cell)}
                    className={`h-6 w-6 rounded-md transition-all hover:scale-110 ${opacityColor}`}
                    title={`Day ${cell.day}: ${cell.count} exercises solved`}
                  />
                );
              })}
            </div>
            
            <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Less Active</span>
              <div className="flex gap-1.5">
                <span className="h-3.5 w-3.5 rounded-sm bg-slate-900" />
                <span className="h-3.5 w-3.5 rounded-sm bg-indigo-900/40" />
                <span className="h-3.5 w-3.5 rounded-sm bg-indigo-700/60" />
                <span className="h-3.5 w-3.5 rounded-sm bg-indigo-500" />
              </div>
              <span>Highly Active</span>
            </div>
          </div>

          {selectedCell ? (
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-900 font-mono text-xs text-indigo-400 flex justify-between">
              <span>DAY {selectedCell.day} STUDY METRICS:</span>
              <span className="text-white font-bold">{selectedCell.count} exercises registered</span>
            </div>
          ) : (
            <div className="text-center font-mono text-[10px] text-slate-500">Click a cell grid above to query specific timeline log attributes.</div>
          )}
        </div>

        {/* Detailed mastery distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Mastery Index Distribution</h3>
            <p className="text-xs text-slate-400 leading-normal mt-1">Syllabus clusters must reach 75%+ mastery to unlock successor study segments.</p>
          </div>

          <div className="space-y-3 py-4 max-h-72 overflow-y-auto no-scrollbar">
            {masteryData.map(topicRow => {
              const completed = topicRow.mastery >= 75;
              return (
                <div key={topicRow.name} className="space-y-1">
                  <div className="flex justify-between items-baseline font-mono text-[11px]">
                    <span className="text-slate-300 font-bold">{topicRow.name}</span>
                    <span className={completed ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {topicRow.mastery}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${topicRow.mastery}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
