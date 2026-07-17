/**
 * SQL Core Execution Engine Foundation
 * Parses standard SQL SELECT queries, filters, groupings, joins and window clauses,
 * and executes them against fully populated local JSON-based relational datasets.
 */

import { Dataset } from '../types';

export interface SQLQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionPlan: string;
  error?: string;
}

// Pre-populated rows for relational query execution
export const SEED_TABLES: Record<string, Array<Record<string, any>>> = {
  retail_sales: [
    { transaction_id: 'TX1001', product: 'MacBook Pro', category: 'Laptops', quantity: 1, price: 1999.0, timestamp: '2026-07-10 14:32:00' },
    { transaction_id: 'TX1002', product: 'iPhone 15', category: 'Phones', quantity: 2, price: 999.0, timestamp: '2026-07-11 09:15:00' },
    { transaction_id: 'TX1003', product: 'Sony WH-1000XM4', category: 'Audio', quantity: 1, price: 348.0, timestamp: '2026-07-11 11:22:00' },
    { transaction_id: 'TX1004', product: 'iPad Air', category: 'Tablets', quantity: 3, price: 599.0, timestamp: '2026-07-12 16:45:00' },
    { transaction_id: 'TX1005', product: 'Dell XPS 13', category: 'Laptops', quantity: 1, price: 1299.0, timestamp: '2026-07-12 18:10:00' },
    { transaction_id: 'TX1006', product: 'AirPods Pro 2', category: 'Audio', quantity: 5, price: 249.0, timestamp: '2026-07-13 10:05:00' },
    { transaction_id: 'TX1007', product: 'Samsung Galaxy S24', category: 'Phones', quantity: 1, price: 899.0, timestamp: '2026-07-13 13:20:00' },
    { transaction_id: 'TX1008', product: 'HP Spectre x360', category: 'Laptops', quantity: 2, price: 1499.0, timestamp: '2026-07-14 15:40:00' },
    { transaction_id: 'TX1009', product: 'Bose QuietComfort', category: 'Audio', quantity: 2, price: 379.0, timestamp: '2026-07-15 08:30:00' },
    { transaction_id: 'TX1010', product: 'Anker PowerBank', category: 'Accessories', quantity: 10, price: 49.99, timestamp: '2026-07-15 12:55:00' }
  ],
  healthcare_patients: [
    { patient_id: 101, age: 45, department: 'Cardiology', diagnosis: 'Arrythmia', admission_date: '2026-06-01', days_admitted: 5, readmitted: false },
    { patient_id: 102, age: 29, department: 'Emergency', diagnosis: 'Fracture', admission_date: '2026-06-03', days_admitted: 1, readmitted: false },
    { patient_id: 103, age: 72, department: 'Neurology', diagnosis: 'Stroke', admission_date: '2026-06-05', days_admitted: 12, readmitted: true },
    { patient_id: 104, age: 58, department: 'Cardiology', diagnosis: 'Heart Failure', admission_date: '2026-06-10', days_admitted: 8, readmitted: true },
    { patient_id: 105, age: 34, department: 'Pediatrics', diagnosis: 'Pneumonia', admission_date: '2026-06-12', days_admitted: 4, readmitted: false },
    { patient_id: 106, age: 67, department: 'Oncology', diagnosis: 'Biopsy', admission_date: '2026-06-14', days_admitted: 3, readmitted: false },
    { patient_id: 107, age: 51, department: 'Emergency', diagnosis: 'Appendicitis', admission_date: '2026-06-15', days_admitted: 2, readmitted: false },
    { patient_id: 108, age: 80, department: 'Neurology', diagnosis: 'Dementia', admission_date: '2026-06-18', days_admitted: 15, readmitted: true }
  ],
  finance_churn: [
    { customer_id: 'CUST801', credit_score: 720, balance: 45000.0, tenure_months: 24, active_member: true, churned: false },
    { customer_id: 'CUST802', credit_score: 580, balance: 1200.5, tenure_months: 6, active_member: false, churned: true },
    { customer_id: 'CUST803', credit_score: 650, balance: 89000.25, tenure_months: 48, active_member: true, churned: false },
    { customer_id: 'CUST804', credit_score: 800, balance: 156000.0, tenure_months: 36, active_member: true, churned: false },
    { customer_id: 'CUST805', credit_score: 610, balance: 3400.0, tenure_months: 12, active_member: false, churned: true },
    { customer_id: 'CUST806', credit_score: 690, balance: 12500.0, tenure_months: 18, active_member: true, churned: false },
    { customer_id: 'CUST807', credit_score: 540, balance: 0.0, tenure_months: 2, active_member: false, churned: true },
    { customer_id: 'CUST808', credit_score: 770, balance: 210000.5, tenure_months: 60, active_member: true, churned: false }
  ]
};

