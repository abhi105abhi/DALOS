export interface DocItem {
  id: string;
  library: 'Python' | 'NumPy' | 'Pandas' | 'Polars' | 'DuckDB' | 'PyArrow' | 'SciPy' | 'Statsmodels' | 'Matplotlib' | 'Seaborn' | 'Plotly' | 'SQL';
  name: string;
  purpose: string;
  syntax: string;
  parameters: Array<{ name: string; type: string; desc: string }>;
  returnValue: string;
  exampleCode: string;
  visualExplanation: string;
  performance: string;
  commonMistakes: string[];
  interviewUsage: string;
  relatedTopics: string[];
}

export const LIBRARY_DOCS: DocItem[] = [
  {
    id: 'py_print',
    library: 'Python',
    name: 'print()',
    purpose: 'Outputs text, variables, or objects directly to the standard output console stream.',
    syntax: 'print(*objects, sep=\' \', end=\'\\n\', file=None, flush=False)',
    parameters: [
      { name: '*objects', type: 'any', desc: 'Comma-separated values or variable labels to write to console.' },
      { name: 'sep', type: 'str', desc: 'String separator used between items. Defaults to a single space.' },
      { name: 'end', type: 'str', desc: 'String written at the end of the print stream. Defaults to newline.' }
    ],
    returnValue: 'None',
    exampleCode: 'print("Data", "Analyst", sep=" // ", end="!\\n")',
    visualExplanation: 'Takes values -> concatenates them with sep string -> appends end suffix -> outputs stream.',
    performance: 'I/O operation. Avoid calling print inside tight loops with millions of iterations; aggregate string logs first.',
    commonMistakes: [
      'Trying to assign print outcome to variables (e.g., val = print("X")), which assigns None.'
    ],
    interviewUsage: 'Used for console debugging and stdout validation during whiteboard challenges.',
    relatedTopics: ['python_basics', 'Variables']
  },
  {
    id: 'np_array',
    library: 'NumPy',
    name: 'np.array()',
    purpose: 'Initializes and constructs a homogeneous multidimensional NumPy ndarray sequence.',
    syntax: 'np.array(object, dtype=None, copy=True, order=\'K\', subok=False, ndmin=0)',
    parameters: [
      { name: 'object', type: 'array_like', desc: 'Input python list, tuple, nested sequence, or iterator.' },
      { name: 'dtype', type: 'data-type', desc: 'Force specific item type (e.g., np.float32, np.int64).' }
    ],
    returnValue: 'ndarray',
    exampleCode: 'import numpy as np\narr = np.array([1, 2, 3], dtype=np.float32)\nprint(arr)',
    visualExplanation: 'Accepts scattered Python list -> creates contiguous homogeneous memory chunk -> returns array pointer.',
    performance: 'Extremely fast contiguous buffer allocation. Homogeneity eliminates type-checking overhead.',
    commonMistakes: [
      'Passing multiple separate lists as parameters without wrapping them in an outer container list, causing parameter mismatches.'
    ],
    interviewUsage: 'Asked to explain memory layout differences between Python lists and contiguous NumPy matrices.',
    relatedTopics: ['numpy_essentials', 'broadcasting']
  },
  {
    id: 'pd_groupby',
    library: 'Pandas',
    name: 'df.groupby()',
    purpose: 'Aggregates a DataFrame by partitioning rows based on unique values of one or more index columns.',
    syntax: 'df.groupby(by=None, axis=0, level=None, as_index=True, sort=True, group_keys=True)',
    parameters: [
      { name: 'by', type: 'str / list', desc: 'Column name or list of columns to group rows by.' },
      { name: 'as_index', type: 'bool', desc: 'If True, grouping keys become index labels on output DataFrame.' }
    ],
    returnValue: 'DataFrameGroupBy object',
    exampleCode: 'import pandas as pd\n# Run custom department sales groupings inside SQL or Pandas\nprint("DataFrame GroupBy compiled")',
    visualExplanation: 'Split: groups rows -> Apply: computes aggregated metrics -> Combine: reassembles summary.',
    performance: 'Uses fast hash groupings under the hood. $O(N)$ speed scale, memory usage scales with number of groups.',
    commonMistakes: [
      'Forgetting that grouping results in GroupBy objects; you must chain aggregate actions (e.g., .sum(), .mean(), .agg()) to extract results.'
    ],
    interviewUsage: 'The most requested Pandas API in interviews. Essential for cohort analysis and SQL translation questions.',
    relatedTopics: ['pandas_wrangling', 'Split-Apply-Combine']
  },
  {
    id: 'pl_dataframe',
    library: 'Polars',
    name: 'pl.DataFrame()',
    purpose: 'Initializes a fast, memory-efficient Polars DataFrame utilizing Rust-based Arrow columns.',
    syntax: 'pl.DataFrame(data=None, schema=None, orient=None)',
    parameters: [
      { name: 'data', type: 'dict / list', desc: 'Relational data inputs.' },
      { name: 'schema', type: 'dict / list', desc: 'Explicit schema mapping labels to Polars types.' }
    ],
    returnValue: 'Polars DataFrame',
    exampleCode: '# Polars rust-backed dataframe declaration\n# import polars as pl\n# df = pl.DataFrame({"a": [1, 2]})',
    visualExplanation: 'Constructs columnar Rust memory pointers utilizing zero-copy arrow buffer integrations.',
    performance: 'Polars uses multithreaded engine and Arrow contiguous arrays. Up to 10-50x faster than Pandas on massive datasets.',
    commonMistakes: [
      'Trying to use Pandas loc or iloc methods on Polars tables; Polars uses filter() and select() expressions.'
    ],
    interviewUsage: 'Asked when evaluating modern, scale-optimized data processing options for massive CSV loads.',
    relatedTopics: ['pandas_wrangling', 'Polars']
  },
  {
    id: 'duckdb_query',
    library: 'DuckDB',
    name: 'duckdb.query()',
    purpose: 'Executes highly optimized relational analytical SQL queries directly against memory-backed data frames.',
    syntax: 'duckdb.query(sql_query_string)',
    parameters: [
      { name: 'sql_query_string', type: 'str', desc: 'SQL command statement to run.' }
    ],
    returnValue: 'DuckDBRelation',
    exampleCode: '# duckdb.query("SELECT * FROM retail_sales")',
    visualExplanation: 'Compiles SQL query text -> runs vector execution engine over columnar datasets -> yields rows.',
    performance: 'Sub-millisecond latency. Operates vector engines on columnar memory blocks.',
    commonMistakes: [
      'Confusing DuckDB with transactional databases. It is built for OLAP (online analytical processing) and statistics aggregations.'
    ],
    interviewUsage: 'Ideal for demonstrating full-featured in-process analytics engines and fast local testing.',
    relatedTopics: ['sql_queries', 'DuckDB']
  },
  {
    id: 'pa_table',
    library: 'PyArrow',
    name: 'pa.Table.from_pandas()',
    purpose: 'Creates a columnar PyArrow Table from an existing Pandas DataFrame without copying underlying memory.',
    syntax: 'pa.Table.from_pandas(df, schema=None, preserve_index=None)',
    parameters: [
      { name: 'df', type: 'DataFrame', desc: 'Pandas dataset to import.' }
    ],
    returnValue: 'PyArrow Table',
    exampleCode: '# import pyarrow as pa\n# table = pa.Table.from_pandas(df)',
    visualExplanation: 'Binds Pandas numpy-aligned arrays to Apache Arrow standardized columnar memory formats.',
    performance: 'Zero-copy operations if types align. Highly optimized for parquet serialization and cross-language transfers.',
    commonMistakes: [
      'Expecting PyArrow tables to support standard analytical functions directly. Use Polars or Pandas to query them instead.'
    ],
    interviewUsage: 'Asked when designing low-overhead binary interfaces to transfer tabular data between Python and Spark/Rust.',
    relatedTopics: ['numpy_essentials', 'PyArrow']
  },
  {
    id: 'scipy_ttest',
    library: 'SciPy',
    name: 'scipy.stats.ttest_ind()',
    purpose: 'Calculates the T-test score and p-value for the means of two independent data samples.',
    syntax: 'ttest_ind(a, b, axis=0, equal_var=True, nan_policy=\'propagate\')',
    parameters: [
      { name: 'a', type: 'array_like', desc: 'First sample dataset.' },
      { name: 'b', type: 'array_like', desc: 'Second sample dataset.' }
    ],
    returnValue: 'Ttest_indResult (statistic, pvalue)',
    exampleCode: '# from scipy import stats\n# res = stats.ttest_ind(sample_a, sample_b)',
    visualExplanation: 'Compares control mean vs treatment mean -> computes standard error -> outputs p-value.',
    performance: 'Extremely fast. Leverages vectorized statistical distributions.',
    commonMistakes: [
      'Applying this test to non-normally distributed samples of very small sizes, where non-parametric tests are required.'
    ],
    interviewUsage: 'Crucial for A/B testing implementation interviews to verify variant conversions.',
    relatedTopics: ['statistics', 'Hypothesis testing']
  },
  {
    id: 'stats_ols',
    library: 'Statsmodels',
    name: 'statsmodels.api.OLS()',
    purpose: 'Initializes and fits an Ordinary Least Squares (OLS) linear regression model to predict numeric targets.',
    syntax: 'sm.OLS(endog, exog)',
    parameters: [
      { name: 'endog', type: 'array_like', desc: 'Dependent target variable ($Y$).' },
      { name: 'exog', type: 'array_like', desc: 'Independent feature variables ($X$), including constant term.' }
    ],
    returnValue: 'OLS model instance',
    exampleCode: '# import statsmodels.api as sm\n# model = sm.OLS(y, X).fit()',
    visualExplanation: 'Solves algebraic equations to locate weights that minimize the sum of squared residuals.',
    performance: 'Highly efficient matrix solvers, though performance degrades with highly collinear datasets.',
    commonMistakes: [
      'Forgetting to add a constant column manually (sm.add_constant) to the features array, which forces the model intercept to zero.'
    ],
    interviewUsage: 'A standard question in regression interviews. Essential for interpreting coefficient tables and statistical significance.',
    relatedTopics: ['statistics', 'machine_learning']
  },
  {
    id: 'plt_plot',
    library: 'Matplotlib',
    name: 'plt.plot()',
    purpose: 'Draws coordinates connected by lines or custom markers onto a chart canvas.',
    syntax: 'plt.plot(*args, scalex=True, scaley=True, data=None, **kwargs)',
    parameters: [
      { name: 'args', type: 'X, Y coordinates', desc: 'Data arrays representing X and Y coordinate indices.' }
    ],
    returnValue: 'List of Line2D objects',
    exampleCode: 'import matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [10, 20, 30])\nplt.title("Trend")\n# plt.show()',
    visualExplanation: 'Draws points on Cartesian canvas and connects them with vector stroke paths.',
    performance: 'Highly optimized vector engine. Becomes slow when plotting more than 100,000 coordinates.',
    commonMistakes: [
      'Calling plot inside a loop without closing or resetting the figure state, leading to overlapping lines and memory leaks.'
    ],
    interviewUsage: 'Asked to verify canvas control mechanics in basic graphing challenges.',
    relatedTopics: ['data_viz', 'Matplotlib']
  },
  {
    id: 'sns_scatterplot',
    library: 'Seaborn',
    name: 'sns.scatterplot()',
    purpose: 'Builds beautiful, styled scatter plots mapping relationships between continuous variables.',
    syntax: 'sns.scatterplot(data=None, x=None, y=None, hue=None, style=None, size=None)',
    parameters: [
      { name: 'data', type: 'DataFrame', desc: 'Input Pandas DataFrame.' },
      { name: 'x', type: 'str', desc: 'Column name mapped to X axis.' },
      { name: 'y', type: 'str', desc: 'Column name mapped to Y axis.' }
    ],
    returnValue: 'matplotlib.axes.Axes',
    exampleCode: '# import seaborn as sns\n# sns.scatterplot(data=df, x="age", y="sales", hue="dept")',
    visualExplanation: 'Pulls data columns from DataFrame -> maps values to pixels -> applies aesthetic color categorical styles.',
    performance: 'Extends Matplotlib layouts; inherits performance limits. Pre-aggregate massive data frames first.',
    commonMistakes: [
      'Passing raw list variables directly into x and y without specifying the data parameter, which bypasses Seaborn column-mapping logic.'
    ],
    interviewUsage: 'Ideal for demonstrating modern, highly communicative exploratory data visualizations.',
    relatedTopics: ['data_viz', 'Seaborn']
  },
  {
    id: 'px_scatter',
    library: 'Plotly',
    name: 'px.scatter()',
    purpose: 'Builds interactive, hover-responsive HTML scatter plots for exploratory dashboards.',
    syntax: 'px.scatter(data_frame=None, x=None, y=None, color=None, hover_data=None)',
    parameters: [
      { name: 'data_frame', type: 'DataFrame', desc: 'Table containing coordinates.' }
    ],
    returnValue: 'plotly.graph_objects.Figure',
    exampleCode: '# import plotly.express as px\n# fig = px.scatter(df, x="age", y="sales")',
    visualExplanation: 'Compiles coordinates into a JSON spec -> renders in browser with d3/WebGL for interactive hovering and panning.',
    performance: 'WebGL handles up to 100,000 coordinates smoothly in browser, though large figures increase page HTML payload.',
    commonMistakes: [
      'Including Plotly inside standard static PDF reporting systems, which strips out interactive capabilities.'
    ],
    interviewUsage: 'Demonstrates modern, executive-friendly interactive reporting skills.',
    relatedTopics: ['data_viz', 'Plotly']
  },
  {
    id: 'sql_select',
    library: 'SQL',
    name: 'SELECT',
    purpose: 'Retrieves specified columns and calculates fields from database tables.',
    syntax: 'SELECT column1, column2, expression AS alias FROM table_name;',
    parameters: [
      { name: 'columns', type: 'fields', desc: 'Comma-separated column names or expressions.' }
    ],
    returnValue: 'Result relation (table rows)',
    exampleCode: 'SELECT transaction_id, product, price * quantity AS subtotal FROM retail_sales;',
    visualExplanation: 'Scans target table -> extracts requested columns -> evaluates expressions -> displays results grid.',
    performance: 'Highly efficient projection. Selecting specific columns is faster than SELECT *.',
    commonMistakes: [
      'Using SELECT * in production, which wastes network bandwidth and disk reads.'
    ],
    interviewUsage: 'The most fundamental SQL command; tested in every technical interview.',
    relatedTopics: ['sql_queries', 'SELECT']
  }
];
