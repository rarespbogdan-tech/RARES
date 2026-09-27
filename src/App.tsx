import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BudgetState, 
  Expense, 
  ProjectionPeriod, 
  ProjectionDetails 
} from './types';
import { BudgetSummary } from './components/BudgetSummary';
import { ExpenseList } from './components/ExpenseList';
import { PeriodSelector, AVAILABLE_PERIODS } from './components/PeriodSelector';
import { ProjectionResult } from './components/ProjectionResult';
import { InteractiveCharts } from './components/InteractiveCharts';
import { PremiumPanel } from './components/PremiumPanel';
import { 
  Sparkles, 
  RefreshCw, 
  Info,
  Lock,
  Coins
} from 'lucide-react';

// Default initial state
const DEFAULT_STATE: BudgetState = {
  initialSavings: 4000,
  monthlyIncome: 3500,
  expenses: [
    { id: '1', name: 'Mâncare', amount: 1200, category: 'mancare' },
    { id: '2', name: 'Taxe & Impozite', amount: 450, category: 'taxe' },
    { id: '3', name: 'Alte Cheltuieli', amount: 600, category: 'cheltuieli' }
  ]
};

export default function App() {
  const [state, setState] = useState<BudgetState>(() => {
    try {
      const saved = localStorage.getItem('personal_budget_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage state', e);
    }
    return DEFAULT_STATE;
  });

  const [selectedPeriod, setSelectedPeriod] = useState<ProjectionPeriod>(AVAILABLE_PERIODS[11]); // Default 12 luni (1 an)
  const [projection, setProjection] = useState<ProjectionDetails | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Premium membership state
  const [isPremiumActive, setIsPremiumActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('personal_budget_premium');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('');
  const [showPremiumPanelInline, setShowPremiumPanelInline] = useState(false);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('personal_budget_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('personal_budget_premium', String(isPremiumActive));
  }, [isPremiumActive]);

  const handleRequestUpgrade = (featureName: string) => {
    setPremiumFeatureName(featureName);
    setShowPremiumModal(true);
  };

  // Handle standard amount updates
  const handleUpdateExpense = (id: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) => (exp.id === id ? { ...exp, amount } : exp)),
    }));
  };

  const handleAddCustomExpense = (name: string, amount: number) => {
    const newId = Date.now().toString();
    const newExpense: Expense = {
      id: newId,
      name,
      amount,
      isCustom: true,
      category: 'custom',
    };
    setState((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }));
  };

  const handleRemoveCustomExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  };

  const handleReset = () => {
    if (window.confirm('Ești sigur că vrei să resetezi toate datele la valorile implicite?')) {
      setState(DEFAULT_STATE);
      setProjection(null);
    }
  };

  const loadPreset = (presetName: string) => {
    switch (presetName) {
      case 'student':
        setState({
          initialSavings: 1200,
          monthlyIncome: 1800,
          expenses: [
            { id: '1', name: 'Mâncare', amount: 800, category: 'mancare' },
            { id: '2', name: 'Taxe & Impozite', amount: 150, category: 'taxe' },
            { id: '3', name: 'Alte Cheltuieli', amount: 350, category: 'cheltuieli' },
            { id: '4', name: 'Chirie Cămin', amount: 400, isCustom: true, category: 'custom' }
          ]
        });
        break;
      case 'familie':
        setState({
          initialSavings: 15000,
          monthlyIncome: 8500,
          expenses: [
            { id: '1', name: 'Mâncare', amount: 2500, category: 'mancare' },
            { id: '2', name: 'Taxe & Impozite', amount: 1200, category: 'taxe' },
            { id: '3', name: 'Alte Cheltuieli', amount: 1800, category: 'cheltuieli' },
            { id: '4', name: 'Rată/Chirie Casă', amount: 2000, isCustom: true, category: 'custom' },
            { id: '5', name: 'Grădiniță/Școală', amount: 800, isCustom: true, category: 'custom' }
          ]
        });
        break;
      case 'freelancer':
        setState({
          initialSavings: 8000,
          monthlyIncome: 5500,
          expenses: [
            { id: '1', name: 'Mâncare', amount: 1400, category: 'mancare' },
            { id: '2', name: 'Taxe & Impozite', amount: 1600, category: 'taxe' },
            { id: '3', name: 'Alte Cheltuieli', amount: 900, category: 'cheltuieli' },
            { id: '4', name: 'Abonamente Software', amount: 300, isCustom: true, category: 'custom' }
          ]
        });
        break;
    }
    setProjection(null);
  };

  const calculateProjection = () => {
    setIsCalculating(true);

    setTimeout(() => {
      const monthsCount = selectedPeriod.monthsCount;
      const totalMonthlyExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const totalIncome = state.initialSavings + (state.monthlyIncome * monthsCount);
      const totalExpenses = totalMonthlyExpenses * monthsCount;
      const remainingAmount = totalIncome - totalExpenses;

      const monthlyBreakdown = [];
      let runningSavings = state.initialSavings;

      for (let i = 1; i <= monthsCount; i++) {
        runningSavings = runningSavings + state.monthlyIncome - totalMonthlyExpenses;

        let label = `Luna ${i}`;
        if (monthsCount > 12) {
          const yr = Math.ceil(i / 12);
          const mn = i % 12 === 0 ? 12 : i % 12;
          label = `An ${yr} • L${mn}`;
        }

        monthlyBreakdown.push({
          monthIndex: i,
          label,
          incomeCumulative: state.initialSavings + (state.monthlyIncome * i),
          expensesCumulative: totalMonthlyExpenses * i,
          savingsCumulative: runningSavings,
        });
      }

      setProjection({
        period: selectedPeriod,
        totalIncome,
        totalExpenses,
        remainingAmount,
        monthlyBreakdown,
      });
      setIsCalculating(false);

      setTimeout(() => {
        const el = document.getElementById('results-section-view');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 500);
  };

  const totalMonthlyExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans px-6 py-10 flex flex-col justify-between" id="app-root-view">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Header exact replica style of Geometric Balance with 'Despre noi' navigation */}
        <header className="border-b border-white pb-6 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="main-header">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Finanțe Minim</h1>
            <p className="text-xs opacity-40 font-mono uppercase tracking-wider mt-1">Sistem de Organizare Monetară v1.0</p>
          </div>
          <a
            href="https://labs.google.com/pomelli/website/bSOJsJmE9Tq5KiepYyTOLO"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer no-print font-bold"
            id="link-about-us"
          >
            Despre noi
          </a>
        </header>

        {/* Small Utility Bar for state control & guide */}
        <div className="flex justify-between items-center pb-2 border-b border-white/10" id="utility-bar">
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
            Control Panou Financiar {isPremiumActive && <span className="text-amber-400 font-bold ml-1">✦ PRO ✦</span>}
          </span>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setShowPremiumPanelInline(!showPremiumPanelInline)}
              id="btn-toggle-premium-panel"
              className={`text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                isPremiumActive ? 'text-amber-400 font-bold hover:text-amber-300 animate-pulse' : 'text-white/60 hover:text-white'
              }`}
            >
              {isPremiumActive ? '[ ✦ Premium Pro ]' : '[ ✦ Activează Premium ]'}
            </button>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              id="btn-toggle-info"
              className="text-[10px] font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              {showExplanation ? '[ Ascunde Ghid ]' : '[ Ghid Utilizare ]'}
            </button>
            <button
              onClick={handleReset}
              id="btn-reset-data"
              className="text-[10px] font-mono uppercase tracking-wider text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              [ Reset ]
            </button>
          </div>
        </div>

        {/* Animated Guide Panel */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-white p-6 bg-black font-mono text-[11px] text-white/70 space-y-3 overflow-hidden"
              id="info-modal-view"
            >
              <p className="font-bold text-white uppercase tracking-wider">Cum funcționează aplicarea:</p>
              <p>1. Introdu soldul actual (suma disponibilă acum) și venitul recurent lunar.</p>
              <p>2. Ajustează valorile pentru categoriile de cheltuieli lunare sau adaugă unele noi.</p>
              <p>3. Alege perioada dorită de proiecție din grila geometrică de selecție.</p>
              <p>4. Apasă pe CALCUL pentru a genera starea soldului net viitor.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Premium Panel Inline */}
        <AnimatePresence>
          {showPremiumPanelInline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              id="premium-inline-container"
            >
              <PremiumPanel
                isPremiumActive={isPremiumActive}
                onTogglePremium={setIsPremiumActive}
                onRequestClose={() => setShowPremiumPanelInline(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset selections */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-white p-4 bg-transparent" id="presets-container">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-white" /> Șabloane Predefinite:
          </span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto" id="preset-buttons">
            <button
              onClick={() => loadPreset('student')}
              id="preset-student"
              className="px-3 py-1 text-[10px] font-mono border border-white/20 hover:border-white bg-black hover:bg-white/5 text-white/80 cursor-pointer transition-all uppercase tracking-wider"
            >
              STUDENT
            </button>
            <button
              onClick={() => loadPreset('familie')}
              id="preset-familie"
              className="px-3 py-1 text-[10px] font-mono border border-white/20 hover:border-white bg-black hover:bg-white/5 text-white/80 cursor-pointer transition-all uppercase tracking-wider"
            >
              FAMILIE
            </button>
            <button
              onClick={() => loadPreset('freelancer')}
              id="preset-freelancer"
              className="px-3 py-1 text-[10px] font-mono border border-white/20 hover:border-white bg-black hover:bg-white/5 text-white/80 cursor-pointer transition-all uppercase tracking-wider"
            >
              FREELANCER
            </button>
          </div>
        </div>

        {/* Inputs & Outputs Grid */}
        <div className="space-y-10" id="main-inputs-container">
          {/* Starting Funds & Incomes */}
          <BudgetSummary
            initialSavings={state.initialSavings}
            monthlyIncome={state.monthlyIncome}
            totalMonthlyExpenses={totalMonthlyExpenses}
            onChangeInitialSavings={(val) => setState(prev => ({ ...prev, initialSavings: val }))}
            onChangeMonthlyIncome={(val) => setState(prev => ({ ...prev, monthlyIncome: val }))}
          />

          {/* Expenses lists */}
          <ExpenseList
            expenses={state.expenses}
            onUpdateExpense={handleUpdateExpense}
            onAddCustomExpense={handleAddCustomExpense}
            onRemoveCustomExpense={handleRemoveCustomExpense}
            isPremiumActive={isPremiumActive}
            onRequestUpgrade={handleRequestUpgrade}
          />

          {/* Live Interactive Charts section */}
          <InteractiveCharts 
            expenses={state.expenses} 
            isPremiumActive={isPremiumActive}
            onRequestUpgrade={handleRequestUpgrade}
          />

          {/* Projection period card */}
          <div className="border border-white p-6 bg-black space-y-4" id="period-setup-card">
            <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
              Selectează Perioada de Proiecție
            </label>
            <p className="text-[9px] text-white/30 font-mono uppercase tracking-wide">
              Intervalul pe baza căruia se va calcula soldul net total estimat
            </p>
            <div className="pt-2">
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                onSelectPeriod={(period) => setSelectedPeriod(period)}
                isPremiumActive={isPremiumActive}
                onRequestUpgrade={handleRequestUpgrade}
              />
            </div>
          </div>
        </div>

        {/* Big high-contrast Geometric Balance calculation action button */}
        <div className="pt-4" id="action-trigger-container">
          <button
            onClick={calculateProjection}
            disabled={isCalculating}
            id="btn-calculate-projection"
            className="bg-white text-black font-bold text-base sm:text-lg py-5 uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-neutral-200 transition-colors active:scale-[0.99] w-full text-center font-mono cursor-pointer block"
          >
            {isCalculating ? 'Se calculează...' : 'Calculează'}
          </button>
        </div>

        {/* Projections Viewport */}
        <div id="results-section-view">
          <AnimatePresence mode="wait">
            {projection && (
              <motion.div
                key={projection.period.monthsCount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                                className="border border-white p-6 md:p-8 bg-black space-y-8"
              >
                <ProjectionResult projection={projection} isPremiumActive={isPremiumActive} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Premium Modal Overlay */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            id="premium-modal-backdrop"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              id="premium-modal-content"
            >
              <div className="border border-white bg-black">
                {/* Custom warning alert */}
                <div className="bg-amber-400 text-black px-6 py-3 font-mono text-[10px] uppercase tracking-wider font-bold flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Această funcție ({premiumFeatureName}) necesită un Abonament Pro activ</span>
                </div>
                <div className="p-4">
                  <PremiumPanel
                    isPremiumActive={isPremiumActive}
                    onTogglePremium={(active) => {
                      setIsPremiumActive(active);
                      if (active) {
                        setTimeout(() => setShowPremiumModal(false), 1000);
                      }
                    }}
                    onRequestClose={() => setShowPremiumModal(false)}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer conforming to Geometric Balance theme */}
      <footer className="mt-20 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] opacity-40 uppercase tracking-[0.3em] max-w-4xl mx-auto w-full border-t border-white/10 pt-6">
        <div>PROIECȚIE FINANCIARĂ MINIMALĂ</div>
        <div>STRATEGIE MINIMALISTĂ © {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
