import React, { useEffect } from 'react';
import { Share, PlusSquare, MoreVertical, X, Download } from 'lucide-react';

interface InstallModalProps {
  onCancel: () => void;
  isIOS: boolean;
}

const InstallModal: React.FC<InstallModalProps> = ({ onCancel, isIOS }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onCancel]);

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-pop-in border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
           <div>
             <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Download className="w-6 h-6" />
                Instalar Aplicativo
             </h2>
             <p className="text-indigo-100 text-sm mt-1">Adicione à sua tela inicial para acesso rápido e offline.</p>
           </div>
           <button onClick={onCancel} className="text-indigo-100 hover:text-white bg-indigo-700 hover:bg-indigo-800 rounded-full p-1 transition-colors">
             <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-6">
          {isIOS ? (
            <div className="space-y-4">
              <p className="text-slate-600 font-semibold">Para instalar no iPhone/iPad:</p>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-indigo-600">
                    <Share size={24} />
                  </div>
                  <span className="text-slate-700 text-sm font-medium mt-1">1. Toque no botão <strong className="text-slate-900">Compartilhar</strong> na barra inferior do navegador.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-indigo-600">
                    <PlusSquare size={24} />
                  </div>
                  <span className="text-slate-700 text-sm font-medium mt-1">2. Role para baixo e selecione <strong className="text-slate-900">Adicionar à Tela de Início</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-indigo-600 font-bold text-xl w-10 h-10 flex items-center justify-center">
                    3
                  </div>
                  <span className="text-slate-700 text-sm font-medium mt-1">3. Confirme tocando em <strong className="text-slate-900">Adicionar</strong> no canto superior.</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600 font-semibold">Se a instalação não iniciou automaticamente:</p>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-indigo-600">
                    <MoreVertical size={24} />
                  </div>
                  <span className="text-slate-700 text-sm font-medium mt-1">1. Toque no ícone de menu (três pontos) do navegador.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-indigo-600">
                    <Download size={24} />
                  </div>
                  <span className="text-slate-700 text-sm font-medium mt-1">2. Selecione <strong className="text-slate-900">Instalar aplicativo</strong> ou <strong className="text-slate-900">Adicionar à tela inicial</strong>.</span>
                </li>
              </ol>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <button onClick={onCancel} className="text-indigo-600 font-bold text-sm hover:underline">
                Entendi, vou tentar
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;