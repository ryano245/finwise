import React from 'react';
import type { Budget, CategoryBudget } from '../types/budget';
import type { LanguageStrings } from '../utilities/budget';

type Props = {
  strings: LanguageStrings;
  styles: string;
  currentBudget: Budget | null;
  incomeAllowance: number;
  setIncomeAllowance: (n: number) => void;
  totalBudget: number;
  setTotalBudget: (n: number) => void;
  remainingToAllocate: number;
  newCategoryName: string;
  setNewCategoryName: (s: string) => void;
  newCategoryAmount: number;
  setNewCategoryAmount: (n: number) => void;
  newCategoryDescription: string;
  setNewCategoryDescription: (s: string) => void;
  addCategory: () => void;
  startEditCategory: (cat: CategoryBudget) => void;
  editingCategoryId: string | null;
  categoryDraft: Partial<CategoryBudget>;
  setCategoryDraft: (d: Partial<CategoryBudget>) => void;
  saveEditedCategory: () => void;
  cancelEditCategory: () => void;
  deleteCategory: (id: string) => void;

  /* New props for Add Expense UI */
  expenseAmount: number;
  setExpenseAmount: (n: number) => void;
  expenseCategory: string;
  setExpenseCategory: (s: string) => void;
  expenseDate: string;
  setExpenseDate: (s: string) => void;
  expenseDescription: string;
  setExpenseDescription: (s: string) => void;
  addExpense: (e?: React.FormEvent) => void;
};

