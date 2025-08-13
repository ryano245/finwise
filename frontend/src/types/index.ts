export interface User {
    id: string;
    email: string;
    displayName?: string;
  }
  
  export interface Budget {
    id: string;
    userId: string;
    month: string; // "2025-01" format
    totalBudget: number;
    categories: {
      [categoryName: string]: number; // User-defined categories with budget amounts
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Expense {
    id: string;
    userId: string;
    amount: number;
    category: string; // User-defined category name
    description: string;
    date: string; // "2025-01-13" format
    createdAt: Date;
  }
  
  export interface CategorySummary {
    categoryName: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }