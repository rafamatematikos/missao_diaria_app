import React, { useMemo, useState } from 'react';
import type { Activity } from '../types';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import isWithinInterval from 'date-fns/isWithinInterval';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DAYS_OF_WEEK, SHORT_DAYS_OF_WEEK } from '../constants';
import { Trophy, Target, TrendingUp, Award, ChevronLeft, ChevronRight, CheckCircle, XCircle, Circle } from 'lucide-react';

interface HistoryViewProps {
  activities: Activity[];
}

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
    <div className={`p-4 rounded-xl shadow-lg flex items-center gap-4 border-l-4 ${color}`}>
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="text-2xl font-extrabold text-slate-800">{value}</p>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
        </div>
    </div>
);

// FIX: Refactored StatusIcon to use an explicit props interface and React.FC to resolve a TypeScript error.
interface StatusIconProps {
  status: 'completed' | 'missed' | 'not-scheduled';
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className="w-5 h-5 text-green-500" title="Concluída" />;
        case 'missed':
            return <XCircle className="w-5 h-5 text-red-500" title="Não Concluída" />;
        case 'not-scheduled':
            return <Circle className="w-5 h-5 text-slate-300" fill="currentColor" title="Não agendada" />;
        default:
            return null;
    }
}

const HistoryView: React.FC<HistoryViewProps> = ({ activities }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    const dashboardData = useMemo(() => {
        const weekDays = eachDayOfInterval({ start, end });
        const weekIdentifier = format(start, 'yyyy-MM-dd');

        let totalScheduledTasks = 0;
        let totalCompletedTasks = 0;
        const dailyCompletionCounts = Array(7).fill(0);
        let perfectDays = 0;
        const completedMissionTally: { [name: string]: number } = {};
        
        const weeklyActivities = activities.filter(act => {
            if (act.deletedInWeeks?.includes(weekIdentifier)) return false;
            if (act.recurrence === 'once') {
                if (!act.date) return false;
                const activityDate = parse(act.date, 'yyyy-MM-dd', new Date());
                return isWithinInterval(activityDate, { start, end });
            }
            return true;
        });

        const activityMap = new Map<string, { id: string, name: string, statuses: ('completed' | 'missed' | 'not-scheduled')[] }>();
        weeklyActivities.forEach(activity => {
            const override = activity.overrides?.[weekIdentifier];
            const effectiveName = override?.name ?? activity.name;
            activityMap.set(activity.id, { id: activity.id, name: effectiveName, statuses: Array(7).fill('not-scheduled') });
        });

        weekDays.forEach((day, dayIndex) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayOfWeekName = DAYS_OF_WEEK[day.getDay()];
            let dailyScheduled = 0;
            let dailyCompleted = 0;

            weeklyActivities.forEach(activity => {
                const override = activity.overrides?.[weekIdentifier];
                const effectiveDays = override?.days ?? activity.days ?? [];
                const effectiveName = override?.name ?? activity.name;

                const isScheduled = activity.recurrence === 'once' ? activity.date === dateKey : effectiveDays.includes(dayOfWeekName);
                const detail = activityMap.get(activity.id)!;

                if (isScheduled) {
                    totalScheduledTasks++;
                    dailyScheduled++;
                    const isCompleted = !!activity.completed?.[dateKey];
                    
                    if (isCompleted) {
                        totalCompletedTasks++;
                        dailyCompleted++;
                        dailyCompletionCounts[dayIndex]++;
                        completedMissionTally[effectiveName] = (completedMissionTally[effectiveName] || 0) + 1;
                        detail.statuses[dayIndex] = 'completed';
                    } else {
                        detail.statuses[dayIndex] = 'missed';
                    }
                }
            });

            if (dailyScheduled > 0 && dailyScheduled === dailyCompleted) {
                perfectDays++;
            }
        });

        const successRate = totalScheduledTasks > 0 ? Math.round((totalCompletedTasks / totalScheduledTasks) * 100) : 0;
        
        const mostCompletedMission = Object.entries(completedMissionTally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return {
            weeklyStats: {
                totalCompletedTasks,
                successRate,
                perfectDays,
                mostCompletedMission,
                hasTasks: totalScheduledTasks > 0,
            },
            dailyCompletionCounts,
            activityDetails: Array.from(activityMap.values()),
        };
    }, [activities, start, end]);
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const maxDailyCount = Math.max(...dashboardData.dailyCompletionCounts, 1);

    return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="Semana anterior">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 text-center">
                {capitalize(format(start, 'dd MMM', { locale: ptBR }))} - {capitalize(format(end, 'dd MMM, yyyy', { locale: ptBR }))}
            </h3>
            <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="Próxima semana">
            <ChevronRight className="w-6 h-6 text-slate-600" />
            </button>
        </div>

        {!dashboardData.weeklyStats.hasTasks ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-lg">
                <Trophy size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-extrabold text-slate-700">Nenhuma missão agendada para esta semana.</h3>
                <p className="text-slate-500 mt-1">Navegue para outras semanas ou adicione missões na aba principal.</p>
            </div>
        ) : (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<Trophy size={32} className="text-amber-500" />} value={dashboardData.weeklyStats.totalCompletedTasks} label="Missões Concluídas" color="border-amber-400 bg-amber-50" />
                    <StatCard icon={<Target size={32} className="text-green-500" />} value={`${dashboardData.weeklyStats.successRate}%`} label="Taxa de Sucesso" color="border-green-400 bg-green-50" />
                    <StatCard icon={<Award size={32} className="text-indigo-500" />} value={dashboardData.weeklyStats.perfectDays} label="Dias Perfeitos" color="border-indigo-400 bg-indigo-50" />
                    <StatCard icon={<TrendingUp size={32} className="text-sky-500" />} value={dashboardData.weeklyStats.mostCompletedMission} label="Missão Destaque" color="border-sky-400 bg-sky-50" />
                </div>
                
                <div>
                    <h4 className="text-lg font-extrabold text-slate-700 mb-4">Desempenho Diário</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-around items-end h-40">
                            {dashboardData.dailyCompletionCounts.map((count, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 w-10 text-center group">
                                    <div className="text-sm font-bold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity h-5">{count > 0 ? count : ''}</div>
                                    <div 
                                        className="w-6 bg-indigo-400 hover:bg-indigo-500 rounded-t-md transition-all duration-300"
                                        style={{ height: `${(count / maxDailyCount) * 100}%` }}
                                        title={`${count} missões concluídas`}
                                    ></div>
                                    <span className="text-xs font-bold text-slate-500">{SHORT_DAYS_OF_WEEK[index]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-extrabold text-slate-700 mb-4">Detalhes das Missões da Semana</h4>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                        {dashboardData.activityDetails.map(detail => (
                            <div key={detail.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="font-bold text-slate-800">{detail.name}</span>
                                <div className="flex justify-around items-center w-full sm:w-auto">
                                    {detail.statuses.map((status, index) => (
                                        <StatusIcon key={index} status={status} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default HistoryView;