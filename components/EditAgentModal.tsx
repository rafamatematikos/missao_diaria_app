import React, { useState, useEffect, useMemo } from 'react';
import type { ChildInfo } from '../types';
import { X } from 'lucide-react';
import differenceInYears from 'date-fns/differenceInYears';
import parse from 'date-fns/parse';

interface EditAgentModalProps {
  currentInfo: ChildInfo;
  onSave: (newInfo: ChildInfo) => void;
  onCancel: () => void;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({ currentInfo, onSave, onCancel }) => {
  const [name, setName] = useState(currentInfo.name);
  const [birthDate, setBirthDate] = useState(currentInfo.birthDate || '');

  const calculatedAge = useMemo(() => {
    if (!birthDate) return null;
    const date = parse(birthDate, 'yyyy-MM-dd', new Date());
    return differenceInYears(new Date(), date);
  }, [birthDate]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && birthDate) {
      onSave({ ...currentInfo, name: name.trim(), birthDate });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-agent-modal-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-pop-in border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 id="edit-agent-modal-title" className="text-xl font-extrabold text-slate-800 dark:text-white">Editar Dados do Agente</h2>
            <button onClick={onCancel} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X size={24} />
            </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="agent-name" className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nome de Código do Agente
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 font-semibold"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="agent-dob" className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                Data de Nascimento
              </label>
              <input
                id="agent-dob"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 font-semibold"
              />
               {calculatedAge !== null && (
                <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-bold text-right">
                    Idade atual: {calculatedAge} anos
                </p>
               )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAgentModal;