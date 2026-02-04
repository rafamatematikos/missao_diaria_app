import React, { useState, useMemo } from 'react';
import type { ChildInfo } from '../types';
import differenceInYears from 'date-fns/differenceInYears';
import parse from 'date-fns/parse';

interface ChildInfoFormProps {
  onSave: (info: ChildInfo) => void;
  onCancel?: () => void;
}

const ChildInfoForm: React.FC<ChildInfoFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const calculatedAge = useMemo(() => {
    if (!birthDate) return null;
    const date = parse(birthDate, 'yyyy-MM-dd', new Date());
    return differenceInYears(new Date(), date);
  }, [birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && birthDate) {
      onSave({ name: name.trim(), birthDate });
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-pop-in">
      <h2 className="text-2xl font-extrabold text-center text-slate-700 dark:text-white mb-4">Registro de Novo Agente</h2>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Informe os dados do agente para começar a primeira missão.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="child-name" className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
            Nome de Código do Agente
          </label>
          <input
            id="child-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Super J"
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 font-semibold"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="child-dob" className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
            Data de Nascimento
          </label>
          <input
            id="child-dob"
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
        <div className="flex flex-col gap-3 pt-2">
          <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-extrabold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-lg shadow-indigo-500/40"
          >
              Iniciar Missão!
          </button>
          {onCancel && (
              <button
                  type="button"
                  onClick={onCancel}
                  className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition duration-200"
              >
                  Cancelar
              </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChildInfoForm;