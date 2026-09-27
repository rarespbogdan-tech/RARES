import React, { useMemo } from 'react';
import { ProjectionDetails } from '../types';
import { TrendingUp, AlertTriangle, ShieldCheck, Download, Printer } from 'lucide-react';

interface ProjectionResultProps {
  projection: ProjectionDetails;
  currencySymbol?: string;
  isPremiumActive: boolean;
}

export const ProjectionResult: React.FC<ProjectionResultProps> = ({
  projection,
  currencySymbol = 'RON',
  isPremiumActive,
}) => {
  const { period, totalIncome, totalExpenses, remainingAmount, monthlyBreakdown } = projection;

  const spentPercentage = useMemo(() => {
    if (totalIncome === 0) return 0;
    return Math.min(100, Math.round((totalExpenses / totalIncome) * 100));
  }, [totalIncome, totalExpenses]);

  const isDeficit = remainingAmount < 0;

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = 'Luna Index,Eticheta Luna,Venit Cumulat (RON),Cheltuieli Cumulate (RON),Sold Cumulat Estimat (RON)\n';
    const rows = monthlyBreakdown.map((row) => 
      `${row.monthIndex},"${row.label}",${row.incomeCumulative},${row.expensesCumulative},${row.savingsCumulative}`
    ).join('\n');
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `proiectie_financiara_${period.label.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const financialStatus = useMemo(() => {
    if (isDeficit) {
      return {
        title: 'Dezechilibru Bugetar Detectat',
        description: `Cheltuielile totale depășesc resursele cu ${Math.abs(remainingAmount).toLocaleString()} ${currencySymbol}. Recomandăm optimizarea cheltuielilor.`,
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        colorClass: 'border-red-500 text-red-400 bg-black',
      };
    }
    if (spentPercentage > 85) {
      return {
        title: 'Buget Limitat',
        description: `Cheltuiești ${spentPercentage}% din buget. Fondurile de economii sunt reduse. Recomandăm atenție la cheltuielile variabile.`,
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        colorClass: 'border-amber-500 text-amber-400 bg-black',
      };
    }
    if (spentPercentage > 50) {
      return {
        title: 'Buget Stabil',
        description: `Cheltuiești ${spentPercentage}% din totalul disponibil. Menții o rezervă de siguranță rezonabilă.`,
        icon: <ShieldCheck className="w-5 h-5 text-white/80" />,
        colorClass: 'border-white text-white/90 bg-black',
      };
    }
    return {
      title: 'Echilibru Financiar Excelent',
      description: `Felicitări! Reții peste 50% ca economii curate. Traiectoria ta de acumulare pe termen lung este optimă.`,
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      colorClass: 'border-white text-white bg-white/5',
    };
  }, [isDeficit, spentPercentage, remainingAmount, currencySymbol]);

  const chartPoints = useMemo(() => {
    if (!monthlyBreakdown || monthlyBreakdown.length === 0) return null;
    const width = 500;
    const height = 180;
    const padding = 25;

    const savingsValues = monthlyBreakdown.map((d) => d.savingsCumulative);
    const maxVal = Math.max(...savingsValues, 1000);
    const minVal = Math.min(...savingsValues, -500);
    const range = maxVal - minVal || 1;

    const points = monthlyBreakdown.map((d, index) => {
      const x = padding + (index / (monthlyBreakdown.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((d.savingsCumulative - minVal) / range) * (height - padding * 2);
      return { x, y, val: d.savingsCumulative, label: d.label };
    });

    return {
      svgPath: points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
      pointsList: points,
      width,
      height,
      minVal,
      maxVal,
    };
  }, [monthlyBreakdown]);

  return (
    <div className="space-y-8" id="projection-results-block">
      <div className="flex justify-between items-start flex-col sm:flex-row gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
            PROIECTARE REZULTATE: {period.label}
          </label>
          <p className="text-[9px] text-white/30 font-mono uppercase tracking-wide mt-1">
            Bilanț detaliat pentru intervalul de {period.monthsCount} {period.monthsCount === 1 ? 'lună' : 'luni'}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto no-print">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-white text-white hover:bg-white hover:text-black transition-colors text-[10px] font-mono uppercase tracking-[0.15em] flex items-center gap-1.5 cursor-pointer"
            id="btn-print-projection"
          >
            <Printer className="w-3 h-3" />
            Printează Raport
          </button>
          {isPremiumActive && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 border border-white text-white hover:bg-white hover:text-black transition-colors text-[10px] font-mono uppercase tracking-[0.15em] flex items-center gap-1.5 cursor-pointer"
              id="btn-export-csv"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stats-grid">
        <div className="border border-white p-6 bg-black relative" id="card-total-available">
          <label className="block text-[9px] uppercase tracking-[0.15em] opacity-60 mb-2">Venit Total ({period.label})</label>
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {totalIncome.toLocaleString()} <span className="text-xs font-normal opacity-50">{currencySymbol}</span>
          </div>
        </div>

        <div className="border border-white p-6 bg-black relative" id="card-total-expenses">
          <label className="block text-[9px] uppercase tracking-[0.15em] opacity-60 mb-2">Cheltuieli Totale ({period.label})</label>
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {totalExpenses.toLocaleString()} <span className="text-xs font-normal opacity-50">{currencySymbol}</span>
          </div>
          <div className="w-full bg-neutral-900 h-[1px] mt-3">
            <div className="bg-white h-full" style={{ width: `${spentPercentage}%` }} />
          </div>
        </div>

        <div className="border border-white p-6 bg-black relative" id="card-remaining-savings">
          <label className="block text-[9px] uppercase tracking-[0.15em] opacity-80 mb-2">Sold Rămas Estimat</label>
          <div className={`text-3xl font-black tracking-tighter font-mono ${isDeficit ? 'text-red-400' : 'text-white'}`}>
            {remainingAmount.toLocaleString()} <span className="text-sm font-normal opacity-60">{currencySymbol}</span>
          </div>
        </div>
      </div>

      {/* Advisory component */}
      <div className={`border p-4 flex items-start space-x-3 ${financialStatus.colorClass}`} id="financial-advice-card">
        <div className="mt-0.5 shrink-0">{financialStatus.icon}</div>
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider font-semibold text-white">
            {financialStatus.title}
          </p>
          <p className="text-[11px] text-white/70 leading-relaxed">
            {financialStatus.description}
          </p>
        </div>
      </div>

      {/* Visualisation and details row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="breakdown-charts-layout">
        {/* SVG chart section */}
        <div className="border border-white p-6 bg-black lg:col-span-7 flex flex-col justify-between" id="chart-section">
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">
              Evoluția Estimată a Soldului
            </label>
            <p className="text-[9px] text-white/30 font-mono uppercase tracking-wide">
              Valoare cumulată pe luni în {currencySymbol}
            </p>
          </div>

          <div className="relative w-full aspect-[5/2.5] min-h-[160px] flex items-center justify-center bg-transparent border border-white/10 p-2 overflow-hidden">
            {chartPoints && chartPoints.pointsList.length > 0 ? (
              <svg 
                viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                className="w-full h-full"
                id="svg-growth-chart"
              >
                {/* Horizontal guide lines */}
                <line x1="25" y1="25" x2="475" y2="25" stroke="rgba(255,255,255,0.08)" />
                <line x1="25" y1="90" x2="475" y2="90" stroke="rgba(255,255,255,0.08)" />
                <line x1="25" y1="155" x2="475" y2="155" stroke="rgba(255,255,255,0.08)" />

                {chartPoints.minVal < 0 && (
                  <line 
                    x1="25" 
                    y1={chartPoints.height - 25 - ((0 - chartPoints.minVal) / (chartPoints.maxVal - chartPoints.minVal)) * (chartPoints.height - 50)} 
                    x2="475" 
                    y2={chartPoints.height - 25 - ((0 - chartPoints.minVal) / (chartPoints.maxVal - chartPoints.minVal)) * (chartPoints.height - 50)} 
                    stroke="rgba(239, 68, 68, 0.4)" 
                    strokeWidth="1" 
                    strokeDasharray="2 2"
                  />
                )}

                <path
                  d={`${chartPoints.svgPath} L ${chartPoints.pointsList[chartPoints.pointsList.length - 1].x} ${chartPoints.height - 25} L ${chartPoints.pointsList[0].x} ${chartPoints.height - 25} Z`}
                  fill="rgba(255,255,255,0.03)"
                />

                <path
                  d={chartPoints.svgPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {chartPoints.pointsList.map((p, idx) => {
                  const showNode = 
                    chartPoints.pointsList.length <= 12 || 
                    idx === 0 || 
                    idx === chartPoints.pointsList.length - 1 || 
                    idx % Math.round(chartPoints.pointsList.length / 5) === 0;

                  if (!showNode) return null;

                  const isNegativeValue = p.val < 0;

                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill={isNegativeValue ? "#ef4444" : "#ffffff"}
                        stroke="#000000"
                        strokeWidth="1"
                      />
                      <text
                        x={p.x}
                        y={p.y - 8}
                        textAnchor="middle"
                        fill="#ffffff"
                        className="font-mono text-[8px]"
                      >
                        {Math.round(p.val).toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                <text x="25" y={chartPoints.height - 6} fill="rgba(255,255,255,0.4)" className="font-mono text-[8px]">
                  {chartPoints.pointsList[0]?.label || 'Start'}
                </text>
                <text x="475" y={chartPoints.height - 6} fill="rgba(255,255,255,0.4)" textAnchor="end" className="font-mono text-[8px]">
                  {chartPoints.pointsList[chartPoints.pointsList.length - 1]?.label || 'Final'}
                </text>
              </svg>
            ) : (
              <p className="font-mono text-xs text-white/40">Date insuficiente pentru generare grafic.</p>
            )}
          </div>
        </div>

        {/* Breakdown parameters table */}
        <div className="border border-white p-6 bg-black lg:col-span-5 flex flex-col justify-between" id="breakdown-table-section">
          <div className="space-y-4">
            <label className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
              Indicatori Sănătate Financiară
            </label>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="opacity-60">Suma Inițială:</span>
                <span className="font-bold">
                  {projection.monthlyBreakdown[0]?.savingsCumulative !== undefined 
                    ? (projection.monthlyBreakdown[0].savingsCumulative - (projection.totalIncome - projection.monthlyBreakdown[0].incomeCumulative)).toLocaleString() 
                    : 0} {currencySymbol}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="opacity-60">Economii Net Recurente:</span>
                <span className={projection.totalIncome - projection.totalExpenses >= 0 ? "text-white" : "text-red-400"}>
                  {(projection.totalIncome - projection.totalExpenses).toLocaleString()} {currencySymbol}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="opacity-60">Rata de Economisire:</span>
                <span className="font-bold">{isDeficit ? '0%' : `${100 - spentPercentage}%`}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="w-full bg-neutral-900 h-1">
              <div 
                className={`h-full ${isDeficit ? 'bg-red-500' : 'bg-white'}`} 
                style={{ width: `${isDeficit ? 0 : 100 - spentPercentage}%` }}
              />
            </div>
            <p className="text-[8px] font-mono opacity-40 mt-2 uppercase tracking-wider text-right">
              Procent economisire din încasări
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
