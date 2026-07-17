import Dexie, { type Table } from 'dexie';
import { 
  TopicMetadata, 
  KnowledgeNode, 
  ProgressState, 
  Flashcard, 
  DocPage, 
  Dataset, 
  NotebookState, 
  UserSettings,
  TopicCategory,
  Achievement
} from '../types';

export class DALOSDatabase extends Dexie {
  topics!: Table<TopicMetadata, string>;
  knowledgeGraph!: Table<KnowledgeNode, string>;
  progress!: Table<ProgressState & { id: string }, string>;
  flashcards!: Table<Flashcard, string>;
  documentation!: Table<DocPage, string>;
  datasets!: Table<Dataset, string>;
  notebooks!: Table<NotebookState, string>;
  settings!: Table<UserSettings & { id: string }, string>;

  constructor() {
    super('DALOSDatabase');
    this.version(1).stores({
      topics: 'id, category, difficulty',
      knowledgeGraph: 'topicId, mastery, memoryDecay, nextReviewAt',
      progress: 'id',
      flashcards: 'id, topicId, type, difficulty, nextReviewAt, box',
      documentation: 'id, topicId, category',
      datasets: 'id, category, offlineCached, isSynthetic',
      notebooks: 'id, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new DALOSDatabase();

// --- SEED DATA ---

export const INITIAL_TOPICS: TopicMetadata[] = [
  {
    id: 'python_basics',
    title: 'Python Core Variables & Types',
    category: TopicCategory.PYTHON,
    description: 'Learn the foundational syntax of Python: variables, data types, standard operations, and simple scripts.',
    difficulty: 'Beginner',
    prerequisites: [],
    dependencies: ['python_functions'],
    estimatedMinutes: 45,
    practiceCount: 5,
    challengeCount: 3,
    revisionWeight: 4,
    interviewImportance: 3,
    portfolioImportance: 2,
  },
  {
    id: 'python_functions',
    title: 'Functions & Control Flow',
    category: TopicCategory.PYTHON,
    description: 'Master function definitions, parameters, return statements, conditional if/else blocks, and modular code code layout.',
    difficulty: 'Beginner',
    prerequisites: ['python_basics'],
    dependencies: ['python_collections'],
    estimatedMinutes: 60,
    practiceCount: 6,
    challengeCount: 4,
    revisionWeight: 4,
    interviewImportance: 4,
    portfolioImportance: 2,
  },
  {
    id: 'python_collections',
    title: 'Data Structures: Lists, Dicts, Loops',
    category: TopicCategory.PYTHON,
    description: 'Wrangle lists, tuples, dictionaries, sets, and implement for/while loops to iterate over data collections.',
    difficulty: 'Beginner',
    prerequisites: ['python_functions'],
    dependencies: ['numpy_essentials'],
    estimatedMinutes: 90,
    practiceCount: 8,
    challengeCount: 5,
    revisionWeight: 5,
    interviewImportance: 5,
    portfolioImportance: 3,
  },
  {
    id: 'numpy_essentials',
    title: 'NumPy Arrays & Vectorization',
    category: TopicCategory.NUMPY,
    description: 'Understand vectorization, multi-dimensional array manipulation, mathematical functions, indexing, and array slicing.',
    difficulty: 'Intermediate',
    prerequisites: ['python_collections'],
    dependencies: ['pandas_wrangling'],
    estimatedMinutes: 90,
    practiceCount: 8,
    challengeCount: 4,
    revisionWeight: 3,
    interviewImportance: 4,
    portfolioImportance: 3,
  },
  {
    id: 'pandas_wrangling',
    title: 'Pandas Dataframes & Wrangling',
    category: TopicCategory.PANDAS,
    description: 'Load CSVs, perform data filtering, drop missing values, group-by aggregations, merge datasets, and clean raw data.',
    difficulty: 'Intermediate',
    prerequisites: ['numpy_essentials'],
    dependencies: ['data_viz', 'eda_practice'],
    estimatedMinutes: 180,
    practiceCount: 15,
    challengeCount: 10,
    revisionWeight: 5,
    interviewImportance: 5,
    portfolioImportance: 5,
  },
  {
    id: 'data_viz',
    title: 'Data Visualization Techniques',
    category: TopicCategory.VISUALIZATION,
    description: 'Build insightful charts using Matplotlib, Seaborn, and interactive Plotly figures to communicate trends.',
    difficulty: 'Intermediate',
    prerequisites: ['pandas_wrangling'],
    dependencies: ['eda_practice'],
    estimatedMinutes: 120,
    practiceCount: 10,
    challengeCount: 6,
    revisionWeight: 4,
    interviewImportance: 3,
    portfolioImportance: 5,
  },
  {
    id: 'sql_queries',
    title: 'SQL SELECT, Joins, and Groupings',
    category: TopicCategory.SQL,
    description: 'Query relational tables using filters, INNER/LEFT joins, complex aggregations, and subqueries with SQLite/DuckDB.',
    difficulty: 'Beginner',
    prerequisites: [],
    dependencies: ['sql_advanced'],
    estimatedMinutes: 120,
    practiceCount: 12,
    challengeCount: 8,
    revisionWeight: 5,
    interviewImportance: 5,
    portfolioImportance: 4,
  },
  {
    id: 'sql_advanced',
    title: 'Advanced SQL & Window Functions',
    category: TopicCategory.SQL,
    description: 'Leverage window functions (ROW_NUMBER, LAG, LEAD), CTEs (Common Table Expressions), and partition aggregations.',
    difficulty: 'Intermediate',
    prerequisites: ['sql_queries'],
    dependencies: ['eda_practice', 'business_analytics'],
    estimatedMinutes: 150,
    practiceCount: 10,
    challengeCount: 6,
    revisionWeight: 5,
    interviewImportance: 5,
    portfolioImportance: 4,
  },
  {
    id: 'statistics',
    title: 'Statistics & Hypothesis Testing',
    category: TopicCategory.STATISTICS,
    description: 'Learn central tendency, variance, distributions, correlation, p-values, t-tests, and core AB testing statistics.',
    difficulty: 'Intermediate',
    prerequisites: ['pandas_wrangling'],
    dependencies: ['eda_practice'],
    estimatedMinutes: 150,
    practiceCount: 8,
    challengeCount: 5,
    revisionWeight: 4,
    interviewImportance: 5,
    portfolioImportance: 3,
  },
  {
    id: 'eda_practice',
    title: 'Exploratory Data Analysis (EDA)',
    category: TopicCategory.EDA,
    description: 'A comprehensive approach to exploring any raw dataset to find anomalies, correlations, patterns, and insights.',
    difficulty: 'Intermediate',
    prerequisites: ['pandas_wrangling', 'data_viz', 'sql_advanced', 'statistics'],
    dependencies: ['business_analytics', 'machine_learning'],
    estimatedMinutes: 200,
    practiceCount: 12,
    challengeCount: 8,
    revisionWeight: 5,
    interviewImportance: 5,
    portfolioImportance: 5,
  },
  {
    id: 'business_analytics',
    title: 'Business Analytics & Cohort Analysis',
    category: TopicCategory.BUSINESS,
    description: 'Calculate LTV, CAC, Churn rate, and design professional retention cohort heatmaps and executive dashboards.',
    difficulty: 'Intermediate',
    prerequisites: ['eda_practice'],
    dependencies: ['portfolio_projects'],
    estimatedMinutes: 150,
    practiceCount: 8,
    challengeCount: 4,
    revisionWeight: 4,
    interviewImportance: 4,
    portfolioImportance: 5,
  },
  {
    id: 'machine_learning',
    title: 'Machine Learning Basics (Regression & Classification)',
    category: TopicCategory.ML_BASICS,
    description: 'Prepare data, train linear/logistic regression models using Scikit-Learn, and evaluate accuracy and confusion matrices.',
    difficulty: 'Advanced',
    prerequisites: ['eda_practice'],
    dependencies: ['portfolio_projects'],
    estimatedMinutes: 240,
    practiceCount: 10,
    challengeCount: 5,
    revisionWeight: 3,
    interviewImportance: 4,
    portfolioImportance: 4,
  },
  {
    id: 'portfolio_projects',
    title: 'Capstones & Portfolio Projects',
    category: TopicCategory.PORTFOLIO,
    description: 'Combine SQL, Python, and statistical EDA to solve a massive real-world marketing or financial business case.',
    difficulty: 'Advanced',
    prerequisites: ['business_analytics', 'machine_learning'],
    dependencies: [],
    estimatedMinutes: 360,
    practiceCount: 2,
    challengeCount: 2,
    revisionWeight: 2,
    interviewImportance: 5,
    portfolioImportance: 5,
  },
];

export const INITIAL_KNOWLEDGE_NODES = [
  'variables', 'functions', 'lists', 'loops', 'numpy', 'pandas', 'visualization', 'eda', 'machine_learning'
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc_1',
    type: 'code',
    topicId: 'python_basics',
    prompt: 'How do you check the data type of an object in Python?',
    answer: 'Use the built-in `type()` function.',
    codeSnippet: 'x = 10.5\nprint(type(x))  # Output: <class \'float\'>',
    tags: ['python', 'basics', 'types'],
    difficulty: 'easy',
    box: 1,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
  {
    id: 'fc_2',
    type: 'text',
    topicId: 'pandas_wrangling',
    prompt: 'What is the main difference between loc[] and iloc[] in Pandas?',
    answer: '`loc` is label-based selection, meaning you query rows and columns using their named index. `iloc` is integer-position based selection (0-indexed position).',
    tags: ['pandas', 'indexing', 'wrangling'],
    difficulty: 'medium',
    box: 1,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
  {
    id: 'fc_3',
    type: 'sql',
    topicId: 'sql_queries',
    prompt: 'What is the standard order of execution for a SQL query query block containing SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY?',
    answer: 'The database engine executes clauses in this order: FROM, JOINs -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.',
    codeSnippet: 'SELECT category, COUNT(*)\nFROM orders\nWHERE status = \'Completed\'\nGROUP BY category\nHAVING COUNT(*) > 5\nORDER BY 2 DESC;',
    tags: ['sql', 'query-order', 'performance'],
    difficulty: 'hard',
    box: 1,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
  {
    id: 'fc_4',
    type: 'concept',
    topicId: 'statistics',
    prompt: 'What is Type I error and Type II error in statistics?',
    answer: 'Type I Error (False Positive) occurs when we reject a true null hypothesis (saying there is an effect when there is not). Type II Error (False Negative) occurs when we fail to reject a false null hypothesis (missing an actual effect).',
    tags: ['statistics', 'hypothesis-testing', 'ab-testing'],
    difficulty: 'hard',
    box: 1,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
  {
    id: 'fc_5',
    type: 'debug',
    topicId: 'numpy_essentials',
    prompt: 'Why does this trigger an error: `arr = np.array([1, 2, 3]) + np.array([1, 2])`?',
    answer: 'It fails because NumPy cannot broadcast shapes together unless the dimensions are compatible. Here, shape (3,) and shape (2,) cannot be aligned.',
    codeSnippet: '# ValueError: operands could not be broadcast together with shapes (3,) (2,)',
    tags: ['numpy', 'broadcasting', 'arrays'],
    difficulty: 'medium',
    box: 1,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  }
];

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'retail_sales',
    name: 'E-Commerce Transactions Dashboard',
    category: 'Retail',
    description: 'Clean transaction data from a global electronics retailer containing sales amounts, categories, product names, and order timestamps.',
    rowCount: 5000,
    columnCount: 6,
    fileSizeKB: 320,
    columns: [
      { name: 'transaction_id', type: 'VARCHAR', description: 'Unique invoice code' },
      { name: 'product', type: 'VARCHAR', description: 'Device sold' },
      { name: 'category', type: 'VARCHAR', description: 'Product sector (Audio, Phones, Laptops)' },
      { name: 'quantity', type: 'INTEGER', description: 'Units purchased' },
      { name: 'price', type: 'FLOAT', description: 'Price per unit in USD' },
      { name: 'timestamp', type: 'TIMESTAMP', description: 'Order exact date & time' }
    ],
    offlineCached: true,
    isSynthetic: false,
  },
  {
    id: 'healthcare_patients',
    name: 'Patient Admittance & Diagnostic Logs',
    category: 'Healthcare',
    description: 'Anonymized hospital logs with treatment queues, diagnosis classes, patient ages, days of stay, and readmission indicators.',
    rowCount: 2400,
    columnCount: 7,
    fileSizeKB: 180,
    columns: [
      { name: 'patient_id', type: 'INTEGER', description: 'Anonymized identity label' },
      { name: 'age', type: 'INTEGER', description: 'Age of patient' },
      { name: 'department', type: 'VARCHAR', description: 'Admitting hospital clinic' },
      { name: 'diagnosis', type: 'VARCHAR', description: 'Coded diagnosis' },
      { name: 'admission_date', type: 'DATE', description: 'Date patient was admitted' },
      { name: 'days_admitted', type: 'INTEGER', description: 'Duration of hospitalization' },
      { name: 'readmitted', type: 'BOOLEAN', description: 'Whether they returned within 30 days' }
    ],
    offlineCached: true,
    isSynthetic: false,
  },
  {
    id: 'finance_churn',
    name: 'Banking Subscription Retention & Churn',
    category: 'Finance',
    description: 'SaaS style subscriber analytics tracking account active tenure, transaction frequency, credit scores, geography, and active exit codes.',
    rowCount: 1200,
    columnCount: 6,
    fileSizeKB: 95,
    columns: [
      { name: 'customer_id', type: 'VARCHAR', description: 'Customer identifier' },
      { name: 'credit_score', type: 'INTEGER', description: 'FICO score index' },
      { name: 'balance', type: 'FLOAT', description: 'Account total deposit in USD' },
      { name: 'tenure_months', type: 'INTEGER', description: 'Active engagement span' },
      { name: 'active_member', type: 'BOOLEAN', description: 'Interactive flag' },
      { name: 'churned', type: 'BOOLEAN', description: 'Whether the subscriber canceled' }
    ],
    offlineCached: true,
    isSynthetic: true,
  }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_welcome',
    title: 'Hello Analyst!',
    description: 'Boot up the Personal DALOS environment for the first time.',
    unlockedAt: null,
    icon: 'Terminal',
    xpReward: 100,
    category: 'curriculum',
    threshold: 1,
    currentValue: 0
  },
  {
    id: 'ach_streak_3',
    title: 'Daily Rhythm',
    description: 'Maintain a 3-day learning streak in DALOS.',
    unlockedAt: null,
    icon: 'Flame',
    xpReward: 300,
    category: 'streak',
    threshold: 3,
    currentValue: 1
  },
  {
    id: 'ach_ide_runs',
    title: 'Compile Success',
    description: 'Execute Python or SQL code in the local runtime 10 times.',
    unlockedAt: null,
    icon: 'Code',
    xpReward: 200,
    category: 'ide',
    threshold: 10,
    currentValue: 0
  },
  {
    id: 'ach_flashcard_master',
    title: 'Spaced Mastery',
    description: 'Review and pass 5 flashcards correctly in the revision engine.',
    unlockedAt: null,
    icon: 'CheckSquare',
    xpReward: 250,
    category: 'accuracy',
    threshold: 5,
    currentValue: 0
  }
];

export const DEFAULT_PROGRESS: ProgressState = {
  xp: 0,
  level: 1,
  dailyStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  learningMinutes: 0,
  challengesSolved: 0,
  projectsCompleted: 0,
  lessonsCompleted: 0,
  heatmap: {
    [new Date().toISOString().split('T')[0]]: 100 // default starting day gain
  },
  achievements: DEFAULT_ACHIEVEMENTS
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'slate',
  fontSize: 'md',
  editorTheme: 'vs-dark',
  executionTimeLimitMs: 5000,
  offlineCacheEnabled: true,
  apiKeys: {
    gemini: ''
  }
};

export const INITIAL_NOTEBOOKS: NotebookState[] = [
  {
    id: 'nb_eda_tutorial',
    title: 'Exploratory Data Analysis Template',
    cells: [
      {
        id: 'nb_c1',
        type: 'markdown',
        content: '## Exploratory Data Analysis (EDA) on Retail Sales\n\nWelcome to your analytical notebook! Let us perform Python and SQL data processing directly in the local sandbox. In this notebook, we load transaction logs and generate insights.'
      },
      {
        id: 'nb_c2',
        type: 'python',
        content: 'import numpy as np\n# Sample analytics array representing daily revenue in USD\nrevenue = np.array([1200, 1540, 980, 2200, 1850, 2900, 3100])\nprint("Average revenue: $", np.mean(revenue))\nprint("Max revenue: $", np.max(revenue))\nprint("Standard deviation: $", round(np.std(revenue), 2))'
      },
      {
        id: 'nb_c3',
        type: 'sql',
        content: 'SELECT category, SUM(quantity * price) as total_sales, COUNT(*) as txn_count\nFROM retail_sales\nGROUP BY category\nORDER BY total_sales DESC;'
      }
    ],
    updatedAt: new Date().toISOString()
  }
];

// --- SEED SEED DATABASE UTILITY ---

export async function seedDatabase() {
  const topicCount = await db.topics.count();
  if (topicCount === 0) {
    // Seed topics
    await db.topics.bulkAdd(INITIAL_TOPICS);

    // Seed Knowledge Graph Status
    const kgNodes: KnowledgeNode[] = INITIAL_TOPICS.map((topic, index) => {
      // Begin with Python basic at 35% mastery, everything else 0%
      const startingMastery = topic.id === 'python_basics' ? 35 : 0;
      return {
        topicId: topic.id,
        mastery: startingMastery,
        confidence: startingMastery > 0 ? 3 : 1,
        memoryDecay: 0.1,
        hintUsageCount: 0,
        errorFrequency: 0,
        speedScore: 100,
        revisionScore: 0,
        dependencyScore: INITIAL_TOPICS.filter(t => t.prerequisites.includes(topic.id)).length,
        lastPracticedAt: startingMastery > 0 ? new Date().toISOString() : null,
        nextReviewAt: startingMastery > 0 ? new Date(Date.now() + 86400000).toISOString() : null, // tomorrow
      };
    });
    await db.knowledgeGraph.bulkAdd(kgNodes);

    // Seed Progress State
    await db.progress.add({ id: 'current', ...DEFAULT_PROGRESS });

    // Seed Flashcards
    await db.flashcards.bulkAdd(INITIAL_FLASHCARDS);

    // Seed Datasets
    await db.datasets.bulkAdd(INITIAL_DATASETS);

    // Seed Notebooks
    await db.notebooks.bulkAdd(INITIAL_NOTEBOOKS);

    // Seed Settings
    await db.settings.add({ id: 'current', ...DEFAULT_SETTINGS });
    
    console.log('IndexedDB database successfully seeded.');
  }
}
