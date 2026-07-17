import React from 'react';
import { Flame, Award, Zap, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { ProgressState } from '../types';

interface HeaderProps {
  progress: ProgressState;
  isOfflineSimulated: boolean;
  toggleOfflineSimulate: () => void;
  syncDatabase: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  isOfflineSimulated,
  toggleOfflineSimulate,
  syncDatabase,
  isSyncing
}) => {
  const currentXP = progress.xp;
  // Formula: level = Math.floor(Math.sqrt(xp / 150)) + 1
  // To find next level XP: (level)^2 * 150
  const currentLevel = progress.level;
  const prevLevelXP = Math.pow(currentLevel - 1, 2) * 150;
  const nextLevelXP = Math.pow(currentLevel, 2) * 150;
  const levelProgressPercent = Math.max(0, Math.min(100, ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur md:px-8">
      {/* Brand & Mode Status */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-mono text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
          Δ
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide text-white md:text-base">Personal DALOS</h1>
          <p className="hidden font-mono text-[10px] text-slate-400 sm:block">v1.2 // Learning Operating System</p>
        </div>
      </div>

      {/* Stats and Controls */}
      <div className="flex items-center gap-2 sm:gap-6">
        
        {/* Streak Counter */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-amber-500 border border-amber-500/20" title="Daily streak">
          <Flame className="h-4 w-4 fill-amber-500 animate-pulse" />
          <span className="font-mono text-xs font-bold sm:text-sm">{progress.dailyStreak}d Streak</span>
        </div>

        {/* Level and XP */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold font-mono text-sm border border-indigo-500/20">
            Lvl {currentLevel}
          </div>
          <div className="w-24 md:w-36">
            <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
              <span>XP: {currentXP}</span>
              <span>Next: {nextLevelXP}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Offline Simulation Toggle */}
        <button
          onClick={toggleOfflineSimulate}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs font-medium border transition-colors ${
            isOfflineSimulated 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
          title={isOfflineSimulated ? "DALOS running in Mock Offline sandbox mode" : "DALOS running in fully connected Mode"}
        >
          {isOfflineSimulated ? (
            <>
              <CloudOff className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Offline (Sim)</span>
            </>
          ) : (
            <>
              <Cloud className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Online (PWA)</span>
            </>
          )}
        </button>

        {/* Force Database Sync */}
        <button
          onClick={syncDatabase}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${isSyncing ? 'animate-spin text-indigo-400' : ''}`}
          title="Force-synchronize local cached files"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
