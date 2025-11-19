import React, { useState } from 'react';
import type { Activity, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface AddActivityFormProps {
  onAdd: (activity: Omit<Activity, 'id' | 'completed' | 'deletedInWeeks' | 'overrides'>) => void;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set());
  const [recurrence, setRecurrence] = useState<'weekly' | 'once'>('weekly');
  const [date, setDate] = useState('');

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

  const handleSelectAllDays = () => {
    if (selectedDays.size === DAYS_OF_WEEK.length) {
      setSelectedDays(new Set());
    } else {
      setSelectedDays(new Set(DAYS_OF_WEEK));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Por favor, preencha o nome da missão.");
        return;
    }

    if (recurrence === 'weekly') {
        if (selectedDays.size === 0) {
            alert("Por favor, selecione pelo menos um dia da semana.");
            return;
        }
        onAdd({
            name,
            recurrence: 'weekly',
            days: Array.from(selectedDays),
        });
    } else { // recurrence === 'once'
        if (!date) {
            alert("Por favor, selecione uma data.");
            return;
        }
        // Date from input is 'yyyy-MM-dd'. To avoid timezone issues, parse it as UTC.
        const dateParts = date.split('-').map(Number);
        const activityDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
        const dayOfWeek = DAYS_OF_WEEK[activityDate.getUTCDay()];
        
        onAdd({
            name,
            recurrence: 'once',
            date,
            days: [dayOfWeek],
        });
    }

    // Reset form
    setName('');
    setSelectedDays(new Set());
    setRecurrence('weekly');
    setDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div>
        <label htmlFor="activity-name" className="block text-sm font-bold text-slate-600 mb-1">
            Nome da Missão
        </label>
        <input
            id="activity-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Guardar os brinquedos"
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 font-semibold"
        />
        </div>
        <div>
        <label className="block text-sm font-bold text-slate-600 mb-2">Frequência da Missão</label>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button type="button" onClick={() => setRecurrence('weekly')} className={`flex-1 text-center text-sm font-bold py-2 rounded-md transition-all ${recurrence === 'weekly' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                Semanal
            </button>
            <button type="button" onClick={() => setRecurrence('once')} className={`flex-1 text-center text-sm font-bold py-2 rounded-md transition-all ${recurrence === 'once' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                Missão Única
            </button>
        </div>
        </div>
        
        {recurrence === 'weekly' && (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-600">
                Dias da Missão
                </label>
                <button
                    type="button"
                    onClick={handleSelectAllDays}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                    {selectedDays.size === DAYS_OF_WEEK.length ? 'Limpar Todos' : 'Selecionar Todos'}
                </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map(day => (
                <button
                type="button"
                key={day}
                onClick={() => handleDayClick(day)}
                className={`w-full py-3 text-sm font-bold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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

        {recurrence === 'once' && (
            <div>
                <label htmlFor="activity-date" className="block text-sm font-bold text-slate-600 mb-1">
                Data da Missão
                </label>
                <input
                id="activity-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required={recurrence === 'once'}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 font-semibold"
                />
            </div>
        )}

        <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-extrabold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-lg shadow-indigo-500/40"
        >
        Adicionar Missão
        </button>
    </form>
  );
};

export default AddActivityForm;