# 🗺️ Complete Data Analyst Roadmap — Fresher Checklist
> All skills needed to land your first DA job. Organized by priority.
> ⭐ = High Interview Weight | ✅ = Completed | 🔲 = Not Started | ❌ = Skip
> ⏱️ Schedule: 6 hrs/day total | SQL: 4 hrs/day dedicated until mastered

---

## 📊 SKILL MAP OVERVIEW

```
SQL  ──────────────────────── 🔴 Most Critical  (4 hrs/day until perfect)
Excel / Google Sheets  ─────── 🔴 Most Critical  (6 hrs/day)
Statistics & Math  ─────────── 🟠 Very Important (6 hrs/day)
Python (Analysis)  ─────────── 🟠 Very Important (6 hrs/day)
Data Visualization  ────────── 🟡 Important      (6 hrs/day)
Business Thinking  ─────────── 🟡 Important      (2 hrs/day — runs parallel with SQL)
Portfolio & Projects  ──────── 🟢 Your Proof of Work
Interview Prep  ────────────── 🟢 Final Mile
```

---

## 📅 MASTER TIMELINE (6 hrs/day → ~14 Weeks / ~3.5 Months)

```
Phase 1 ── SQL Mastery      Weeks 1–7   │ 4 hrs SQL + 2 hrs parallel daily
Phase 2 ── Excel + Stats    Weeks 8–10  │ 6 hrs/day
Phase 3 ── Python + Viz     Weeks 11–12 │ 6 hrs/day
Phase 4 ── Projects         Week 13     │ 6 hrs/day
Phase 5 ── Interview Prep   Week 14+    │ 6 hrs/day → Apply!
```

| Week | SQL Block (4 hrs) | Parallel Block (2 hrs) | Goal | Status |
|---|---|---|---|---|
| **1** | SQL: SELECT, Filtering, Aggregates | Business Metrics vocab | Query basics without Googling | ✅ Completed |
| **2** | SQL: Joins Basics & Advanced + Set Operators | Excel: VLOOKUP, SUMIF basics | Multi-table queries | ✅ Completed |
| **3** | SQL: String, Date, NULL, CASE | Excel: pivot table basics | Handle real messy data | 📍 **Current** |
| **4** | SQL: Subqueries + CTEs | Statistics: descriptive stats | Nested logic mastered | 🔲 Next |
| **5** | SQL: Window Functions (all types) | Statistics: probability basics | ⭐ Window functions interview-ready | 🔲 Upcoming |
| **6** | SQL: Modern DWH (JSON, Dim Modeling, Tuning) | Statistics: hypothesis testing | Master cloud DWH & design | 🔲 Upcoming (New!) |
| **7** | SQL: Classic patterns + Mock interviews | Business metrics: Metric Drop | Crack any SQL round | 🔲 Upcoming |
| **8** | ~~SQL~~ → **Excel deep dive (6 hrs)** | — | Excel test ready | 🔲 Upcoming |
| **9** | **Statistics: Hypothesis Testing + A/B (6 hrs)** | — | Answer any stat question | 🔲 Upcoming |
| **10** | **Python: Basics + Pandas Part 1 (6 hrs)** | — | Load, clean, filter data | 🔲 Upcoming |
| **11** | **Python: Pandas Part 2 + Visualization (6 hrs)** | — | Full EDA in Python | 🔲 Upcoming |
| **12** | **Tableau or Power BI (6 hrs)** | — | Working dashboard | 🔲 Upcoming |
| **13** | **Projects (6 hrs)** | — | 3 portfolio projects done | 🔲 Upcoming |
| **14+** | **Interview Prep + Apply (6 hrs)** | — | Land the job | 🔲 Upcoming |

---

## 🔴 PHASE 1 — SQL MASTERY (Weeks 1–7)
### Daily Schedule: 4 hrs SQL + 2 hrs Parallel

---

### WEEK 1 — SQL Foundation ✅ COMPLETED
> Parallel: Read business metric definitions (30 min) + watch StatQuest intro video (30 min)

