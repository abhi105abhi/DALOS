import React, { useEffect, useState } from 'react';
import { 
  Check, 
  Lock, 
  Play, 
  BookOpen, 
  HelpCircle, 
  TrendingUp, 
  Award, 
  Clock 
} from 'lucide-react';
import { db } from '../storage/db';
import { TopicMetadata, KnowledgeNode } from '../types';
import { LearningEngine } from '../learning-engine/engine';

interface CurriculumTabProps {
  onSelectTopicForQuiz: (topicId: string) => void;
}

export const CurriculumTab: React.FC<CurriculumTabProps> = ({ onSelectTopicForQuiz }) => {
  const [topics, setTopics] = useState<TopicMetadata[]>([]);
  const [kgNodes, setKgNodes] = useState<Record<string, KnowledgeNode>>({});
  const [unlockedState, setUnlockedState] = useState<Record<string, boolean>>({});
  const [selectedTopic, setSelectedTopic] = useState<TopicMetadata | null>(null);

  useEffect(() => {
    async function loadSyllabus() {
      const allTopics = await db.topics.toArray();
      const allKg = await db.knowledgeGraph.toArray();

      const kgMap: Record<string, KnowledgeNode> = {};
      for (const node of allKg) {
        kgMap[node.topicId] = node;
      }

      // Check unlock status for all nodes using the engine
      const unlockMap: Record<string, boolean> = {};
      for (const t of allTopics) {
        unlockMap[t.id] = await LearningEngine.isTopicUnlocked(t.id);
      }

      setTopics(allTopics);
      setKgNodes(kgMap);
      setUnlockedState(unlockMap);

      // Default select the first topic
      if (allTopics.length > 0) {
        setSelectedTopic(allTopics[0]);
      }
    }
    loadSyllabus();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-fade-in">
      
      {/* Interactive Path Graph Map */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span>Interactive Syllabus Path Graph</span>
          </h2>
          <p className="text-xs text-slate-400">
            Prerequisites are automatically validated by the local learning engine. Unlock subsequent nodes by completing previous nodes with a passing score of 70%+.
          </p>
        </div>

        {/* The Graphic Map Scroll Canvas */}
        <div className="relative flex-1 overflow-y-auto no-scrollbar rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-[550px] min-h-[400px]">
          
          {/* Node graph flow */}
          <div className="relative flex flex-col items-center gap-12 py-8">
            
            {/* Draw connector lines between sequentially stacked cards */}
            <div className="absolute top-10 bottom-10 left-1/2 w-0.5 -translate-x-1/2 bg-slate-800/80 pointer-events-none" />

            {topics.map((topic, index) => {
              const kg = kgNodes[topic.id];
              const isUnlocked = unlockedState[topic.id];
              const isCompleted = kg && kg.mastery >= 75;
              const isSelected = selectedTopic?.id === topic.id;

              return (
                <div 
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`relative z-10 flex w-full max-w-md cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/5' 
                      : isCompleted 
                        ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50'
                        : isUnlocked
                          ? 'bg-slate-900/90 border-indigo-500/20 hover:border-indigo-500/40'
                          : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-75'
                  }`}
                >
                  {/* Status indicator circle */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold border ${
                    isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : isUnlocked 
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-md shadow-indigo-500/10 animate-pulse'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    ) : !isUnlocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Information block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        {topic.category.split(' ')[0]}
                      </span>
                      {isCompleted && (
                        <span className="font-mono text-[9px] text-emerald-400 font-bold">
                          Mastered
                        </span>
                      )}
                    </div>
                    <h3 className="truncate text-sm font-bold text-slate-200">{topic.title}</h3>
                    <p className="truncate text-[11px] text-slate-400">{topic.description}</p>
                  </div>

                  {/* Right side Mastery badge / status */}
                  <div className="text-right">
                    <div className="font-mono text-[11px] font-bold text-white">
                      {kg ? `${kg.mastery}%` : '0%'}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">mastery</div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* Node Detail Side Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col h-full justify-between">
        {selectedTopic ? (
          <div className="space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-400 uppercase">
                  {selectedTopic.category}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  selectedTopic.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                  selectedTopic.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {selectedTopic.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedTopic.title}</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedTopic.description}</p>
            </div>

            {/* Structured requirements & Importance indexes */}
            <div className="space-y-4 border-t border-slate-800/80 pt-4">
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 p-2.5 border border-slate-800">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Study Time</div>
                    <div className="font-mono font-bold text-slate-200">{selectedTopic.estimatedMinutes}m</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 p-2.5 border border-slate-800">
                  <Award className="h-4 w-4 text-violet-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Total Tasks</div>
                    <div className="font-mono font-bold text-slate-200">{selectedTopic.practiceCount + selectedTopic.challengeCount} Items</div>
                  </div>
                </div>
              </div>

              {/* Prerequisites list */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Prerequisite Requirements:</span>
                {selectedTopic.prerequisites.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTopic.prerequisites.map(p => (
                      <span key={p} className="rounded bg-slate-950 px-2 py-1 font-mono text-[10px] text-slate-300 border border-slate-800">
                        {p.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">None. Fully unlocked for starting.</div>
                )}
              </div>

              {/* Learning weights / Importance sliders */}
              <div className="space-y-2 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Interview Importance:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <div key={v} className={`h-2.5 w-4 rounded-sm ${v <= selectedTopic.interviewImportance ? 'bg-amber-500' : 'bg-slate-800'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Portfolio Weight:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <div key={v} className={`h-2.5 w-4 rounded-sm ${v <= selectedTopic.portfolioImportance ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Launch direct command */}
            <div className="pt-4">
              {unlockedState[selectedTopic.id] ? (
                <button
                  onClick={() => onSelectTopicForQuiz(selectedTopic.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Launch Practice Quiz</span>
                </button>
              ) : (
                <div className="w-full text-center rounded-xl bg-slate-950 p-3 border border-slate-900 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Complete prerequisites to study this node.</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <HelpCircle className="h-8 w-8 mb-2" />
            <p className="text-xs">Select a curriculum node to explore syllabus parameters.</p>
          </div>
        )}
      </div>

    </div>
  );
};
