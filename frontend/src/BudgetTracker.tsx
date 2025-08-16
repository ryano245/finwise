// frontend/src/BudgetTracker.tsx
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

import type { LanguageStrings } from './utilities/budget';
import { englishStrings, indonesianStrings } from './utilities/budget';
import { budgetTrackerStyles } from './styles/BudgetTracker';
import {
  CategoryBudget,
  Budget,
  Expense,
  CategorySummary,
  Goal,
} from './types/budget';

function App() {
  // inject component-scoped styles
  const styles = budgetTrackerStyles;

  /** Language */
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'id' || saved === 'en') ? saved : 'en';
  });
  const strings: LanguageStrings =
    currentLanguage === 'en' ? englishStrings : indonesianStrings;
  useEffect(() => { localStorage.setItem('lang', currentLanguage); }, [currentLanguage]);

  /** Budget + expenses state */
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  /** Add-category form */
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState<number>(0);
  const [newCategoryDate, setNewCategoryDate] = useState<string>('');
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');

  /** Edit-category inline */
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<Partial<CategoryBudget>>({});

  /** Add-expense form */
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');

  /** Edit-expense inline */
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseDraft, setExpenseDraft] = useState<Partial<Expense>>({});

  /** Total budget field */
  const [totalBudget, setTotalBudget] = useState<number>(0);

  /** Income/Allowance field */
  const [incomeAllowance, setIncomeAllowance] = useState<number>(0);

  /** ===== Goals (multi) ===== */
  const [goals, setGoals] = useState<Goal[]>(() => {
    const raw = localStorage.getItem('goals_v1');
    if (raw) {
      try { return JSON.parse(raw) as Goal[]; } catch { /* fallthrough */ }
    }
    // migrate from legacy single-goal fields if any
    const legacy = {
      wish: localStorage.getItem('wish') ?? '',
      goalType: localStorage.getItem('goal_type') ?? 'emergency',
      goalTypeOther: localStorage.getItem('goal_type_other') ?? '',
      targetAmount: Number(localStorage.getItem('goal_amount') ?? 0),
      targetAmountUnknown: localStorage.getItem('goal_amount_unknown') === '1',
      startDate: localStorage.getItem('goal_start_date') ?? '',
      targetDate: localStorage.getItem('goal_target_date') ?? '',
      flexibility: (localStorage.getItem('goal_flex') === 'soft' ? 'soft' : 'hard') as 'hard'|'soft',
      currentSavings: Number(localStorage.getItem('goal_current_savings') ?? 0),
      priority: (localStorage.getItem('goal_priority') as 'high'|'medium'|'low') || 'medium',
      riskProfile: (localStorage.getItem('goal_risk') as 'conservative'|'balanced'|'aggressive') || 'balanced',
      nonNegotiables: (() => { const s = localStorage.getItem('goal_non_negotiables'); try { return s ? JSON.parse(s) : []; } catch { return []; } })(),
      motivation: localStorage.getItem('goal_motivation') ?? '',
    };
    const hasAny = legacy.wish || legacy.targetDate || legacy.targetAmount || legacy.currentSavings;
    return hasAny ? [{
      id: `goal-${Date.now()}`,
      ...legacy
    }] : [];
  });
  useEffect(() => { localStorage.setItem('goals_v1', JSON.stringify(goals)); }, [goals]);

  // per-goal chips text
  const [nonNegInputMap, setNonNegInputMap] = useState<Record<string, string>>({});
  const setNonNegInputFor = (goalId: string, value: string) =>
    setNonNegInputMap(m => ({ ...m, [goalId]: value }));

  const updateGoal = (id: string, patch: Partial<Goal>) =>
    setGoals(gs => gs.map(g => g.id === id ? { ...g, ...patch } : g));

  const addNewGoal = () => {
    setGoals(gs => [...gs, {
      id: `goal-${Date.now()}`,
      wish: '',
      goalType: 'emergency',
      goalTypeOther: '',
      targetAmount: 0,
      targetAmountUnknown: false,
      startDate: '',
      targetDate: '',
      flexibility: 'hard',
      currentSavings: 0,
      priority: 'medium',
      riskProfile: 'balanced',
      nonNegotiables: [],
      motivation: ''
    }]);
  };

  const addNonNeg = (goalId: string) => {
    const v = (nonNegInputMap[goalId] ?? '').trim();
    if (!v) return;
    setGoals(gs => gs.map(g =>
      g.id === goalId
        ? { ...g, nonNegotiables: g.nonNegotiables.includes(v) ? g.nonNegotiables : [...g.nonNegotiables, v] }
        : g
    ));
    setNonNegInputFor(goalId, '');
  };

  const removeNonNeg = (goalId: string, v: string) => {
    setGoals(gs => gs.map(g =>
      g.id === goalId ? { ...g, nonNegotiables: g.nonNegotiables.filter(x => x !== v) } : g
    ));
  };

  // NEW: delete a goal
  const deleteGoal = (id: string) => {
    setGoals(gs => gs.filter(g => g.id !== id));
  };

  /** Helpers */
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const toMonth = (yyyyMmDd: string) => yyyyMmDd.slice(0, 7);

  // IDR without thousand separators to avoid dot-as-decimal confusion
  const formatCurrency = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString('id-ID', { useGrouping: false, maximumFractionDigits: 0 })}`;

  /** Load data on mount */
  useEffect(() => {
    try {
      const currentMonth = getCurrentMonth();

      const storedBudget = localStorage.getItem(`budget-${currentMonth}`);
      if (storedBudget) {
        const raw = JSON.parse(storedBudget) as any;
        let categories: CategoryBudget[] = [];
        if (Array.isArray(raw.categories)) {
          categories = raw.categories as CategoryBudget[];
        } else if (raw.categories && typeof raw.categories === 'object') {
          categories = Object.entries(raw.categories).map(([name, amount], i) => ({
            id: `cat-${i}-${name}`,
            name,
            amount: Number(amount),
            date: `${currentMonth}-01`,
            description: ''
          }));
        }
        const budget: Budget = {
          id: raw.id ?? `budget-${currentMonth}`,
          month: raw.month ?? currentMonth,
          incomeAllowance: Number(raw.incomeAllowance ?? 0),
          totalBudget: Number(raw.totalBudget ?? 0),
          categories,
          createdAt: raw.createdAt ?? new Date().toISOString(),
          updatedAt: raw.updatedAt ?? new Date().toISOString()
        };
        setCurrentBudget(budget);
        setIncomeAllowance(budget.incomeAllowance);
        setTotalBudget(budget.totalBudget);
      
      }

      const storedExpenses = localStorage.getItem(`expenses-${currentMonth}`);
      if (storedExpenses) {
        const list = JSON.parse(storedExpenses) as Expense[];
        setExpenses(list);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);

  /** Derived summaries */
  const categorySummaries: CategorySummary[] = useMemo(() => {
    if (!currentBudget) return [];
    return currentBudget.categories.map((cat) => {
      const spent = expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
      const remaining = cat.amount - spent;
      const percentRaw = cat.amount > 0 ? (spent / cat.amount) * 100 : 0;
      return {
        categoryName: cat.name,
        budgeted: cat.amount,
        spent,
        remaining,
        percentRaw,
        percentBar: Math.max(0, Math.min(percentRaw, 100))
      };
    });
  }, [currentBudget, expenses]);

  const sumCategoryCaps = useMemo(
    () => currentBudget?.categories.reduce((acc, c) => acc + (c.amount || 0), 0) ?? 0,
    [currentBudget]
  );
  const remainingToAllocate = Math.max(0, totalBudget - sumCategoryCaps);

  /** Categories */
  const addCategory = () => {
    if (!currentBudget) return;
    const name = newCategoryName.trim();
    if (!name || !newCategoryAmount || !newCategoryDate || !newCategoryDescription.trim()) {
      alert(strings.requiredField);
      return;
    }
    const exists = currentBudget.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) { alert(strings.dupCategoryWarning); return; }
    if (newCategoryAmount > remainingToAllocate) {
      alert(`Cannot allocate more than remaining: ${formatCurrency(remainingToAllocate)}`);
      return;
    }
    const newCat: CategoryBudget = {
      id: `cat-${Date.now()}`,
      name,
      amount: newCategoryAmount,
      date: newCategoryDate,
      description: newCategoryDescription.trim()
    };
    setCurrentBudget({ ...currentBudget, categories: [...currentBudget.categories, newCat] });
    setNewCategoryName(''); setNewCategoryAmount(0); setNewCategoryDate(''); setNewCategoryDescription('');
  };

  const startEditCategory = (cat: CategoryBudget) => {
    setEditingCategoryId(cat.id);
    setCategoryDraft({ ...cat });
  };
  const cancelEditCategory = () => { setEditingCategoryId(null); setCategoryDraft({}); };
  const saveEditedCategory = () => {
    if (!currentBudget || !editingCategoryId || !categoryDraft) return;
    const name = (categoryDraft.name ?? '').trim();
    const amount = Number(categoryDraft.amount ?? 0);
    const date = (categoryDraft.date ?? '').trim();
    const description = (categoryDraft.description ?? '').trim();
    if (!name || !amount || !date || !description) { alert(strings.requiredField); return; }
    const dup = currentBudget.categories.some(
      c => c.id !== editingCategoryId && c.name.toLowerCase() === name.toLowerCase()
    );
    if (dup) { alert(strings.dupCategoryWarning); return; }
    const totalIfSaved = currentBudget.categories.reduce((acc, c) => {
      if (c.id === editingCategoryId) return acc + amount;
      return acc + c.amount;
    }, 0);
    if (totalIfSaved > totalBudget) {
      alert(`Total of category caps would exceed total budget (${formatCurrency(totalBudget)}).`);
      return;
    }
    const updatedCats = currentBudget.categories.map((c) =>
      c.id === editingCategoryId ? { ...c, name, amount, date, description } : c
    );
    setCurrentBudget({ ...currentBudget, categories: updatedCats });
    cancelEditCategory();
  };

  // NEW: delete a category
  const deleteCategory = (id: string) => {
    if (!currentBudget) return;
    if (editingCategoryId === id) cancelEditCategory();
    setCurrentBudget({
      ...currentBudget,
      categories: currentBudget.categories.filter(c => c.id !== id),
    });
  };

  const saveBudget = () => {
    if (!currentBudget) return;
    const nowIso = new Date().toISOString();
    const data: Budget = { ...currentBudget, totalBudget, updatedAt: nowIso };
    localStorage.setItem(`budget-${currentBudget.month}`, JSON.stringify(data));
    setCurrentBudget(data);
    alert(strings.budgetSaved);
  };

  /** Expenses */
  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseCategory || !expenseDate || !expenseDescription.trim()) {
      alert(strings.requiredField);
      return;
    }
    const newExp: Expense = {
      id: `expense-${Date.now()}`,
      amount: expenseAmount,
      category: expenseCategory,
      description: expenseDescription.trim(),
      date: expenseDate,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExp, ...prev]);
    setExpenseAmount(0); setExpenseCategory(''); setExpenseDate(''); setExpenseDescription('');
    alert(strings.expenseAdded);
  };

  const startEditExpense = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseDraft({ ...exp });
  };
  const cancelEditExpense = () => { setEditingExpenseId(null); setExpenseDraft({}); };
  const saveEditedExpense = () => {
    if (!editingExpenseId || !expenseDraft) return;
    const amount = Number(expenseDraft.amount ?? 0);
    const category = (expenseDraft.category ?? '').trim();
    const date = (expenseDraft.date ?? '').trim();
    const description = (expenseDraft.description ?? '').trim();
    if (!amount || !category || !date || !description) { alert(strings.requiredField); return; }
    setExpenses(prev => prev.map(e => e.id === editingExpenseId ? { ...e, amount, category, date, description } : e));
    cancelEditExpense();
  };

  // NEW: delete an expense
  const deleteExpense = (id: string) => {
    if (editingExpenseId === id) cancelEditExpense();
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const saveAllExpenses = () => {
    const byMonth = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
      const m = toMonth(e.date);
      (acc[m] ||= []).push(e);
      return acc;
    }, {});
    Object.entries(byMonth).forEach(([month, list]) => {
      localStorage.setItem(`expenses-${month}`, JSON.stringify(list));
    });
    const cm = getCurrentMonth();
    if (!byMonth[cm]) localStorage.removeItem(`expenses-${cm}`);
    alert(strings.budgetSaved);
  };

  /** Generate Plan gate */
  const canGeneratePlan = expenses.length >= 5;

  const switchLanguage = (lang: 'en' | 'id') => setCurrentLanguage(lang);

  /** Extra notes (FIX: make it a controlled input synced to localStorage) */
  const [extraNotes, setExtraNotes] = useState<string>(() => localStorage.getItem('extra_notes') ?? '');
  useEffect(() => {
    localStorage.setItem('extra_notes', extraNotes);
  }, [extraNotes]);

  /** =======================
   *         Render
   *  ======================= */
  return (
    <div className="app">
      <style>{styles}</style>

      <header className="container" style={{ paddingTop: 24 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 12 }}>{strings.appTitle}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div className="row" role="group" aria-label="Language switcher">
            <button onClick={() => switchLanguage('en')} className={currentLanguage === 'en' ? 'active' : ''}>EN</button>
            <button onClick={() => switchLanguage('id')} className={currentLanguage === 'id' ? 'active' : ''}>ID</button>
          </div>
        </div>

        {/* Goal context section (multi-goal) */}
        <div className="goal-card container" style={{ marginBottom: 24 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{strings.goalSectionTitle}</h3>
            <button type="button" onClick={addNewGoal} aria-label="Add goal">＋</button>
          </div>

          {goals.length === 0 && (
            <div className="hint">Add your first goal with the ＋ button.</div>
          )}

          {goals.map((goal) => (
            <div key={goal.id} className="stack" style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
              {/* Per-goal actions */}
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => deleteGoal(goal.id)} aria-label="Delete goal">
                  {strings.delete}
                </button>
              </div>

              {/* Title + Goal type */}
              <div className="row">
                <label htmlFor={`wish-${goal.id}`} className="sr-only">{strings.wishLabel}</label>
                <input
                  id={`wish-${goal.id}`}
                  type="text"
                  value={goal.wish}
                  onChange={(e) => updateGoal(goal.id, { wish: e.target.value })}
                  placeholder={strings.wishPlaceholder}
                  required
                  style={{ flex: 1 }}
                />

                <label htmlFor={`goalType-${goal.id}`} className="sr-only">{strings.goalTypeLabel}</label>
                <select
                  id={`goalType-${goal.id}`}
                  value={goal.goalType}
                  onChange={(e) => updateGoal(goal.id, { goalType: e.target.value })}
                >
                  <option value="emergency">{strings.goalTypeOptions.emergency}</option>
                  <option value="debt">{strings.goalTypeOptions.debt}</option>
                  <option value="device">{strings.goalTypeOptions.device}</option>
                  <option value="travel">{strings.goalTypeOptions.travel}</option>
                  <option value="tuition">{strings.goalTypeOptions.tuition}</option>
                  <option value="move">{strings.goalTypeOptions.move}</option>
                  <option value="build">{strings.goalTypeOptions.build}</option>
                  <option value="other">{strings.goalTypeOptions.other}</option>
                </select>

                {goal.goalType === 'other' && (
                  <input
                    aria-label={strings.goalTypeOtherLabel}
                    type="text"
                    value={goal.goalTypeOther}
                    onChange={(e) => updateGoal(goal.id, { goalTypeOther: e.target.value })}
                    placeholder={strings.goalTypeOtherLabel}
                  />
                )}
              </div>

              {/* Target amount + Not sure */}
              <div className="row">
                <label htmlFor={`targetAmount-${goal.id}`} className="sr-only">{strings.targetAmountLabel}</label>
                <input
                  id={`targetAmount-${goal.id}`}
                  type="number"
                  placeholder={strings.targetAmountPlaceholder}
                  value={goal.targetAmountUnknown ? '' : (goal.targetAmount === 0 ? '' : goal.targetAmount)}
                  onChange={(e) => updateGoal(goal.id, { targetAmount: e.target.value === '' ? 0 : Number(e.target.value) })}
                  min={0}
                  disabled={goal.targetAmountUnknown}
                />
                <label className="row" style={{ gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={goal.targetAmountUnknown}
                    onChange={(e) => updateGoal(goal.id, { targetAmountUnknown: e.target.checked })}
                  />
                  {strings.targetAmountUnknown}
                </label>
              </div>

              {/* Dates with visible labels */}
              <div className="row">
                <div className="stack">
                  <label htmlFor={`start-${goal.id}`}>{strings.startDateLabel}</label>
                  <input
                    id={`start-${goal.id}`}
                    type="date"
                    value={goal.startDate}
                    onChange={(e) => updateGoal(goal.id, { startDate: e.target.value })}
                  />
                </div>

                <div className="stack">
                  <label htmlFor={`target-${goal.id}`}>{strings.targetDateLabel}</label>
                  <input
                    id={`target-${goal.id}`}
                    type="date"
                    value={goal.targetDate}
                    onChange={(e) => updateGoal(goal.id, { targetDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Flexibility */}
              <div className="row" role="group" aria-label={strings.flexibilityLabel}>
                <span className="hint">{strings.flexibilityLabel}:</span>
                <label className="row">
                  <input
                    type="radio"
                    name={`flex-${goal.id}`}
                    checked={goal.flexibility === 'hard'}
                    onChange={() => updateGoal(goal.id, { flexibility: 'hard' })}
                  />
                  {strings.flexibilityHard}
                </label>
                <label className="row">
                  <input
                    type="radio"
                    name={`flex-${goal.id}`}
                    checked={goal.flexibility === 'soft'}
                    onChange={() => updateGoal(goal.id, { flexibility: 'soft' })}
                  />
                  {strings.flexibilitySoft}
                </label>
              </div>

              {/* Current savings, priority, risk */}
              <div className="row">
                <label htmlFor={`currentSavings-${goal.id}`} className="sr-only">{strings.currentSavingsLabel}</label>
                <input
                  id={`currentSavings-${goal.id}`}
                  type="number"
                  value={goal.currentSavings === 0 ? '' : goal.currentSavings}
                  onChange={(e) => updateGoal(goal.id, { currentSavings: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder={strings.currentSavingsLabel}
                  min={0}
                />

                <label htmlFor={`priority-${goal.id}`} className="sr-only">{strings.priorityLabel}</label>
                <select
                  id={`priority-${goal.id}`}
                  value={goal.priority}
                  onChange={(e) => updateGoal(goal.id, { priority: e.target.value as Goal['priority'] })}
                >
                  <option value="high">{strings.priorityOptions.high}</option>
                  <option value="medium">{strings.priorityOptions.medium}</option>
                  <option value="low">{strings.priorityOptions.low}</option>
                </select>

                <label htmlFor={`risk-${goal.id}`} className="sr-only">{strings.riskLabel}</label>
                <select
                  id={`risk-${goal.id}`}
                  value={goal.riskProfile}
                  onChange={(e) => updateGoal(goal.id, { riskProfile: e.target.value as Goal['riskProfile'] })}
                >
                  <option value="conservative">{strings.riskOptions.conservative}</option>
                  <option value="balanced">{strings.riskOptions.balanced}</option>
                  <option value="aggressive">{strings.riskOptions.aggressive}</option>
                </select>
              </div>

              {/* Non-negotiables chips */}
              <div className="stack">
                <label htmlFor={`nonneg-${goal.id}`} className="sr-only">{strings.nonNegotiablesLabel}</label>
                <div className="row">
                  <input
                    id={`nonneg-${goal.id}`}
                    type="text"
                    value={nonNegInputMap[goal.id] ?? ''}
                    onChange={(e) => setNonNegInputFor(goal.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNonNeg(goal.id); } }}
                    placeholder={strings.nonNegotiablesPlaceholder}
                    style={{ flex: 1 }}
                  />
                  <button onClick={() => addNonNeg(goal.id)}>{strings.add}</button>
                </div>
                {goal.nonNegotiables.length > 0 && (
                  <div className="chips" aria-label={strings.nonNegotiablesLabel}>
                    {goal.nonNegotiables.map((v) => (
                      <span key={v} className="chip">
                        {v}
                        <button aria-label="remove" onClick={() => removeNonNeg(goal.id, v)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Motivation */}
              <div className="row">
                <label htmlFor={`motivation-${goal.id}`} className="sr-only">{strings.motivationLabel}</label>
                <input
                  id={`motivation-${goal.id}`}
                  type="text"
                  value={goal.motivation}
                  onChange={(e) => updateGoal(goal.id, { motivation: e.target.value })}
                  placeholder={strings.motivationPlaceholder}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </header>
      
      {/* Income / Allowance (Optional) */}
      <div>
        <label htmlFor="incomeAllowance">Income / Allowance </label>
        <input
          id="incomeAllowance"
          type="number"
          placeholder="e.g. 2000"
          value={incomeAllowance}
          onChange={(e) => setIncomeAllowance(e.target.value === '' ? 0 : Number(e.target.value))}
        />
      </div>

      <main className="container">
        {/* Budget Setup */}
        <section className="stack">
          <h2 style={{ textAlign: 'center' }}>{strings.monthlyBudgetSetup}</h2>

          <div className="stack">
            <div className="stack">
              <label htmlFor="totalBudget">{strings.totalMonthlyBudget}</label>
              <div className="row">
                <input
                  id="totalBudget"
                  type="number"
                  value={totalBudget === 0 ? '' : totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder={strings.budgetAmountPlaceholder}
                  required
                  min={0}
                />
                <div className="hint">{`Remaining to allocate: ${formatCurrency(Math.max(0, remainingToAllocate))}`}</div>
              </div>
            </div>

            <div className="stack">
              <h3>{strings.addBudgetCategory}</h3>

              <div className="row">
                <label htmlFor="catName" className="sr-only">{strings.categoryName}</label>
                <input
                  id="catName"
                  type="text"
                  placeholder={strings.categoryNamePlaceholder}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />

                <label htmlFor="catAmount" className="sr-only">{strings.budgetAmount}</label>
                <input
                  id="catAmount"
                  type="number"
                  placeholder={strings.budgetAmountPlaceholder}
                  value={newCategoryAmount === 0 ? '' : newCategoryAmount}
                  onChange={(e) => setNewCategoryAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  min={1}
                  required
                />

                <label htmlFor="catDate" className="sr-only">{strings.date}</label>
                <input
                  id="catDate"
                  type="date"
                  value={newCategoryDate}
                  onChange={(e) => setNewCategoryDate(e.target.value)}
                  required
                />

                <label htmlFor="catDesc" className="sr-only">{strings.description}</label>
                <textarea
                  id="catDesc"
                  placeholder={strings.description}
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  required
                />

                <button onClick={addCategory} disabled={newCategoryAmount > remainingToAllocate}>
                  {strings.addCategory}
                </button>
              </div>
            </div>

            {currentBudget && currentBudget.categories.length > 0 && (
              <div className="categories-list">
                <h3>{strings.budgetCategories}</h3>
                {currentBudget.categories.map((cat) => (
                  <div key={cat.id} className="category-item">
                    {editingCategoryId === cat.id ? (
                      <div className="category-edit">
                        <div className="row">
                          <input
                            aria-label={strings.categoryName}
                            type="text"
                            value={categoryDraft.name ?? ''}
                            onChange={(e) => setCategoryDraft(d => ({ ...d, name: e.target.value }))}
                          />
                          <input
                            aria-label={strings.budgetAmount}
                            type="number"
                            min={1}
                            value={categoryDraft.amount == null || categoryDraft.amount === 0 ? '' : categoryDraft.amount}
                            onChange={(e) =>
                              setCategoryDraft(d => ({ ...d, amount: e.target.value === '' ? 0 : Number(e.target.value) }))
                            }
                          />
                          <input
                            aria-label={strings.date}
                            type="date"
                            value={categoryDraft.date ?? ''}
                            onChange={(e) => setCategoryDraft(d => ({ ...d, date: e.target.value }))}
                          />
                        </div>
                        <textarea
                          aria-label={strings.description}
                          value={categoryDraft.description ?? ''}
                          onChange={(e) => setCategoryDraft(d => ({ ...d, description: e.target.value }))}
                        />
                        <div className="row-actions">
                          <button onClick={saveEditedCategory}>{strings.save}</button>
                          <button onClick={cancelEditCategory}>{strings.cancel}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="category-view">
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                          <div><strong>{cat.name}</strong>: {formatCurrency(cat.amount)}</div>
                          <div className="row-actions">
                            <button aria-label="Edit category" onClick={() => startEditCategory(cat)}>✏️</button>
                            {/* NEW: delete category */}
                            <button aria-label="Delete category" onClick={() => deleteCategory(cat.id)}>{strings.delete}</button>
                          </div>
                        </div>
                        <div className="hint">{strings.date}: {cat.date}</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{cat.description}</div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="save-row">
                  <button onClick={saveBudget} className="save-budget">{strings.saveBudget}</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Expense Entry */}
        {currentBudget && (
          <section className="stack" style={{ marginTop: 24 }}>
            <h2 style={{ textAlign: 'center' }}>{strings.addExpense}</h2>

            <form onSubmit={addExpense} className="row">
              <label htmlFor="expAmount" className="sr-only">{strings.expenseAmount}</label>
              <input
                id="expAmount"
                type="number"
                placeholder={strings.expenseAmountPlaceholder}
                value={expenseAmount === 0 ? '' : expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                required
                min={1}
              />

              <label htmlFor="expCategory" className="sr-only">{strings.selectCategory}</label>
              <select
                id="expCategory"
                name="expenseCategory"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                required
              >
                <option value="">{strings.selectCategory}</option>
                {currentBudget.categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>

              <label htmlFor="expDate" className="sr-only">{strings.date}</label>
              <input
                id="expDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />

              <label htmlFor="expDesc" className="sr-only">{strings.expenseDescription}</label>
              <textarea
                id="expDesc"
                placeholder={strings.expenseDescriptionPlaceholder}
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                required
              />

              <button type="submit">{strings.addExpenseButton}</button>
            </form>
          </section>
        )}

        {/* Dashboard */}
        {currentBudget && categorySummaries.length > 0 && (
          <section className="stack" style={{ marginTop: 24 }}>
            <h2 style={{ textAlign: 'center' }}>
              {strings.budgetDashboard} - {currentBudget.month}
            </h2>

            <div className="dashboard-grid">
              {categorySummaries.map(summary => (
                <div key={summary.categoryName} className="category-card">
                  <h4>{summary.categoryName}</h4>

                  {/* Visual progress bar */}
                  <div className="progress-bar" aria-hidden="true">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${summary.percentBar}%`,
                        backgroundColor: summary.percentRaw > 100 ? '#ef4444' : '#10b981'
                      }}
                    />
                  </div>

                  {/* Accessible progress for AT */}
                  <progress
                    className="sr-only"
                    value={Math.round(summary.percentBar)}
                    max={100}
                    aria-label={`${summary.categoryName} progress`}
                  />

                  <div className="category-stats">
                    <span>{strings.budget}: {formatCurrency(summary.budgeted)}</span>
                    <span>{strings.spent}: {formatCurrency(summary.spent)}</span>
                    <span>{strings.remaining}: {formatCurrency(summary.remaining)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Expenses list (editable) */}
        {expenses.length > 0 && (
          <section className="stack" style={{ marginTop: 24 }}>
            <h2 style={{ textAlign: 'center' }}>{strings.recentExpenses}</h2>

            <div className="expenses-list">
              {expenses.map(expense => (
                <div key={expense.id} className="expense-item">
                  {editingExpenseId === expense.id ? (
                    <div className="expense-edit">
                      <div className="row">
                        <input
                          aria-label={strings.expenseAmount}
                          type="number"
                          min={1}
                          value={expenseDraft.amount == null || expenseDraft.amount === 0 ? '' : expenseDraft.amount}
                          onChange={(e) =>
                            setExpenseDraft(d => ({ ...d, amount: e.target.value === '' ? 0 : Number(e.target.value) }))
                          }
                        />
                        <select
                          aria-label={strings.selectCategory}
                          value={expenseDraft.category ?? ''}
                          onChange={(e) => setExpenseDraft(d => ({ ...d, category: e.target.value }))}
                        >
                          <option value="">{strings.selectCategory}</option>
                          {currentBudget?.categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <input
                          aria-label={strings.date}
                          type="date"
                          value={expenseDraft.date ?? ''}
                          onChange={(e) => setExpenseDraft(d => ({ ...d, date: e.target.value }))}
                        />
                      </div>
                      <textarea
                        aria-label={strings.description}
                        value={expenseDraft.description ?? ''}
                        onChange={(e) => setExpenseDraft(d => ({ ...d, description: e.target.value }))}
                      />
                      <div className="row-actions">
                        <button onClick={saveEditedExpense}>{strings.save}</button>
                        <button onClick={cancelEditExpense}>{strings.cancel}</button>
                        {/* Optional delete while editing */}
                        <button onClick={() => deleteExpense(expense.id)}>{strings.delete}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <span><strong>{expense.description}</strong></span>
                          <span style={{ color:'#6b7280' }}>{expense.category}</span>
                        </div>
                        <div className="hint">{strings.date}: {expense.date}</div>
                      </div>
                      <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                      <div className="row-actions">
                        <button aria-label="Edit expense" onClick={() => startEditExpense(expense)}>✏️</button>
                        {/* NEW: delete expense */}
                        <button aria-label="Delete expense" onClick={() => deleteExpense(expense.id)}>{strings.delete}</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="save-row" style={{ marginBottom: 8 }}>
              <button onClick={saveAllExpenses}>{strings.saveExpensesButton}</button>
            </div>
          </section>
        )}

        {/* Extra notes (FIXED) */}
        <section className="stack" style={{ marginTop: 16 }}>
          <h3>{strings.extraNotesTitle}</h3>
          <textarea
            placeholder={strings.extraNotesPlaceholder}
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            rows={3}
          />
        </section>

        {/* Generate Plan */}
        <section className="stack" style={{ marginTop: 8, marginBottom: 48, alignItems: 'flex-end' }}>
          {(!canGeneratePlan) && (
            <div id="genplan-requirements" className="hint" style={{ width: '100%', textAlign: 'right' }}>
              {strings.needMoreExpenses} ({expenses.length}/5)
            </div>
          )}
          <button
            onClick={() => {}}
            disabled={!canGeneratePlan}
            aria-describedby={!canGeneratePlan ? 'genplan-requirements' : undefined}
          >
            {strings.generatePlan}
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
