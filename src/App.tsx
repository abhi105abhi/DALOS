import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './storage/db';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { CurriculumTab } from './components/CurriculumTab';
import { PracticeTab } from './components/PracticeTab';
import { NotebookTab } from './components/NotebookTab';
import { PythonIDETab } from './components/PythonIDETab';
import { SQLIDETab } from './components/SQLIDETab';
import { DatasetsTab } from './components/DatasetsTab';
import { FlashcardsTab } from './components/FlashcardsTab';
import { ProgressTab } from './components/ProgressTab';
import { AchievementsTab } from './components/AchievementsTab';
import { SettingsTab } from './components/SettingsTab';
import { ProgressState } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Read progress state dynamically using Dexie React hook
  const progressList = useLiveQuery(() => db.progress.toArray());
  const progress: ProgressState | undefined = progressList?.[0];

  const handleToggleOffline = () => {
    setIsOfflineSimulated(prev => !prev);
  };

  const handleSyncDatabase = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  const handleSelectTopicForQuiz = (topicId: string) => {
    setSelectedTopicId(topicId);
    setActiveTab('practice');
  };

  const handleNavigateToTab = (tabId: string) => {
    setActiveTab(tabId as TabId);
  };

  // Render current content viewport tab
  const renderTabContent = () => {
    if (!progress) {
      return (
        <div className="flex h-[60vh] flex-col items-center justify-center text-slate-500 font-mono text-xs">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-2" />
          <span>Configuring DALOS database...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab 
            progress={progress} 
            onNavigate={setActiveTab} 
            onSelectTopicForQuiz={handleSelectTopicForQuiz}
          />
        );
      case 'curriculum':
        return <CurriculumTab onSelectTopicForQuiz={handleSelectTopicForQuiz} />;
      case 'practice':
        return (
          <PracticeTab 
            initialTopicId={selectedTopicId} 
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case 'notebook':
        return <NotebookTab />;
      case 'python_ide':
        return <PythonIDETab />;
      case 'sql_ide':
        return <SQLIDETab />;
      case 'datasets':
        return <DatasetsTab />;
      case 'flashcards':
        return <FlashcardsTab />;
      case 'progress':
        return <ProgressTab progress={progress} />;
      case 'achievements':
        return <AchievementsTab progress={progress} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <div className="text-slate-500 font-mono text-xs">Sandbox component loading error.</div>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      
      {/* Header Panel */}
      {progress && (
        <Header 
          progress={progress}
          isOfflineSimulated={isOfflineSimulated}
          toggleOfflineSimulate={handleToggleOffline}
          syncDatabase={handleSyncDatabase}
          isSyncing={isSyncing}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="flex flex-1">
        
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Viewport content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 h-[calc(100vh-4rem)] no-scrollbar">
          {renderTabContent()}
        </main>

      </div>
    </div>
  );
}
