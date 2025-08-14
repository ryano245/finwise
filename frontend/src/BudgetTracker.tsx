import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

// ===== Types =====
interface CategoryBudget {
  id: string;
  name: string;
  amount: number;
  date: string;        // YYYY-MM-DD
  description: string; // unlimited length
}

interface Budget {
  id?: string;
  month: string;              // YYYY-MM
  totalBudget: number;
  categories: CategoryBudget[];
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
}

interface Expense {
  id: string;
  amount: number;
  category: string;           // category name
  description: string;
  date: string;               // YYYY-MM-DD
  createdAt: string;          // ISO
}

interface CategorySummary {
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentRaw: number; // unclamped (for color)
  percentBar: number; // clamped 0..100 for bar width
}

// ===== i18n =====
interface LanguageStrings {
  appTitle: string;

  // goal context
  goalSectionTitle: string;
  wishLabel: string;
  wishPlaceholder: string;
  realizedDateLabel: string;
  targetDateLabel: string;

  monthlyBudgetSetup: string;
  totalMonthlyBudget: string;
  addBudgetCategory: string;
  categoryName: string;
  categoryNamePlaceholder: string;
  budgetAmount: string;
  budgetAmountPlaceholder: string;
  addCategory: string;
  budgetCategories: string;
  saveBudget: string;
  budgetSaved: string;

  addExpense: string;
  expenseAmount: string;
  expenseAmountPlaceholder: string;
  selectCategory: string;
  expenseDescription: string;
  expenseDescriptionPlaceholder: string;
  addExpenseButton: string;
  saveExpensesButton: string;
  expenseAdded: string;

  budgetDashboard: string;
  budget: string; spent: string; remaining: string; percentage: string;
  recentExpenses: string;

  date: string;
  description: string;

  // bottom notes
  extraNotesTitle: string;
  extraNotesPlaceholder: string;

  // generate plan
  generatePlan: string;
  needMoreExpenses: string;

  loading: string; add: string; save: string; cancel: string; delete: string;

  dupCategoryWarning: string;
  requiredField: string;
}

const englishStrings: LanguageStrings = {
  appTitle: "Finwise - Budget Tracker",

  goalSectionTitle: "Your Goal",
  wishLabel: "What do you wish for?",
  wishPlaceholder: "e.g., Build 3-month emergency fund, pay off paylater, etc.",
  realizedDateLabel: "When did you realize this goal?",
  targetDateLabel: "By when do you want it?",

  monthlyBudgetSetup: "Monthly Budget Setup",
  totalMonthlyBudget: "Total Monthly Budget:",
  addBudgetCategory: "Add Budget Category",
  categoryName: "Category Name",
  categoryNamePlaceholder: "e.g., Food, Transport, Entertainment",
  budgetAmount: "Budget Amount",
  budgetAmountPlaceholder: "Enter amount",
  addCategory: "Add Category",
  budgetCategories: "Budget Categories:",
  saveBudget: "Save Budget",
  budgetSaved: "Saved successfully!",

  addExpense: "Add Expense",
  expenseAmount: "Expense Amount",
  expenseAmountPlaceholder: "Enter expense amount",
  selectCategory: "Select category",
  expenseDescription: "Expense Description",
  expenseDescriptionPlaceholder: "What did you spend on?",
  addExpenseButton: "Add Expense",
  saveExpensesButton: "Save Expenses",
  expenseAdded: "Expense added successfully!",

  budgetDashboard: "Budget Dashboard",
  budget: "Budget", spent: "Spent", remaining: "Remaining", percentage: "Percentage",
  recentExpenses: "Recent Expenses",

  date: "Date",
  description: "Description",

  extraNotesTitle: "Is there anything else you want to let us know?",
  extraNotesPlaceholder: "Add any extra context (optional)…",

  generatePlan: "Generate Plan",
  needMoreExpenses: "Add at least 5 expenses to enable.",

  loading: "Loading...", add: "Add", save: "Save", cancel: "Cancel", delete: "Delete",

  dupCategoryWarning: "Category already exists (case-insensitive).",
  requiredField: "This field is required."
};

