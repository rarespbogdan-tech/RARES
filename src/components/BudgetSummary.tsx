import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetSummaryProps {
  initialSavings: number;
  monthlyIncome: number;
  totalMonthlyExpenses: number;
  onChangeInitialSavings: (val: number) => void;
  onChangeMonthlyIncome: (val: number) => void;
  currencySymbol?: string;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  initialSavings,
  monthlyIncome,
  totalMonthlyExpenses,
  onChangeInitialSavings,
  onChangeMonthlyIncome,
  currencySymbol = 'RON',
}) => {
  const monthlySurplus = monthlyIncome - totalMonthlyExpenses;
  const isNegativeSurplus = monthlySurplus < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="budget-summary-setup">
      {/* Starting Funds Input */}
      <div className="border border-white p-6 bg-black" id="starting-funds-inputs">
        <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">
          Sold Actual / Economii ({currencySymbol})
        </label>
        <div className="flex items-baseline">
          <input
            type="number"
            min="0"
            placeholder="0.00"
            id="input-initial-savings"
            value={initialSavings === 0 ? '' : initialSavings}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
              onChangeInitialSavings(isNaN(val) ? 0 : val);
            }}
            className="bg-transparent border-none text-3xl font-light focus:outline-none w-full text-white placeholder-white/20 font-mono"
          />
          <span className="text-xs opacity-40 font-mono shrink-0 ml-2">{currencySymbol}</span>
        </div>
        <p className="text-[9px] text-white/40 font-mono mt-3 uppercase tracking-wider">
          Fonduri inițiale înainte de proiecții repetitive
        </p>
      </div>

      {/* Recurrent Monthly Income Input */}
      <div className="border border-white p-6 bg-black" id="recurrent-income-input">
        <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">
          Venit Recurent Lunar ({currencySymbol} / LUNĂ)
        </label>
        <div className="flex items-baseline">
          <input
            type="number"
            min="0"
            placeholder="0.00"
            id="input-monthly-income"
            value={monthlyIncome === 0 ? '' : monthlyIncome}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
              onChangeMonthlyIncome(isNaN(val) ? 0 : val);
            }}
            className="bg-transparent border-none text-3xl font-light focus:outline-none w-full text-white placeholder-white/20 font-mono"
          />
          <span className="text-xs opacity-40 font-mono shrink-0 ml-2">{currencySymbol} / LUNĂ</span>
        </div>
        <p className="text-[9px] text-white/40 font-mono mt-3 uppercase tracking-wider">
          Salariu sau intrări lunare constante
        </p>
      </div>

      {/* Monthly Balance Preview (Full Width span on larger viewports or clean layout) */}
      <div className="border border-white p-6 bg-black md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="monthly-surplus-indicator">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
            Bilanț Lunar Recurent (Venituri - Cheltuieli)
          </label>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold tracking-tight ${isNegativeSurplus ? 'text-red-400' : 'text-white'}`}>
              {monthlySurplus.toLocaleString()}
            </span>
            <span className="text-xs opacity-60 font-mono">{currencySymbol} / LUNĂ</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-white/50">
              {isNegativeSurplus ? 'Deficit lunar' : 'Excedent lunar'}
            </p>
            <p className="text-[9px] font-mono text-white/30">
              Din {monthlyIncome} încasat și {totalMonthlyExpenses} cheltuit
            </p>
          </div>
          <div className={`p-3 border ${isNegativeSurplus ? 'border-red-500 text-red-400' : 'border-white text-white'} bg-transparent`}>
            {isNegativeSurplus ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
};
