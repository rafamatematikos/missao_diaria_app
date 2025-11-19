import React, { useState, useEffect } from 'react';
import type { Activity, DayOfWeek, ActivityOverride } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import format from 'date-fns/format';
import { X } from 'lucide-react';

interface EditActivityModalProps {
  activity: Activity;
  weekStartDate: Date;
  onSave: (activityId: string, weekIdentifier: string, overrideData: ActivityOverride) => void;
  onCancel: () => void;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ activity, weekStartDate, onSave, onCancel }) => {
  const weekIdentifier = format(weekStartDate, 'yyyy-MM-dd');
  const weeklyOverride = activity.overrides?.[weekIdentifier];
  
  const [name, setName] = useState(weeklyOverride?.name ?? activity.name);
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set(weeklyOverride?.days ?? activity.days));

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

  const handleDayClick = (day: DayOfWeek) => {
    setSelectedDays(prev => {
      const newDays = new Set(prev);
      if (newDays.has(day)) {
        newDays.delete(day);
      } else {
        newDays.add(day);
      }
      return newDays;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Por favor, preencha o nome da missão.");
        return;
    }

    if (activity.recurrence === 'weekly' && selectedDays.size === 0) {
      alert("Por favor, selecione pelo menos um dia.");
      return;
    }
    
    const overrideData: ActivityOverride = { name };
    if (activity.recurrence === 'weekly') {
        overrideData.days = Array.from(selectedDays);
    }
    onSave(activity.id, weekIdentifier, overrideData);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-pop-in border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <h2 id="edit-modal-title" className="text-xl font-extrabold text-slate-800">Ajustar Missão da Semana</h2>
            <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={24} />
            </button>
        </div>
        <div className="p-6">
          <p className="text-slate-600 mb-6 -mt-2">As alterações afetarão apenas a semana de {format(weekStartDate, "dd/MM/yy")}.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="edit-activity-name" className="block text-sm font-bold text-slate-600 mb-1">
                Nome da Missão
              </label>
              <input
                id="edit-activity-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 font-semibold"
              />
            </div>
            {activity.recurrence === 'weekly' && (
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  Dias da Missão
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`py-2 px-2 text-sm font-bold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        selectedDays.has(day)
                          ? 'bg-indigo-600 text-white shadow-md transform hover:bg-indigo-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

export default EditActivityModal;