export default function MonthlyBudgetSetup(props: Props) {
  const {
    strings, styles, currentBudget, incomeAllowance, setIncomeAllowance, totalBudget, setTotalBudget, remainingToAllocate,
    newCategoryName, setNewCategoryName, newCategoryAmount, setNewCategoryAmount,
    newCategoryDescription, setNewCategoryDescription, addCategory,
    startEditCategory, editingCategoryId, categoryDraft, setCategoryDraft, saveEditedCategory, cancelEditCategory, deleteCategory,
    expenseAmount, setExpenseAmount, expenseCategory, setExpenseCategory, expenseDate, setExpenseDate, expenseDescription, setExpenseDescription, addExpense
  } = props;

  return (
    <>
      {/* Income + Savings + Budget + Categories card */}
      <div className="panel-card container" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>{strings.monthlyBudgetSetup}</h2>
        </div>

        <hr style={{ margin: '1rem 0', border: '0.5px solid lightgrey' }} />

        <div className="stack">

        <div className="stack">
            <label
              htmlFor="incomeAllowance"
              style={{ textAlign: 'left', display: 'block', width: '100%' }}
            >
              <strong>{strings.incomeAllowance}</strong>
            </label>

            <div className="row">
              <input
                id="incomeAllowance"
                type="number"
                value={incomeAllowance === 0 ? '' : incomeAllowance}
                onChange={(e) => {
                  const income = e.target.value === '' ? 0 : Number(e.target.value);
                  setIncomeAllowance(income);
                }}
                placeholder={strings.budgetAmountPlaceholder}
                required
                min={0}
              />
              <div className="hint">{`If 0 Income or Allowance, leave this empty`}</div>
            </div>
          </div>

          <div className="stack">
            <label
              htmlFor="totalBudget"
              style={{ textAlign: 'left', display: 'block', width: '100%' }}
            >
              <strong>{strings.totalMonthlyBudget}</strong>
            </label>

            <div className="row">
              <input
                id="totalBudget"
                type="number"
                value={totalBudget === 0 ? '' : totalBudget}
                onChange={(e) => {
                  const newTotal = e.target.value === '' ? 0 : Number(e.target.value);
                  setTotalBudget(newTotal);
                }}
                placeholder={strings.budgetAmountPlaceholder}
                required
                min={0}
              />
              <div className="hint">{`Remaining to allocate: Rp ${Math.round(remainingToAllocate)}`}</div>
            </div>
          </div>

          <div className="stack" style={{ marginTop: 12 }}>
            <label style={{ marginBottom: 8, textAlign: 'left', width: '100%' }}>
              <strong>{strings.addBudgetCategory}</strong>
            </label>

            <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
              <input id="catName" type="text" placeholder={strings.categoryNamePlaceholder} value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
              <input id="catAmount" type="number" placeholder={strings.budgetAmountPlaceholder} value={newCategoryAmount === 0 ? '' : newCategoryAmount} onChange={(e) => setNewCategoryAmount(e.target.value === '' ? 0 : Number(e.target.value))} min={1} required />
              <textarea id="catDesc" placeholder={strings.description} value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} required style={{ flex: 1 }} />
              <button onClick={addCategory} disabled={newCategoryAmount > remainingToAllocate}>{strings.addCategory}</button>
            </div>
          </div>

          {currentBudget && currentBudget.categories.length > 0 && (
            <div className="categories-list" style={{ marginTop: 16 }}>
              <h3>{strings.budgetCategories}</h3>
              {currentBudget.categories.map((cat) => (
                <div key={cat.id} className="category-item" style={{ paddingTop: 10 }}>
                  {editingCategoryId === cat.id ? (
                    <div className="category-edit">
                      <div className="row">
                        <input aria-label={strings.categoryName} type="text" value={categoryDraft.name ?? ''} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} />
                        <input aria-label={strings.budgetAmount} type="number" min={1} value={categoryDraft.amount == null || categoryDraft.amount === 0 ? '' : categoryDraft.amount} onChange={(e) => setCategoryDraft({ ...categoryDraft, amount: e.target.value === '' ? 0 : Number(e.target.value) })} />
                      </div>
                      <textarea aria-label={strings.description} value={categoryDraft.description ?? ''} onChange={(e) => setCategoryDraft({ ...categoryDraft, description: e.target.value })} />
                      <div className="row-actions">
                        <button onClick={saveEditedCategory}>{strings.save}</button>
                        <button onClick={cancelEditCategory}>{strings.cancel}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="category-view">
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <div><strong>{cat.name}</strong>: Rp {Math.round(cat.amount)}</div>
                        <div className="row-actions">
                          <button aria-label="Edit category" onClick={() => startEditCategory(cat)}>✏️</button>
                          <button aria-label="Delete category" onClick={() => deleteCategory(cat.id)}>{strings.delete}</button>
                        </div>
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{cat.description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense card (new) */}
      <div className="panel-card container" style={{ padding: 16, marginTop: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>{strings.addExpense}</h2>
        </div>

        <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '1rem', textAlign: 'left' }}>
          {strings.addExpenseDescription}
        </p>

        <hr style={{ margin: '1rem 0', border: '0.5px solid lightgrey' }} />

        <form onSubmit={(e) => addExpense(e)} className="stack">
          <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
              <label htmlFor="expAmount" style={{ marginBottom: 6 }}>{strings.expenseAmount}</label>
              <input
                id="expAmount"
                type="number"
                placeholder={strings.expenseAmountPlaceholder}
                value={expenseAmount === 0 ? '' : expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                required
                min={1}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 160 }}>
              <label htmlFor="expCategory" style={{ marginBottom: 6 }}>{strings.selectCategory}</label>
              <select
                id="expCategory"
                name="expenseCategory"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                required
              >
                <option value="">{strings.selectCategory}</option>
                {currentBudget?.categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 160 }}>
              <label htmlFor="expDate" style={{ marginBottom: 6 }}>{strings.date}</label>
              <input
                id="expDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <label htmlFor="expDesc" style={{ marginBottom: 6 }}>{strings.expenseDescription}</label>
              <textarea
                id="expDesc"
                placeholder={strings.expenseDescriptionPlaceholder}
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                required
                style={{ minHeight: 64 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit">{strings.addExpenseButton}</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}