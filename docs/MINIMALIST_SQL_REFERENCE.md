# Minimalist SQL Quick Reference & Performance Guide

## 1. Core SQL Foundations & Clause Order
### Logical Query Execution Order
```sql
1. FROM       -- Identifies source tables & joins
2. WHERE      -- Filters raw rows before grouping
3. GROUP BY   -- Groups rows by specified keys
4. HAVING     -- Filters aggregated groups
5. SELECT     -- Projects output expressions & window functions
6. DISTINCT   -- Eliminates duplicate rows
7. ORDER BY   -- Sorts final result set
8. LIMIT      -- Restricts row count output
```

## 2. Advanced SQL Techniques
### Window Functions Cheat Sheet
- `ROW_NUMBER()`: Unique sequential integer per partition (1, 2, 3, 4).
- `RANK()`: Sequential integer with gaps on ties (1, 2, 2, 4).
- `DENSE_RANK()`: Sequential integer without gaps on ties (1, 2, 2, 3).
- `LAG(col, offset)`: Accesses previous row values without self-joins.
- `LEAD(col, offset)`: Accesses subsequent row values.
```sql
-- Example: Month-over-Month Revenue Growth
SELECT order_month, net_revenue,
       LAG(net_revenue) OVER (ORDER BY order_month) AS prev_month_rev,
       ROUND((net_revenue - LAG(net_revenue) OVER (ORDER BY order_month)) * 100.0 / 
             LAG(net_revenue) OVER (ORDER BY order_month), 2) AS mom_growth_pct
FROM monthly_sales;
```

## 3. Top Performance & Indexing Tips
1. **SARGable WHERE Clauses**: Avoid wrapping indexed columns in functions (e.g. use `WHERE order_date >= '2024-01-01'` instead of `WHERE YEAR(order_date) = 2024`).
2. **Covering Indexes**: Create composite indexes containing filtering keys + projected columns to allow index-only scans.
3. **Filter Early**: Put high-selectivity predicates in `WHERE` prior to joining large tables.
4. **Avoid `SELECT *`**: Request explicit columns to reduce I/O bandwidth and memory overhead.
5. **CTE vs Subqueries**: Use CTEs (`WITH ... AS (...)`) for clean modularity, or temporary tables for multi-step materialization of large aggregations.

## 4. AI Prompting for SQL Analysts
- **Schema Context First**: Always supply table DDL schema (`CREATE TABLE ...`) when asking LLMs to generate queries.
- **Edge Cases Prompting**: Explicitly ask AI to account for `NULL` values, duplicate rows, and empty result sets.
- **Execution Plan Audit**: Prompt AI to analyze `EXPLAIN QUERY PLAN` output for table scans vs index searches.
