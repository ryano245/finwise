import React, { useState, useEffect } from 'react';
import './App.css';

// Types
interface Budget {
  id?: string;
  month: string;
  totalBudget: number;
  categories: {[key: string]: number};
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  id?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

interface CategorySummary {
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

// Internationalization - Language strings
interface LanguageStrings {
  // App title and navigation
  appTitle: string;
  
  // Budget setup
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
  
  // Expense tracking
  addExpense: string;
  expenseAmount: string;
  expenseAmountPlaceholder: string;
  selectCategory: string;
  expenseDescription: string;
  expenseDescriptionPlaceholder: string;
  addExpenseButton: string;
  expenseAdded: string;
  
  // Dashboard
  budgetDashboard: string;
  budget: string;
  spent: string;
  remaining: string;
  percentage: string;
  recentExpenses: string;
  
  // General
  loading: string;
  add: string;
  save: string;
  cancel: string;
  delete: string;
}

// English language strings
const englishStrings: LanguageStrings = {
  // App title and navigation
  appTitle: "Finwise - Budget Tracker",
  
  // Budget setup
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
  budgetSaved: "Budget saved successfully!",
  
  // Expense tracking
  addExpense: "Add Expense",
  expenseAmount: "Expense Amount",
  expenseAmountPlaceholder: "Enter expense amount",
  selectCategory: "Select category",
  expenseDescription: "Expense Description",
  expenseDescriptionPlaceholder: "What did you spend on?",
  addExpenseButton: "Add Expense",
  expenseAdded: "Expense added successfully!",
  
  // Dashboard
  budgetDashboard: "Budget Dashboard",
  budget: "Budget",
  spent: "Spent",
  remaining: "Remaining",
  percentage: "Percentage",
  recentExpenses: "Recent Expenses",
  
  // General
  loading: "Loading...",
  add: "Add",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete"
};

// Indonesian language strings
const indonesianStrings: LanguageStrings = {
  // App title and navigation
  appTitle: "Finwise - Budget Tracker",
  
  // Budget setup
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
  budgetSaved: "Budget berhasil disimpan!",
  
  // Expense tracking
  addExpense: "Tambah Pengeluaran",
  expenseAmount: "Jumlah Pengeluaran",
  expenseAmountPlaceholder: "Masukkan jumlah pengeluaran",
  selectCategory: "Pilih kategori",
  expenseDescription: "Deskripsi Pengeluaran",
  expenseDescriptionPlaceholder: "Untuk apa pengeluaran ini?",
  addExpenseButton: "Tambah Pengeluaran",
  expenseAdded: "Pengeluaran berhasil ditambahkan!",
  
  // Dashboard
  budgetDashboard: "Dashboard Budget",
  budget: "Budget",
  spent: "Terpakai",
  remaining: "Sisa",
  percentage: "Persentase",
  recentExpenses: "Pengeluaran Terbaru",
  
  // General
  loading: "Memuat...",
  add: "Tambah",
  save: "Simpan",
  cancel: "Batal",
  delete: "Hapus"
};

function App() {
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  
  // Language support
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>('en');
  const strings = currentLanguage === 'en' ? englishStrings : indonesianStrings;
  
  // Budget states
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [categories, setCategories] = useState<{[key: string]: number}>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState<number>(0);
  
  // Expense states
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Load data from localStorage on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Calculate category summaries when budget or expenses change
  useEffect(() => {
    if (currentBudget && expenses.length >= 0) {
      calculateCategorySummaries();
    }
  }, [currentBudget, expenses]);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const loadUserData = () => {
    try {
      const currentMonth = getCurrentMonth();
      
      // Load current month's budget from localStorage
      const storedBudget = localStorage.getItem(`budget-${currentMonth}`);
      if (storedBudget) {
        const budgetData = JSON.parse(storedBudget) as Budget;
        setCurrentBudget(budgetData);
        setCategories(budgetData.categories);
        setTotalBudget(budgetData.totalBudget);
      }
      
      // Load current month's expenses from localStorage
      const storedExpenses = localStorage.getItem(`expenses-${currentMonth}`);
      if (storedExpenses) {
        const expenseList = JSON.parse(storedExpenses) as Expense[];
        setExpenses(expenseList);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const calculateCategorySummaries = () => {
    if (!currentBudget) return;
    
    const summaries: CategorySummary[] = Object.entries(currentBudget.categories).map(([categoryName, budgeted]) => {
      const spent = expenses
        .filter(expense => expense.category === categoryName)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const remaining = budgeted - spent;
      const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
      
      return {
        categoryName,
        budgeted,
        spent,
        remaining,
        percentage: Math.min(percentage, 100)
      };
    });
    
    setCategorySummaries(summaries);
  };

  const addCategory = () => {
    if (newCategoryName && newCategoryAmount > 0) {
      setCategories(prev => ({
        ...prev,
        [newCategoryName]: newCategoryAmount
      }));
      setNewCategoryName('');
      setNewCategoryAmount(0);
    }
  };

  const saveBudget = () => {
    if (Object.keys(categories).length === 0) return;
    
    try {
      const currentMonth = getCurrentMonth();
      const budgetData: Budget = {
        id: `budget-${currentMonth}`,
        month: currentMonth,
        totalBudget,
        categories,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(`budget-${currentMonth}`, JSON.stringify(budgetData));
      setCurrentBudget(budgetData);
      alert(strings.budgetSaved);
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseCategory || !expenseDescription) return;
    
    try {
      const currentMonth = getCurrentMonth();
      const newExpense: Expense = {
        id: `expense-${Date.now()}`,
        amount: expenseAmount,
        category: expenseCategory,
        description: expenseDescription,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      
      // Save to localStorage
      localStorage.setItem(`expenses-${currentMonth}`, JSON.stringify(updatedExpenses));
      
      // Reset form
      setExpenseAmount(0);
      setExpenseCategory('');
      setExpenseDescription('');
      
      alert(strings.expenseAdded);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const switchLanguage = (newLanguage: 'en' | 'id') => {
    setCurrentLanguage(newLanguage);
  };

  return (
    <div className="app">
      <header>
        <h1>{strings.appTitle}</h1>
        <div className="header-controls">
          {/* Language Switcher */}
          <div className="language-switcher">
            <button 
              onClick={() => switchLanguage('en')}
              className={currentLanguage === 'en' ? 'active' : ''}
            >
              EN
            </button>
            <button 
              onClick={() => switchLanguage('id')}
              className={currentLanguage === 'id' ? 'active' : ''}
            >
              ID
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Budget Setup Section */}
        <section className="budget-setup">
          <h2>{strings.monthlyBudgetSetup}</h2>
          <div className="budget-form">
            <div className="total-budget">
              <label>{strings.totalMonthlyBudget}</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                placeholder={strings.budgetAmountPlaceholder}
              />
            </div>
            
            <div className="category-input">
              <h3>{strings.addBudgetCategory}</h3>
              <input
                type="text"
                placeholder={strings.categoryNamePlaceholder}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <input
                type="number"
                placeholder={strings.budgetAmountPlaceholder}
                value={newCategoryAmount}
                onChange={(e) => setNewCategoryAmount(Number(e.target.value))}
              />
              <button onClick={addCategory}>{strings.addCategory}</button>
            </div>

            {Object.keys(categories).length > 0 && (
              <div className="categories-list">
                <h3>{strings.budgetCategories}</h3>
                {Object.entries(categories).map(([name, amount]) => (
                  <div key={name} className="category-item">
                    <span>{name}: {formatCurrency(amount)}</span>
                  </div>
                ))}
                <button onClick={saveBudget} className="save-budget">
                  {strings.saveBudget}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Expense Entry Section */}
        {currentBudget && (
          <section className="expense-entry">
            <h2>{strings.addExpense}</h2>
            <form onSubmit={addExpense}>
              <input
                type="number"
                placeholder={strings.expenseAmountPlaceholder}
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                required
              />
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                required
              >
                <option value="">{strings.selectCategory}</option>
                {Object.keys(currentBudget.categories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={strings.expenseDescriptionPlaceholder}
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                required
              />
              <button type="submit">{strings.addExpenseButton}</button>
            </form>
          </section>
        )}

        {/* Dashboard Section */}
        {currentBudget && categorySummaries.length > 0 && (
          <section className="dashboard">
            <h2>{strings.budgetDashboard} - {getCurrentMonth()}</h2>
            <div className="category-summaries">
              {categorySummaries.map(summary => (
                <div key={summary.categoryName} className="category-summary">
                  <h4>{summary.categoryName}</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${summary.percentage}%`,
                        backgroundColor: summary.percentage > 100 ? '#ef4444' : '#10b981'
                      }}
                    ></div>
                  </div>
                  <div className="category-details">
                    <span>{strings.budget}: {formatCurrency(summary.budgeted)}</span>
                    <span>{strings.spent}: {formatCurrency(summary.spent)}</span>
                    <span>{strings.remaining}: {formatCurrency(summary.remaining)}</span>
                    <span className={summary.percentage > 100 ? 'over-budget' : ''}>
                      {summary.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <section className="recent-expenses">
            <h2>{strings.recentExpenses}</h2>
            <div className="expenses-list">
              {expenses.slice(-5).reverse().map(expense => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <span className="expense-description">{expense.description}</span>
                    <span className="expense-category">{expense.category}</span>
                  </div>
                  <div className="expense-amount">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className="expense-date">{expense.date}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;