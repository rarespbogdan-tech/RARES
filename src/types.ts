export interface Expense {
  id: string;
  name: string;
  amount: number;
  isCustom?: boolean;
  category: 'mancare' | 'taxe' | 'cheltuieli' | 'custom';
}

export interface BudgetState {
  initialSavings: number; // Suma initiala pe care o am deja
  monthlyIncome: number;  // Venitul lunar recurrent (optional, dar util pentru proiectii pe termen lung!)
  expenses: Expense[];
}

export interface ProjectionPeriod {
  label: string;
  monthsCount: number;
  type: 'month' | 'year';
  value: number;
}

export interface ProjectionDetails {
  period: ProjectionPeriod;
  totalIncome: number;
  totalExpenses: number;
  remainingAmount: number;
  monthlyBreakdown: {
    monthIndex: number;
    label: string;
    incomeCumulative: number;
    expensesCumulative: number;
    savingsCumulative: number;
  }[];
}
