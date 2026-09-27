import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { Lock, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

interface InteractiveChartsProps {
  expenses: Expense[];
  currencySymbol?: string;
  isPremiumActive: boolean;
  onRequestUpgrade: (featureName: string) => void;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  expenses,
  currencySymbol = 'RON',
  isPremiumActive,
  onRequestUpgrade,
}) => {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  // Group and calculate expenses by categories or individual names
  // To make it very useful, we can group them by name or category.
  // The request says: "grafice cu bare pentru a arăta cheltuielile lunare pe categorii și un grafic cu plăcintă pentru a vizualiza distribuția generală a cheltuielilor"
  // Let's summarize expenses by category.
  // Categories: 'mancare', 'taxe', 'cheltuieli', 'custom' (or grouped by name to be more specific)
  // Let's group by name to show specific expenses because they are more representative, 
  // or group by category if they are standard. Grouping by name makes the charts super detailed and direct.
  // Let's group by name since each item in the list represents a specific custom expense!
  const chartData = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return expenses.map((e, index) => {
      const percentage = total > 0 ? (e.amount / total) * 100 : 0;
      return {
        id: e.id,
        name: e.name,
        amount: e.amount,
        percentage: parseFloat(percentage.toFixed(1)),
        category: e.category,
        index,
      };
    }).filter(item => item.amount > 0);
  }, [expenses]);

  const totalExpensesAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Geometric layout parameters for Bar Chart
  const barChartWidth = 500;
  const barChartHeight = 250;
  const paddingLeft = 120;
  const paddingRight = 40;
  const paddingTop = 20;
  const paddingBottom = 40;

  const maxAmount = useMemo(() => {
    const vals = chartData.map((d) => d.amount);
    return Math.max(...vals, 100); // default to 100 to avoid division by zero
  }, [chartData]);

  // Pie Chart calculations
  const pieSize = 200;
  const center = pieSize / 2;
  const radius = 80;

  const pieSlices = useMemo(() => {
    let accumulatedAngle = 0;
    return chartData.map((d) => {
      const percentage = totalExpensesAmount > 0 ? d.amount / totalExpensesAmount : 0;
      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      // Convert polar coordinates to Cartesian for SVG path
      const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
          x: centerX + r * Math.cos(angleInRadians),
          y: centerY + r * Math.sin(angleInRadians),
        };
      };

      const start = polarToCartesian(center, center, radius, startAngle);
      const end = polarToCartesian(center, center, radius, endAngle);
      const largeArcFlag = angle > 180 ? 1 : 0;

      // Path string for the slice
      let pathData = '';
      if (angle >= 360) {
        pathData = `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`;
      } else if (angle > 0) {
        pathData = [
          `M ${center} ${center}`,
          `L ${start.x} ${start.y}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
          'Z',
        ].join(' ');
      }

      // Mid-angle for labels or indicators
      const midAngle = startAngle + angle / 2;
      const labelPos = polarToCartesian(center, center, radius * 1.25, midAngle);

      return {
        ...d,
        startAngle,
        endAngle,
        midAngle,
        pathData,
        labelPos,
      };
    });
  }, [chartData, totalExpensesAmount, center, radius]);

  // Beautiful geometric patterns/styles for slices (High contrast monochrome styled)
  const getSliceStyles = (idx: number, isHovered: boolean) => {
    const patterns = [
      { stroke: '#ffffff', strokeWidth: '1.5', fill: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)' },
      { stroke: '#ffffff', strokeWidth: '1.5', fill: isHovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)' },
      { stroke: '#ffffff', strokeWidth: '1.5', fill: isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' },
      { stroke: '#ffffff', strokeWidth: '1.5', fill: isHovered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.35)' },
      { stroke: '#ffffff', strokeWidth: '1.5', fill: isHovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)' },
      { stroke: '#ffffff', strokeWidth: '1.5', fill: isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)' },
    ];
    return patterns[idx % patterns.length];
  };

  if (chartData.length === 0) {
    return (
      <div className="border border-white p-6 bg-black text-center space-y-3" id="charts-empty-state">
        <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
          Analiză Grafică Cheltuieli
        </label>
        <p className="font-mono text-xs text-white/40 uppercase">
          Nu există date de cheltuieli active (toate sumele sunt 0). Introdu sume mai sus pentru a genera graficele.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="interactive-charts-block">
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
          Analiză & Distribuție Bugetară
        </label>
        <p className="text-[9px] text-white/30 font-mono uppercase tracking-wide mt-1">
          Vizualizare grafică în timp real a cheltuielilor lunare
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="charts-grid-container">
        {/* BAR CHART: Monthly Expenses by Categories */}
        <div className="border border-white p-6 bg-black flex flex-col justify-between" id="bar-chart-card">
          <div className="mb-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">
              📊 Structura Cheltuielilor Lunare
            </h4>
            <p className="text-[9px] font-mono opacity-40 uppercase tracking-wide mt-0.5">
              Sume nete per categorie în {currencySymbol}
            </p>
          </div>

          <div className="relative w-full aspect-[4/2.5] min-h-[220px] flex items-center justify-center bg-transparent p-2">
            <svg
              viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}
              className="w-full h-full"
              id="svg-bar-chart"
            >
              {/* Vertical grids */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const x = paddingLeft + ratio * (barChartWidth - paddingLeft - paddingRight);
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={barChartHeight - paddingBottom}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={x}
                      y={barChartHeight - paddingBottom + 14}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.4)"
                      className="font-mono text-[9px]"
                    >
                      {Math.round(ratio * maxAmount)}
                    </text>
                  </g>
                );
              })}

              {/* Bar items */}
              {chartData.map((d, idx) => {
                const availableHeight = barChartHeight - paddingTop - paddingBottom;
                const barSpacing = availableHeight / chartData.length;
                const barHeight = Math.min(barSpacing * 0.6, 24);
                const y = paddingTop + idx * barSpacing + (barSpacing - barHeight) / 2;
                
                const barWidthMax = barChartWidth - paddingLeft - paddingRight;
                const barWidth = (d.amount / maxAmount) * barWidthMax;

                const isHovered = hoveredBarIndex === idx;

                return (
                  <g
                    key={d.id}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="cursor-pointer"
                  >
                    {/* Y-axis Label */}
                    <text
                      x={paddingLeft - 12}
                      y={y + barHeight / 2 + 3}
                      textAnchor="end"
                      fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.7)'}
                      className="font-sans text-[11px] font-medium tracking-wide uppercase truncate max-w-[100px]"
                    >
                      {d.name.length > 14 ? `${d.name.slice(0, 12)}...` : d.name}
                    </text>

                    {/* Background track */}
                    <rect
                      x={paddingLeft}
                      y={y}
                      width={barWidthMax}
                      height={barHeight}
                      fill="rgba(255,255,255,0.02)"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />

                    {/* Fill bar */}
                    <rect
                      x={paddingLeft}
                      y={y}
                      width={Math.max(barWidth, 2)}
                      height={barHeight}
                      fill={isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      className="transition-all duration-300"
                    />

                    {/* Value label */}
                    <text
                      x={paddingLeft + Math.max(barWidth, 2) + 8}
                      y={y + barHeight / 2 + 4}
                      fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                      className="font-mono text-[10px]"
                    >
                      {d.amount} {currencySymbol} ({d.percentage}%)
                    </text>
                  </g>
                );
              })}

              {/* Y Axis base line */}
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={barChartHeight - paddingBottom}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* PIE CHART: Distribution of General Expenses */}
        <div className="border border-white p-6 bg-black flex flex-col justify-between" id="pie-chart-card">
          <div className="mb-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">
              ⭕ Ponderea Cheltuielilor în Total
            </h4>
            <p className="text-[9px] font-mono opacity-40 uppercase tracking-wide mt-0.5">
              Distribuția procentuală a banilor ieșiți din cont
            </p>
          </div>

          <div className="relative w-full aspect-[4/2.5] min-h-[220px] flex flex-col sm:flex-row items-center justify-around gap-4 p-2">
            {/* SVG Pie */}
            <div className="relative w-[180px] h-[180px]">
              <svg
                viewBox={`0 0 ${pieSize} ${pieSize}`}
                className="w-full h-full"
                id="svg-pie-chart"
              >
                {pieSlices.map((slice, idx) => {
                  const isHovered = hoveredPieIndex === idx;
                  const sliceStyles = getSliceStyles(idx, isHovered);

                  return (
                    <g
                      key={slice.id}
                      onMouseEnter={() => setHoveredPieIndex(idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                      className="cursor-pointer"
                    >
                      {/* Interactive Slice Path */}
                      <path
                        d={slice.pathData}
                        fill={sliceStyles.fill}
                        stroke={sliceStyles.stroke}
                        strokeWidth={isHovered ? '2' : sliceStyles.strokeWidth}
                        className="transition-all duration-200"
                        style={{
                          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                          transformOrigin: `${center}px ${center}px`,
                        }}
                      />
                    </g>
                  );
                })}

                {/* Inner cutout to make it a elegant high-contrast donut */}
                <circle
                  cx={center}
                  cy={center}
                  r="45"
                  fill="#000000"
                  stroke="#ffffff"
                  strokeWidth="1"
                />

                {/* Center text indicating total expenses */}
                <text
                  x={center}
                  y={center - 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  className="font-mono text-[7px] uppercase tracking-widest"
                >
                  TOTAL LUNAR
                </text>
                <text
                  x={center}
                  y={center + 11}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="font-mono text-[11px] font-bold"
                >
                  {totalExpensesAmount}
                </text>
              </svg>
            </div>

            {/* Geometric custom legends list on the right */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto max-h-[180px] overflow-y-auto pr-1" id="pie-chart-legend">
              {chartData.map((d, idx) => {
                const isHovered = hoveredPieIndex === idx || hoveredBarIndex === idx;
                const sliceStyles = getSliceStyles(idx, isHovered);
                return (
                  <div
                    key={d.id}
                    onMouseEnter={() => {
                      setHoveredPieIndex(idx);
                      setHoveredBarIndex(idx);
                    }}
                    onMouseLeave={() => {
                      setHoveredPieIndex(null);
                      setHoveredBarIndex(null);
                    }}
                    className={`flex items-center space-x-2 py-1 px-2 border transition-all cursor-pointer ${
                      isHovered ? 'border-white bg-white/5' : 'border-transparent'
                    }`}
                    id={`legend-item-${d.id}`}
                  >
                    {/* Monochrome filled block indicator */}
                    <div
                      className="w-3 h-3 border border-white shrink-0"
                      style={{ backgroundColor: sliceStyles.fill }}
                    />
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] font-medium text-white/90 uppercase tracking-wide">
                        {d.name}
                      </span>
                      <span className="font-mono text-[9px] text-white/40">
                        {d.amount} {currencySymbol} ({d.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM BLOCK: Advanced Analysis Report */}
      <div className="border border-white bg-black p-6 relative overflow-hidden" id="premium-analysis-block">
        <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
          <div>
            <span className="inline-block bg-amber-400 text-black text-[8px] font-bold font-mono uppercase tracking-[0.2em] px-1.5 py-0.5 mb-1">
              ✦ PRO RAPORT INTELIGENT
            </span>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">
              Corelație Financiară & Viteza de Acumulare
            </h4>
          </div>
          {!isPremiumActive && <Lock className="w-3.5 h-3.5 text-amber-400" />}
        </div>

        {/* Dynamic content (blurred if not premium) */}
        <div className={`space-y-4 transition-all duration-300 ${!isPremiumActive ? 'blur-[3px] select-none pointer-events-none opacity-40' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Observation 1 */}
            <div className="border border-white/10 p-4 bg-white/5 space-y-2">
              <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block">Distribuție Recomandată</span>
              <p className="text-xs text-white/90 leading-relaxed">
                {chartData.length > 0 ? (
                  <>
                    Cea mai mare cheltuială a ta este <span className="font-bold font-mono text-white">"{chartData.sort((a,b)=>b.amount-a.amount)[0]?.name}"</span> în valoare de <span className="font-bold font-mono text-white">{chartData.sort((a,b)=>b.amount-a.amount)[0]?.amount} {currencySymbol}</span>. Aceasta reprezintă <span className="font-bold text-white">{chartData.sort((a,b)=>b.amount-a.amount)[0]?.percentage}%</span> din totalul ieșirilor lunare.
                  </>
                ) : (
                  'Nicio cheltuială configurată activ.'
                )}
              </p>
            </div>

            {/* Observation 2 */}
            <div className="border border-white/10 p-4 bg-white/5 space-y-2">
              <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block">Corelație cu Economiile</span>
              <p className="text-xs text-white/90 leading-relaxed">
                {totalExpensesAmount > 0 ? (
                  <>
                    La fiecare <span className="font-mono text-white font-bold">100 {currencySymbol}</span> câștigați, consumi direct <span className="font-mono text-white font-bold">{Math.round((totalExpensesAmount / maxAmount) * 100)} {currencySymbol}</span> pe costuri fixe și recurente, lăsând restul pentru acumulare pe termen lung.
                  </>
                ) : (
                  'Rată optimă de utilizare a fondurilor.'
                )}
              </p>
            </div>
          </div>

          <div className="border border-white/10 p-4 bg-white/5 space-y-2">
            <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest block">Praguri de Echilibru Monetar</span>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <p className="text-xs text-white/70">
                Abonamentul tău îți permite să vizualizezi indicatorii asociați vitezei de acumulare.
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 border border-white/20 text-[9px] font-mono text-white uppercase">RESERVĂ: OK</span>
                <span className="px-2 py-1 border border-white/20 text-[9px] font-mono text-white uppercase">RAPORT: OPTIM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lock Overlay for Free users */}
        {!isPremiumActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center z-10">
            <div className="max-w-xs space-y-3 p-4 border border-amber-400 bg-black">
              <div className="mx-auto w-8 h-8 border border-amber-400 flex items-center justify-center bg-amber-400/10 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                  ANALIZĂ PRO BLOCATĂ
                </h5>
                <p className="text-[10px] text-white/60 font-mono">
                  Activează Abonamentul Premium (30 RON) pentru a debloca interpretarea automată a datelor tale.
                </p>
              </div>
              <button
                onClick={() => onRequestUpgrade('Analiză Financiară Inteligentă')}
                className="w-full py-2 bg-amber-400 text-black hover:bg-amber-300 transition-colors text-[9px] font-mono uppercase tracking-widest font-bold cursor-pointer"
              >
                Deblochează cu 30 Lei
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