const indonesianStrings: LanguageStrings = {
  appTitle: "Finwise - Budget Tracker",

  goalSectionTitle: "Tujuan Anda",
  wishLabel: "Apa yang Anda inginkan?",
  wishPlaceholder: "contoh: Bangun dana darurat 3 bulan, lunasi paylater, dsb.",
  realizedDateLabel: "Kapan Anda menyadari tujuan ini?",
  targetDateLabel: "Target kapan tercapai?",

  monthlyBudgetSetup: "Setup Budget Bulanan",
  totalMonthlyBudget: "Total Budget Bulanan:",
  addBudgetCategory: "Tambah Kategori Budget",
  categoryName: "Nama Kategori",
  categoryNamePlaceholder: "contoh: Makanan, Transportasi, Hiburan",
  budgetAmount: "Jumlah Budget",
  budgetAmountPlaceholder: "Masukkan jumlah",
  addCategory: "Tambah Kategori",
  budgetCategories: "Kategori Budget:",
  saveBudget: "Simpan Budget",
  budgetSaved: "Berhasil disimpan!",

  addExpense: "Tambah Pengeluaran",
  expenseAmount: "Jumlah Pengeluaran",
  expenseAmountPlaceholder: "Masukkan jumlah pengeluaran",
  selectCategory: "Pilih kategori",
  expenseDescription: "Deskripsi Pengeluaran",
  expenseDescriptionPlaceholder: "Untuk apa pengeluaran ini?",
  addExpenseButton: "Tambah Pengeluaran",
  saveExpensesButton: "Simpan Pengeluaran",
  expenseAdded: "Pengeluaran berhasil ditambahkan!",

  budgetDashboard: "Dashboard Budget",
  budget: "Budget", spent: "Terpakai", remaining: "Sisa", percentage: "Persentase",
  recentExpenses: "Pengeluaran Terbaru",

  date: "Tanggal",
  description: "Deskripsi",

  extraNotesTitle: "Ada hal lain yang ingin Anda sampaikan?",
  extraNotesPlaceholder: "Tambahkan konteks tambahan (opsional)…",

  generatePlan: "Buat Rencana",
  needMoreExpenses: "Tambahkan minimal 5 pengeluaran untuk mengaktifkan.",

  loading: "Memuat...", add: "Tambah", save: "Simpan", cancel: "Batal", delete: "Hapus",

  dupCategoryWarning: "Kategori sudah ada (abaikan besar/kecil huruf).",
  requiredField: "Wajib diisi."
};

