import React from 'react';
import { 
  Award, 
  Terminal, 
  Flame, 
  Code, 
  CheckSquare, 
  Lock, 
  CheckCircle, 
  Star 
} from 'lucide-react';
import { Achievement, ProgressState } from '../types';

interface AchievementsTabProps {
  progress: ProgressState;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Terminal,
  Flame,
  Code,
  CheckSquare
};

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ progress }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Medal Title Block */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Anlayst Achievement Board</h2>
            <p className="text-xs text-slate-400">Unlock professional milestone badges to claim supplementary curriculum XP rewards.</p>
          </div>
        </div>
      </div>

      {/* Grid listing achievements */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {progress.achievements.map(ach => {
          const IconComponent = ICON_MAP[ach.icon] || Award;
          const isUnlocked = ach.unlockedAt !== null;
          const pct = Math.max(0, Math.min(100, (ach.currentValue / ach.threshold) * 100));

          return (
            <div 
              key={ach.id}
              className={`rounded-xl border p-5 flex gap-4 transition-all ${
                isUnlocked 
                  ? 'bg-slate-900/60 border-amber-500/30' 
                  : 'bg-slate-950/40 border-slate-900/80 opacity-65'
              }`}
            >
              {/* Medal Badge */}
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                isUnlocked 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-md shadow-amber-500/10' 
                  : 'bg-slate-950 text-slate-500 border-slate-900'
              }`}>
                {isUnlocked ? (
                  <IconComponent className="h-5 w-5 animate-bounce" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>

              {/* Information */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="text-sm font-bold text-slate-200 truncate">{ach.title}</h3>
                  <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    +{ach.xpReward} XP
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-slate-500">
                    <span>PROGRESS</span>
                    <span>{ach.currentValue} / {ach.threshold}</span>
                  </div>
                  
                  <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUnlocked ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {isUnlocked && (
                  <div className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 font-bold uppercase pt-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Unlocked {new Date(ach.unlockedAt!).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
