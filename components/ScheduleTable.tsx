import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Activity } from '../types';
import { DAYS_OF_WEEK, SHORT_DAYS_OF_WEEK } from '../constants';
// FIX: Use sub-path imports for date-fns functions to resolve module resolution errors.
import format from 'date-fns/format';
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isWithinInterval from 'date-fns/isWithinInterval';
import parse from 'date-fns/parse';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Star, Rocket, Trophy } from 'lucide-react';

interface ScheduleTableProps {
  activities: Activity[];
  onDelete: (id: string, name: string, weekStartDate: Date) => void;
  onToggleComplete: (activityId: string, date: Date) => void;
  onEdit: (activity: Activity, weekStartDate: Date) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ activities, onDelete, onToggleComplete, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [justCompleted, setJustCompleted] = useState<string | null>(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const datePickerRef = useRef<HTMLInputElement>(null);

    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Domingo
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start, end });

    const weekIdentifier = useMemo(() => format(start, 'yyyy-MM-dd'), [start]);

    useEffect(() => {
        if (isDatePickerVisible && datePickerRef.current) {
            datePickerRef.current.focus();
        }
    }, [isDatePickerVisible]);

    const visibleActivities = useMemo(() => {
        return activities.filter(act => {
             // Handle 'once' activities: only show if they are in the current week
            if (act.recurrence === 'once') {
                if (!act.date) return false;
                const activityDate = parse(act.date, 'yyyy-MM-dd', new Date());
                if (!isWithinInterval(activityDate, { start, end })) {
                    return false;
                }
            }
            // Always check for weekly deletion
            return !act.deletedInWeeks?.includes(weekIdentifier);
        });
    }, [activities, weekIdentifier, start, end]);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);

        if (!isNaN(localDate.getTime())) {
            setCurrentDate(localDate);
        }
        setIsDatePickerVisible(false);
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const progress = useMemo(() => {
        let totalTasks = 0;
        let completedTasks = 0;

        weekDays.forEach(day => {
            const dayOfWeekName = DAYS_OF_WEEK[day.getDay()];
            visibleActivities.forEach(activity => {
                const override = activity.overrides?.[weekIdentifier];
                const effectiveDays = override?.days ?? activity.days ?? [];

                const isScheduled = activity.recurrence === 'once'
                    ? activity.date === format(day, 'yyyy-MM-dd')
                    : effectiveDays.includes(dayOfWeekName);

                if (isScheduled) {
                    totalTasks++;
                    const dateKey = format(day, 'yyyy-MM-dd');
                    if (activity.completed?.[dateKey]) {
                        completedTasks++;
                    }
                }
            });
        });

        if (totalTasks === 0) {
            return { percentage: 0, completed: 0, total: 0 };
        }

        return {
            percentage: Math.round((completedTasks / totalTasks) * 100),
            completed: completedTasks,
            total: totalTasks
        };
    }, [visibleActivities, weekDays, weekIdentifier]);

    if (activities.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center flex flex-col justify-center items-center">
                <Rocket size={64} className="text-slate-300 mb-4" />
                <h3 className="text-xl font-extrabold text-slate-700">Quadro de Missões Vazio!</h3>
                <p className="text-slate-500 mt-2">Clique no botão <span className="font-bold text-indigo-600">'+'</span> para adicionar uma nova missão e começar a aventura!</p>
            </div>
        );
    }
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200">
       <div className="flex justify-between items-center mb-6">
        <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="Semana anterior">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div className="relative text-lg sm:text-xl font-extrabold text-slate-800 text-center min-w-[200px] sm:min-w-[320px]">
            {isDatePickerVisible ? (
                <input
                    ref={datePickerRef}
                    type="date"
                    value={format(currentDate, 'yyyy-MM-dd')}
                    onChange={handleDateChange}
                    onBlur={() => setIsDatePickerVisible(false)}
                    className="w-full bg-slate-100 border-2 border-slate-300 rounded-lg p-1 text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            ) : (
                <button
                    onClick={() => setIsDatePickerVisible(true)}
                    className="hover:bg-slate-100 p-2 rounded-lg transition-colors w-full"
                    aria-label="Selecionar semana"
                >
                    {capitalize(format(start, 'dd MMM', { locale: ptBR }))} - {capitalize(format(end, 'dd MMM, yyyy', { locale: ptBR }))}
                </button>
            )}
        </div>
        <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="Próxima semana">
          <ChevronRight className="w-6 h-6 text-slate-600" />
        </button>
      </div>

       <div className="mb-6 px-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-700">Progresso da Missão Semanal</span>
          <span className="text-sm font-extrabold">
            <span className="text-indigo-600">{progress.percentage}%</span>
            <span className="text-slate-500 font-medium ml-2">({progress.completed}/{progress.total})</span>
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-5 relative overflow-hidden shadow-inner border border-slate-300">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
                progress.percentage === 100 
                ? 'progress-bar-complete' 
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 progress-bar-stripes'
            }`}
            style={{ width: `${progress.percentage}%` }}
          >
          </div>
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="block md:hidden mt-6 space-y-4">
        {visibleActivities.length > 0 ? visibleActivities.map((activity) => {
            const override = activity.overrides?.[weekIdentifier];
            const effectiveName = override?.name ?? activity.name;
            const effectiveDays = override?.days;

            const scheduledDaysThisWeek: Date[] = [];
            weekDays.forEach(day => {
                const dayOfWeekName = DAYS_OF_WEEK[day.getDay()];
                const isScheduled = activity.recurrence === 'once'
                    ? activity.date === format(day, 'yyyy-MM-dd')
                    : (effectiveDays ?? activity.days ?? []).includes(dayOfWeekName);
                if (isScheduled) {
                    scheduledDaysThisWeek.push(day);
                }
            });

            const isMissionFullyCompletedThisWeek = scheduledDaysThisWeek.length > 0 && scheduledDaysThisWeek.every(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                return activity.completed?.[dateKey];
            });

            return (
                <div key={activity.id} className={`p-4 rounded-xl border transition-all duration-300 ${isMissionFullyCompletedThisWeek ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-start gap-2">
                         <div className={`font-bold flex items-center gap-2 transition-colors duration-300 ${isMissionFullyCompletedThisWeek ? 'text-slate-500' : 'text-slate-800'}`}>
                            {isMissionFullyCompletedThisWeek && (
                                <Trophy className="w-5 h-5 text-amber-500 animate-pop-in" />
                            )}
                            <span className="break-words">{effectiveName}</span>
                         </div>
                        <div className="flex items-center flex-shrink-0">
                            <button
                                onClick={() => onEdit(activity, start)}
                                className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-100"
                                aria-label={`Editar missão ${effectiveName} desta semana`}
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onDelete(activity.id, effectiveName, start)} 
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                                aria-label={`Excluir missão ${effectiveName} desta semana`}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                        {weekDays.map(day => {
                            const dayOfWeekName = DAYS_OF_WEEK[day.getDay()];
                            const isScheduled = activity.recurrence === 'once'
                                ? activity.date === format(day, 'yyyy-MM-dd')
                                : (effectiveDays ?? activity.days ?? []).includes(dayOfWeekName);

                            const dateKey = format(day, 'yyyy-MM-dd');
                            const isCompleted = activity.completed?.[dateKey] || false;
                            
                            return (
                                <div key={day.toISOString()} className="flex flex-col items-center space-y-2">
                                    <span className="text-xs font-bold text-slate-500">{SHORT_DAYS_OF_WEEK[day.getDay()]}</span>
                                    <div className="w-9 h-9 flex items-center justify-center">
                                        {isScheduled ? (
                                            <button 
                                                onClick={() => {
                                                    if (!isCompleted) {
                                                        const uniqueKey = `${activity.id}-${dateKey}`;
                                                        setJustCompleted(uniqueKey);
                                                        setTimeout(() => {
                                                            setJustCompleted(prev => (prev === uniqueKey ? null : prev));
                                                        }, 600);
                                                    }
                                                    onToggleComplete(activity.id, day)
                                                }}
                                                className={`flex justify-center items-center w-full h-full rounded-full transition-transform transform hover:scale-125 duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
                                                    justCompleted === `${activity.id}-${dateKey}` ? 'glowing-star' : ''
                                                }`}
                                                aria-label={`Marcar missão ${effectiveName} no dia ${format(day, 'dd/MM')} como ${isCompleted ? 'não concluída' : 'concluída'}`}
                                            >
                                                <Star key={`${activity.id}-${dateKey}-${isCompleted}`} className={`w-7 h-7 transition-all duration-300 ${isCompleted ? 'text-amber-400 fill-amber-400 animate-star-fill' : 'text-slate-300'}`} />
                                            </button>
                                        ) : (
                                            <div className="w-2 h-2 bg-slate-200 rounded-full" title="Não agendado"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
        }) : (
            <div className="text-center p-8 text-slate-500">
                Nenhuma missão programada para esta semana.
            </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block mt-2 overflow-x-auto">
          <div className="w-full min-w-[700px]">
            <div className="grid grid-cols-9 gap-2">
                <div className="px-2 py-3 text-sm font-extrabold text-slate-600 text-left">Missão</div>
                {weekDays.map(day => (
                  <div key={day.toString()} className="px-1 py-3 text-center">
                    <div className="text-sm font-extrabold text-slate-600 capitalize">{format(day, 'EEE', { locale: ptBR })}</div>
                    <div className="text-slate-800 text-lg sm:text-xl mt-1">{format(day, 'd')}</div>
                  </div>
                ))}
                <div className="px-2 py-3 text-sm font-extrabold text-slate-600 text-center">Ações</div>
            </div>

            <div className="space-y-2 mt-2">
                {visibleActivities.length > 0 ? visibleActivities.map((activity) => {
                    const override = activity.overrides?.[weekIdentifier];
                    const effectiveName = override?.name ?? activity.name;
                    const effectiveDays = override?.days;

                    const scheduledDaysThisWeek: Date[] = [];
                    weekDays.forEach(day => {
                        const dayOfWeekName = DAYS_OF_WEEK[day.getDay()];
                        const isScheduled = activity.recurrence === 'once'
                            ? activity.date === format(day, 'yyyy-MM-dd')
                            : (effectiveDays ?? activity.days ?? []).includes(dayOfWeekName);
                        if (isScheduled) {
                            scheduledDaysThisWeek.push(day);
                        }
                    });

                    const isMissionFullyCompletedThisWeek = scheduledDaysThisWeek.length > 0 && scheduledDaysThisWeek.every(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        return activity.completed?.[dateKey];
                    });

                    return (
                        <div 
                            key={activity.id} 
                            className={`grid grid-cols-9 gap-2 items-center rounded-xl px-2 py-3 transition-colors duration-300 ${isMissionFullyCompletedThisWeek ? 'bg-green-50' : 'bg-white'}`}
                        >
                          <div className={`font-bold flex items-center gap-2 transition-colors duration-300 ${isMissionFullyCompletedThisWeek ? 'text-slate-500' : 'text-slate-800'}`}>
                            {isMissionFullyCompletedThisWeek && (
                                <Trophy className="w-5 h-5 text-amber-500 animate-pop-in" />
                            )}
                            <span>{effectiveName}</span>
                          </div>
                          {weekDays.map(day => {
                              const dayOfWeekName = DAYS_OF_WEEK[day.getDay()];
                              const isScheduled = activity.recurrence === 'once'
                                ? activity.date === format(day, 'yyyy-MM-dd')
                                : (effectiveDays ?? activity.days ?? []).includes(dayOfWeekName);

                              const dateKey = format(day, 'yyyy-MM-dd');
                              const isCompleted = activity.completed?.[dateKey] || false;

                              return (
                                  <div key={day.toString()} className="text-center">
                                      {isScheduled && (
                                          <button 
                                              onClick={() => {
                                                if (!isCompleted) {
                                                    const uniqueKey = `${activity.id}-${dateKey}`;
                                                    setJustCompleted(uniqueKey);
                                                    setTimeout(() => {
                                                        setJustCompleted(prev => (prev === uniqueKey ? null : prev));
                                                    }, 600);
                                                }
                                                onToggleComplete(activity.id, day)
                                              }}
                                              className={`flex justify-center items-center w-full p-2 rounded-lg transition-transform transform hover:scale-125 duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
                                                justCompleted === `${activity.id}-${dateKey}` ? 'glowing-star' : ''
                                              }`}
                                              aria-label={`Marcar missão ${effectiveName} no dia ${format(day, 'dd/MM')} como ${isCompleted ? 'não concluída' : 'concluída'}`}
                                          >
                                              <Star key={`${activity.id}-${dateKey}-${isCompleted}`} className={`w-6 h-6 transition-all duration-300 ${isCompleted ? 'text-amber-400 fill-amber-400 animate-star-fill' : 'text-slate-300'}`} />
                                          </button>
                                      )}
                                  </div>
                              )
                          })}
                          <div className="text-center">
                              <div className="flex justify-center items-center gap-2">
                                  <button
                                      onClick={() => onEdit(activity, start)}
                                      className="text-indigo-500 hover:text-indigo-700 transition-colors duration-200 p-2 rounded-full hover:bg-indigo-100"
                                      aria-label={`Editar missão ${effectiveName} desta semana`}
                                  >
                                      <Pencil className="w-5 h-5" />
                                  </button>
                                  <button 
                                      onClick={() => onDelete(activity.id, effectiveName, start)} 
                                      className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-full hover:bg-red-100"
                                      aria-label={`Excluir missão ${effectiveName} desta semana`}
                                  >
                                      <Trash2 className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-8 text-center p-8 text-slate-500">
                        Nenhuma missão programada para esta semana.
                    </div>
                )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ScheduleTable;