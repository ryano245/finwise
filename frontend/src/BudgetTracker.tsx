// File: frontend/src/BudgetTracker.tsx
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

import GoalTab from './tabs/GoalTab';
import MonthlyBudgetSetup from './tabs/MonthlyBudgetSetup';
import BudgetDashboard from './tabs/BudgetDashboard';
import GeneratePlan from './tabs/GeneratePlan';

const BudgetTracker: React.FC = () => {
  const styles = budgetTrackerStyles;

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'id' || saved === 'en') ? saved : 'en';
  });
  const strings: LanguageStrings = currentLanguage === 'en' ? englishStrings : indonesianStrings;
  useEffect(() => { localStorage.setItem('lang', currentLanguage); }, [currentLanguage]);

  // All state (lifted)
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  // Persist any change to the current budget
  useEffect(() => {
    if (!currentBudget) return;
    const toSave = { ...currentBudget, updatedAt: new Date().toISOString() };
    localStorage.setItem(`budget-${currentBudget.month}`, JSON.stringify(toSave));
  }, [currentBudget]);

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState<number>(0);
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<Partial<CategoryBudget>>({});

  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseDraft, setExpenseDraft] = useState<Partial<Expense>>({});

  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [incomeAllowance, setIncomeAllowance] = useState<number>(0);

  const [goals, setGoals] = useState<Goal[]>(() => {
    const raw = localStorage.getItem('goals_v1');
    if (raw) {
      try { return JSON.parse(raw) as Goal[]; } catch { /* fallthrough */ }
    }
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
    return hasAny ? [{ id: `goal-${Date.now()}`, ...legacy }] : [];
  });
  useEffect(() => { localStorage.setItem('goals_v1', JSON.stringify(goals)); }, [goals]);

  const [nonNegInputMap, setNonNegInputMap] = useState<Record<string, string>>({});
  const setNonNegInputFor = (goalId: string, value: string) => setNonNegInputMap(m => ({ ...m, [goalId]: value }));

  const updateGoal = (id: string, patch: Partial<Goal>) => setGoals(gs => gs.map(g => g.id === id ? { ...g, ...patch } : g));
  const addNewGoal = () => setGoals(gs => [...gs, { id: `goal-${Date.now()}`, wish: '', goalType: 'emergency', goalTypeOther: '', targetAmount: 0, targetAmountUnknown: false, startDate: '', targetDate: '', flexibility: 'hard', currentSavings: 0, priority: 'medium', riskProfile: 'balanced', nonNegotiables: [], motivation: '' }]);
  const addNonNeg = (goalId: string) => { const v = (nonNegInputMap[goalId] ?? '').trim(); if (!v) return; setGoals(gs => gs.map(g => g.id === goalId ? { ...g, nonNegotiables: g.nonNegotiables.includes(v) ? g.nonNegotiables : [...g.nonNegotiables, v] } : g)); setNonNegInputFor(goalId, ''); };
  const removeNonNeg = (goalId: string, v: string) => setGoals(gs => gs.map(g => g.id === goalId ? { ...g, nonNegotiables: g.nonNegotiables.filter(x => x !== v) } : g));
  const deleteGoal = (id: string) => setGoals(gs => gs.filter(g => g.id !== id));

  const getCurrentMonth = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; };
  const toMonth = (yyyyMmDd: string) => yyyyMmDd.slice(0, 7);
  const formatCurrency = (amount: number) => `Rp ${Math.round(amount).toLocaleString('id-ID', { useGrouping: false, maximumFractionDigits: 0 })}`;

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
          categories = Object.entries(raw.categories).map(([name, amount], i) => ({ id: `cat-${i}-${name}`, name, amount: Number(amount), date: `${currentMonth}-01`, description: '' }));
        }
        const budget: Budget = { id: raw.id ?? `budget-${currentMonth}`, month: raw.month ?? currentMonth, incomeAllowance: Number(raw.incomeAllowance ?? 0), totalBudget: Number(raw.totalBudget ?? 0), categories, createdAt: raw.createdAt ?? new Date().toISOString(), updatedAt: raw.updatedAt ?? new Date().toISOString() };
        setCurrentBudget(budget);
        setTotalBudget(budget.totalBudget);
        setIncomeAllowance(budget.incomeAllowance)
      }

      const storedExpenses = localStorage.getItem(`expenses-${currentMonth}`);
      if (storedExpenses) {
        const list = JSON.parse(storedExpenses) as Expense[];
        setExpenses(list);
      }
    } catch (e) { console.error('Error loading data:', e); }
  }, []);

  const categorySummaries: CategorySummary[] = useMemo(() => {
    if (!currentBudget) return [];
    return currentBudget.categories.map((cat) => {
      const spent = expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
      const remaining = cat.amount - spent;
      const percentRaw = cat.amount > 0 ? (spent / cat.amount) * 100 : 0;
      return { categoryName: cat.name, budgeted: cat.amount, spent, remaining, percentRaw, percentBar: Math.max(0, Math.min(percentRaw, 100)) };
    });
  }, [currentBudget, expenses]);

  const sumCategoryCaps = useMemo(() => currentBudget?.categories.reduce((acc, c) => acc + (c.amount || 0), 0) ?? 0, [currentBudget]);
  const remainingToAllocate = Math.max(0, totalBudget - sumCategoryCaps);

  const addCategory = () => {
    if (!currentBudget) return;
    const name = newCategoryName.trim();
    if (!name || !newCategoryAmount || !newCategoryDescription.trim()) { alert(strings.requiredField); return; }
    const exists = currentBudget.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) { alert(strings.dupCategoryWarning); return; }
    if (newCategoryAmount > remainingToAllocate) { alert(`Cannot allocate more than remaining: ${formatCurrency(remainingToAllocate)}`); return; }
    const newCat: CategoryBudget = { id: `cat-${Date.now()}`, name, amount: newCategoryAmount, description: newCategoryDescription.trim() };
    const updatedBudget: Budget = {
        ...currentBudget,
        categories: [...currentBudget.categories, newCat],
        totalBudget,
        updatedAt: new Date().toISOString(),
    };
    setCurrentBudget(updatedBudget);
    localStorage.setItem(`budget-${currentBudget.month}`, JSON.stringify(updatedBudget));
    setNewCategoryName(''); setNewCategoryAmount(0); setNewCategoryDescription('');
    alert(strings.budgetSaved);
  };

  const startEditCategory = (cat: CategoryBudget) => { setEditingCategoryId(cat.id); setCategoryDraft({ ...cat }); };
  const cancelEditCategory = () => { setEditingCategoryId(null); setCategoryDraft({}); };
  const saveEditedCategory = () => {
    if (!currentBudget || !editingCategoryId || !categoryDraft) return;
    const name = (categoryDraft.name ?? '').trim();
    const amount = Number(categoryDraft.amount ?? 0);
    const description = (categoryDraft.description ?? '').trim();
    if (!name || !amount || !description) { alert(strings.requiredField); return; }
    const dup = currentBudget.categories.some(c => c.id !== editingCategoryId && c.name.toLowerCase() === name.toLowerCase());
    if (dup) { alert(strings.dupCategoryWarning); return; }
    const totalIfSaved = currentBudget.categories.reduce((acc, c) => { if (c.id === editingCategoryId) return acc + amount; return acc + c.amount; }, 0);
    if (totalIfSaved > totalBudget) { alert(`Total of category caps would exceed total budget (${formatCurrency(totalBudget)}).`); return; }
    const updatedCats = currentBudget.categories.map((c) => c.id === editingCategoryId ? { ...c, name, amount, description } : c);
    setCurrentBudget({ ...currentBudget, categories: updatedCats });
    cancelEditCategory();
  };

  const deleteCategory = (id: string) => { if (!currentBudget) return; if (editingCategoryId === id) cancelEditCategory(); setCurrentBudget({ ...currentBudget, categories: currentBudget.categories.filter(c => c.id !== id) }); };

  const addExpense = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!expenseAmount || !expenseCategory || !expenseDate || !expenseDescription.trim()) { alert(strings.requiredField); return; }
    const newExp: Expense = { id: `expense-${Date.now()}`, amount: expenseAmount, category: expenseCategory, description: expenseDescription.trim(), date: expenseDate, createdAt: new Date().toISOString() };
    setExpenses(prev => [newExp, ...prev]);
    // auto-persist this expense immediately
    const cm = getCurrentMonth();
    const updated = [newExp, ...expenses].filter(Boolean);
    localStorage.setItem(`expenses-${cm}`, JSON.stringify(updated));
    setExpenseAmount(0); setExpenseCategory(''); setExpenseDate(''); setExpenseDescription('');
  };

  const startEditExpense = (exp: Expense) => { setEditingExpenseId(exp.id); setExpenseDraft({ ...exp }); };
  const cancelEditExpense = () => { setEditingExpenseId(null); setExpenseDraft({}); };
  const saveEditedExpense = () => {
    if (!editingExpenseId || !expenseDraft) return;
    const amount = Number(expenseDraft.amount ?? 0);
    const category = (expenseDraft.category ?? '').trim();
    const date = (expenseDraft.date ?? '').trim();
    const description = (expenseDraft.description ?? '').trim();
    if (!amount || !category || !date || !description) { alert(strings.requiredField); return; }
    const updated = expenses.map(e => e.id === editingExpenseId ? { ...e, amount, category, date, description } : e);
    setExpenses(updated);
    const cm = getCurrentMonth();
    localStorage.setItem(`expenses-${cm}`, JSON.stringify(updated));
    cancelEditExpense();
  };

  const deleteExpense = (id: string) => { if (editingExpenseId === id) cancelEditExpense(); const updated = expenses.filter(e => e.id !== id); setExpenses(updated); const cm = getCurrentMonth(); localStorage.setItem(`expenses-${cm}`, JSON.stringify(updated)); };

  const switchLanguage = (lang: 'en' | 'id') => setCurrentLanguage(lang);

  const [extraNotes, setExtraNotes] = useState<string>(() => localStorage.getItem('extra_notes') ?? '');
  useEffect(() => { localStorage.setItem('extra_notes', extraNotes); }, [extraNotes]);

  // Tabs
  const [activeTab, setActiveTab] = useState<'goal'|'setup'|'dashboard'|'plan'>('goal');

  const canGeneratePlan = expenses.length >= 5;

  const onGenerate = async (extraNotes?: string): Promise<string> => {
        if (!currentBudget) {
            console.warn('onGenerate: No currentBudget available');
            alert('No budget data available');
            return '';
        }

        try {
            // Flag expired goals without modifying originals
            const today = new Date();
            const flaggedGoals = goals.map((goal: Goal & { expired?: boolean }) => ({
                ...goal,
                expired: goal.targetDate ? new Date(goal.targetDate) >= today : false
            }));

            const requestBody = { 
                budget: currentBudget, 
                expenses, 
                goals: flaggedGoals, 
                language: currentLanguage, 
                extraNotes: extraNotes?.trim() || "None" 
            };
            console.log('Sending generate-plan request:', requestBody);

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const textBody = await res.text();
            console.log('Raw response body:', textBody);

            if (!res.ok) {
                console.error('Generate-plan failed:', res.status, textBody);
                alert('Failed to generate plan (server error)');
                return '';
            }

            let data: { plan?: string; message?: string };
            try {
                data = JSON.parse(textBody);
            } catch (parseErr) {
                console.error('Failed to parse JSON response:', parseErr, 'Body:', textBody);
                alert('Error parsing plan response');
                return '';
            }

            const planText = data.plan ?? data.message ?? '';
            console.log('Plan text received:', planText);

            if (!planText) {
                alert('No plan returned from the server');
                return '';
            }

            return planText;
        } catch (err) {
            console.error('Error generating plan:', err);
            alert('Error generating plan');
            return '';
        }
    };




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

        {/* Tab switcher */}
        <nav className="tabs" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setActiveTab('goal')} className={activeTab === 'goal' ? 'active' : ''}>{strings.goalSectionTitle}</button>
          <button onClick={() => setActiveTab('setup')} className={activeTab === 'setup' ? 'active' : ''}>{strings.monthlyBudgetSetup}</button>
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>{strings.budgetDashboard}</button>
          <button onClick={() => setActiveTab('plan')} className={activeTab === 'plan' ? 'active' : ''}>{strings.generatePlan}</button>
        </nav>
      </header>

      <main className="container" style={{ paddingBottom: "4rem" }}>
        {activeTab === 'goal' && (
          <GoalTab
            strings={strings}
            goals={goals}
            nonNegInputMap={nonNegInputMap}
            setNonNegInputFor={setNonNegInputFor}
            updateGoal={updateGoal}
            addNewGoal={addNewGoal}
            addNonNeg={addNonNeg}
            removeNonNeg={removeNonNeg}
            deleteGoal={deleteGoal}
          />
        )}

        {activeTab === 'setup' && (
          <>
            <MonthlyBudgetSetup
                          strings={strings}
                          styles={styles}
                          currentBudget={currentBudget}
                          incomeAllowance={incomeAllowance}
                          setIncomeAllowance={setIncomeAllowance}
                          totalBudget={totalBudget}
                          setTotalBudget={(n) => { setTotalBudget(n); if (!currentBudget && n > 0) { const currentMonth = getCurrentMonth(); const newBudget: Budget = { id: `budget-${currentMonth}`, month: currentMonth, incomeAllowance: n, totalBudget: n, categories: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; setCurrentBudget(newBudget); } } }
                          remainingToAllocate={remainingToAllocate}
                          newCategoryName={newCategoryName}
                          setNewCategoryName={setNewCategoryName}
                          newCategoryAmount={newCategoryAmount}
                          setNewCategoryAmount={setNewCategoryAmount}
                          newCategoryDescription={newCategoryDescription}
                          setNewCategoryDescription={setNewCategoryDescription}
                          addCategory={addCategory}
                          startEditCategory={startEditCategory}
                          editingCategoryId={editingCategoryId}
                          categoryDraft={categoryDraft}
                          setCategoryDraft={setCategoryDraft}
                          saveEditedCategory={saveEditedCategory}
                          cancelEditCategory={cancelEditCategory}
                          deleteCategory={deleteCategory} 
                          expenseAmount={expenseAmount}
                          setExpenseAmount={setExpenseAmount}
                          expenseCategory={expenseCategory}
                          setExpenseCategory={setExpenseCategory}
                          expenseDate={expenseDate}
                          setExpenseDate={setExpenseDate}
                          expenseDescription={expenseDescription}
                          setExpenseDescription={setExpenseDescription}
                          addExpense={addExpense}
                          />

            {/* // Expense entry shown under setup to keep tabs minimal
            {currentBudget && (
              <section className="stack" style={{ marginTop: 24 }}>
                <h2 style={{ textAlign: 'center' }}>{strings.addExpense}</h2>
                <form onSubmit={addExpense} className="row">
                  <input id="expAmount" type="number" placeholder={strings.expenseAmountPlaceholder} value={expenseAmount === 0 ? '' : expenseAmount} onChange={(e) => setExpenseAmount(e.target.value === '' ? 0 : Number(e.target.value))} required min={1} />
                  <select id="expCategory" name="expenseCategory" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} required>
                    <option value="">{strings.selectCategory}</option>
                    {currentBudget.categories.map(category => (<option key={category.id} value={category.name}>{category.name}</option>))}
                  </select>
                  <input id="expDate" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
                  <textarea id="expDesc" placeholder={strings.expenseDescriptionPlaceholder} value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} required />
                  <button type="submit">{strings.addExpenseButton}</button>
                </form>
              </section>
            )} */}
          </>
        )}

        {activeTab === 'dashboard' && (
          <BudgetDashboard strings={strings} currentBudget={currentBudget!} categorySummaries={categorySummaries} expenses={expenses} startEditExpense={startEditExpense} deleteExpense={deleteExpense} />
        )}

        {activeTab === 'plan' && (
        <>

            {/* Extra notes only visible in Generate Plan tab */}
            <section className="stack" style={{ marginTop: 16 }}>
            <h3>{strings.extraNotesTitle}</h3>
            <textarea
                placeholder={strings.extraNotesPlaceholder}
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                rows={3}
            />
            </section>

            <GeneratePlan
            strings={strings}
            canGeneratePlan={canGeneratePlan}
            onGenerate={async () => {
                // Include extra notes in the request
                return await onGenerate(extraNotes);
            }}
            expensesCount={expenses.length}
            />
        </>
        )}
      </main>
    </div>
  );
};

export default BudgetTracker;