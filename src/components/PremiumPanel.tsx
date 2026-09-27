import React, { useState } from 'react';
import { ShieldCheck, Calendar, Layers, Download, BarChart2, Check, RefreshCw, X } from 'lucide-react';

interface PremiumPanelProps {
  isPremiumActive: boolean;
  onTogglePremium: (active: boolean) => void;
  onExportCSV?: () => void;
  onRequestClose?: () => void;
}

export const PremiumPanel: React.FC<PremiumPanelProps> = ({
  isPremiumActive,
  onTogglePremium,
  onExportCSV,
  onRequestClose,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleActivate = () => {
    setIsProcessing(true);
    // Simulate a stylish payment/activation process
    setTimeout(() => {
      setIsProcessing(false);
      onTogglePremium(true);
      setShowSuccess(true);
    }, 1200);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (promoCode.trim().toLowerCase() === 'rares20se') {
      setIsPromoApplied(true);
    } else {
      setPromoError('Cod invalid. Încearcă din nou.');
      setIsPromoApplied(false);
    }
  };

  const handleDeactivate = () => {
    if (window.confirm('Vrei să dezactivezi abonamentul Premium și să revii la planul gratuit?')) {
      onTogglePremium(false);
      setShowSuccess(false);
      setIsPromoApplied(false);
      setPromoCode('');
    }
  };

  const benefits = [
    {
      icon: <Calendar className="w-5 h-5 text-white shrink-0" />,
      title: 'Proiectare Financiară de la 1 la 5 Ani',
      desc: 'Extinde proiecțiile bugetare pe termen lung pentru a vizualiza exact unde te vei afla peste câțiva ani.',
    },
    {
      icon: <Layers className="w-5 h-5 text-white shrink-0" />,
      title: 'Categorii Personalizate Nelimitate',
      desc: 'Adaugă oricâte surse de cheltuieli dorești, fără limita standard de maximum 2 categorii.',
    },
    {
      icon: <Download className="w-5 h-5 text-white shrink-0" />,
      title: 'Export Raport de Date (CSV)',
      desc: 'Descarcă instant datele tale financiare configurate pentru analiză în Excel, Sheets sau alte platforme.',
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-white shrink-0" />,
      title: 'Rapoarte de Distribuție & Corelații',
      desc: 'Analiză premium a ratei de economisire și a pragurilor recomandate de echilibru monetar.',
    },
  ];

  return (
    <div className="border-2 border-white bg-black p-6 md:p-8 space-y-6 relative" id="premium-membership-card">
      {onRequestClose && (
        <button
          onClick={onRequestClose}
          className="absolute top-4 right-4 p-1 text-white/50 hover:text-white border border-transparent hover:border-white/20 hover:bg-white/5 transition-all"
          title="Închide"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Title */}
      <div className="space-y-1 pr-6">
        <span className="inline-block bg-white text-black text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 mb-1 font-bold">
          PLAN PREMIUM ✦ ACTIVEAZĂ ACUM
        </span>
        <h3 className="text-2xl font-black tracking-tight uppercase">
          Abonament Finanțe Pro
        </h3>
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          Maximizează controlul bugetului tău cu instrumente geometrice avansate
        </p>
      </div>

      {showSuccess && isPremiumActive ? (
        /* Success Screen */
        <div className="border border-white p-6 bg-white/5 space-y-4 text-center" id="premium-success-state">
          <div className="mx-auto w-12 h-12 border border-white flex items-center justify-center bg-white text-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-mono font-bold uppercase tracking-wider text-white">
              SISTEM PREMIUM ACTIVAT CU SUCCES!
            </h4>
            <p className="text-xs text-white/60 font-mono">
              {isPromoApplied 
                ? 'Abonament Pro activat GRATUIT prin codul de reducere "rares20se".' 
                : 'Suma de 30 RON a fost debitată fictiv. Te bucuri acum de acces complet pe viață / lunar.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setShowSuccess(false)}
              className="px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider hover:bg-neutral-200 transition-colors"
            >
              Începe Explorarea
            </button>
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 bg-transparent text-white/40 border border-white/20 text-xs font-mono uppercase tracking-wider hover:text-white hover:border-white transition-colors"
            >
              Dezactivează
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="premium-details-layout">
          {/* Left Column: Benefits list */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex gap-3 items-start border-l border-white/20 pl-3">
                  <div className="p-1 border border-white/20 bg-white/5">
                    {b.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {b.title}
                    </h5>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pricing & Call-to-Action */}
          <div className="md:col-span-5 border border-white p-6 bg-white/5 flex flex-col justify-between space-y-6" id="premium-pricing-box">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                TARIF UNIC RECOMANDAT
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                {isPromoApplied ? (
                  <>
                    <span className="text-4xl font-black font-mono tracking-tight text-amber-400">0</span>
                    <span className="text-sm font-mono text-amber-400">RON</span>
                    <span className="text-[10px] font-mono line-through opacity-40 ml-2">30 RON</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-black font-mono tracking-tight text-white">30</span>
                    <span className="text-sm font-mono opacity-60">RON / LUNĂ</span>
                  </>
                )}
              </div>
              <p className="text-[9px] font-mono text-white/30 uppercase leading-normal">
                {isPromoApplied 
                  ? 'Reducere de 100% aplicată! Bucură-te de contul gratuit.' 
                  : 'Preț fix transparent. Include toate upgrade-urile și beneficiile enumerate.'}
              </p>

              {/* Promo Code Input Field */}
              {!isPremiumActive && (
                <div className="border-t border-white/10 pt-4 text-left">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/50 block mb-2">
                    Ai un cod de reducere?
                  </span>
                  {isPromoApplied ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 text-[10px] font-mono text-emerald-400 flex justify-between items-center">
                      <span>✦ Cod "rares20se" aplicat!</span>
                      <button 
                        onClick={() => {
                          setIsPromoApplied(false);
                          setPromoCode('');
                        }}
                        className="text-white/60 hover:text-white underline cursor-pointer"
                      >
                        Șterge
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          if (promoError) setPromoError(null);
                        }}
                        placeholder="EX: rares20se"
                        className="flex-1 bg-black text-white border border-white/20 px-2.5 py-1.5 text-xs font-mono focus:border-white focus:outline-none uppercase placeholder:text-white/20"
                      />
                      <button
                        type="submit"
                        className="bg-white text-black hover:bg-neutral-200 px-3 py-1.5 text-[10px] font-mono uppercase font-bold cursor-pointer transition-colors border border-white"
                      >
                        Aplică
                      </button>
                    </form>
                  )}
                  {promoError && (
                    <p className="text-red-400 text-[10px] font-mono mt-1">
                      ⚠️ {promoError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isPremiumActive ? (
              <div className="space-y-2">
                <div className="border border-white/30 p-2.5 bg-black/40 flex items-center gap-2 text-white/80">
                  <Check className="w-4 h-4 text-white shrink-0" />
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Abonament Premium Activ</span>
                </div>
                <button
                  onClick={handleDeactivate}
                  className="w-full py-2.5 bg-transparent text-red-400 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 transition-all text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                >
                  Dezactivează Abonament
                </button>
              </div>
            ) : (
              <button
                onClick={handleActivate}
                disabled={isProcessing}
                className={`w-full py-4 disabled:bg-neutral-800 disabled:text-white/40 font-bold transition-all text-xs font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer border ${
                  isPromoApplied 
                    ? 'bg-amber-400 text-black hover:bg-amber-300 border-amber-400' 
                    : 'bg-white text-black hover:bg-neutral-200 border-white'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Se procesează...
                  </>
                ) : isPromoApplied ? (
                  'Activează Premium (GRATUIT)'
                ) : (
                  'Activează Premium (30 Lei)'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Legal Notice */}
      <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row justify-between text-[8px] font-mono text-white/30 uppercase tracking-widest gap-2">
        <span>*Plată simulată în mediu de test sigur</span>
        <span>Anulabil oricând dintr-un singur click</span>
      </div>
    </div>
  );
};