// ===== Component =====
function App() {
  // Small stylesheet for layout cleanup
  const styles = `
    .container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
    header, section { margin: 0 auto; }
    .row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .row > * { margin: 0; }
    .stack { display:flex; flex-direction:column; gap:12px; }
    .hint { color:#6b7280; font-size:.9rem; }

    .categories-list, .expenses-list { display:flex; flex-direction:column; gap:12px; }

    .dashboard-grid {
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap:16px;
    }
    .category-card {
      border:1px solid #e5e7eb;
      border-radius:12px;
      padding:12px;
      background:#fff;
      box-shadow:0 1px 2px rgba(0,0,0,.04);
    }
    .category-card h4 { margin:0 0 8px 0; }
    .progress-bar { height:8px; background:#e5e7eb; border-radius:999px; overflow:hidden; }
    .progress-fill { height:100%; }
    .category-stats { display:flex; justify-content:space-between; margin-top:8px; gap:10px; font-size:.95rem; }

    .category-item, .expense-item {
      border:1px solid #f1f5f9; border-radius:10px; background:#fff;
      padding:10px; display:flex; align-items:center; justify-content:space-between; gap:10px;
    }
    .category-view, .expense-edit, .category-edit { width:100%; }

    .category-edit, .expense-edit { display:flex; flex-direction:column; gap:8px; }
    .row-actions { display:flex; gap:8px; }

    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

    .save-row { display:flex; justify-content:flex-end; }

    .goal-card {
      border:1px solid #e5e7eb; border-radius:12px; background:#fff; padding:12px;
      display:flex; flex-direction:column; gap:10px;
    }
  `;

  // Language
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'id' || saved === 'en') ? saved : 'en';
  });
  const strings = currentLanguage === 'en' ? englishStrings : indonesianStrings;
  useEffect(() => { localStorage.setItem('lang', currentLanguage); }, [currentLanguage]);

  // Budget + expenses state
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Add-category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState<number>(0);
  const [newCategoryDate, setNewCategoryDate] = useState<string>(''); // required
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');

  // Edit-category inline
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<Partial<CategoryBudget>>({});

  // Add-expense form
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState<string>(''); // required
  const [expenseDescription, setExpenseDescription] = useState<string>('');

  // Edit-expense inline
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseDraft, setExpenseDraft] = useState<Partial<Expense>>({});

  // Total budget field
  const [totalBudget, setTotalBudget] = useState<number>(0);

  // Goal context & notes (persist automatically)
  const [wish, setWish] = useState<string>(() => localStorage.getItem('wish') ?? '');
  const [realizedDate, setRealizedDate] = useState<string>(() => localStorage.getItem('wish_realized_date') ?? '');
  const [targetDate, setTargetDate] = useState<string>(() => localStorage.getItem('wish_target_date') ?? '');
  const [extraNotes, setExtraNotes] = useState<string>(() => localStorage.getItem('extra_notes') ?? '');

  useEffect(() => { localStorage.setItem('wish', wish); }, [wish]);
  useEffect(() => { localStorage.setItem('wish_realized_date', realizedDate); }, [realizedDate]);
  useEffect(() => { localStorage.setItem('wish_target_date', targetDate); }, [targetDate]);
  useEffect(() => { localStorage.setItem('extra_notes', extraNotes); }, [extraNotes]);

  // Helpers
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const toMonth = (yyyyMmDd: string) => yyyyMmDd.slice(0, 7);

  // Currency without thousands separator (so it doesn't look like a decimal)
  const formatCurrency = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString('id-ID', { useGrouping: false, maximumFractionDigits: 0 })}`;

  // Load data on mount
  useEffect(() => {
    try {
      const currentMonth = getCurrentMonth();

      // Budget
      const storedBudget = localStorage.getItem(`budget-${currentMonth}`);
      if (storedBudget) {
        const raw = JSON.parse(storedBudget) as any;
        // migrate from old map shape to array if needed
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
          totalBudget: Number(raw.totalBudget ?? 0),
          categories,
          createdAt: raw.createdAt ?? new Date().toISOString(),
          updatedAt: raw.updatedAt ?? new Date().toISOString()
        };
        setCurrentBudget(budget);
        setTotalBudget(budget.totalBudget);
      }

      // Expenses
      const storedExpenses = localStorage.getItem(`expenses-${currentMonth}`);
      if (storedExpenses) {
        const list = JSON.parse(storedExpenses) as Expense[];
        setExpenses(list);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);

  // Derived summaries
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

  // Categories
  const addCategory = () => {
    if (!currentBudget) return;
    const name = newCategoryName.trim();
    if (!name || !newCategoryAmount || !newCategoryDate || !newCategoryDescription.trim()) {
      alert(strings.requiredField);
      return;
    }
    // Duplicate check (case-insensitive)
    const exists = currentBudget.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) { alert(strings.dupCategoryWarning); return; }
    // Over-allocation guard
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

  const saveBudget = () => {
    if (!currentBudget) return;
    const nowIso = new Date().toISOString();
    const data: Budget = { ...currentBudget, totalBudget, updatedAt: nowIso };
    localStorage.setItem(`budget-${currentBudget.month}`, JSON.stringify(data));
    setCurrentBudget(data);
    alert(strings.budgetSaved);
  };

  // Expenses
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

  const saveAllExpenses = () => {
    // Save by month of each expense's date
    const byMonth = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
      const m = toMonth(e.date);
      (acc[m] ||= []).push(e);
      return acc;
    }, {});
    Object.entries(byMonth).forEach(([month, list]) => {
      localStorage.setItem(`expenses-${month}`, JSON.stringify(list));
    });
    // keep current month key fresh / clean
    const cm = getCurrentMonth();
    if (!byMonth[cm]) localStorage.removeItem(`expenses-${cm}`);
    alert(strings.budgetSaved);
  };

  // Enable “Generate Plan” when there are 5+ expenses
  const canGeneratePlan = expenses.length >= 5;

  const switchLanguage = (lang: 'en' | 'id') => setCurrentLanguage(lang);

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

        {/* Goal context section */}
        <div className="goal-card container" style={{ marginBottom: 24 }}>
          <h3 style={{ margin: 0 }}>{strings.goalSectionTitle}</h3>
          <div className="row">
            <label htmlFor="wish" className="sr-only">{strings.wishLabel}</label>
            <input
              id="wish"
              type="text"
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder={strings.wishPlaceholder}
              required
              style={{ flex: 1 }}
            />

            <label htmlFor="realizedDate" className="sr-only">{strings.realizedDateLabel}</label>
            <input
              id="realizedDate"
              type="date"
              value={realizedDate}
              onChange={(e) => setRealizedDate(e.target.value)}
              required
            />

            <label htmlFor="targetDate" className="sr-only">{strings.targetDateLabel}</label>
            <input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>
        </div>
      </header>

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
                          <button aria-label="Edit category" onClick={() => startEditCategory(cat)}>✏️</button>
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

                  <div className="progress-bar" aria-label={`${summary.categoryName} progress`}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${summary.percentBar}%`,
                        backgroundColor: summary.percentRaw > 100 ? '#ef4444' : '#10b981'
                      }}
                    />
                  </div>

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
                      <button aria-label="Edit expense" onClick={() => startEditExpense(expense)}>✏️</button>
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

        {/* Extra notes */}
        <section className="stack" style={{ marginTop: 16 }}>
          <h3>{strings.extraNotesTitle}</h3>
          <textarea
            placeholder={strings.extraNotesPlaceholder}
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            rows={3}
          />
        </section>

        {/* Generate Plan (bottom) */}
        <section className="stack" style={{ marginTop: 8, marginBottom: 48, alignItems: 'flex-end' }}>
          {(!canGeneratePlan) && (
            <div className="hint" style={{ width: '100%', textAlign: 'right' }}>
              {strings.needMoreExpenses} ({expenses.length}/5)
            </div>
          )}
          <button
            onClick={() => {}}
            disabled={!canGeneratePlan}
            aria-describedby="genplan-hint"
          >
            {strings.generatePlan}
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
