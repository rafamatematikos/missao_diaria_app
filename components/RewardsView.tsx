import React, { useState } from 'react';
import type { Reward, RedeemedReward } from '../types';
import { Gift, Trash2, PlusCircle, Pencil, Archive, CheckCircle, XCircle } from 'lucide-react';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { ptBR } from 'date-fns/locale/pt-BR';

interface RewardsViewProps {
  rewards: Reward[];
  redeemedRewards: RedeemedReward[];
  coins: number;
  onAddReward: (reward: Omit<Reward, 'id'>) => void;
  onDeleteReward: (reward: Reward) => void;
  onRedeemReward: (reward: Reward) => void;
  onEditReward: (reward: Reward) => void;
  onToggleUsed: (uniqueId: string) => void;
}

const CoinIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gold-gradient-rewards" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#gold-gradient-rewards)" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="rgba(255, 255, 255, 0.85)" />
    </svg>
);


const RewardsView: React.FC<RewardsViewProps> = ({ rewards, redeemedRewards, coins, onAddReward, onDeleteReward, onRedeemReward, onEditReward, onToggleUsed }) => {
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseInt(newRewardCost, 10);
    if (newRewardName.trim() && !isNaN(cost) && cost > 0) {
      onAddReward({ name: newRewardName.trim(), cost });
      setNewRewardName('');
      setNewRewardCost('');
    } else {
        alert('Por favor, preencha um nome válido e um custo positivo para a recompensa.');
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: 'store' | 'history', label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm sm:text-base font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        activeTab === tab
          ? 'bg-white text-indigo-600 shadow-md'
          : 'bg-transparent text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 space-y-6">
      <div className="bg-slate-200 p-1 rounded-xl flex items-center space-x-1 max-w-lg mx-auto">
        <TabButton tab="store" label="Loja de Recompensas" icon={<Gift size={18} />} />
        <TabButton tab="history" label="Resgatadas" icon={<Archive size={18} />} />
      </div>

      {activeTab === 'store' && (
        <div className="space-y-8 animate-pop-in">
          {/* Add Reward Form */}
          <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
            <h3 className="text-xl font-extrabold text-slate-700 mb-4 flex items-center gap-2">
                <PlusCircle size={24} className="text-indigo-600"/>
                Cadastrar Nova Recompensa
            </h3>
            <form onSubmit={handleAddReward} className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-grow w-full">
                    <label htmlFor="reward-name" className="block text-sm font-bold text-slate-600 mb-1">
                        Título da Recompensa
                    </label>
                    <input
                        id="reward-name"
                        type="text"
                        value={newRewardName}
                        onChange={(e) => setNewRewardName(e.target.value)}
                        placeholder="Ex: 1 hora de videogame"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white font-semibold"
                    />
                </div>
                <div className="w-full sm:w-40">
                    <label htmlFor="reward-cost" className="block text-sm font-bold text-slate-600 mb-1">
                        Custo em moedas
                    </label>
                    <input
                        id="reward-cost"
                        type="number"
                        value={newRewardCost}
                        onChange={(e) => setNewRewardCost(e.target.value)}
                        placeholder="Ex: 10"
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white font-semibold"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-indigo-600 text-white font-extrabold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-lg shadow-indigo-500/40"
                >
                    Adicionar
                </button>
            </form>
          </div>

          {/* Rewards List */}
          <div>
            {rewards.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Nenhuma recompensa cadastrada ainda.</p>
                <p className="text-slate-500 mt-1">Use o formulário acima para adicionar a primeira!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.sort((a, b) => a.cost - b.cost).map(reward => {
                  const canAfford = coins >= reward.cost;
                  return (
                    <div key={reward.id} className={`p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${canAfford ? 'bg-white shadow-md' : 'bg-slate-100'}`}>
                      <div>
                        <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-extrabold text-lg break-words flex-grow ${canAfford ? 'text-slate-800' : 'text-slate-500'}`}>{reward.name}</h4>
                            <div className="flex-shrink-0 flex items-center">
                                <button 
                                    onClick={() => onEditReward(reward)}
                                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 p-1 rounded-full transition-colors"
                                    aria-label={`Editar recompensa ${reward.name}`}
                                >
                                    <Pencil size={16}/>
                                </button>
                                <button 
                                    onClick={() => onDeleteReward(reward)}
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors"
                                    aria-label={`Remover recompensa ${reward.name}`}
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 mt-2 font-bold ${canAfford ? 'text-amber-600' : 'text-slate-400'}`}>
                            <CoinIcon className="w-6 h-6"/>
                            <span>{reward.cost}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRedeemReward(reward)}
                        disabled={!canAfford}
                        className="w-full mt-4 font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-600 text-white shadow-lg shadow-green-500/30 hover:bg-green-700 focus:ring-green-500 disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        Resgatar
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 animate-pop-in">
          <h3 className="text-xl font-extrabold text-slate-700 mb-4 flex items-center gap-2">
            <Archive size={24} className="text-indigo-600" />
            Histórico de Recompensas
          </h3>
          {redeemedRewards.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Nenhuma recompensa foi resgatada ainda.</p>
                <p className="text-slate-500 mt-1">Continue completando missões para juntar moedas!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {redeemedRewards
                    .slice()
                    .sort((a, b) => {
                      if (a.used !== b.used) {
                        return a.used ? 1 : -1;
                      }
                      return parse(b.redemptionDate, 'yyyy-MM-dd', new Date()).getTime() - parse(a.redemptionDate, 'yyyy-MM-dd', new Date()).getTime();
                    })
                    .map(reward => (
                        <div key={reward.uniqueId} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${reward.used ? 'bg-slate-100 opacity-70' : 'bg-slate-50'}`}>
                            <div className="flex-grow">
                                <p className={`font-bold text-slate-800 ${reward.used ? 'line-through' : ''}`}>{reward.name}</p>
                                <p className="text-sm text-slate-500 font-semibold mt-1">
                                    Resgatado em: {format(parse(reward.redemptionDate, 'yyyy-MM-dd', new Date()), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-2 font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                    <CoinIcon className="w-5 h-5"/>
                                    <span>{reward.cost}</span>
                                </div>
                                <button
                                    onClick={() => onToggleUsed(reward.uniqueId)}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        reward.used 
                                        ? 'bg-slate-300 text-slate-600 hover:bg-slate-400 focus:ring-slate-400' 
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow'
                                    }`}
                                    aria-label={reward.used ? `Marcar recompensa ${reward.name} como não utilizada` : `Marcar recompensa ${reward.name} como utilizada`}
                                >
                                    {reward.used ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                    <span className="whitespace-nowrap">{reward.used ? 'Usada' : 'Marcar como usada'}</span>
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RewardsView;