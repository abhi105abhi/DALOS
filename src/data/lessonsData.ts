export interface LessonContent {
  id: string;
  title: string;
  duration: string;
  objectives: string[];
  prerequisites: string[];
  explanation: string;
  visualDiagramType: 'python_variables' | 'python_functions' | 'python_collections' | 'numpy_broadcasting' | 'pandas_groupby' | 'data_viz' | 'sql_join' | 'sql_window' | 'stats_distribution' | 'eda_pipeline' | 'business_cohort' | 'ml_regression' | 'portfolio';
  codeExample: string;
  commonMistakes: string[];
  performanceTips: string[];
  interviewTips: string[];
  summary: string;
}

export const LESSONS_DATABASE: Record<string, LessonContent> = {
  python_basics: {
    id: 'python_basics',
    title: 'Python Core Variables & Types',
    duration: '45 mins',
    objectives: [
      'Understand how Python handles variable assignment and dynamic typing.',
      'Differentiate between fundamental data types (int, float, str, bool).',
      'Learn standard mathematical, logical, and string operators in Python.',
      'Acquire input/output skills and write simple terminal-executable scripts.'
    ],
    prerequisites: [],
    explanation: `### Variables and Dynamic Typing
In Python, variables are named references to objects in memory. Unlike static languages like C++ or Java, Python uses **dynamic typing**—you do not declare a variable's type before using it, and a variable can change its type at runtime.

### The Memory Reference Model
When you run \`x = 10\`, Python:
1. Creates an integer object with value \`10\` in memory.
2. Binds the label \`x\` to point to that memory address.
3. If you run \`x = "Data"\`, the label \`x\` is rebound to a new string object. The old \`10\` object becomes candidate for garbage collection if no other variables reference it.

### Core Data Types
- **Integers (\`int\`)**: Whole numbers, e.g., \`42\`, \`-7\`.
- **Floating-point (\`float\`)**: Decimal numbers, e.g., \`3.1415\`, \`-0.001\`.
- **Strings (\`str\`)**: Text enclosed in single or double quotes, e.g., \`"Hello"\`, \`'World'\`.
- **Booleans (\`bool\`)**: Conditional state variables representing \`True\` or \`False\`.`,
    visualDiagramType: 'python_variables',
    codeExample: `# Variable Assignment & Dynamic Binding Demo
x = 42
print("Initially, x =", x, "with type", type(x))

x = "Becoming a Professional Data Analyst"
print("After rebinding, x =", x, "with type", type(x))

# Basic Math & Division Types
dividend = 15
divisor = 4
standard_division = dividend / divisor
floor_division = dividend // divisor
remainder_modulo = dividend % divisor

print("\\nDivision Mechanics:")
print(f"Standard Division (/) of 15 by 4 is {standard_division} (float)")
print(f"Floor Division (//) of 15 by 4 is {floor_division} (int)")
print(f"Modulo Division (%) of 15 by 4 is {remainder_modulo} (remainder)")
`,
    commonMistakes: [
      'Using reserved keyword names (e.g., class, import, try, pass) as variable identifiers.',
      'Confusing standard division (/) which always yields a float, with integer floor division (//).',
      'Concatenating a string and an integer directly (e.g., "Age: " + 25) without explicit typecasting (str(25)).'
    ],
    performanceTips: [
      'Use standard arithmetic operators instead of math library functions when performing simple additions or multiplications.',
      'Prefer formatted f-strings (e.g., f"Data: {x}") over manual string concatenation (+) for improved speed and readability.'
    ],
    interviewTips: [
      'Explain that variables in Python are pointers to memory references, and variables themselves are untyped, whereas the objects they point to are typed.',
      'Be prepared to explain why floating-point operations can exhibit precision limits (e.g., 0.1 + 0.2 != 0.3) due to binary fraction rounding.'
    ],
    summary: 'Variables are dynamically bound labels pointing to memory objects. Floor division (//) truncates values to integer bounds, while f-strings offer clean string format evaluation.'
  },
  python_functions: {
    id: 'python_functions',
    title: 'Functions & Control Flow',
    duration: '60 mins',
    objectives: [
      'Construct reusable code structures using the def keyword.',
      'Configure positional, keyword, and default parameters inside definitions.',
      'Master conditional branching structures using if, elif, and else statements.',
      'Understand lexical scope rules and variable accessibility thresholds.'
    ],
    prerequisites: ['python_basics'],
    explanation: `### Defining Functions
Functions are self-contained logical units that run when called. They allow you to abide by the DRY (Don't Repeat Yourself) principle.

### Parameter Passing
- **Positional**: Arguments matched by relative position in the function call.
- **Keyword**: Arguments matched by name (e.g., \`func(val=5)\`).
- **Default Parameters**: Initialized in definition (e.g., \`def func(val=10):\`). They must appear *after* any parameters without default values.

### Control Flow Branching
Python uses conditional expressions to direct execution pathways. Standard indentation (4 spaces) defines block structures.

### Lexical Scope (LEGB Rule)
Python resolves names looking in order at:
1. **L**ocal scope: Variables defined inside active function.
2. **E**nclosing scope: Variables in outer nested functions.
3. **G**lobal scope: Variables defined at module root level.
4. **B**uilt-in scope: Preloaded names like \`len\` or \`print\`.`,
    visualDiagramType: 'python_functions',
    codeExample: `# Complete Functions & Branching Sandbox
def calculate_tax(salary, tax_bracket=0.2):
    """Calculates income tax based on base tax bracket threshold."""
    if salary <= 50000:
        return salary * 0.12
    elif salary <= 120000:
        return salary * tax_bracket
    else:
        # High tax scale
        return salary * 0.35

# Execute calls with positional and keyword arguments
beginner_tax = calculate_tax(45000)
analyst_tax = calculate_tax(95000, tax_bracket=0.22)
lead_tax = calculate_tax(180000)

print(f"Tax for Beginner ($45k): \${beginner_tax}")
print(f"Tax for Analyst ($95k, 22%): \${analyst_tax}")
print(f"Tax for Lead ($180k): \${lead_tax}")
`,
    commonMistakes: [
      'Using mutable default parameters like lists or dicts (e.g., def append_to(val, lst=[])) which retain state across multiple calls. Always use None as a default instead.',
      'Forgetting that changing a global variable inside a function requires the global keyword, though this pattern is generally discouraged.'
    ],
    performanceTips: [
      'Functions localize variables, which resolve faster in the local symbol table than global namespace variables.',
      'Avoid deeply nested conditionals. Use guard clauses to return early from functions and keep logic flat.'
    ],
    interviewTips: [
      'Be prepared to detail the LEGB resolution lookup hierarchy.',
      'Explain that Python passes arguments by "object reference" (or assignment)—immutable objects act like pass-by-value, while mutable objects can be modified inside the function.'
    ],
    summary: 'Def blocks create reusable routines. Parameters support default initialization, while conditionals branch program execution. Scopes resolve cleanly using LEGB rules.'
  },
  python_collections: {
    id: 'python_collections',
    title: 'Data Structures: Lists, Dicts, Loops',
    duration: '90 mins',
    objectives: [
      'Master Python lists, list comprehensions, slicing, and sorting routines.',
      'Store key-value pairs inside dictionaries and query with default safe values.',
      'Iterate over sequences using for and while loops, with break and continue rules.',
      'Incorporate iterables, generators, and decorators into advanced scripts.'
    ],
    prerequisites: ['python_functions'],
    explanation: `### Core Collections
Python provides versatile built-in collections designed for efficient grouping:
- **Lists (\`[]\`)**: Ordered, mutable sequences of elements.
- **Tuples (\`()\`)**: Ordered, immutable sequences of elements. Ideal for packing records.
- **Dictionaries (\`{}\`)**: Unordered hash tables linking unique keys to values. Fast lookup ($O(1)$ on average).
- **Sets (\`{}\`)**: Unordered collections of unique elements. Fast membership testing.

### Iteration & Loops
- **For Loop**: Iterates through collections, strings, or range sequences.
- **While Loop**: Iterates as long as a logical condition remains true.
- **List Comprehensions**: Elegant shorthand to construct lists: \`[expr for item in list if cond]\`.`,
    visualDiagramType: 'python_collections',
    codeExample: `# Collections & Iterator Compilers
items = [2, 5, 8, 11, 14, 17]

# List Comprehension for vector-like squaring filter
squared_evens = [x**2 for x in items if x % 2 == 0]
print("Squared even values:", squared_evens)

# Dictionaries for hash-table metric tracking
retention_cohorts = {
    "June": 0.85,
    "July": 0.78,
    "August": 0.92
}

# Safe key querying with .get()
june_ret = retention_cohorts.get("June", 0.0)
sept_ret = retention_cohorts.get("Sept", 0.0) # safely returns default
print(f"June retention: {june_ret}, Sept retention: {sept_ret}")

# Generator expression (saves memory by evaluating elements lazily)
lazy_squares = (x**2 for x in range(10000))
print("Generator ready:", next(lazy_squares), next(lazy_squares))
`,
    commonMistakes: [
      'Modifying a list or collection while actively iterating over it. This throws index pointers off and skips items.',
      'Attempting to use mutable lists or dicts as dictionary keys. Only hashable, immutable types (like strings, numbers, or tuples) can be keys.'
    ],
    performanceTips: [
      'Use list comprehensions instead of manual for-loops and append() calls; they execute at compiled speed in C.',
      'Use sets instead of lists for membership testing (x in set_var is $O(1)$ whereas in list it is $O(N)$).'
    ],
    interviewTips: [
      'Explain the difference between deep and shallow copies of collections.',
      'Explain that generators use lazy evaluation, meaning they compute items one-at-a-time on demand, which results in $O(1)$ memory footprint regardless of collection size.'
    ],
    summary: 'Lists represent ordered mutable records, dicts serve as fast key-value maps, and sets store unique entries. List comprehensions and generators optimize loop structures.'
  },
  numpy_essentials: {
    id: 'numpy_essentials',
    title: 'NumPy Arrays & Vectorization',
    duration: '90 mins',
    objectives: [
      'Understand the benefits of contiguous C-style arrays over standard Python lists.',
      'Perform element-wise arithmetic utilizing optimized vectorization techniques.',
      'Wrangle multidimensional arrays using slicing, indexing, and boolean masks.',
      'Master the rules of broadcasting when aligning arrays of mismatched shapes.'
    ],
    prerequisites: ['python_collections'],
    explanation: `### Why NumPy?
Standard Python lists are arrays of pointers to individual objects, which scatter memory and slow down mathematical operations due to dynamic type-checking overhead. NumPy introduces **ndarrays**:
1. **Contiguous Memory**: Values are stored in consecutive blocks, maximizing CPU cache efficiency.
2. **Homogeneity**: Every item has the same data type (\`dtype\`), enabling compiler optimizations.

### Vectorization
Instead of writing nested loops to add arrays, NumPy delegates loops to low-level compiled C routines. This is called **vectorization**.

### Broadcasting Rules
When adding arrays of mismatched shapes:
- Align shapes on the right.
- Two dimensions are compatible if they are equal, or if one of them is \`1\`.
- If compatible, the array of size \`1\` is virtually stretched to match the larger size.`,
    visualDiagramType: 'numpy_broadcasting',
    codeExample: `import numpy as np

# Standard array arithmetic is vectorized
a = np.array([1, 2, 3])
b = np.array([10, 20, 30])
print("a + b =", a + b)

# Multi-dimensional arrays (2D Grid)
matrix = np.array([[1, 2, 3], [4, 5, 6]])
print("\\nMatrix shape:", matrix.shape)
print("Mean across columns (axis 0):", np.mean(matrix, axis=0))
print("Mean across rows (axis 1):", np.mean(matrix, axis=1))

# Broadcasting example (aligning 2D and 1D arrays)
grid = np.array([[1, 2, 3], 
                 [10, 20, 30]])
row_vec = np.array([100, 200, 300]) # shape (3,) compatible with grid shape (2, 3)

broadcasted_sum = grid + row_vec
print("\\nBroadcasted Sum Grid:")
print(broadcasted_sum)
`,
    commonMistakes: [
      'Attempting to broadcast arrays of incompatible shapes, which throws a ValueError.',
      'Confusing standard multiplication (*) which operates element-wise with dot multiplication (@ or np.dot) which executes matrix multiplication.'
    ],
    performanceTips: [
      'Never loop over NumPy arrays with standard Python loops. Always use vectorized functions and aggregations (np.sum, np.mean).',
      'Use in-place operators (+=, *=) to modify existing arrays and prevent allocating memory for temporary intermediary copies.'
    ],
    interviewTips: [
      'Be prepared to describe what memory stride pointers are and why contiguous memory layout optimizes CPU performance.',
      'Explain the exact dimensions rules for matrix dot products: the inner dimensions must match (M x N multiplied by N x P yields M x P).'
    ],
    summary: 'NumPy leverages contiguous memory blocks and compiled speed. Broadcasting stretches dimensions of size 1, and vectorization eliminates slow Python loop routines.'
  },
  pandas_wrangling: {
    id: 'pandas_wrangling',
    title: 'Pandas Dataframes & Wrangling',
    duration: '180 mins',
    objectives: [
      'Master the foundational structures of Series and DataFrames.',
      'Filter and slice data utilizing boolean indexing and slicing with loc/iloc.',
      'Apply GroupBy aggregations to split-apply-combine multi-metric metrics.',
      'Incorporate table merges, joins, and missing value recovery mechanics.'
    ],
    prerequisites: ['numpy_essentials'],
    explanation: `### Core Pandas Structures
- **Series**: 1D labeled array capable of holding any data type.
- **DataFrame**: 2D labeled tabular structure with columns and row indices.

### Querying and Indexing
- \`df.loc[row_labels, col_labels]\`: Query by index/column name.
- \`df.iloc[row_indices, col_indices]\`: Query by 0-indexed position.
- **Boolean Indexing**: Filter rows by passing a boolean mask: \`df[df['sales'] > 1000]\`.

### The GroupBy Lifecycle (Split-Apply-Combine)
1. **Split**: The table is partitioned into groups based on key values.
2. **Apply**: An aggregate function (sum, mean, count) is executed on each partition.
3. **Combine**: Results are reassembled into a single structured summary table.`,
    visualDiagramType: 'pandas_groupby',
    codeExample: `# Let us simulate Pandas structures with raw tables or Python logic
# Here, we show standard GroupBy grouping mechanics
data = [
    {"dept": "Sales", "revenue": 12000, "active": True},
    {"dept": "Engineering", "revenue": 18000, "active": True},
    {"dept": "Sales", "revenue": 15000, "active": False},
    {"dept": "Engineering", "revenue": 22000, "active": True}
]

# Simulating a split-apply-combine routine for Department revenue aggregation
groups = {}
for row in data:
    dept = row["dept"]
    if dept not in groups:
        groups[dept] = []
    groups[dept].append(row["revenue"])

print("Aggregated Group Summaries:")
for dept, revenues in groups.items():
    avg_rev = sum(revenues) / len(revenues)
    print(f"Department: {dept:12} | Total Revenue: {sum(revenues):5} | Mean: {avg_rev}")
`,
    commonMistakes: [
      'Triggering a SettingWithCopyWarning by trying to assign values directly to a filtered slice of a DataFrame. Always use loc or copy() instead.',
      'Assuming groupby() keeps grouping columns as index rows. Use as_index=False inside the groupby call to maintain column status.'
    ],
    performanceTips: [
      'Avoid using iterrows() or apply() for math. Use vectorized column operations (df["price"] * df["qty"]) which run in optimized C lanes.',
      'Use appropriate categorical data types for string columns with repeating values (e.g., gender, country) to cut memory usage.'
    ],
    interviewTips: [
      'Describe the difference between outer, inner, left, and right merge strategies.',
      'Detail the 3 phases of the GroupBy operation: Split, Apply, and Combine.'
    ],
    summary: 'DataFrame columns are Series bound by indices. Loc queries labels, iloc queries positions, and GroupBy executes Split-Apply-Combine routines.'
  },
  data_viz: {
    id: 'data_viz',
    title: 'Data Visualization Techniques',
    duration: '120 mins',
    objectives: [
      'Select appropriate chart geometries based on analytical data structures.',
      'Develop styling foundations for Matplotlib, Seaborn, and interactive Plotly.',
      'Avoid visual clutter, bad scales, and misleading representations.',
      'Configure accessible palettes and structure visual storytelling pipelines.'
    ],
    prerequisites: ['pandas_wrangling'],
    explanation: `### Selecting Chart Geometries
Selecting the right visualization depends on your variable structure:
- **Distribution**: Histograms, density plots (KDE), or box plots (excellent for visualizing outliers).
- **Correlation/Relationship**: Scatter plots, pair plots, or heatmaps.
- **Comparison**: Bar charts (categorical vs. numeric) or line charts (trends over time).

### Design Rules
- **Maximize Data-to-Ink Ratio**: Eliminate redundant gridlines, dark borders, and unnecessary 3D elements.
- **Color Selection**: Use diverging palettes for contrasting bounds, sequential palettes for progressive scales, and qualitative palettes for categories. Ensure colorblind accessibility.
- **Misleading Scales**: Avoid cutting off the y-axis in bar charts; this artificially amplifies relative differences. For line charts tracking percentage changes, starting at non-zero boundaries can be acceptable.`,
    visualDiagramType: 'data_viz',
    codeExample: `# Let us map visual trend metrics
# Below, we mock structured coordinates to plot standard trend metrics
x_coords = [10, 20, 30, 40, 50]
y_scatter = [15, 30, 45, 60, 75] # Linear scatter path
y_noise = [18, 25, 48, 55, 80] # Noisy trend path

print("Simulating Trend Analysis:")
for x, y_s, y_n in zip(x_coords, y_scatter, y_noise):
    residual = y_n - y_s
    # print mini scatter bar index
    bar_symbol = "*" * (y_n // 5)
    print(f"X: {x:2} | Y_Actual: {y_n:2} | Residual: {residual:+2} | Visualization: {bar_symbol}")
`,
    commonMistakes: [
      'Using pie charts with more than 5 categories. They make it extremely difficult for the human eye to compare relative slice areas.',
      'Adding too many decorative elements, lines, and non-standard colors which distract from primary insights.'
    ],
    performanceTips: [
      'Plotting millions of raw points directly onto a scatter plot is slow and causes overplotting. Bin values into hexbins or use density contours instead.',
      'Optimize performance by aggregating huge datasets in Pandas prior to plotting with Matplotlib.'
    ],
    interviewTips: [
      'Define what the "data-to-ink ratio" represents and give three methods to improve it.',
      'Explain when a box plot is superior to a bar chart (it displays median, interquartile ranges, and outliers, revealing the distribution shape rather than a single average value).'
    ],
    summary: 'Chart choices match analytical variables. Clean, non-distracting layouts maximize readability, sequential colors represent metrics, and bar charts must begin at zero.'
  },
  sql_queries: {
    id: 'sql_queries',
    title: 'SQL SELECT, Joins, and Groupings',
    duration: '120 mins',
    objectives: [
      'Master relational querying foundations: SELECT, FROM, WHERE, and LIMIT.',
      'Aggregate metrics utilizing GROUP BY statements alongside HAVING filters.',
      'Connect tables using INNER, LEFT, RIGHT, and FULL OUTER joins.',
      'Organize subqueries logically to isolate analytical slices.'
    ],
    prerequisites: [],
    explanation: `### Relational Database Basics
A relational database organizes data into rows and columns linked by primary and foreign keys. SQL (Structured Query Language) is the standard declarations language to query and interact with this data.

### Standard Order of Execution
Although written in one order, the database engine executes queries in another:
1. **FROM & JOINs**: Identifies target tables and joins them.
2. **WHERE**: Filters out records before groupings.
3. **GROUP BY**: Groups rows together.
4. **HAVING**: Filters grouped summaries.
5. **SELECT**: Gathers output variables, evaluates expressions, and applies aliases.
6. **ORDER BY**: Sorts rows.
7. **LIMIT**: Cuts off outputs.

### Join Strategies
- **INNER JOIN**: Keeps rows with matching values in both tables.
- **LEFT JOIN**: Keeps all rows from left table, matching right variables with NULL if not found.`,
    visualDiagramType: 'sql_join',
    codeExample: `SELECT category, 
       SUM(quantity) as total_units,
       ROUND(AVG(price), 2) as average_price
FROM retail_sales
WHERE quantity >= 2
GROUP BY category
HAVING SUM(quantity) > 5
ORDER BY total_units DESC;`,
    commonMistakes: [
      'Attempting to filter aggregated metrics inside the WHERE clause. Aggregates must be filtered using HAVING, or wrapped in a subquery/CTE.',
      'Ambiguity errors: failing to prefix duplicate columns with their respective table aliases during joins.'
    ],
    performanceTips: [
      'Avoid selecting unnecessary columns with SELECT *. Choose explicit columns to minimize disk read and network transmission overhead.',
      'Filter tables early with WHERE clauses before executing JOIN operations to reduce the number of rows that must be joined in memory.'
    ],
    interviewTips: [
      'Detail the exact execution order of SQL statements and contrast WHERE and HAVING.',
      'Explain what a LEFT JOIN produces if there are multiple matches in the right table (it duplicates the left-hand rows for each match, potentially bloating your result set).'
    ],
    summary: 'The database resolves FROM/JOIN first. WHERE filters rows, GROUP BY compiles aggregates, HAVING filters groupings, and SELECT projects columns.'
  },
  sql_advanced: {
    id: 'sql_advanced',
    title: 'Advanced SQL & Window Functions',
    duration: '150 mins',
    objectives: [
      'Construct window queries using OVER (PARTITION BY ... ORDER BY ...).',
      'Leverage ranking metrics: ROW_NUMBER, RANK, and DENSE_RANK.',
      'Utilize offset window functions: LEAD and LAG to calculate differences.',
      'Write legible sub-queries and Common Table Expressions (CTEs).'
    ],
    prerequisites: ['sql_queries'],
    explanation: `### Window Functions
Unlike standard GROUP BY aggregates which collapse many rows into one summary row, **window functions** perform operations across a set of table rows that are related to the current row, preserving the individual identity of each row.

### Core Window Syntax
\`\`\`sql
SELECT value, SUM(value) OVER(PARTITION BY category ORDER BY date) FROM sales;
\`\`\`
- **PARTITION BY**: Groups rows into cohorts.
- **ORDER BY**: Establishes execution order within each cohort, defining the "window frame" (the running bounds).

### Ranking Mechanics
- **ROW_NUMBER()**: Sequential numbering without duplicates.
- **RANK()**: Duplicates receive equal ranks, leaving gaps for subsequent values.
- **DENSE_RANK()**: Duplicates receive equal ranks, with no gaps in numbering.

### Common Table Expressions (CTEs)
CTEs define temporary result sets that you can reference within a subsequent query block, making SQL code far more readable than nested subqueries:
\`\`\`sql
WITH cohort_totals AS (
  SELECT dept, SUM(sales) as tot FROM sa GROUP BY dept
)
SELECT * FROM cohort_totals WHERE tot > 50000;
\`\`\``,
    visualDiagramType: 'sql_window',
    codeExample: `# Let us define a CTE containing lag calculations
# In our SQL Studio sandbox, we can write window operations or run simulations
# Below is a standard window lag query template
sql_query = """
WITH monthly_revenue AS (
  SELECT category, 
         DATE_TRUNC('month', timestamp) as sales_month,
         SUM(quantity * price) as revenue
  FROM retail_sales
  GROUP BY category, sales_month
)
SELECT category, sales_month, revenue,
       LAG(revenue, 1) OVER (PARTITION BY category ORDER BY sales_month) as prev_revenue
FROM monthly_revenue;
"""
print("Seeding window analytical template... Complete.")
`,
    commonMistakes: [
      'Attempting to filter window outputs inside the WHERE clause directly. Window operations execute AFTER WHERE, so filters on window values must use CTEs or subqueries.',
      'Forgetting an ORDER BY clause inside LEAD or LAG windows, resulting in unpredictable, chaotic data offsets.'
    ],
    performanceTips: [
      'Avoid partitioning over high-cardinality, unindexed keys; this forces expensive disk merges and global sorting sweeps.',
      'Keep window frame boundaries explicit (e.g., ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) to prevent the engine from using slow defaults.'
    ],
    interviewTips: [
      'Differentiate between ROW_NUMBER, RANK, and DENSE_RANK with an example.',
      'Detail how to use LAG or LEAD to compute Month-over-Month growth rates.'
    ],
    summary: 'Window functions calculate values over groups of rows without collapsing them. CTEs structure queries sequentially. LAG/LEAD retrieve offset values.'
  },
  statistics: {
    id: 'statistics',
    title: 'Statistics & Hypothesis Testing',
    duration: '150 mins',
    objectives: [
      'Evaluate measures of central tendency, skewness, and variance.',
      'Understand probability distributions, normal curve areas, and central limit theorem.',
      'Perform hypothesis testing: set null hypotheses, alpha values, and calculate p-values.',
      'Design A/B testing frameworks and determine appropriate sample sizes.'
    ],
    prerequisites: ['pandas_wrangling'],
    explanation: `### Central Limit Theorem (CLT)
The CLT states that as the sample size ($n$) grows large (typically $n \\geq 30$), the sampling distribution of the sample mean approaches a **normal distribution**, regardless of the shape of the underlying population distribution. This is the foundation of parameter testing.

### Hypothesis Testing Lifecycle
1. **Define Hypotheses**:
   - $H_0$ (Null): No difference exists (e.g., control and treatment conversion rates are equal).
   - $H_1$ (Alternative): A statistically significant difference exists.
2. **Set Confidence Threshold (Alpha $\\alpha$)**: Typically \`0.05\`.
3. **Calculate Test Statistic**: E.g., z-score, t-score, or F-statistic.
4. **Extract P-Value**: The probability of obtaining the observed results (or more extreme) by random luck under the assumption that the Null Hypothesis is true.
5. **Decide**: If $\\text{p-value} < \\alpha$, we reject $H_0$ in favor of $H_1$.`,
    visualDiagramType: 'stats_distribution',
    codeExample: `# Let us mock a t-test calculation in Python
# Calculating p-value for control vs variant cohorts
import math

control_mean = 0.12 # 12% conversion
control_n = 1000
control_var = (control_mean * (1 - control_mean)) / control_n

variant_mean = 0.15 # 15% conversion
variant_n = 1050
variant_var = (variant_mean * (1 - variant_mean)) / variant_n

# Compute Z-score standard error
pooled_se = math.sqrt(control_var + variant_var)
z_score = (variant_mean - control_mean) / pooled_se

# Simple normal curve approximation for one-tailed test
# Z of 2.01 indicates p-value of approx ~0.022
print(f"Control Var: {control_var:.6f}, Variant Var: {variant_var:.6f}")
print(f"Calculated Z-score statistic: {z_score:.4f}")
if z_score > 1.645:
    print("Z-score > 1.645: Reject $H_0$ at alpha 0.05! Significant lift observed.")
else:
    print("Fail to reject $H_0$: Insufficient evidence to support variant lift.")
`,
    commonMistakes: [
      'Interpreting p-value as the "probability that the alternative hypothesis is true". It is strictly the probability of seeing this data if $H_0$ is true.',
      'P-hacking: running multiple tests on different segments until something is significant, which inflates the false positive rate.'
    ],
    performanceTips: [
      'Use power analysis before running an experiment to determine the minimum sample size required, avoiding wastefully long or underpowered tests.',
      'Prefer non-parametric tests (like Mann-Whitney U) if sample distributions are highly skewed and sample sizes are small.'
    ],
    interviewTips: [
      'Explain how the central limit theorem enables parametric testing on non-normal populations.',
      'Detail the steps to design a standard A/B test for a web button change, including metrics, sample size calculation, and final testing checks.'
    ],
    summary: 'CLT normalizes sampling distributions for large samples. p-values determine statistical significance, and A/B tests compare treatment and control groups.'
  },
  eda_practice: {
    id: 'eda_practice',
    title: 'Exploratory Data Analysis (EDA)',
    duration: '200 mins',
    objectives: [
      'Conduct initial dataset profiling: shape, dtypes, null counts, and duplicates.',
      'Detect and treat missing data using statistical imputation or removal.',
      'Identify outliers using Interquartile Range (IQR) and Z-score methods.',
      'Analyze variables using univariate, bivariate, and multivariate visualizations.'
    ],
    prerequisites: ['pandas_wrangling', 'data_viz', 'sql_advanced', 'statistics'],
    explanation: `### The EDA Mindset
EDA is the critical first step of any analysis. It is an iterative cycle of:
1. Formulating analytical questions.
2. Looking at your data through summaries and visualizations.
3. Refining your questions and cleaning anomalies.

### Common Outlier Treatments
- **IQR Rule**: Outliers are points lying outside $[Q_1 - 1.5 \\times \\text{IQR}, Q_3 + 1.5 \\times \\text{IQR}]$.
- **Z-Score Rule**: Outliers are points with $|Z| > 3$ in a normally distributed population.

### Missing Data Strategies
- **MCAR** (Missing Completely at Random): Safe to drop or impute with simple median values.
- **MAR** (Missing at Random): Values depend on other observed variables. Use iterative regression models.
- **MNAR** (Missing Not at Random): Values depend on the missing values themselves. Requires domain expertise.`,
    visualDiagramType: 'eda_pipeline',
    codeExample: `# Let us write a Python script to isolate outliers using the IQR rule
import numpy as np

# Sample dataset of ages with synthetic outlier anomalies
ages = [22, 25, 29, 31, 24, 28, 33, 21, 26, 95, 3] # 95 and 3 are outliers
arr = np.array(ages)

q1 = np.percentile(arr, 25)
q3 = np.percentile(arr, 75)
iqr = q3 - q1

lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr

clean_ages = arr[(arr >= lower_bound) & (arr <= upper_bound)]
outliers = arr[(arr < lower_bound) | (arr > upper_bound)]

print(f"Data Percentiles: Q1={q1:.1f}, Q3={q3:.1f}, IQR={iqr:.1f}")
print(f"Valid bounds: [{lower_bound:.1f} to {upper_bound:.1f}]")
print(f"Cleaned subset: {clean_ages.tolist()}")
print(f"Identified Outliers: {outliers.tolist()}")
`,
    commonMistakes: [
      'Dropping rows with missing values blindly, which can introduce bias if values are not missing completely at random (MCAR).',
      'Forgetting to check for inconsistent string representations (e.g., "N/A", "unknown", "?") which Pandas may load as valid strings instead of NaN.'
    ],
    performanceTips: [
      'Use df.info(memory_usage="deep") to monitor memory utilization on huge datasets during initial profiling sweeps.',
      'Isolate columns early in the cleaning process to avoid performing unnecessary calculations on discarded variables.'
    ],
    interviewTips: [
      'Detail your structured step-by-step approach when exploring a completely new, unfamiliar dataset.',
      'Explain when you would impute missing values with the median versus the mean (median is superior for skewed numerical distributions as it is resistant to outliers).'
    ],
    summary: 'Dataset profiling identifies missing records, duplicates, and data types. IQR masks isolate outlier boundaries, and statistical imputation preserves sample size.'
  },
  business_analytics: {
    id: 'business_analytics',
    title: 'Business Analytics & Cohort Analysis',
    duration: '150 mins',
    objectives: [
      'Define and calculate key business metrics: LTV, CAC, Churn, and ARPU.',
      'Construct subscription-style user cohorts based on sign-up sign-up dates.',
      'Formulate retention rates over time and design cohort heatmap metrics.',
      'Design professional executive dashboards focused on root business questions.'
    ],
    prerequisites: ['eda_practice'],
    explanation: `### Core Business KPIs
- **CAC (Customer Acquisition Cost)**: Total marketing spend divided by new customers acquired.
- **LTV (Lifetime Value)**: Total revenue a customer yields over their entire relationship.
- **Churn Rate**: Percentage of subscribers who cancel in a given period.
  $$\\text{Churn Rate} = \\frac{\\text{Customers Lost during period}}{\\text{Active Customers at start of period}}$$
- **LTV:CAC Ratio**: Golden benchmark indicator. Target is $\\geq 3.0$ for SaaS and retail.

### Cohort Analysis
A cohort is a group of users who share a common characteristic over a time period (usually their sign-up month). Tracking cohorts over successive months reveals whether customer retention is improving over time, independent of user acquisition fluctuations.`,
    visualDiagramType: 'business_cohort',
    codeExample: `# Let us calculate a simple monthly retention rate cohort matrix
cohorts = {
    "June Cohort": [1000, 850, 720, 680, 650], # users active month 0 to 4
    "July Cohort": [1200, 960, 820, 780, None]
}

print("Cohort Retention Grid Analysis:")
for cohort_name, users in cohorts.items():
    starting_users = users[0]
    retention_rates = []
    for u in users:
        if u is None:
            continue
        rate = (u / starting_users) * 100
        retention_rates.append(f"{rate:5.1f}%")
    
    rates_str = " -> ".join(retention_rates)
    print(f"{cohort_name:12} | {rates_str}")
`,
    commonMistakes: [
      'Calculating churn rate using customers who signed up *during* the active period, which skews calculations. Churn must rely on customers active at the *start* of the period.',
      'Focusing on superficial vanity metrics (e.g., page views, social followers) rather than actionable metrics (e.g., LTV, retention cohorts).'
    ],
    performanceTips: [
      'Aggregate transactions daily or weekly into analytical warehouses before trying to compute rolling metrics like LTV, saving processor cycles.',
      'Use boolean matrices to optimize sign-up cohort mapping in Pandas instead of executing nested for loops.'
    ],
    interviewTips: [
      'Define LTV, CAC, and why the LTV:CAC ratio is critical for business health.',
      'Explain how a cohort heatmap reveals a drop-off in product value (e.g., if month 2 retention drops sharply for all cohorts, it indicates a poor onboarding experience or lack of long-term utility).'
    ],
    summary: 'CAC measures acquisition cost, while LTV tracks lifetime value. Cohorts group users by time segments to isolate retention trends and product market fit.'
  },
  machine_learning: {
    id: 'machine_learning',
    title: 'Machine Learning Basics (Regression & Classification)',
    duration: '240 mins',
    objectives: [
      'Structure analytical pipelines for training, validation, and testing split.',
      'Implement Linear Regression models to forecast continuous numerical values.',
      'Train Logistic Regression classifiers and construct evaluation matrices.',
      'Interpret model coefficients, error margins, and feature importances.'
    ],
    prerequisites: ['eda_practice'],
    explanation: `### The ML Lifecycle
1. **Feature Engineering**: Select relevant features, handle outliers, and encode categorical variables.
2. **Train/Test Split**: Partition data into a training set (usually 70-80%) to train the model, and a test set to evaluate performance on unseen data.
3. **Training**: Fit the model to find optimal parameters (weights).
4. **Evaluation**: Check error metrics to ensure the model generalizes well and does not overfit.

### Linear Regression
Fits a straight line to predict a continuous numeric variable $y$ from features $x$:
$$y = w_0 + w_1 x_1 + w_2 x_2 + \\epsilon$$
We evaluate it using **Mean Squared Error (MSE)** and $R^2$ (coefficient of determination).

### Logistic Regression
Used for binary classification (predicting True/False, Churn/No Churn). It models the probability of a positive outcome using the sigmoid function:
$$P(y=1) = \\frac{1}{1 + e^{-z}}$$
We evaluate classifiers using a **Confusion Matrix**: Precision, Recall, and F1-Score.`,
    visualDiagramType: 'ml_regression',
    codeExample: `# Let us simulate a linear regression model prediction
# Finding best fit line parameters (y = w_0 + w_1 * x)
x_features = [1, 2, 3, 4, 5]
y_targets = [2.1, 4.2, 5.9, 8.3, 10.1]

# Simulating simple least squares slope estimation
mean_x = sum(x_features) / len(x_features)
mean_y = sum(y_targets) / len(y_targets)

numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(x_features, y_targets))
denominator = sum((x - mean_x)**2 for x in x_features)

w_1 = numerator / denominator
w_0 = mean_y - w_1 * mean_x

print(f"Calculated Regression Parameters:")
print(f"Intercept (w_0): {w_0:.4f}")
print(f"Slope weight (w_1): {w_1:.4f}")
print(f"Estimated equation: Y_pred = {w_0:.2f} + {w_1:.2f} * X")

# Test prediction on new feature
new_x = 6
pred = w_0 + w_1 * new_x
print(f"Forecasted prediction for X={new_x}: {pred:.4f}")
`,
    commonMistakes: [
      'Data leakage: preparing features (e.g., calculating column mean) on the entire dataset *before* splitting, leaking test set information into the training phase.',
      'Overfitting: training a model that fits training noise perfectly but fails to generalize to unseen test records.'
    ],
    performanceTips: [
      'Scale features using StandardScaler or MinMaxScaler; optimization algorithms (like gradient descent) converge much faster on normalized distributions.',
      'Drop redundant, highly correlated features (collinearity) to keep models simple and interpretable.'
    ],
    interviewTips: [
      'Explain the difference between classification and regression and give examples of evaluation metrics for each.',
      'Explain precision vs recall, and describe when you would prioritize recall over precision (e.g., in medical diagnostics, missing a sick patient (false negative) is far more critical than a false alarm (false positive)).'
    ],
    summary: 'Models split datasets into train and test cohorts. Linear regression fits numerical gradients, while logistic regression applies sigmoidal curves for classification.'
  },
  portfolio_projects: {
    id: 'portfolio_projects',
    title: 'Capstones & Portfolio Projects',
    duration: '360 mins',
    objectives: [
      'Integrate SQL, Python, and stats to solve a real business case.',
      'Formulate professional portfolios presenting clean code on GitHub.',
      'Draft analytical reports presenting business insights to stakeholders.',
      'Master data resume strategies and portfolio presentation structures.'
    ],
    prerequisites: ['business_analytics', 'machine_learning'],
    explanation: `### Structuring Capstones
A professional portfolio project must show end-to-end analytical capability, not just a clean Jupyter notebook. It should contain:
1. **Problem Statement**: What real business value is being created?
2. **Data Pipeline**: Show raw extraction, schema design (SQL), cleaning (Pandas), and storage.
3. **Analysis & Modeling**: Apply statistics (A/B testing) or ML models.
4. **Business Recommendation**: Connect analytical numbers back to specific business changes.

### Presenting to Stakeholders
- **Executive Summary**: 3 bullet points summarizing the problem, insight, and recommendation.
- **No Code Walls**: Place code in appendix/GitHub. Stakeholders care about business value, not imports.
- **Visual Clarity**: Use polished, annotated charts. Add titles describing the key take-away directly on the chart itself.`,
    visualDiagramType: 'portfolio',
    codeExample: `# Let us mock an end-to-end business portfolio project summary
project_summary = {
    "Title": "SaaS Churn Reduction & LTV Optimization",
    "Business Problem": "Churn rose by 4% in Q3, depressing recurring revenues.",
    "Data Source": "12,000 subscriber billing rows (finance_churn)",
    "Methodology": "Logistic regression churn classifier & cohort heatmap analysis",
    "Key Insight": "Customers with FICO scores < 600 churn at 3x the rate of other groups.",
    "Business Recommendation": "Implement specialized onboarding checks for credit cohorts."
}

print("Portfolio Case Study Blueprint:")
for key, desc in project_summary.items():
    print(f" {key:18} | {desc}")
`,
    commonMistakes: [
      'Uploading standard, overused datasets (e.g., Titanic, Iris, Boston Housing) to your resume portfolio. Recruiters see these thousands of times and skip them.',
      'Focusing on complex modeling details while neglecting the business context and recommendations.'
    ],
    performanceTips: [
      'Store large raw datasets inside cloud databases or zipped parquet format on GitHub instead of uploading huge, uncompressed CSV files.',
      'Refactor slow notebook code into modular, production-ready Python classes.'
    ],
    interviewTips: [
      'Walk through a portfolio project using the STAR method (Situation, Task, Action, Result).',
      'Describe how you translated a technical model outcome into a direct business change for a client or stakeholder.'
    ],
    summary: 'Capstones unite technical queries and statistical models. Clean documentation, business recommendations, and professional presentation highlight candidate value.'
  }
};
