import React, { useState } from 'react';
import { Expense } from '../types';
import { Plus, Trash2, Beef, Landmark, Wallet, Layers } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onUpdateExpense: (id: string, amount: number) => void;
  onAddCustomExpense: (name: string, amount: number) => void;
  onRemoveCustomExpense: (id: string) => void;
  isPremiumActive: boolean;
  onRequestUpgrade: (featureName: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onUpdateExpense,
  onAddCustomExpense,
  onRemoveCustomExpense,
  isPremiumActive,
  onRequestUpgrade,
}) => {
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const customExpensesCount = expenses.filter(e => e.isCustom).length;
  const isLimitReached = !isPremiumActive && customExpensesCount >= 2;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLimitReached) {
      onRequestUpgrade('Categorii Personalizate Nelimitate');
      return;
    }

    if (!newExpenseName.trim()) {
      setError('Te rog introdu un nume pentru cheltuială.');
      return;
    }

    const val = parseFloat(newExpenseAmount);
    if (isNaN(val) || val < 0) {
      setError('Te rog introdu o sumă validă (mai mare sau egală cu 0).');
      return;
    }

    onAddCustomExpense(newExpenseName.trim(), val);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mancare':
        return <Beef className="w-4 h-4 text-white" />;
      case 'taxe':
        return <Landmark className="w-4 h-4 text-white" />;
      case 'cheltuieli':
        return <Wallet className="w-4 h-4 text-white" />;
      default:
        return <Layers className="w-4 h-4 text-white/70" />;
    }
  };

  return (
    <div className="space-y-8" id="expense-list-container">
      {/* List of expenses card */}
      <div className="border border-white p-6 bg-black space-y-6" id="expense-inputs-card">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
            Cheltuieli Lunare Curente
          </label>
          <p className="text-[9px] text-white/30 font-mono uppercase tracking-wide mt-1">
            Configurează sumele plătite lunar pentru fiecare domeniu
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4" id="expenses-items-list">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="border border-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent hover:bg-white/5 transition-all"
              id={`expense-row-${expense.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className="opacity-70">
                  {getCategoryIcon(expense.category)}
                </div>
                <span className="font-sans text-sm font-medium text-white tracking-wide uppercase text-xs">
                  {expense.name}
                </span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="flex items-baseline border-b border-white/20 hover:border-white focus-within:border-white w-full sm:w-44 py-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    id={`input-amount-${expense.id}`}
                    value={expense.amount === 0 ? '' : expense.amount}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      onUpdateExpense(expense.id, isNaN(val) ? 0 : val);
                    }}
                    className="w-full bg-transparent border-none text-white text-lg font-light focus:outline-none text-right font-mono pr-1"
                  />
                  <span className="text-[10px] opacity-40 font-mono shrink-0">RON</span>
                </div>

                {expense.isCustom && (
                  <button
                    onClick={() => onRemoveCustomExpense(expense.id)}
                    id={`btn-delete-${expense.id}`}
                    title="Șterge cheltuiala"
                    className="p-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Expense Form */}
      <div className="border border-white p-6 bg-black space-y-4" id="add-expense-section">
        <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
          Adaugă Altă Categorie de Cheltuială
        </label>

        <form onSubmit={handleAdd} className="space-y-4" id="add-expense-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-b border-white/25 focus-within:border-white py-1">
              <input
                type="text"
                placeholder="Ex: Chirie, Abonamente, Gym..."
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
                id="input-new-expense-name"
              />
            </div>
            <div className="flex items-baseline border-b border-white/25 focus-within:border-white py-1">
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm font-mono focus:outline-none text-right pr-2"
                id="input-new-expense-amount"
              />
              <span className="text-xs opacity-40 font-mono shrink-0">RON / lună</span>
            </div>
          </div>

          {isLimitReached && (
            <p className="text-amber-400 text-[11px] font-mono" id="add-expense-premium-limit-warning">
              ✦ Ai atins limita de 2 categorii personalizate pe planul gratuit. Pentru a adăuga mai multe, activează Abonamentul Premium (30 RON).
            </p>
          )}

          {error && (
            <p className="text-red-400 text-[11px] font-mono" id="add-expense-error">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            id="btn-add-expense-submit"
            className={`w-full py-2.5 transition-colors text-xs font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer ${
              isLimitReached
                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/40 hover:bg-amber-400 hover:text-black'
                : 'bg-transparent text-white border border-white hover:bg-white hover:text-black'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {isLimitReached ? 'Activează Premium (30 RON)' : 'Adaugă în listă'}
          </button>
        </form>
      </div>
    </div>
  );
};
