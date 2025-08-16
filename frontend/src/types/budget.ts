/** =======================
 *         Types
 *  ======================= */
export interface CategoryBudget {
  id: string;
  name: string;
  amount: number;
  date: string;        // YYYY-MM-DD
  description: string; // unlimited length
}

export interface Budget {
  id?: string;
  month: string;              // YYYY-MM
  incomeAllowance: number;
  totalBudget: number;
  categories: CategoryBudget[];
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
}

export interface Expense {
  id: string;
  amount: number;
  category: string;           // category name
  description: string;
  date: string;               // YYYY-MM-DD
  createdAt: string;          // ISO
}

export interface CategorySummary {
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentRaw: number;
  percentBar: number;
}

/** Structured goal so we can support multiple goals */
export interface Goal {
  id: string;
  wish: string;
  goalType: string;
  goalTypeOther: string;
  targetAmount: number;
  targetAmountUnknown: boolean;
  startDate: string;
  targetDate: string;
  flexibility: 'hard' | 'soft';
  currentSavings: number;
  priority: 'high' | 'medium' | 'low';
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  nonNegotiables: string[];
  motivation: string;
}
