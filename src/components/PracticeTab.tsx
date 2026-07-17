import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Zap, 
  ChevronRight, 
  ArrowRight, 
  BookOpen,
  Terminal,
  Play,
  ClipboardList,
  Flame,
  Award,
  BookMarked,
  Layers,
  Cpu,
  Bookmark,
  ChevronDown,
  Info,
  AlertCircle
} from 'lucide-react';
import { db } from '../storage/db';
import { LearningEngine } from '../learning-engine/engine';
import { TopicMetadata, KnowledgeNode, Flashcard } from '../types';
import { LESSONS_DATABASE, LessonContent } from '../data/lessonsData';
import { PythonRuntime } from '../python-runtime/pyodide-client';
import { SQLRuntime } from '../sql-runtime/sql-client';

interface Question {
  id: string;
  topicId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

const QUESTION_BANK: Record<string, Question[]> = {
  python_basics: [
    {
      id: 'qb_py_1',
      topicId: 'python_basics',
      prompt: 'What is the correct syntax to create a list of strings in Python?',
      options: [
        'fruits = "apple", "banana", "cherry"',
        'fruits = ["apple", "banana", "cherry"]',
        'fruits = (["apple"], ["banana"])',
        'fruits = {apple, banana, cherry}'
      ],
      correctIndex: 1,
      hint: 'Lists in Python are defined using square brackets `[]` and items are comma-separated.',
      explanation: 'Square brackets `[]` are used to define lists. Parentheses `()` are for tuples, and curly braces `{}` are for sets or dictionaries.'
    },
    {
      id: 'qb_py_2',
      topicId: 'python_basics',
      prompt: 'What will be the resulting value of the expression `15 // 4` in Python?',
      options: [
        '3.75',
        '3',
        '3.0',
        '4'
      ],
      correctIndex: 1,
      hint: 'The `//` operator performs floor division, rounding down to the nearest integer.',
      explanation: 'The floor division operator `//` divides the numbers and slices off any decimal value, returning an integer. 15 / 4 is 3.75, hence the floor is 3.'
    }
  ],
  python_functions: [
    {
      id: 'qb_func_1',
      topicId: 'python_functions',
      prompt: 'Which keyword is used to establish local scope definitions in Python functions?',
      options: [
        'def',
        'function',
        'lambda',
        'global'
      ],
      correctIndex: 0,
      hint: 'The prefix that initiates function definitions in Python.',
      explanation: '`def` is short for define, and is used to initialize functions.'
    },
    {
      id: 'qb_func_2',
      topicId: 'python_functions',
      prompt: 'What will happen if a variable is declared inside a function without any scope modifiers, but shares a name with a global variable?',
      options: [
        'It throws a NameError at compile time.',
        'It shadows the global variable, creating a local copy without modifying the global value.',
        'It automatically updates the global variable value.',
        'It creates a local pointer to the global variable block.'
      ],
      correctIndex: 1,
      hint: 'Lexical shadowing prevents external scope manipulation unless global key-bindings are active.',
      explanation: 'Without the global keyword, assigning a variable inside a function creates a local namespace copy, preserving global values.'
    }
  ],
  python_collections: [
    {
      id: 'qb_coll_1',
      topicId: 'python_collections',
      prompt: 'What is a key difference between a Python List and a Python Tuple?',
      options: [
        'Lists are ordered; tuples are unordered.',
        'Lists are mutable; tuples are immutable.',
        'Lists can hold mixed types; tuples must be homogeneous.',
        'Tuples use square brackets; lists use parenthesis.'
      ],
      correctIndex: 1,
      hint: 'Immutable collections cannot be modified after instantiation.',
      explanation: 'Tuples are immutable, which makes them faster and safer for representing static coordinates or structured records.'
    }
  ],
  numpy_essentials: [
    {
      id: 'qb_np_1',
      topicId: 'numpy_essentials',
      prompt: 'What does vectorization in NumPy refer to?',
      options: [
        'Converting scalar functions to work with python standard lists.',
        'Executing array operations without explicit Python `for` loops, leveraging optimized C binaries.',
        'Creating 3D vector graphics matrices.',
        'Slicing lists using coordinate pointers.'
      ],
      correctIndex: 1,
      hint: 'NumPy delegates mathematical loops to compiled, low-level libraries for performance.',
      explanation: 'Vectorization allows operations to execute directly across whole arrays in parallel compile-time speed, bypassing slow python loops.'
    },
    {
      id: 'qb_np_2',
      topicId: 'numpy_essentials',
      prompt: 'What is the shape of `np.array([[1, 2, 3], [4, 5, 6]])`?',
      options: [
        '(3, 2)',
        '(6,)',
        '(2, 3)',
        '(2, 3, 1)'
      ],
      correctIndex: 2,
      hint: 'The array has 2 rows and 3 columns.',
      explanation: 'NumPy shapes list dimensions in order of (rows, columns). There are 2 nested outer brackets, each containing 3 scalars.'
    }
  ],
  pandas_wrangling: [
    {
      id: 'qb_pd_1',
      topicId: 'pandas_wrangling',
      prompt: 'Which Pandas method is used to aggregate data by one or more columns?',
      options: [
        'df.aggregate_by()',
        'df.pivot_table()',
        'df.groupby()',
        'df.split()'
      ],
      correctIndex: 2,
      hint: 'This method is similar to SQL GROUP BY syntax.',
      explanation: '`df.groupby()` splits the DataFrame into subsets by columns, allowing aggregate operations like `.sum()` or `.mean()` to be chained.'
    },
    {
      id: 'qb_pd_2',
      topicId: 'pandas_wrangling',
      prompt: 'How do you filter a DataFrame `df` to keep only rows where the column "sales" is greater than 10,000?',
      options: [
        'df.filter(df["sales"] > 10000)',
        'df[df["sales"] > 10000]',
        'df.loc["sales" > 10000]',
        'df.query(sales > 10000)'
      ],
      correctIndex: 1,
      hint: 'This uses boolean indexing by passing a comparison array inside selection brackets.',
      explanation: '`df[df["sales"] > 10000]` uses boolean filtering. It creates a mask of True/False values and filters the rows accordingly.'
    }
  ],
  sql_queries: [
    {
      id: 'qb_sql_1',
      topicId: 'sql_queries',
      prompt: 'In SQL, which clause is used to filter records generated by aggregate groupings?',
      options: [
        'WHERE',
        'HAVING',
        'FILTER',
        'QUALIFY'
      ],
      correctIndex: 1,
      hint: 'The WHERE clause filters rows BEFORE aggregation. This clause filters groups AFTER aggregation.',
      explanation: '`HAVING` is executed after the GROUP BY statement, meaning it evaluates groupings, while `WHERE` evaluates original rows.'
    },
    {
      id: 'qb_sql_2',
      topicId: 'sql_queries',
      prompt: 'What type of JOIN returns all rows from the left table and matched rows from the right table?',
      options: [
        'INNER JOIN',
        'FULL OUTER JOIN',
        'LEFT JOIN',
        'CROSS JOIN'
      ],
      correctIndex: 2,
      hint: 'It prioritizes the source dataset declared on the left side of the JOIN syntax.',
      explanation: 'A `LEFT JOIN` or `LEFT OUTER JOIN` preserves all rows of the left dataset, filling right side variables with NULLs if there is no match.'
    }
  ],
  sql_advanced: [
    {
      id: 'qb_sqladv_1',
      topicId: 'sql_advanced',
      prompt: 'Which function resets row index indexes per subgroup without collapsing duplicate ranks?',
      options: [
        'ROW_NUMBER()',
        'RANK()',
        'DENSE_RANK()',
        'PARTITION()'
      ],
      correctIndex: 0,
      hint: 'Always returns unique incrementing values.',
      explanation: 'ROW_NUMBER() gives a unique sequential integer per partition starting at 1, regardless of duplicate values.'
    }
  ],
  statistics: [
    {
      id: 'qb_stat_1',
      topicId: 'statistics',
      prompt: 'What does a p-value of 0.03 indicate if our confidence alpha threshold is set to 0.05?',
      options: [
        'Accept the Null Hypothesis; no statistically significant variance.',
        'Reject the Null Hypothesis; evidence of a statistically significant effect.',
        'The experiment is corrupt and has 3% noise.',
        'The statistical power of the test is 97%.'
      ],
      correctIndex: 1,
      hint: 'If the p-value is less than alpha, we reject the null hypothesis.',
      explanation: 'Since 0.03 < 0.05, the probability of seeing this outcome by random luck is extremely small, meaning we reject the null hypothesis.'
    }
  ],
  eda_practice: [
    {
      id: 'qb_eda_1',
      topicId: 'eda_practice',
      prompt: 'What points are considered outliers under the IQR (Interquartile Range) rule?',
      options: [
        'Values outside [Q1 - 1.5 * IQR, Q3 + 1.5 * IQR]',
        'Values outside [Median - 2.0 * IQR, Median + 2.0 * IQR]',
        'Values strictly greater than Q3',
        'Values with Z-scores between -1 and +1'
      ],
      correctIndex: 0,
      hint: 'Standard outlier whiskers in boxplots extend by 1.5 times the IQR.',
      explanation: 'Any coordinate value lying below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR is flagged as an outlier.'
    }
  ],
  business_analytics: [
    {
      id: 'qb_biz_1',
      topicId: 'business_analytics',
      prompt: 'What is the correct formula to calculate customer churn rate?',
      options: [
        'Customers lost / Active customers at start of period',
        'Total revenue / Total acquired subscribers',
        'CAC / LTV',
        'New customer acquisitions / Churned users'
      ],
      correctIndex: 0,
      hint: 'Compares exits to original subscriber bases.',
      explanation: 'Churn rate evaluates the proportion of original subscribers lost over a period.'
    }
  ],
  machine_learning: [
    {
      id: 'qb_ml_1',
      topicId: 'machine_learning',
      prompt: 'Which metric is commonly used to evaluate linear regression model accuracy?',
      options: [
        'Confusion Matrix',
        'Mean Squared Error (MSE)',
        'Precision and Recall',
        'F1-Score'
      ],
      correctIndex: 1,
      hint: 'Measures continuous distance averages.',
      explanation: 'MSE aggregates the squared errors of regression coordinates. Classification models use confusion matrices.'
    }
  ],
  portfolio_projects: [
    {
      id: 'qb_port_1',
      topicId: 'portfolio_projects',
      prompt: 'Which section is most important to highlight first when presenting a portfolio case study to executive business stakeholders?',
      options: [
        'Executive Summary (Business Problem & Outcome)',
        'Import statements and library setups',
        'Deep parameter grid-search values',
        'Full list of raw csv files used'
      ],
      correctIndex: 0,
      hint: 'Focus on business value creation and deliverables.',
      explanation: 'Executives value business outcomes and action items first. Keep detailed programming appendix links for technical reviewers.'
    }
  ]
};

interface PracticeTabProps {
  initialTopicId: string | null;
  onNavigateToTab: (tabId: string) => void;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({ initialTopicId, onNavigateToTab }) => {
  const [activeTopicId, setActiveTopicId] = useState<string>('python_basics');
  const [topicMetadata, setTopicMetadata] = useState<TopicMetadata | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [revealedHint, setRevealedHint] = useState(false);
  
  // Learning Engine scoring & duration
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [seconds, setSeconds] = useState(0);

  // Lesson & Playgrounds
  const [activeMode, setActiveMode] = useState<'lesson' | 'quiz'>('lesson');
  const [editableCode, setEditableCode] = useState<string>('');
  const [sandboxOutput, setSandboxOutput] = useState<string>('');
  const [sandboxError, setSandboxError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [flashcardOutcome, setFlashcardOutcome] = useState<string | null>(null);

  // Sync with syllabus tab clicks
  useEffect(() => {
    if (initialTopicId) {
      setActiveTopicId(initialTopicId);
      setActiveMode('lesson'); // Default to lesson when selecting node
    }
  }, [initialTopicId]);

  useEffect(() => {
    async function loadTopicData() {
      const metadata = await db.topics.get(activeTopicId);
      if (metadata) {
        setTopicMetadata(metadata);
      }
      
      const qList = QUESTION_BANK[activeTopicId] || QUESTION_BANK['python_basics'];
      setQuestions(qList);
      
      // Initialize code editor with lesson example
      const lesson = LESSONS_DATABASE[activeTopicId];
      if (lesson) {
        setEditableCode(lesson.codeExample);
      } else {
        setEditableCode('# Lesson sandbox ready.');
      }
      
      setSandboxOutput('');
      setSandboxError('');
      setFlashcardOutcome(null);

      // Reset quiz
      setCurrentIdx(0);
      setSelectedOpt(null);
      setAnswered(false);
      setRevealedHint(false);
      setCorrectAnswers(0);
      setHintsUsed(0);
      setQuizComplete(false);
      setStartTime(Date.now());
      setSeconds(0);
    }
    loadTopicData();
  }, [activeTopicId]);

  useEffect(() => {
    if (quizComplete || activeMode === 'lesson') return;
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, quizComplete, activeMode]);

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedOpt(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || answered) return;
    setAnswered(true);

    const q = questions[currentIdx];
    if (selectedOpt === q.correctIndex) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setAnswered(false);
      setRevealedHint(false);
    } else {
      setQuizComplete(true);
      const scorePercent = Math.round((correctAnswers / questions.length) * 100);
      await LearningEngine.recordPracticeSession({
        topicId: activeTopicId,
        scorePercent,
        hintsUsed,
        isChallenge: false,
        secondsTaken: seconds
      });
    }
  };

