import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Users, UserPlus, Trash2, UserCog, Download } from 'lucide-react';

const CoinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="gold-gradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="1" stopColor="#FBBF24" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#gold-gradient)" stroke="#F59E0B" strokeWidth="1.5" />
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="rgba(255, 255, 255, 0.85)" />
  </svg>
);

interface HeaderProps {
  childName?: string;
  coins?: number;
  onDeleteAgent: () => void;
  onLogout: () => void;
  onCreateNew: () => void;
  onEditAgent: () => void;
  hasData: boolean;
  showInstallButton?: boolean;
  onInstall?: () => void;
}

const Header: React.FC<HeaderProps> = ({ childName, coins, onDeleteAgent, onLogout, onCreateNew, onEditAgent, hasData, showInstallButton, onInstall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [animateCoin, setAnimateCoin] = useState(false);
  const prevCoinsRef = useRef<number | undefined>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (prevCoinsRef.current !== undefined && coins !== undefined && coins > prevCoinsRef.current) {
        setAnimateCoin(true);
        const timer = setTimeout(() => setAnimateCoin(false), 400); // Animation duration
        return () => clearTimeout(timer);
    }
    prevCoinsRef.current = coins;
  }, [coins]);

  return (
    <header className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 pb-6 border-b-2 border-slate-200">
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <Rocket className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
            Missão Diária
          </h1>
        </div>
        {childName && (
           <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
             <p className="text-lg text-indigo-600 font-bold">Agente: {childName}</p>
             <div 
                className={`flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-300 shadow-sm transition-transform duration-300 ease-out ${animateCoin ? 'scale-125' : 'scale-100'}`}
                title={`${coins ?? 0} moedas de recompensa`}
             >
                 <CoinIcon className="w-5 h-5" />
                 <span>{coins ?? 0}</span>
             </div>
           </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showInstallButton && onInstall && (
            <button
                onClick={onInstall}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 animate-pulse"
                title="Instalar App"
            >
                <Download size={20} />
                <span>Instalar</span>
            </button>
        )}
        {hasData && (
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold text-xl cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                >
                    {childName?.charAt(0).toUpperCase()}
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-pop-in origin-top-right">
                        <div className="p-2 border-b border-slate-200 mb-2">
                            <p className="font-extrabold text-slate-800">{childName}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-slate-500">Agente Ativo</p>
                                <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                                    <CoinIcon className="w-4 h-4" />
                                    <span>{coins ?? 0}</span>
                                </div>
                            </div>
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => { onEditAgent(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors font-semibold">
                                    <UserCog size={18} />
                                    Editar Agente
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors font-semibold">
                                    <Users size={18} />
                                    Trocar Agente
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { onCreateNew(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors font-semibold">
                                    <UserPlus size={18} />
                                    Criar Novo Agente
                                </button>
                            </li>
                        </ul>
                        <hr className="my-2 border-slate-200" />
                        <ul>
                            <li>
                                <button onClick={() => { onDeleteAgent(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-semibold">
                                    <Trash2 size={18} />
                                    Resetar Agente Atual
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;