**Day 1 — SELECT Core** ✅
- [x] `SELECT` specific columns — why never use `SELECT *` in production
- [x] `WHERE` with `AND`, `OR`, `NOT`
- [x] `BETWEEN`, `IN`, `LIKE` with `%` and `_`
- [x] `ORDER BY` ASC / DESC, multiple columns
- [x] `LIMIT` / `TOP` to restrict rows
- [x] Column aliases with `AS`

**Day 2 — Filtering & Deduplication** ✅
- [x] `DISTINCT` to remove duplicate rows
- [x] `IS NULL` / `IS NOT NULL`
- [x] Difference between `WHERE` and `HAVING`
- [x] Practice: Write 15 SELECT queries on a sample database

**Day 3 — Aggregates** ✅
- [x] `COUNT(*)` vs `COUNT(column)` — critical difference
- [x] `SUM()`, `AVG()`, `MIN()`, `MAX()`
- [x] `GROUP BY` with one and multiple columns
- [x] `HAVING` to filter aggregated results
- [x] Combine `GROUP BY` + `ORDER BY`
- [x] Practice: 10 aggregation problems

> ⚠️ **Note:** DDL (CREATE, ALTER, DROP) and DML (INSERT, UPDATE, DELETE) are completed
> from the course. These are bonus knowledge — analysts rarely use them in production.

---

### WEEK 2 — Joins & Set Operators ✅ COMPLETED
> Parallel: Excel core formulas preview (30 min/day)

**Day 4–5 — All Join Types** ✅
- [x] `INNER JOIN` — only rows with matches in both tables
- [x] `LEFT JOIN` — all left rows, NULLs where no match ⭐
- [x] `RIGHT JOIN` — know it, rarely use it
- [x] `FULL OUTER JOIN` — all rows from both sides
- [x] Join on multiple column conditions
- [x] Alias tables for readability (`FROM orders o JOIN customers c`)
- [x] Why duplicates appear after joins (fan-out) — detect and fix

**Day 6 — Advanced Joins** ✅
- [x] Self Join — table joined to itself (manager → employee hierarchy)
- [x] Join 3+ tables in one query
- [x] Joining on non-equality conditions (range joins)

**Day 7 — Set Operators** ✅
- [x] `UNION` — combine result sets, removes duplicates
- [x] `UNION ALL` — keeps duplicates, faster
- [x] `INTERSECT` — rows present in both result sets
- [x] `EXCEPT` / `MINUS` — rows in first set not in second

> ✅ **Week 2 Milestone:** Comfortable joining 3+ tables and using set operators

---

### WEEK 3 — String, Date, NULL, CASE  📍 YOU ARE HERE
> Parallel: Start Excel formulas deep practice (VLOOKUP, SUMIF, IF — 30 min/day)

**Day 8 — String Functions** 🔲
- [ ] `UPPER()`, `LOWER()`, `TRIM()`, `LENGTH()` / `LEN()`
- [ ] `SUBSTRING()` / `SUBSTR()`
- [ ] `REPLACE()`, `CONCAT()` / `||`
- [ ] `LIKE` deep dive — patterns with `%` and `_`
- [ ] Practice: clean messy string columns with queries

**Day 9 — Date Functions** 🔲
- [ ] Get current date: `CURRENT_DATE`, `GETDATE()`, `DATE('now')`
- [ ] Extract parts: `YEAR()`, `MONTH()`, `DAY()` or `strftime()`
- [ ] Date differences between two date columns
- [ ] Format dates for display
- [ ] Practice: 10 date-based filtering and calculation problems

**Day 10 — NULL Handling** 🔲
- [ ] `IS NULL` / `IS NOT NULL` in WHERE
- [ ] `COALESCE()` — replace NULLs with defaults
- [ ] `NULLIF()` — return NULL when two values match
- [ ] How NULLs behave in `SUM`, `AVG`, `COUNT` — they are silently ignored
- [ ] Practice: 8 NULL handling problems