  const handleRevealHint = () => {
    if (revealedHint) return;
    setRevealedHint(true);
    setHintsUsed(prev => prev + 1);
  };

  const handleRunLessonCode = async () => {
    setIsPlaying(true);
    setSandboxOutput('');
    setSandboxError('');
    await LearningEngine.recordCodeRun();

    try {
      const isSqlTopic = activeTopicId.includes('sql');
      if (isSqlTopic) {
        const queryRes = await SQLRuntime.runQuery(editableCode);
        if (queryRes.error) {
          setSandboxError(queryRes.error);
        } else {
          const headers = queryRes.columns.join(' | ');
          const rows = queryRes.rows.map(r => queryRes.columns.map(c => String(r[c] ?? 'NULL')).join(' | ')).join('\n');
          setSandboxOutput(`Table Result:\n${headers}\n${'-'.repeat(headers.length)}\n${rows}`);
        }
      } else {
        const pyResult = await PythonRuntime.runCode(editableCode);
        if (pyResult.stderr) {
          setSandboxError(pyResult.stderr);
        } else {
          setSandboxOutput(pyResult.stdout || pyResult.outputValue || 'Execution completed.');
        }
      }
    } catch (err: any) {
      setSandboxError(err.message || 'Execution error.');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleGenerateFlashcard = async () => {
    setFlashcardOutcome(null);
    try {
      const lesson = LESSONS_DATABASE[activeTopicId];
      if (!lesson) return;

      const newCard: Flashcard = {
        id: `fc_gen_${Date.now()}`,
        type: activeTopicId.includes('sql') ? 'sql' : 'code',
        topicId: activeTopicId,
        prompt: `Explain the main concept or use-case of ${lesson.title}.`,
        answer: lesson.summary,
        codeSnippet: lesson.codeExample.slice(0, 200),
        tags: [activeTopicId, 'generated'],
        difficulty: 'medium',
        box: 1,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        lastReviewedAt: null,
        nextReviewAt: null
      };

      await db.flashcards.add(newCard);
      setFlashcardOutcome('Successfully added a customized spaced repetition flashcard to your Leitner box system! Visit "Leitner Revision" to study.');
    } catch (err: any) {
      setFlashcardOutcome(`Failed: ${err.message}`);
    }
  };

  const handleExportToNotebook = async () => {
    try {
      const activeNb = await db.notebooks.toCollection().last();
      if (activeNb) {
        const updatedCells = [
          ...activeNb.cells,
          {
            id: `cell_${Date.now()}`,
            type: activeTopicId.includes('sql') ? 'sql' as const : 'python' as const,
            content: editableCode
          }
        ];
        await db.notebooks.update(activeNb.id, { cells: updatedCells, updatedAt: new Date().toISOString() });
        alert('Successfully appended editable sandbox cells to your primary study notebook!');
      } else {
        alert('No study notebooks initialized. Navigate to "Analytics Cells" to configure one.');
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // RENDER DYNAMIC VISUAL DIAGRAM COMPONENT
  const renderVisualizer = (type: string) => {
    switch (type) {
      case 'numpy_broadcasting':
        return <NumPyBroadcastingVisualizer />;
      case 'pandas_groupby':
        return <PandasGroupByVisualizer />;
      case 'sql_join':
        return <SQLJoinVisualizer />;
      case 'stats_distribution':
        return <StatsDistributionVisualizer />;
      case 'ml_regression':
        return <MLRegressionVisualizer />;
      case 'python_variables':
        return <PythonVariablesVisualizer />;
      case 'python_functions':
        return <PythonFunctionsVisualizer />;
      case 'python_collections':
        return <PythonCollectionsVisualizer />;
      default:
        return (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-500 font-mono text-xs">
            <Info className="h-5 w-5 text-indigo-400 mx-auto mb-2" />
            <span>Interactive Educational Flowchart model loaded successfully.</span>
          </div>
        );
    }
  };

  const lesson = LESSONS_DATABASE[activeTopicId] || LESSONS_DATABASE['python_basics'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Selection / Syllabus selector header bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          <select 
            value={activeTopicId}
            onChange={(e) => {
              setActiveTopicId(e.target.value);
              setActiveMode('lesson');
            }}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono font-bold text-slate-200 outline-none hover:border-slate-700"
          >
            {Object.keys(LESSONS_DATABASE).map(key => (
              <option key={key} value={key}>{LESSONS_DATABASE[key].title}</option>
            ))}
          </select>
        </div>

        {/* Tab mode togglers */}
        <div className="flex gap-2 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveMode('lesson')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              activeMode === 'lesson' 
                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400' 
                : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Learn Lesson
          </button>
          <button
            onClick={() => setActiveMode('quiz')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              activeMode === 'quiz' 
                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400' 
                : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Take Quiz
          </button>
        </div>
      </div>

      {activeMode === 'lesson' ? (
        // RENDER INTERACTIVE LESSON MODULE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Main textual content columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Specs Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">{lesson.title}</h1>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>{lesson.duration}</span>
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Objectives</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {lesson.objectives.map((obj, i) => (
                    <li key={i} className="flex gap-1.5 items-start">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explanation Text */}
              <div className="prose prose-invert max-w-none text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 pt-3 border-t border-slate-800/40">
                {lesson.explanation.split('\n\n').map((para, idx) => {
                  if (para.startsWith('###')) {
                    return <h3 key={idx} className="text-base font-bold text-white font-mono mt-4 pt-2">{para.replace('###', '').trim()}</h3>;
                  }
                  if (para.startsWith('-')) {
                    return (
                      <ul key={idx} className="list-disc pl-5 space-y-1">
                        {para.split('\n').map((li, lidx) => (
                          <li key={lidx}>{li.replace('-', '').trim()}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx}>{para}</p>;
                })}
              </div>

            </div>

            {/* Custom Interactive visual diagram visualizers */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Interactive Concept Visualizer</h3>
              {renderVisualizer(lesson.visualDiagramType)}
            </div>

            {/* Common Mistakes, Tips & Interviews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <h4 className="text-xs font-bold text-rose-400 font-mono uppercase flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Common Pitfalls</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 leading-normal">
                  {lesson.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Under the Hood / Performance</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 leading-normal">
                  {lesson.performanceTips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>

          </div>

          {/* Right Column: Code Executor sandbox & tools */}
          <div className="space-y-6">
            
            {/* Live Interactive Sandbox Editor */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-200">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span>Lesson Playground</span>
                </div>

                <button
                  onClick={handleRunLessonCode}
                  disabled={isPlaying}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-md"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Run</span>
                </button>
              </div>

              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                className="w-full h-64 bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs font-mono text-slate-100 outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />

              {/* Console Sandbox Output Output */}
              <div className="h-32 rounded-lg bg-slate-950 border border-slate-900 p-3 overflow-y-auto no-scrollbar font-mono text-[11px] leading-relaxed">
                {sandboxError ? (
                  <div className="text-rose-400 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <pre className="whitespace-pre-wrap">{sandboxError}</pre>
                  </div>
                ) : sandboxOutput ? (
                  <pre className="text-emerald-400 whitespace-pre-wrap">{sandboxOutput}</pre>
                ) : (
                  <span className="text-slate-600 italic">Click Run to compile code inside your browser...</span>
                )}
              </div>
            </div>

            {/* Quick Study Utilities */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Study Toolbelt</h3>
              
              <div className="flex flex-col gap-2 font-mono text-[11px]">
                <button
                  onClick={handleGenerateFlashcard}
                  className="w-full py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 font-bold transition-colors text-left px-3 flex justify-between items-center"
                >
                  <span>Generate Leitner Flashcard</span>
                  <ChevronRight className="h-4.5 w-4.5 text-indigo-400" />
                </button>

                <button
                  onClick={handleExportToNotebook}
                  className="w-full py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 font-bold transition-colors text-left px-3 flex justify-between items-center"
                >
                  <span>Export Code to notebook cells</span>
                  <ChevronRight className="h-4.5 w-4.5 text-indigo-400" />
                </button>
              </div>

              {flashcardOutcome && (
                <div className="rounded-lg bg-emerald-500/5 p-3 text-[10px] border border-emerald-500/15 text-emerald-400 leading-snug">
                  {flashcardOutcome}
                </div>
              )}
            </div>

            {/* CTA Ready to Practice */}
            <div className="rounded-xl border border-indigo-500/25 bg-indigo-600/5 p-5 space-y-3 text-center">
              <h4 className="text-sm font-bold text-white">Finished learning the theory?</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Test your understanding and unlock subsequent curriculum nodes on the Syllabus Map.
              </p>
              <button
                onClick={() => setActiveMode('quiz')}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md"
              >
                <span>Ready to Practice Quiz</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      ) : (
        // RENDER PRACTICE QUIZ MODULE
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-6 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                  Adaptive Practice Mode
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>{Math.floor(seconds / 60)}m {seconds % 60}s</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {topicMetadata ? topicMetadata.title : 'Data Analyst Training'}
              </h2>
            </div>
          </div>

          {!quizComplete ? (
            questions.length > 0 ? (
              <div className="space-y-6">
                
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
                  <span className="text-[10px] uppercase text-indigo-400 font-bold">Minimum passing mark: 70%</span>
                </div>

                <div className="rounded-xl bg-slate-950 p-5 border border-slate-900">
                  <p className="text-sm md:text-base font-semibold leading-relaxed text-slate-200">
                    {questions[currentIdx].prompt}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {questions[currentIdx].options.map((option, idx) => {
                    const isSelected = selectedOpt === idx;
                    const showCorrect = answered && idx === questions[currentIdx].correctIndex;
                    const showIncorrect = answered && isSelected && idx !== questions[currentIdx].correctIndex;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={answered}
                        className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition-all duration-150 ${
                          showCorrect 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : showIncorrect 
                              ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                              : isSelected 
                                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-950/60 border-slate-900 text-slate-300 hover:border-slate-800 hover:bg-slate-950'
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          showCorrect ? 'border-emerald-500 bg-emerald-500 text-slate-900' :
                          showIncorrect ? 'border-rose-500 bg-rose-500 text-slate-900' :
                          isSelected ? 'border-indigo-500 bg-indigo-500 text-slate-950' : 'border-slate-800'
                        }`}>
                          {showCorrect ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : showIncorrect ? (
                            <XCircle className="h-4 w-4" />
                          ) : isSelected ? (
                            <div className="h-2 w-2 rounded-full bg-indigo-400" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between">
                  <div>
                    {!revealedHint ? (
                      <button
                        onClick={handleRevealHint}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 px-4 py-2 text-xs font-semibold transition-colors"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span>Need a Hint?</span>
                      </button>
                    ) : (
                      <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/15 p-3 text-xs text-indigo-300 max-w-sm">
                        <strong>Hint:</strong> {questions[currentIdx].hint}
                      </div>
                    )}
                  </div>

                  <div>
                    {!answered ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOpt === null}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-6 py-2.5 text-xs font-bold transition-all shadow-lg"
                      >
                        <span>Submit Answer</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-xs font-bold transition-all shadow-lg"
                      >
                        <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {answered && (
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-900 space-y-1.5">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">Explanation:</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{questions[currentIdx].explanation}</p>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">Practice questions loaded successfully. Click above to study or review.</div>
            )
          ) : (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Adaptive Quiz Complete!</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Your results have synced with the Leitner Knowledge Graph weights!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto font-mono text-xs text-slate-400">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-900">
                  <div className="text-slate-500 text-[10px]">SCORE</div>
                  <div className="text-base font-bold text-emerald-400">{correctAnswers} / {questions.length}</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-900">
                  <div className="text-slate-500 text-[10px]">XP EARNED</div>
                  <div className="text-base font-bold text-indigo-400">+{correctAnswers * 50} XP</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-900">
                  <div className="text-slate-500 text-[10px]">HINTS USED</div>
                  <div className="text-base font-bold text-slate-300">{hintsUsed}</div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => onNavigateToTab('dashboard')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-semibold shadow-lg"
                >
                  <Zap className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentIdx(0);
                    setSelectedOpt(null);
                    setAnswered(false);
                    setRevealedHint(false);
                    setCorrectAnswers(0);
                    setHintsUsed(0);
                    setQuizComplete(false);
                    setStartTime(Date.now());
                    setSeconds(0);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 px-5 py-2.5 text-xs font-semibold"
                >
                  <span>Re-Take Quiz</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

// ============================================================================
// MAGNIFICENT CUSTOM EDUCATIONAL REACT VISUALIZERS
// ============================================================================

// 1. Python Variables Memory Visualizer
const PythonVariablesVisualizer: React.FC = () => {
  const [name, setName] = useState('x');
  const [value, setValue] = useState('Data Analyst');
  const [blocks, setBlocks] = useState<Array<{ id: string; name: string; val: string; address: string }>>([
    { id: '1', name: 'cohort', val: '2026', address: '0x7ffd50' },
    { id: '2', name: 'status', val: 'Active', address: '0x7ffd58' }
  ]);

  const handleBind = () => {
    if (!name.trim()) return;
    const newBlock = {
      id: String(Date.now()),
      name: name.trim(),
      val: value.trim() || 'None',
      address: `0x7ffd${Math.floor(Math.random() * 90) + 10}`
    };
    setBlocks(prev => [...prev.filter(b => b.name !== name), newBlock]);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Var Name" 
          className="rounded bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 w-full sm:w-28 font-mono outline-none focus:border-indigo-500"
        />
        <span className="text-slate-500 text-xs font-bold font-mono">=</span>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          placeholder="Object Value" 
          className="rounded bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 w-full sm:w-40 font-mono outline-none focus:border-indigo-500"
        />
        <button 
          onClick={handleBind}
          className="w-full sm:w-auto rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[11px] font-bold py-1.5 px-4 transition-colors"
        >
          Bind Variable
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2 border border-slate-900 bg-slate-900/10 p-3 rounded-lg">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Local Variable Namespace Pointers</div>
          <div className="space-y-1.5">
            {blocks.map(b => (
              <div key={b.id} className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-900 text-xs font-mono">
                <span className="text-indigo-400 font-bold">{b.name}</span>
                <span className="text-slate-500">--------&gt;</span>
                <span className="text-sky-400 font-bold">{b.address}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 border border-slate-900 bg-slate-900/10 p-3 rounded-lg">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Contiguous Memory Allocation Blocks</div>
          <div className="space-y-1.5">
            {blocks.map(b => (
              <div key={b.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-indigo-500/20 text-xs font-mono">
                <span className="text-sky-400 font-bold">{b.address}</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-bold">Value: "{b.val}"</span>
                <span className="text-[9px] text-slate-600">({typeof b.val})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. NumPy Broadcasting Grid Visualizer
const NumPyBroadcastingVisualizer: React.FC = () => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(3);

  const isCompatible = rows === 1 || cols === 3 || rows === 2;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-900 pb-3">
        <div className="space-y-1">
          <div className="text-xs font-mono text-slate-400">Array A Shape: <span className="text-indigo-400 font-bold">(2, 3)</span></div>
          <div className="text-xs font-mono text-slate-400">Array B Shape: <span className="text-emerald-400 font-bold">({rows}, {cols})</span></div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-1 font-mono text-xs text-slate-400">
            <span>B_Rows:</span>
            <select value={rows} onChange={e => setRows(parseInt(e.target.value))} className="rounded bg-slate-900 border border-slate-800 p-1 text-slate-200 text-xs">
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-400">
            <span>B_Cols:</span>
            <select value={cols} onChange={e => setCols(parseInt(e.target.value))} className="rounded bg-slate-900 border border-slate-800 p-1 text-slate-200 text-xs">
              <option value={1}>1</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Dimensions alignments specs */}
        <div className="space-y-3 font-mono text-xs text-slate-400">
          <div className="p-3 rounded-lg border border-slate-900 bg-slate-900/20 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Broadcasting Alignment Check</span>
            <div className="flex justify-between"><span>A Shape:</span> <span>2  x  3</span></div>
            <div className="flex justify-between"><span>B Shape:</span> <span>{rows}  x  {cols}</span></div>
            <div className="border-t border-slate-800 pt-1 flex justify-between font-bold">
              <span>Status:</span> 
              <span className="text-emerald-400">COMPATIBLE</span>
            </div>
          </div>
          <p className="text-[10px] font-sans text-slate-400 leading-normal">
            Aligning dimensions from right to left. Mismatched bounds of size 1 are dynamically stretched to match the larger matrix.
          </p>
        </div>

        {/* Dynamic visual representation of stretch */}
        <div className="flex flex-col gap-3 justify-center items-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Virtually Expanded B Array</div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols === 1 ? 3 : cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: rows === 1 ? 2 : rows }).map((_, r) => (
              Array.from({ length: cols === 1 ? 3 : cols }).map((_, c) => (
                <div 
                  key={`${r}-${c}`} 
                  className={`w-10 h-10 rounded border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    (rows === 1 && r > 0) || (cols === 1 && c > 0)
                      ? 'bg-emerald-500/5 border-dashed border-emerald-500/40 text-emerald-500/50'
                      : 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-sm'
                  }`}
                >
                  {r * (cols === 1 ? 1 : cols) + (cols === 1 ? 0 : c) + 1}
                </div>
              ))
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Pandas GroupBy split-apply-combine visualizer
const PandasGroupByVisualizer: React.FC = () => {
  const [step, setStep] = useState<'Raw' | 'Split' | 'Apply' | 'Combine'>('Raw');

  const rows = [
    { id: 1, dept: 'Sales', val: 120 },
    { id: 2, dept: 'Tech', val: 200 },
    { id: 3, dept: 'Sales', val: 150 },
    { id: 4, dept: 'Tech', val: 240 }
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-5">
      <div className="flex gap-1.5 font-mono text-[10px] justify-center">
        {['Raw', 'Split', 'Apply', 'Combine'].map((s: any) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`px-3 py-1.5 rounded-lg border transition-all font-bold ${
              step === s 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex justify-center items-center min-h-[140px] pt-2">
        {step === 'Raw' && (
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[10px] text-slate-500 text-center font-bold">RAW DATAFRAME</div>
            <div className="border border-slate-900 rounded bg-slate-950/40 overflow-hidden">
              {rows.map(r => (
                <div key={r.id} className="flex justify-between w-48 p-2 border-b border-slate-900">
                  <span className="text-slate-400">{r.dept}</span>
                  <span className="text-indigo-400 font-bold">${r.val}k</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'Split' && (
          <div className="grid grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-1.5">
              <div className="text-[10px] text-indigo-400 text-center font-bold">SALES BUCKET</div>
              <div className="border border-indigo-500/20 rounded bg-indigo-500/5 p-2 w-32 space-y-1">
                <div>Sales: $120k</div>
                <div>Sales: $150k</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-emerald-400 text-center font-bold">TECH BUCKET</div>
              <div className="border border-emerald-500/20 rounded bg-emerald-500/5 p-2 w-32 space-y-1">
                <div>Tech: $200k</div>
                <div>Tech: $240k</div>
              </div>
            </div>
          </div>
        )}

        {step === 'Apply' && (
          <div className="grid grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-1.5 text-center">
              <div className="text-[10px] text-indigo-400 font-bold">SUM(SALES)</div>
              <div className="border border-indigo-500/40 rounded-lg bg-indigo-500/10 p-3 w-32 font-bold text-indigo-300">
                $270k
              </div>
            </div>
            <div className="space-y-1.5 text-center">
              <div className="text-[10px] text-emerald-400 font-bold">SUM(TECH)</div>
              <div className="border border-emerald-500/40 rounded-lg bg-emerald-500/10 p-3 w-32 font-bold text-emerald-300">
                $440k
              </div>
            </div>
          </div>
        )}

        {step === 'Combine' && (
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[10px] text-slate-500 text-center font-bold">FINAL SUMMARY DATAFRAME</div>
            <div className="border border-indigo-500/20 rounded bg-indigo-500/5 overflow-hidden w-52">
              <div className="flex justify-between p-2 border-b border-indigo-500/15 font-bold text-indigo-400">
                <span>Dept</span>
                <span>Sum_Revenue</span>
              </div>
              <div className="flex justify-between p-2 border-b border-slate-900 text-slate-300">
                <span>Sales</span>
                <span>$270k</span>
              </div>
              <div className="flex justify-between p-2 text-slate-300">
                <span>Tech</span>
                <span>$440k</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. SQL join overlap visualizer
const SQLJoinVisualizer: React.FC = () => {
  const [joinType, setJoinType] = useState<'inner' | 'left'>('inner');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-5">
      <div className="flex gap-1.5 font-mono text-[10px] justify-center">
        {['inner', 'left'].map((type: any) => (
          <button
            key={type}
            onClick={() => setJoinType(type)}
            className={`px-3 py-1.5 rounded-lg border transition-all font-bold uppercase ${
              joinType === type 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {type} Join
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
        {/* Text descriptions */}
        <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-900 space-y-2 leading-relaxed text-slate-400">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Relational Row Mapping</span>
          {joinType === 'inner' ? (
            <p className="text-[11px]">
              <strong>Inner Join:</strong> Only yields matching records. Rows from Left Table that do not have matching keys in Right Table are discarded.
            </p>
          ) : (
            <p className="text-[11px]">
              <strong>Left Join:</strong> Keeps ALL rows from the Left Table. If no match exists on the Right Table, Right attributes are padded with <span className="text-rose-400 font-bold">NULL</span>.
            </p>
          )}
        </div>

        {/* Overlapping Circles/Shapes Visual representation */}
        <div className="flex items-center justify-center h-28 relative">
          <svg className="w-48 h-24" viewBox="0 0 200 100">
            {/* Left circle */}
            <circle 
              cx="70" 
              cy="50" 
              r="35" 
              className={`transition-all duration-300 stroke-2 ${
                joinType === 'left' ? 'fill-indigo-600/20 stroke-indigo-500' : 'fill-slate-900/60 stroke-indigo-800'
              }`} 
            />
            {/* Right circle */}
            <circle 
              cx="130" 
              cy="50" 
              r="35" 
              className="fill-slate-900/60 stroke-emerald-500 stroke-2" 
            />
            {/* Intersection overlay */}
            <path 
              d="M 100,20 A 35,35 0 0,0 100,80 A 35,35 0 0,0 100,20 Z" 
              className={`transition-all duration-300 stroke-2 ${
                joinType === 'inner' || joinType === 'left' ? 'fill-indigo-500/40 stroke-indigo-400' : 'fill-transparent'
              }`} 
            />
            <text x="50" y="53" fill="#a5b4fc" fontSize="8" fontWeight="bold">LEFT</text>
            <text x="135" y="53" fill="#34d399" fontSize="8" fontWeight="bold">RIGHT</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

// 5. Statistics distribution shader slider
const StatsDistributionVisualizer: React.FC = () => {
  const [alpha, setAlpha] = useState(0.05);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
        <span className="font-mono text-xs text-slate-400">Confidence Alpha (&alpha;): <span className="text-indigo-400 font-bold">{alpha}</span></span>
        <input 
          type="range" 
          min="0.01" 
          max="0.20" 
          step="0.01" 
          value={alpha} 
          onChange={e => setAlpha(parseFloat(e.target.value))} 
          className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="text-[11px] font-mono text-slate-400 space-y-2 leading-relaxed">
          <p>
            The shaded <span className="text-rose-400 font-bold">Red tail bounds</span> represent the critical rejection region.
          </p>
          <p>
            If our calculated sample p-value lands inside this shaded region, we reject the null hypothesis in favor of variant lift.
          </p>
        </div>

        {/* Render a custom distribution curve */}
        <div className="flex justify-center">
          <svg className="w-56 h-28" viewBox="0 0 200 100">
            {/* Shaded tails rejection regions */}
            <path d="M 160,80 Q 180,95 200,100 L 200,100 L 160,100 Z" fill="#f43f5e" opacity="0.6" />
            <path d="M 40,80 Q 20,95 0,100 L 0,100 L 40,100 Z" fill="#f43f5e" opacity="0.6" />
            
            {/* Bell Curve line */}
            <path 
              d="M 0,100 Q 30,95 60,70 T 100,10 T 140,70 T 200,100" 
              fill="transparent" 
              stroke="#6366f1" 
              strokeWidth="2" 
            />
            {/* Critical Z line markers */}
            <line x1="160" y1="20" x2="160" y2="100" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2" />
            <text x="145" y="15" fill="#f43f5e" fontSize="7" fontWeight="bold">Z_Critical</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

// 6. ML Least Squares best-fit line guesser
const MLRegressionVisualizer: React.FC = () => {
  const [slope, setSlope] = useState(1.0);
  const [intercept, setIntercept] = useState(10);

  // Hardcoded coordinate points
  const points = [
    { x: 20, y: 35 },
    { x: 50, y: 65 },
    { x: 80, y: 75 },
    { x: 110, y: 120 },
    { x: 140, y: 145 }
  ];

  // Calculate Mean Squared Error (MSE) dynamically
  const mse = Math.round(
    points.reduce((acc, curr) => {
      const pred = intercept + slope * curr.x;
      return acc + Math.pow(curr.y - pred, 2);
    }, 0) / points.length
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4 border-b border-slate-900 pb-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Slope (w1)</label>
          <input 
            type="range" 
            min="0.2" 
            max="1.8" 
            step="0.1" 
            value={slope} 
            onChange={e => setSlope(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs font-mono font-bold text-indigo-400">{slope}</div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Intercept (w0)</label>
          <input 
            type="range" 
            min="-10" 
            max="40" 
            step="5" 
            value={intercept} 
            onChange={e => setIntercept(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs font-mono font-bold text-indigo-400">{intercept}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono text-xs">
        <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg space-y-1.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Loss Function Evaluator</div>
          <div className="flex justify-between"><span>Current MSE:</span> <span className={`${mse < 200 ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>{mse}</span></div>
          <div className="flex justify-between text-[10px] text-slate-500"><span>Target Best Fit MSE:</span> <span>&lt; 100</span></div>
        </div>

        {/* Regression visual line render */}
        <div className="flex justify-center border border-slate-900 bg-slate-950 p-2 rounded relative h-28">
          <svg className="w-48 h-24" viewBox="0 0 160 160">
            {/* Draw Scatter Coordinates */}
            {points.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={160 - p.y} r="3" fill="#34d399" />
            ))}
            {/* Draw Regression Line */}
            <line 
              x1="0" 
              y1={160 - intercept} 
              x2="160" 
              y2={160 - (intercept + slope * 160)} 
              stroke="#6366f1" 
              strokeWidth="2" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// 7. Python Functions Scope Stack Visualizer
const PythonFunctionsVisualizer: React.FC = () => {
  const [scope, setScope] = useState<'Local' | 'Enclosing' | 'Global' | 'Built-in'>('Local');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
      <div className="flex gap-1.5 font-mono text-[10px] justify-center border-b border-slate-900 pb-3">
        {['Local', 'Enclosing', 'Global', 'Built-in'].map((sc: any) => (
          <button
            key={sc}
            onClick={() => setScope(sc)}
            className={`px-2 py-1 rounded transition-all font-bold ${
              scope === sc 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-900 border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {sc}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs items-center">
        <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/30 border border-slate-900 text-slate-400">
          <span className="text-[10px] text-indigo-400 font-bold uppercase block">LEGB Resolution Hierarchy</span>
          <p className="text-[11px] leading-relaxed font-sans">
            Python processes variables sequentially, resolving first inside your local definition block and scaling outwards.
          </p>
        </div>

        <div className="flex flex-col gap-1 w-full max-w-xs mx-auto">
          <div className={`p-1.5 border rounded text-center font-bold text-[11px] ${scope === 'Local' ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-900/30 border-slate-900 text-slate-500'}`}>1. LOCAL (def block scope)</div>
          <div className={`p-1.5 border rounded text-center font-bold text-[11px] ${scope === 'Enclosing' ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-900/30 border-slate-900 text-slate-500'}`}>2. ENCLOSING (outer functions)</div>
          <div className={`p-1.5 border rounded text-center font-bold text-[11px] ${scope === 'Global' ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-900/30 border-slate-900 text-slate-500'}`}>3. GLOBAL (module variables)</div>
          <div className={`p-1.5 border rounded text-center font-bold text-[11px] ${scope === 'Built-in' ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-900/30 border-slate-900 text-slate-500'}`}>4. BUILT-IN (print, len, etc)</div>
        </div>
      </div>
    </div>
  );
};

// 8. Python Collections Hashing Visualizer
const PythonCollectionsVisualizer: React.FC = () => {
  const [activeItem, setActiveItem] = useState<'List' | 'Dict'>('List');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
      <div className="flex gap-2 font-mono text-[10px] justify-center border-b border-slate-900 pb-3">
        <button 
          onClick={() => setActiveItem('List')} 
          className={`px-3 py-1.5 rounded-lg border transition-all font-bold ${activeItem === 'List' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white'}`}
        >
          List: Sequential Lookup O(N)
        </button>
        <button 
          onClick={() => setActiveItem('Dict')} 
          className={`px-3 py-1.5 rounded-lg border transition-all font-bold ${activeItem === 'Dict' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white'}`}
        >
          Dict: Hash Lookup O(1)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs items-center">
        <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg text-slate-400 space-y-2 leading-relaxed">
          <span className="text-[10px] text-indigo-400 font-bold uppercase block">Time Complexity Analysis</span>
          {activeItem === 'List' ? (
            <p className="text-[11px] font-sans">
              <strong>Lists</strong> force index scans sequentially from index 0 upwards. Locating a value requires checking up to $N$ entries.
            </p>
          ) : (
            <p className="text-[11px] font-sans">
              <strong>Dictionaries</strong> pass keys through a hashing algorithm, yielding an instant index coordinate. Retrieve entries in constant time.
            </p>
          )}
        </div>

        <div className="flex justify-center items-center h-24">
          {activeItem === 'List' ? (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className={`w-8 h-8 rounded border flex flex-col justify-center items-center text-[10px] font-bold ${idx === 4 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-md' : 'bg-slate-900/40 border-slate-900 text-slate-600'}`}>
                  <span>[{idx-1}]</span>
                  <span>val</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 bg-slate-950 p-2 border border-slate-900 rounded-lg w-44 text-center">
              <div className="text-[10px] text-indigo-400 font-bold">Key: "Sales"</div>
              <div className="text-slate-500">&darr; hashing algorithm</div>
              <div className="p-1 rounded bg-indigo-600/15 border border-indigo-500 text-indigo-300 font-bold text-[11px]">Index Pointer [418]</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
