/**
 * DALOS (Data Analyst Learning Operating System) Shared Types
 */

export enum TopicCategory {
  PYTHON = 'Python Basics',
  NUMPY = 'NumPy Essentials',
  PANDAS = 'Pandas Data Wrangling',
  VISUALIZATION = 'Data Visualization (Matplotlib, Seaborn, Plotly)',
  SQL = 'SQL & Database Queries',
  STATISTICS = 'Statistics & Probability',
  EDA = 'Exploratory Data Analysis (EDA)',
  BUSINESS = 'Business Analytics & KPI Dashboards',
  ML_BASICS = 'Machine Learning Basics',
  PORTFOLIO = 'Portfolio Projects',
}

export type TopicId = string;

export interface TopicMetadata {
  id: TopicId;
  title: string;
  category: TopicCategory;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: TopicId[];
  dependencies: TopicId[];
  estimatedMinutes: number;
  practiceCount: number;
  challengeCount: number;
  revisionWeight: number; // 1 to 5 importance
  interviewImportance: number; // 1 to 5 importance
  portfolioImportance: number; // 1 to 5 importance
}

export interface KnowledgeNode {
  topicId: TopicId;
  mastery: number; // 0 to 100%
  confidence: number; // 1 to 5
  memoryDecay: number; // 0 to 1 (1 is fully decayed/forgotten)
  hintUsageCount: number;
  errorFrequency: number; // count of errors made
  speedScore: number; // 1 to 100 (how fast challenges are solved)
  revisionScore: number; // score on retrieval practices
  dependencyScore: number; // calculated impact of this node on dependent nodes
  lastPracticedAt: string | null; // ISO Date String
  nextReviewAt: string | null; // ISO Date String
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null; // null if locked
  icon: string; // lucide icon name
  xpReward: number;
  category: 'speed' | 'accuracy' | 'streak' | 'curriculum' | 'ide';
  threshold: number;
  currentValue: number;
}

export interface ProgressState {
  xp: number;
  level: number;
  dailyStreak: number;
  lastActiveDate: string | null;
  learningMinutes: number;
  challengesSolved: number;
  projectsCompleted: number;
  lessonsCompleted: number;
  heatmap: Record<string, number>; // date (YYYY-MM-DD) -> XP gained
  achievements: Achievement[];
}

export interface Flashcard {
  id: string;
  type: 'text' | 'code' | 'sql' | 'debug' | 'concept';
  topicId: TopicId;
  prompt: string;
  answer: string;
  codeSnippet?: string;
  imageOcclusionUrl?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  // Leitner / SuperMemo-2 Spaced Repetition parameters
  box: number; // 1-5 Leitner boxes
  easeFactor: number; // SM-2 parameter (default 2.5)
  intervalDays: number; // SM-2 parameter (default 1)
  repetitions: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}

export interface DocPage {
  id: string;
  topicId: TopicId;
  title: string;
  category: string;
  explanation: string;
  examples: Array<{
    title: string;
    description: string;
    code: string;
    language: 'python' | 'sql';
  }>;
  commonMistakes: string[];
  performanceNotes: string;
  interviewTips: string[];
  relatedTopics: TopicId[];
  searchKeywords: string[];
}

export interface Dataset {
  id: string;
  name: string;
  category: 'Finance' | 'Healthcare' | 'Retail' | 'Supply Chain' | 'Sports' | 'Weather' | 'Marketing' | 'HR' | 'Banking' | 'Government' | 'Entertainment';
  description: string;
  rowCount: number;
  columnCount: number;
  fileSizeKB: number;
  columns: Array<{ name: string; type: string; description: string }>;
  csvUrl?: string; // local or mock url
  offlineCached: boolean;
  isSynthetic: boolean;
}

export interface NotebookCell {
  id: string;
  type: 'markdown' | 'python' | 'sql';
  content: string;
  output?: string;
  error?: string;
  isRunning?: boolean;
}

export interface NotebookState {
  id: string;
  title: string;
  cells: NotebookCell[];
  updatedAt: string;
}

export interface AISettings {
  apiKey: string;
  provider: 'gemini';
  model: string;
  theme: 'light' | 'dark' | 'synth';
  encryptKeys: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'slate';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  editorTheme: 'vs-dark' | 'light' | 'monokai';
  executionTimeLimitMs: number;
  offlineCacheEnabled: boolean;
  apiKeys: {
    gemini: string;
  };
}