**Day 11 — CASE Statements + Week 3 Review** 🔲
- [ ] `CASE WHEN ... THEN ... ELSE ... END` in SELECT
- [ ] `CASE` to bucket/classify values into ranges
- [ ] `CASE` inside `SUM()` for conditional aggregation (pivot trick)
- [ ] Write 10 queries combining all Week 3 concepts end to end
- [ ] ✅ **Week 3 Milestone:** Can write any basic query from scratch

---

### WEEK 4 — Subqueries + CTEs 🔲 UPCOMING
> Parallel: Descriptive Statistics — mean, median, std dev, percentiles (30 min/day)

**Day 12–13 — Subqueries** 🔲
- [ ] Subquery in `WHERE` clause (filter using another query's result)
- [ ] Subquery in `FROM` clause (inline derived table)
- [ ] Subquery in `SELECT` clause (scalar subquery — one value)
- [ ] Correlated subquery — references the outer query
- [ ] `EXISTS` / `NOT EXISTS` — when to use over `IN`
- [ ] `IN` vs `EXISTS` — performance and logic differences
- [ ] Practice: 10 subquery problems

**Day 14–15 — CTEs** 🔲
- [ ] Write a basic `WITH cte AS (...)` CTE
- [ ] Chain multiple CTEs in one query
- [ ] Recursive CTEs — just know they exist, skip mastering
- [ ] CTE vs Subquery — readability and performance tradeoffs
- [ ] Refactor a complex nested subquery into CTEs

**Day 16–17 — SQL Grinding** 🔲
- [ ] Solve 25 LeetCode Easy + Medium SQL problems
- [ ] 10 StrataScratch DA-track problems
- [ ] For every wrong answer: understand root cause before moving on
- [ ] ✅ **Week 4 Milestone:** CTEs feel natural, LeetCode Easy is automatic

---

### WEEK 5 — Window Functions ⭐⭐ 🔲 UPCOMING
> Parallel: Probability basics + Normal distribution

**Day 18–19 — Ranking Functions** 🔲
- [ ] `ROW_NUMBER()` — unique sequential rank, no ties
- [ ] `RANK()` — ties get same rank, next rank skips
- [ ] `DENSE_RANK()` — ties same rank, no gap after
- [ ] `NTILE(n)` — divide rows into n equal buckets (quartiles, deciles)
- [ ] **Classic pattern:** Latest/most recent record per group (ROW_NUMBER trick) ⭐
- [ ] **Classic pattern:** Top N items per category (RANK trick) ⭐
- [ ] Practice: 10 ranking problems

**Day 20–21 — Aggregate Windows** 🔲
- [ ] `SUM() OVER (PARTITION BY col)` — group total without collapsing rows
- [ ] `AVG() OVER (PARTITION BY col)` — group avg alongside every row
- [ ] `COUNT() OVER (PARTITION BY col)` — group count per row
- [ ] Running total: `SUM() OVER (ORDER BY date)`
- [ ] Moving average: `AVG() OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`
- [ ] % of total: `SUM(sales) / SUM(SUM(sales)) OVER()`

**Day 22–24 — Offset Functions + Frames** 🔲
- [ ] `LAG(col, n)` — value from n rows before current ⭐
- [ ] `LEAD(col, n)` — value from n rows after current ⭐
- [ ] `FIRST_VALUE()` — first value in the window partition
- [ ] `LAST_VALUE()` — last value (requires explicit frame clause!)
- [ ] Window frames: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
- [ ] Window frames: `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`
- [ ] Practice: 12 window function problems
- [ ] ✅ **Week 5 Milestone:** Can write any window function query

---

### WEEK 6 — Modern DWH, Dimensional Modeling & Query Tuning (New Addition) 🔲
> Parallel: Introduction to Hypothesis Testing & statistical significance
> *Why this is needed: Modern cloud databases (Snowflake, BigQuery) store nested/JSON data and charge by byte scanned.*

**Day 25 — Semi-Structured (JSON) Querying** 🔲
- [ ] Querying JSON objects (`JSON_EXTRACT`, JSON pathing `$` or `:` syntax)
- [ ] Flattening arrays to tables (`UNNEST` in BigQuery / `FLATTEN` in Snowflake)
- [ ] Querying key-value properties

**Day 26 — Dimensional Modeling Basics** 🔲
- [ ] Star Schema vs. Snowflake Schema (facts vs. dimensions)
- [ ] Primary Keys vs. Foreign Keys in DW (why warehouses don't always enforce them)
- [ ] Fact Tables (transactional, snapshot, accumulating)
- [ ] Dimension Tables & Slowly Changing Dimensions (SCD Type 1 vs. Type 2 basics)
- [ ] Identifying the "Grain" of a table

**Day 27–28 — Query Optimization (Tuning)** 🔲
- [ ] Why `SELECT *` is highly expensive in columnar databases (BigQuery/Snowflake)
- [ ] Filtering early: push `WHERE` filters before joins
- [ ] How partitioning and clustering prune data scans
- [ ] Understanding a basic query execution plan (identifying full table scans or expensive joins)
- [ ] ✅ **Week 6 Milestone:** Confidently speak about data warehousing and write optimized queries.

---

### WEEK 7 — Classic Interview Patterns + Mock Interviews 🔲 UPCOMING
> Parallel: Metric Drop case studies ("Daily Active Users fell 10%, how do you diagnose?")

**Day 29 — Growth & Trends** 🔲
- [ ] Month-over-Month growth using `LAG()`
- [ ] Year-over-Year change as a percentage
- [ ] Running cumulative revenue

**Day 30 — User Activity** 🔲
- [ ] Monthly Active Users (MAU): `COUNT(DISTINCT user_id)` by month
- [ ] Daily Active Users (DAU)
- [ ] DAU/MAU ratio query

**Day 31 — Retention** 🔲
- [ ] Day-1 retention: users who came back day after signup
- [ ] Day-7, Day-30 retention
- [ ] Cohort retention table

**Day 32 — Deduplication & Ranking** 🔲
- [ ] Find duplicate rows using `GROUP BY` + `HAVING COUNT > 1`
- [ ] Delete duplicates keeping one row (ROW_NUMBER trick)
- [ ] Nth highest salary (DENSE_RANK approach)

**Day 33 — Set-Based Patterns** 🔲
- [ ] Customers who bought X but never bought Y (`LEFT JOIN` + `IS NULL`)
- [ ] Funnel drop-off: users who completed each step in order

**Day 34 — Advanced Patterns + Mock** 🔲
- [ ] Consecutive days of activity (date diff + ROW_NUMBER subtraction)
- [ ] Pivot table using `CASE WHEN` inside `SUM()`
- [ ] 2 full timed mock sessions — 45 minutes, 2 questions each
- [ ] StrataScratch: 15 real company questions
- [ ] ✅ **Week 7 Milestone: SQL MASTERED** — confident in any interview round

---

## 🔴 PHASE 2 — EXCEL + STATISTICS (Weeks 8–10)
### Daily Schedule: 6 hrs/day

---

### WEEK 8 — Excel / Google Sheets 🔲

**Day 35–36 — Core Formulas (12 hrs)**
- [ ] `VLOOKUP` / `XLOOKUP`
- [ ] `INDEX + MATCH`
- [ ] `IF`, `IFS`, `IFERROR`, `IFNA`
- [ ] `COUNTIF`, `COUNTIFS`, `SUMIF`, `SUMIFS`, `AVERAGEIFS`
- [ ] `TEXT()`, `LEFT()`, `RIGHT()`, `MID()`, `FIND()`, `LEN()`
- [ ] `DATE()`, `TODAY()`, `DATEDIF()`, `EOMONTH()`
- [ ] `CONCATENATE()` / `TEXTJOIN()`
- [ ] `UNIQUE()`, `SORT()`, `FILTER()` (modern Excel)

**Day 37–38 — Pivot Tables** ⭐ **(12 hrs)**
- [ ] Create pivot table from scratch
- [ ] Group by rows, columns, and values
- [ ] Add calculated fields
- [ ] Create pivot charts from pivot table
- [ ] Slicers for interactive filtering
- [ ] Conditional formatting for heatmaps

**Day 39 — Data Cleaning (6 hrs)**
- [ ] Remove duplicates, split text to columns
- [ ] Flash Fill for pattern-based autofill
- [ ] Trim spaces, fix casing, handle blank cells
- [ ] Power Query: import, clean, transform without formulas

**Day 40 — Charts for Presentations (6 hrs)**
- [ ] Bar chart, line chart, scatter plot — when to use each
- [ ] Combo chart (bar + line on same axes)
- [ ] Format for business: clear titles, clean labels, no chart junk
- [ ] ✅ **Week 8 Milestone:** Excel test ready

---

### WEEK 9 — Statistics + A/B Testing 🔲

**Day 41–42 — Descriptive Stats (12 hrs)**
- [ ] Mean, Median, Mode — when each matters more
- [ ] Standard Deviation and Variance — intuition, not just formula
- [ ] Percentiles: P25, P50, P75, P90, P99 — how to read them
- [ ] Skewness — left vs right skewed distribution
- [ ] Outlier detection: IQR method, Z-score method
- [ ] Correlation vs Causation ⭐

**Day 43 — Probability (6 hrs)**
- [ ] Basic rules: P(A and B), P(A or B)
- [ ] Conditional probability: P(A | B)
- [ ] Normal distribution — 68-95-99.7 rule
- [ ] Expected value

**Day 44–45 — Hypothesis Testing (12 hrs)**
- [ ] Null vs Alternate hypothesis
- [ ] p-value in plain English
- [ ] t-test: compare means of two groups
- [ ] Chi-square test: compare categorical distributions
- [ ] Confidence intervals — interpret without a calculator
- [ ] Type I and Type II errors

**Day 46 — A/B Testing (6 hrs)** ⭐
- [ ] What A/B testing is and why companies run it
- [ ] Control group vs treatment group
- [ ] Sample size and statistical power
- [ ] Interpret a result: significant? big enough effect?
- [ ] Common pitfalls: peeking early, novelty effect, network effects
- [ ] Practice: Interpret 5 realistic A/B test scenarios
- [ ] ✅ **Week 9 Milestone:** Can explain any A/B test result in an interview

---

## 🟠 PHASE 3 — PYTHON + VISUALIZATION (Weeks 10–12)
### Daily Schedule: 6 hrs/day

---

### WEEK 10 — Python + Pandas Part 1 🔲

**Day 47–49 — Python Fundamentals (18 hrs)**
- [ ] Variables, data types: int, float, str, bool, list, dict, tuple
- [ ] Conditionals: `if`, `elif`, `else`
- [ ] Loops: `for`, `while`
- [ ] Functions: define, call, return values
- [ ] List comprehensions
- [ ] String formatting with f-strings
- [ ] Reading and writing CSV files

**Day 50–53 — Pandas Core (24 hrs)** ⭐
- [ ] `pd.read_csv()`, `.head()`, `.info()`, `.describe()`, `.shape`
- [ ] Select columns, filter rows with boolean conditions
- [ ] Handle missing values: `.isnull()`, `.fillna()`, `.dropna()`
- [ ] Sort: `.sort_values()`
- [ ] Rename, drop columns
- [ ] `value_counts()`, `nunique()`
- [ ] `groupby()` + aggregation — pandas equivalent of SQL GROUP BY
- [ ] `merge()` — pandas equivalent of SQL JOIN

---

### WEEK 11 — Pandas Advanced + Visualization 🔲

**Day 54–56 — Pandas Advanced (18 hrs)**
- [ ] `.apply()` and `.map()` for row/column transformations
- [ ] `pd.pivot_table()` — multi-dimensional aggregation
- [ ] Date handling: `pd.to_datetime()`, `.dt.year`, `.dt.month`
- [ ] `pd.to_csv()` — export cleaned data
- [ ] String ops: `.str.upper()`, `.str.contains()`, `.str.split()`
- [ ] NumPy: arrays, `np.mean()`, `np.std()`, `np.percentile()`

**Day 57–60 — Matplotlib + Seaborn (24 hrs)**
- [ ] Matplotlib: line plot, bar chart, scatter plot, histogram
- [ ] Seaborn: box plot, heatmap, pair plot, violin plot
- [ ] Customize: titles, axis labels, colors, figure size, legends
- [ ] Build a full EDA Jupyter Notebook from scratch (5+ charts)
- [ ] ✅ **Week 11 Milestone:** End-to-end Python EDA independently

---

### WEEK 12 — Tableau or Power BI 🔲
> Pick ONE: Tableau = startup/analytics. Power BI = corporate India.

**Day 61–63 — Core Skills (18 hrs)**
- [ ] Connect to CSV / Excel data
- [ ] Build bar chart, line chart, scatter plot
- [ ] Use filters and parameters for interactivity
- [ ] Create calculated fields / DAX measures
- [ ] Build your first dashboard (3 charts + 2 KPI tiles)

**Day 64–67 — Advanced + Publish (24 hrs)**
- [ ] Tableau: LOD expressions (`FIXED`, `INCLUDE`, `EXCLUDE`)
- [ ] Tableau: Table calcs — running total, % of total, moving avg
- [ ] Power BI: `CALCULATE()`, `SUMX()`, `FILTER()`, `ALL()` in DAX
- [ ] Power BI: Relationships between tables (data modeling)
- [ ] Add drill-down, tooltips, slicers
- [ ] Publish on Tableau Public / Power BI web
- [ ] ✅ **Week 12 Milestone:** Published dashboard in portfolio

---

## 🟢 PHASE 4 — PROJECTS + PORTFOLIO (Week 13)
### Daily Schedule: 6 hrs/day

**Day 68–70 — Project 1: SQL + Excel EDA (3 days)**
- [ ] Find real dataset from Kaggle or government open data
- [ ] Write 5+ business questions, answer each with SQL
- [ ] Visualize key findings in Excel pivot charts
- [ ] Write a 1-page insight summary (what → so what → now what)
- [ ] Upload to GitHub with a clean README

**Day 71–73 — Project 2: Python EDA (3 days)**
- [ ] Load and clean a messy real-world dataset with Pandas
- [ ] 5+ Seaborn/Matplotlib charts telling a business story
- [ ] Jupyter Notebook with markdown narration
- [ ] 3 actionable business recommendations as conclusions
- [ ] Upload to GitHub or publish on Kaggle

**Day 74 — Project 3: BI Dashboard (1 day)**
- [ ] Multi-page Tableau / Power BI dashboard
- [ ] KPI summary + trend + drill-down by category
- [ ] Publish on Tableau Public
- [ ] ✅ **Week 13 Milestone:** Portfolio is live and ready to share

---

## 🟡 BUSINESS THINKING (Parallel — 2 hrs/day during SQL Phase)
> 30 min reading + 30 min case study video per day

### Business Metrics to Know Cold
- [ ] **Revenue:** GMV, ARR, MRR, Net Revenue, Gross Margin
- [ ] **Customer:** CAC, LTV, Churn Rate, Retention Rate
- [ ] **Engagement:** DAU, MAU, DAU/MAU ratio, Session Duration
- [ ] **Product:** Conversion Rate, Funnel Drop-off, Click-through Rate
- [ ] **E-commerce:** AOV, Cart Abandonment Rate, Repeat Purchase Rate

### Analytical Frameworks
- [ ] MECE — Mutually Exclusive, Collectively Exhaustive thinking
- [ ] 5 Whys — Root Cause Analysis
- [ ] Funnel Analysis — user drop-off at each stage
- [ ] Cohort Analysis — track behavior of user groups over time
- [ ] Pareto / 80-20 rule
- [ ] North Star Metric

### "Metric Dropped 20%" Framework ⭐ (Most Common Interview Question)
- [ ] Step 1: Clarify — which metric, by how much, over what period?
- [ ] Step 2: Rule out data issues (tracking bug, definition change)
- [ ] Step 3: Break down by dimension — time / region / platform / product
- [ ] Step 4: Form 3 hypotheses and say how to test each
- [ ] Step 5: Recommend action based on each outcome

---

## 🟢 INTERVIEW PREP (Week 14+, 6 hrs/day)

### Technical Rounds
- [ ] SQL coding: 2 full 45-minute timed mock sessions per week
- [ ] Excel/Sheets test: Clean a messy dataset, build a pivot
- [ ] Python: EDA on a given dataset in Jupyter
- [ ] Statistics: Explain A/B test results out loud
- [ ] Case study: Analyze a dataset and present key findings

### Behavioral (STAR Method)
- [ ] Tell me about a data project you worked on
- [ ] How do you handle ambiguous requirements?
- [ ] Describe communicating a complex finding to non-technical people
- [ ] Describe finding and handling a data quality issue
- [ ] Why data analytics? Why this company?

### Questions to Ask the Interviewer
- [ ] What does a typical day look like for a DA on this team?
- [ ] What data stack do you use (SQL dialect, BI tool, Python)?
- [ ] What are the most important metrics this team owns?
- [ ] What does success look like in the first 90 days?

### GitHub + LinkedIn + Resume
- [ ] GitHub: 3 pinned projects, each with a README
- [ ] LinkedIn: Headline → "Aspiring Data Analyst | SQL • Python • Tableau"
- [ ] LinkedIn: Add each project as Featured with a screenshot
- [ ] Resume: 1 page, quantify everything, skills listed clearly
- [ ] Apply to 5 jobs/day once portfolio is ready

---

## ❌ SKIP THESE — Not Needed as a Fresher DA

| Topic | Why Skip |
|---|---|
| Stored Procedures & Triggers | DBA territory |
| Machine Learning (models) | That's Data Science |
| Hadoop / Spark | Data Engineering |
| Deep Bayesian statistics | Research roles |
| Index Creation & DB Admin | DBA territory |
| Recursive CTEs (mastering) | Just know they exist |
| R Programming | Python is enough |
| CTAS & Temp Tables (deep) | DE territory |

---

## 📈 OVERALL PROGRESS TRACKER

| Phase | Skill | Status |
|---|---|---|
| Phase 1 | SQL: Foundation (SELECT, Filtering, Aggregates) | ✅ Completed |
| Phase 1 | SQL: Joins (Basic + Advanced) + Set Operators | ✅ Completed |
| Phase 1 | SQL: String, Date, NULL, CASE | 📍 **Current — Week 3** |
| Phase 1 | SQL: Subqueries + CTEs | 🔲 Week 4 |
| Phase 1 | SQL: Window Functions | 🔲 Week 5 |
| Phase 1 | SQL: Modern DWH (JSON, Dim Modeling, Tuning) | 🔲 Week 6 (New) |
| Phase 1 | SQL: Mock Interviews + Classic Patterns | 🔲 Week 7 |
| Phase 2 | Excel / Google Sheets | 🔲 Week 8 |
| Phase 2 | Statistics + A/B Testing | 🔲 Week 9 |
| Phase 3 | Python + Pandas | 🔲 Week 10–11 |
| Phase 3 | Tableau / Power BI | 🔲 Week 12 |
| Phase 4 | 3 Portfolio Projects | 🔲 Week 13 |
| Phase 5 | Interview Prep + Applications | 🔲 Week 14+ |

> Update to: 🔄 In Progress → ✅ Completed

---

*Created: 2026-07-07*
*Profile: Data Analyst Fresher*
*Schedule: 6 hrs/day | SQL: 4 hrs/day dedicated*
*Last Updated: 2026-07-08 — restuctured and optimized for Data Analyst relevance*
*Target: Job-ready in ~14 weeks (3.5 months)*