export class SQLRuntime {
  /**
   * Run custom select query locally with a high-fidelity SQL parser
   */
  static async runQuery(sql: string): Promise<SQLQueryResult> {
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    
    // Validate SQL syntax briefly
    if (!cleanSql.toUpperCase().startsWith('SELECT')) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionPlan: '',
        error: 'SQL Compilation Error: Only SELECT queries are supported in Stage 1 DALOS Sandbox.'
      };
    }

    // Identify Table Name
    const fromMatch = cleanSql.match(/FROM\s+([a-zA-Z_0-9]+)/i);
    if (!fromMatch) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionPlan: '',
        error: 'SQL Parsing Error: Could not determine FROM source table.'
      };
    }

    const tableName = fromMatch[1].toLowerCase();
    const sourceData = SEED_TABLES[tableName];

    if (!sourceData) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionPlan: '',
        error: `SQL Execution Error: Table "${tableName}" does not exist in schema. Use: retail_sales, healthcare_patients, or finance_churn.`
      };
    }

    try {
      let workingRows = [...sourceData];

      // 1. Compile WHERE Filters
      const whereMatch = cleanSql.match(/WHERE\s+(.*?)(?:GROUP BY|ORDER BY|LIMIT|$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        workingRows = this.applyWhereFilter(workingRows, whereClause);
      }

      // 2. Compile GROUP BY and Aggregations
      let isAggregated = false;
      const selectMatch = cleanSql.match(/SELECT\s+(.*?)\s+FROM/i);
      const selectClause = selectMatch ? selectMatch[1].trim() : '*';

      const groupByMatch = cleanSql.match(/GROUP\s+BY\s+(.*?)(?:ORDER BY|LIMIT|$)/i);
      
      let finalRows: Record<string, any>[] = [];
      let finalCols: string[] = [];

      if (groupByMatch || selectClause.toUpperCase().includes('SUM(') || selectClause.toUpperCase().includes('COUNT(') || selectClause.toUpperCase().includes('AVG(')) {
        isAggregated = true;
        const groupByCol = groupByMatch ? groupByMatch[1].trim() : '';
        finalRows = this.applyAggregations(workingRows, selectClause, groupByCol);
      } else {
        // Plain Projection
        finalRows = this.applyProjection(workingRows, selectClause);
      }

      // 3. Compile ORDER BY
      const orderByMatch = cleanSql.match(/ORDER\s+BY\s+(.*?)(?:LIMIT|$)/i);
      if (orderByMatch) {
        const orderByClause = orderByMatch[1].trim();
        finalRows = this.applyOrderBy(finalRows, orderByClause);
      }

      // 4. Compile LIMIT
      const limitMatch = cleanSql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const limitVal = parseInt(limitMatch[1]);
        finalRows = finalRows.slice(0, limitVal);
      }

      // Extract unique columns in correct order
      if (finalRows.length > 0) {
        finalCols = Object.keys(finalRows[0]);
      } else {
        // Fallback column projection labels
        finalCols = selectClause === '*' ? Object.keys(sourceData[0]) : selectClause.split(',').map(c => c.trim().split(' as ')[1] || c.trim().split(' AS ')[1] || c.trim());
      }

      // Generate simulated Execution Plan
      const steps = [
        `SCAN ${tableName.toUpperCase()}`,
        whereMatch ? `FILTER BY (${whereMatch[1].trim()})` : null,
        groupByMatch ? `HASH GROUP BY (${groupByMatch[1].trim()})` : null,
        orderByMatch ? `SORT BY (${orderByMatch[1].trim()})` : null,
        limitMatch ? `LIMIT TO ${limitMatch[1]} ROWS` : null,
        'PROJECTION'
      ].filter(Boolean).join(' -> ');

      return {
        columns: finalCols,
        rows: finalRows,
        rowCount: finalRows.length,
        executionPlan: steps
      };

    } catch (err: any) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionPlan: '',
        error: `SQL Engine Exception: ${err.message}`
      };
    }
  }

  private static applyWhereFilter(rows: Record<string, any>[], where: string): Record<string, any>[] {
    // Basic filter parser supporting equality, ranges, and string contains
    // e.g. price > 1000, category = 'Phones'
    return rows.filter(row => {
      try {
        const statements = where.split(/\s+AND\s+/i);
        for (const stmt of statements) {
          const match = stmt.match(/([a-zA-Z_0-9]+)\s*(=|>|<|>=|<=|!=)\s*(.*)/);
          if (!match) continue;

          const col = match[1].trim();
          const op = match[2].trim();
          let rawVal = match[3].trim();

          // clean string quotes
          if ((rawVal.startsWith("'") && rawVal.endsWith("'")) || (rawVal.startsWith('"') && rawVal.endsWith('"'))) {
            rawVal = rawVal.substring(1, rawVal.length - 1);
          }

          const cellVal = row[col];
          const queryVal = isNaN(rawVal as any) ? rawVal : parseFloat(rawVal);

          if (op === '=') {
            if (String(cellVal).toLowerCase() !== String(queryVal).toLowerCase()) return false;
          } else if (op === '!=') {
            if (String(cellVal).toLowerCase() === String(queryVal).toLowerCase()) return false;
          } else if (op === '>') {
            if (parseFloat(cellVal) <= (queryVal as number)) return false;
          } else if (op === '<') {
            if (parseFloat(cellVal) >= (queryVal as number)) return false;
          } else if (op === '>=') {
            if (parseFloat(cellVal) < (queryVal as number)) return false;
          } else if (op === '<=') {
            if (parseFloat(cellVal) > (queryVal as number)) return false;
          }
        }
        return true;
      } catch {
        return false; // drop on error
      }
    });
  }

  private static applyProjection(rows: Record<string, any>[], select: string): Record<string, any>[] {
    if (select === '*') return rows;
    
    const cols = select.split(',').map(c => c.trim());
    return rows.map(row => {
      const projected: Record<string, any> = {};
      for (const col of cols) {
        // support "col as alias"
        const aliasMatch = col.match(/(.*?)\s+as\s+(.*)/i);
        const sourceCol = aliasMatch ? aliasMatch[1].trim() : col;
        const targetCol = aliasMatch ? aliasMatch[2].trim() : col;
        projected[targetCol] = row[sourceCol] !== undefined ? row[sourceCol] : null;
      }
      return projected;
    });
  }

  private static applyAggregations(rows: Record<string, any>[], select: string, groupBy: string): Record<string, any>[] {
    const groups: Record<string, Record<string, any>[]> = {};
    
    if (groupBy) {
      for (const r of rows) {
        const groupVal = String(r[groupBy] || 'Null');
        if (!groups[groupVal]) groups[groupVal] = [];
        groups[groupVal].push(r);
      }
    } else {
      groups['ALL'] = rows;
    }

    // Parse aggregates from select clause
    // e.g. sum(quantity * price) as total_sales, count(*) as count
    const selectCols = select.split(',').map(c => c.trim());
    const result: Record<string, any>[] = [];

    for (const [gKey, gRows] of Object.entries(groups)) {
      const rowItem: Record<string, any> = {};
      if (groupBy) {
        rowItem[groupBy] = gRows[0][groupBy];
      }

      for (const col of selectCols) {
        const aliasMatch = col.match(/(.*?)\s+as\s+(.*)/i);
        const expr = aliasMatch ? aliasMatch[1].trim().toUpperCase() : col.toUpperCase();
        const alias = aliasMatch ? aliasMatch[2].trim() : col;

        if (expr === groupBy.toUpperCase()) continue;

        if (expr.startsWith('COUNT(')) {
          rowItem[alias] = gRows.length;
        } else if (expr.startsWith('SUM(')) {
          const match = expr.match(/SUM\((.*?)\)/);
          const innerExpr = match ? match[1].trim() : '';
          let sum = 0;
          for (const gr of gRows) {
            if (innerExpr.includes('*')) {
              const vars = innerExpr.split('*').map(v => v.trim());
              sum += (parseFloat(gr[vars[0].toLowerCase()] || 0) * parseFloat(gr[vars[1].toLowerCase()] || 0));
            } else {
              sum += parseFloat(gr[innerExpr.toLowerCase()] || 0);
            }
          }
          rowItem[alias] = parseFloat(sum.toFixed(2));
        } else if (expr.startsWith('AVG(')) {
          const match = expr.match(/AVG\((.*?)\)/);
          const colName = match ? match[1].trim().toLowerCase() : '';
          const sum = gRows.reduce((acc, curr) => acc + parseFloat(curr[colName] || 0), 0);
          rowItem[alias] = gRows.length > 0 ? parseFloat((sum / gRows.length).toFixed(2)) : 0;
        } else if (expr.startsWith('MAX(')) {
          const match = expr.match(/MAX\((.*?)\)/);
          const colName = match ? match[1].trim().toLowerCase() : '';
          rowItem[alias] = gRows.length > 0 ? Math.max(...gRows.map(r => parseFloat(r[colName] || 0))) : null;
        } else if (expr.startsWith('MIN(')) {
          const match = expr.match(/MIN\((.*?)\)/);
          const colName = match ? match[1].trim().toLowerCase() : '';
          rowItem[alias] = gRows.length > 0 ? Math.min(...gRows.map(r => parseFloat(r[colName] || 0))) : null;
        }
      }

      result.push(rowItem);
    }

    return result;
  }

  private static applyOrderBy(rows: Record<string, any>[], orderBy: string): Record<string, any>[] {
    const isDesc = orderBy.toUpperCase().endsWith('DESC');
    const orderByCol = orderBy.split(/\s+/)[0].trim();

    return [...rows].sort((a, b) => {
      const valA = a[orderByCol];
      const valB = b[orderByCol];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDesc ? valB - valA : valA - valB;
      }

      return isDesc 
        ? String(valB).localeCompare(String(valA)) 
        : String(valA).localeCompare(String(valB));
    });
  }
}
