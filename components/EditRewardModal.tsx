import React, { useState, useEffect } from 'react';
import type { Reward } from '../types';
import { X } from 'lucide-react';

interface EditRewardModalProps {
  reward: Reward;
  onSave: (updatedReward: Reward) => void;
  onCancel: () => void;
}

const EditRewardModal: React.FC<EditRewardModalProps> = ({ reward, onSave, onCancel }) => {
  const [name, setName] = useState(reward.name);
  const [cost, setCost] = useState(reward.cost.toString());

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
    const costValue = parseInt(cost, 10);
    if (name.trim() && !isNaN(costValue) && costValue > 0) {
      onSave({ ...reward, name: name.trim(), cost: costValue });
    } else {
      alert('Por favor, preencha um nome válido e um custo positivo.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-reward-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-pop-in border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <h2 id="edit-reward-modal-title" className="text-xl font-extrabold text-slate-800">Editar Recompensa</h2>
            <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={24} />
            </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="edit-reward-name" className="block text-sm font-bold text-slate-600 mb-1">
                Título da Recompensa
              </label>
              <input
                id="edit-reward-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 font-semibold"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="edit-reward-cost" className="block text-sm font-bold text-slate-600 mb-1">
                Custo em moedas
              </label>
              <input
                id="edit-reward-cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 font-semibold"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition"
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

export default EditRewardModal;