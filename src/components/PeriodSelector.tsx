import React from 'react';
import { ProjectionPeriod } from '../types';
import { Lock } from 'lucide-react';

interface PeriodSelectorProps {
  selectedPeriod: ProjectionPeriod;
  onSelectPeriod: (period: ProjectionPeriod) => void;
  isPremiumActive: boolean;
  onRequestUpgrade: (featureName: string) => void;
}

export const AVAILABLE_PERIODS: ProjectionPeriod[] = [
  // Months
  { label: '1 L', monthsCount: 1, type: 'month', value: 1 },
  { label: '2 L', monthsCount: 2, type: 'month', value: 2 },
  { label: '3 L', monthsCount: 3, type: 'month', value: 3 },
  { label: '4 L', monthsCount: 4, type: 'month', value: 4 },
  { label: '5 L', monthsCount: 5, type: 'month', value: 5 },
  { label: '6 L', monthsCount: 6, type: 'month', value: 6 },
  { label: '7 L', monthsCount: 7, type: 'month', value: 7 },
  { label: '8 L', monthsCount: 8, type: 'month', value: 8 },
  { label: '9 L', monthsCount: 9, type: 'month', value: 9 },
  { label: '10 L', monthsCount: 10, type: 'month', value: 10 },
  { label: '11 L', monthsCount: 11, type: 'month', value: 11 },
  { label: '12 L', monthsCount: 12, type: 'month', value: 12 },
  // Years
  { label: '1 AN', monthsCount: 12, type: 'year', value: 1 },
  { label: '2 ANI', monthsCount: 24, type: 'year', value: 2 },
  { label: '3 ANI', monthsCount: 36, type: 'year', value: 3 },
  { label: '4 ANI', monthsCount: 48, type: 'year', value: 4 },
  { label: '5 ANI', monthsCount: 60, type: 'year', value: 5 },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onSelectPeriod,
  isPremiumActive,
  onRequestUpgrade,
}) => {
  const months = AVAILABLE_PERIODS.filter((p) => p.type === 'month');
  const years = AVAILABLE_PERIODS.filter((p) => p.type === 'year');

  const handlePeriodClick = (period: ProjectionPeriod) => {
    if (period.type === 'year' && !isPremiumActive) {
      onRequestUpgrade(`Proiectare pe Ani (${period.label})`);
    } else {
      onSelectPeriod(period);
    }
  };

  return (
    <div className="space-y-6" id="period-selector-container">
      {/* Months selection */}
      <div className="space-y-3" id="months-selection-group">
        <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
          Proiectare pe Luni (1 - 12 Luni)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2" id="months-grid">
          {months.map((period) => {
            const isSelected =
              selectedPeriod.type === period.type && selectedPeriod.value === period.value;
            return (
              <button
                key={`${period.type}-${period.value}`}
                id={`btn-period-m-${period.value}`}
                onClick={() => handlePeriodClick(period)}
                className={`aspect-square flex items-center justify-center text-xs font-mono transition-colors duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-black text-white border-white/20 hover:border-white hover:bg-white/5'
                }`}
              >
                {period.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Years selection */}
      <div className="space-y-3" id="years-selection-group">
        <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
          Proiectare pe Ani (1 - 5 Ani) <span className="text-[9px] text-amber-400 font-mono tracking-normal uppercase ml-1">✦ Premium</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="years-grid">
          {years.map((period) => {
            const isSelected =
              selectedPeriod.type === period.type && selectedPeriod.value === period.value;
            return (
              <button
                key={`${period.type}-${period.value}`}
                id={`btn-period-y-${period.value}`}
                onClick={() => handlePeriodClick(period)}
                className={`py-3 text-[10px] tracking-widest font-mono transition-colors duration-200 border cursor-pointer uppercase flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-black text-white border-white/20 hover:border-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-1">
                  {period.label}
                  {!isPremiumActive && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
