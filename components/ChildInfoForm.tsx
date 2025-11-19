import React, { useState } from 'react';
import type { ChildInfo } from '../types';

interface ChildInfoFormProps {
  onSave: (info: ChildInfo) => void;
  onCancel?: () => void;
}

const ChildInfoForm: React.FC<ChildInfoFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && age.trim()) {
      onSave({ name: name.trim(), age });
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-pop-in">
      <h2 className="text-2xl font-extrabold text-center text-slate-700 mb-4">Registro de Novo Agente</h2>
      <p className="text-center text-slate-500 mb-8">Informe os dados do agente para começar a primeira missão.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="child-name" className="block text-sm font-bold text-slate-600 mb-1">
            Nome de Código do Agente
          </label>
          <input
            id="child-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Super J"
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 font-semibold"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="child-age" className="block text-sm font-bold text-slate-600 mb-1">
            Idade
          </label>
          <input
            id="child-age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ex: 7"
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 font-semibold"
          />
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
                  className="w-full bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition duration-200"
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