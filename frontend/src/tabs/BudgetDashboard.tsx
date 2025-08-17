import React from 'react';
import type { CategorySummary, Budget, Expense } from '../types/budget';
import type { LanguageStrings } from '../utilities/budget';

type Props = {
  strings: LanguageStrings;
  currentBudget: Budget | null;
  categorySummaries: CategorySummary[];
  expenses: Expense[];
  startEditExpense: (exp: Expense) => void;
  deleteExpense: (id: string) => void;
};

export default function BudgetDashboard({ strings, currentBudget, categorySummaries, expenses, startEditExpense, deleteExpense }: Props) {
  if (!currentBudget) return <div className="hint">No budget found for this month.</div>;

  return (
    <section className="stack">
      <h2 style={{ textAlign: 'center' }}>{strings.budgetDashboard}</h2>

      <div className="dashboard-grid">
        {categorySummaries.map(summary => (
          <div key={summary.categoryName} className="category-card">
            <h4>{summary.categoryName}</h4>

            <div className="progress-bar" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${summary.percentBar}%`, backgroundColor: summary.percentRaw > 100 ? '#ef4444' : '#10b981' }} />
            </div>

            <progress className="sr-only" value={Math.round(summary.percentBar)} max={100} aria-label={`${summary.categoryName} progress`} />

            <div className="category-stats">
              <span>{strings.budget}: Rp {Math.round(summary.budgeted)}</span>
              <span>{strings.spent}: Rp {Math.round(summary.spent)}</span>
              <span>{strings.remaining}: Rp {Math.round(summary.remaining)}</span>
            </div>
          </div>
        ))}
      </div>

      {expenses.length > 0 && (
        <div className="expenses-list" style={{ marginTop: 16 }}>
          <h3>{strings.recentExpenses}</h3>
          {expenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span><strong>{expense.description}</strong></span>
                  <span style={{ color:'#6b7280' }}>{expense.category}</span>
                </div>
                <div className="hint">{strings.date}: {expense.date}</div>
              </div>
              <div className="expense-amount">Rp {Math.round(expense.amount)}</div>
              <div className="row-actions">
                <button aria-label="Edit expense" onClick={() => startEditExpense(expense)}>✏️</button>
                <button aria-label="Delete expense" onClick={() => deleteExpense(expense.id)}>{strings.delete}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
