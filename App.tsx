import React, { useState, useEffect, useCallback } from 'react';
import type { Activity, ChildInfo, ActivityOverride, Reward, RedeemedReward } from './types';
import Header from './components/Header';
import ChildInfoForm from './components/ChildInfoForm';
import AddActivityForm from './components/AddActivityForm';
import ScheduleTable from './components/ScheduleTable';
import HistoryView from './components/HistoryView';
import EditActivityModal from './components/EditActivityModal';
import EditAgentModal from './components/EditAgentModal';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import RewardsView from './components/RewardsView';
import EditRewardModal from './components/EditRewardModal';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import { Rocket, Trophy, Plus, X, Gift } from 'lucide-react';
import { DAYS_OF_WEEK } from './constants';

// --- In-file Confirmation Modal Component ---
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel, confirmText = "Confirmar" }) => {
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
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div 
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-pop-in border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-lg font-extrabold text-slate-800 mb-2">Confirmar Ação</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg shadow-red-500/30 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

type AppStatus = 'loading' | 'welcome' | 'login' | 'createProfile' | 'main';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>('loading');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [currentView, setCurrentView] = useState<'schedule' | 'history' | 'rewards'>('schedule');
  const [activityToDelete, setActivityToDelete] = useState<{ id: string; name: string; weekStartDate?: Date } | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<{ activity: Activity; weekStartDate: Date } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAgentModalOpen, setIsDeleteAgentModalOpen] = useState(false);
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [rewardToRedeem, setRewardToRedeem] = useState<Reward | null>(null);
  const [rewardToEdit, setRewardToEdit] = useState<Reward | null>(null);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    });
  };

  
  // Effect to determine initial app state
  useEffect(() => {
    const keys = Object.keys(localStorage);
    const hasProfiles = keys.some(key => key.endsWith('_childInfo'));
    
    if (!hasProfiles) {
        setAppStatus('welcome');
    } else {
        setAppStatus('login');
    }
  }, []);

  // Load data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const savedInfo = localStorage.getItem(`${currentUser}_childInfo`);
      if (savedInfo) {
        const parsedInfo: ChildInfo = JSON.parse(savedInfo);
        if (typeof parsedInfo.coins === 'undefined') {
            parsedInfo.coins = 0; // Initialize for older profiles
        }
        if (!parsedInfo.rewards) {
          parsedInfo.rewards = [];
        }
        if (!parsedInfo.redeemedRewards) {
          parsedInfo.redeemedRewards = [];
        } else {
          // Data migration for older redeemed rewards
          parsedInfo.redeemedRewards = parsedInfo.redeemedRewards.map(rr => ({
            ...rr,
            used: rr.used ?? false,
            uniqueId: rr.uniqueId ?? `${rr.id}-${rr.redemptionDate}-${Math.random()}`
          }));
        }
        setChildInfo(parsedInfo);
      } else {
        setChildInfo(null);
      }
      
      const savedActivities = localStorage.getItem(`${currentUser}_activities`);
      setActivities(savedActivities ? JSON.parse(savedActivities) : []);
      setIsDataLoaded(true);
    } else {
      // Reset state when logging out
      setChildInfo(null);
      setActivities([]);
      setIsDataLoaded(false);
    }
  }, [currentUser]);

  // Save child info when it changes
  useEffect(() => {
    if (currentUser && isDataLoaded) {
      if (childInfo) {
        localStorage.setItem(`${currentUser}_childInfo`, JSON.stringify(childInfo));
      } else {
        localStorage.removeItem(`${currentUser}_childInfo`);
      }
    }
  }, [childInfo, currentUser, isDataLoaded]);

  const handleLogin = useCallback((username: string) => {
    setCurrentUser(username);
    setAppStatus('main');
  }, []);
  
  const handleCreateProfile = useCallback((info: ChildInfo) => {
    const trimmedName = info.name.trim();
    const existingProfiles = Object.keys(localStorage)
      .filter(key => key.endsWith('_childInfo'))
      .map(key => key.split('_')[0]);

    if (existingProfiles.map(p => p.toLowerCase()).includes(trimmedName.toLowerCase())) {
      alert('Este nome de agente já existe. Por favor, escolha outro.');
      return;
    }

    const newProfileData: ChildInfo = { ...info, name: trimmedName, coins: 0, rewards: [], redeemedRewards: [] };

    // Manually save initial data to prevent race conditions with useEffect
    localStorage.setItem(`${trimmedName}_childInfo`, JSON.stringify(newProfileData));
    localStorage.setItem(`${trimmedName}_activities`, JSON.stringify([]));

    // Now log in the newly created user
    handleLogin(trimmedName);
  }, [handleLogin]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    const hasProfiles = Object.keys(localStorage).some(key => key.endsWith('_childInfo'));
    setAppStatus(hasProfiles ? 'login' : 'welcome');
  }, []);
  
  const handleRequestNewProfile = () => setAppStatus('createProfile');

  const handleUpdateAgentInfo = useCallback((newInfo: ChildInfo) => {
    if (!currentUser || !childInfo) return;

    const trimmedNewName = newInfo.name.trim();

    // Case 1: Name is being changed
    if (trimmedNewName.toLowerCase() !== currentUser.toLowerCase()) {
        const existingProfiles = Object.keys(localStorage)
            .filter(key => key.endsWith('_childInfo') && key.split('_')[0].toLowerCase() !== currentUser.toLowerCase())
            .map(key => key.split('_')[0].toLowerCase());
        
        if (existingProfiles.includes(trimmedNewName.toLowerCase())) {
            alert('Este nome de agente já existe. Por favor, escolha outro.');
            return; // Abort update
        }

        // Rename keys in localStorage
        const activitiesData = localStorage.getItem(`${currentUser}_activities`);
        // We spread childInfo first to preserve properties like 'coins'
        const updatedInfo = { ...childInfo, ...newInfo, name: trimmedNewName };
        localStorage.setItem(`${trimmedNewName}_childInfo`, JSON.stringify(updatedInfo));
        if (activitiesData) {
            localStorage.setItem(`${trimmedNewName}_activities`, activitiesData);
        }
        
        // Remove old keys
        localStorage.removeItem(`${currentUser}_childInfo`);
        localStorage.removeItem(`${currentUser}_activities`);
        
        // Update state
        setCurrentUser(trimmedNewName);
        setChildInfo(updatedInfo);

    } else { // Case 2: Only age is updated, or name casing is changed
        const updatedInfo = { ...childInfo, ...newInfo, name: trimmedNewName };
        localStorage.setItem(`${currentUser}_childInfo`, JSON.stringify(updatedInfo));
        setChildInfo(updatedInfo);
    }

    setIsEditAgentModalOpen(false);
  }, [currentUser, childInfo]);

  const handleAddActivity = useCallback((activity: Omit<Activity, 'id' | 'completed' | 'deletedInWeeks' | 'overrides'>) => {
    setActivities(prev => {
        const newActivities = [...prev, { ...activity, id: Date.now().toString(), completed: {}, deletedInWeeks: [], overrides: {} }];
        if (currentUser) {
            localStorage.setItem(`${currentUser}_activities`, JSON.stringify(newActivities));
        }
        return newActivities;
    });
  }, [currentUser]);
  
  const requestEditWeeklyActivity = useCallback((activity: Activity, weekStartDate: Date) => {
    setActivityToEdit({ activity, weekStartDate });
  }, []);

  const handleSaveWeeklyEdit = useCallback((activityId: string, weekIdentifier: string, overrideData: ActivityOverride) => {
    setActivities(prev => {
      const newActivities = prev.map(activity => {
        if (activity.id === activityId) {
          const newOverrides = { ...(activity.overrides || {}) };
          newOverrides[weekIdentifier] = overrideData;
          return { ...activity, overrides: newOverrides };
        }
        return activity;
      });
      if (currentUser) {
          localStorage.setItem(`${currentUser}_activities`, JSON.stringify(newActivities));
      }
      return newActivities;
    });
    setActivityToEdit(null);
  }, [currentUser]);

  const requestDeleteWeeklyActivity = useCallback((id: string, name: string, weekStartDate: Date) => {
    setActivityToDelete({ id, name, weekStartDate });
  }, []);

  const confirmDeleteActivity = useCallback(() => {
    if (!activityToDelete?.weekStartDate) return;
    const weekIdentifier = format(activityToDelete.weekStartDate, 'yyyy-MM-dd');
    setActivities(prev => {
      const newActivities = prev.map(activity => {
        if (activity.id === activityToDelete.id) {
          const updatedDeletedInWeeks = Array.from(new Set([...(activity.deletedInWeeks || []), weekIdentifier]));
          return { ...activity, deletedInWeeks: updatedDeletedInWeeks };
        }
        return activity;
      });
      if (currentUser) {
        localStorage.setItem(`${currentUser}_activities`, JSON.stringify(newActivities));
      }
      return newActivities;
    });
    setActivityToDelete(null);
  }, [activityToDelete, currentUser]);

  const handleToggleComplete = useCallback((activityId: string, date: Date) => {
    let coinChange = 0;
    
    setActivities(prevActivities => {
      const activity = prevActivities.find(a => a.id === activityId);
      if (!activity) return prevActivities;

      const dateKey = format(date, 'yyyy-MM-dd');
      const wasCompletedOnDate = !!activity.completed?.[dateKey];
      const isNowBeingCompleted = !wasCompletedOnDate;

      // Determine all scheduled dates for this activity within the week of the toggled date
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
      const weekIdentifier = format(weekStart, 'yyyy-MM-dd');
      const override = activity.overrides?.[weekIdentifier];
      const effectiveDays = override?.days ?? activity.days ?? [];

      const scheduledDatesForWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })
        .filter(d => {
            if (activity.recurrence === 'once') {
                return activity.date === format(d, 'yyyy-MM-dd');
            }
            const dayOfWeekName = DAYS_OF_WEEK[d.getDay()];
            return effectiveDays.includes(dayOfWeekName);
        });

      // If activity has no scheduled occurrences this week, coin logic is irrelevant.
      if (scheduledDatesForWeek.length > 0) {
          // Check if the mission was fully completed for the week BEFORE this toggle
          const wasFullyCompleted = scheduledDatesForWeek.every(d => {
              return !!activity.completed?.[format(d, 'yyyy-MM-dd')];
          });
  
          // Check if the mission is fully completed for the week AFTER this toggle
          const isNowFullyCompleted = scheduledDatesForWeek.every(d => {
              const dKey = format(d, 'yyyy-MM-dd');
              if (dKey === dateKey) {
                  return isNowBeingCompleted; // Use the new state for the toggled date
              }
              return !!activity.completed?.[dKey]; // Use existing state for others
          });

          if (!wasFullyCompleted && isNowFullyCompleted) {
              coinChange = 1; // Mission just became fully completed for the week
          } else if (wasFullyCompleted && !isNowFullyCompleted) {
              coinChange = -1; // Mission was fully completed, but now is not
          }
      }

      // Update the activities state with the toggled completion
      const newActivities = prevActivities.map(act => {
        if (act.id === activityId) {
          const newCompleted = { ...(act.completed || {}) };
          newCompleted[dateKey] = isNowBeingCompleted;
          return { ...act, completed: newCompleted };
        }
        return act;
      });

      if (currentUser) {
        localStorage.setItem(`${currentUser}_activities`, JSON.stringify(newActivities));
      }
      return newActivities;
    });

    // Update coin count if necessary
    if (coinChange !== 0) {
      setChildInfo(prev => {
        if (!prev) return null;
        const newCoins = (prev.coins || 0) + coinChange;
        return { ...prev, coins: Math.max(0, newCoins) }; // Ensure coins don't go below 0
      });
    }
  }, [currentUser]);

  const handleDeleteCurrentAgent = () => {
    if (currentUser) {
        localStorage.removeItem(`${currentUser}_childInfo`);
        localStorage.removeItem(`${currentUser}_activities`);
    }
    setIsDeleteAgentModalOpen(false);
    handleLogout();
  }
  
  const handleAddReward = useCallback((rewardData: Omit<Reward, 'id'>) => {
    setChildInfo(prev => {
        if (!prev) return null;
        const newReward: Reward = { ...rewardData, id: Date.now().toString() };
        const updatedRewards = [...(prev.rewards || []), newReward];
        return { ...prev, rewards: updatedRewards };
    });
  }, []);

  const handleUpdateReward = useCallback((updatedReward: Reward) => {
    setChildInfo(prev => {
        if (!prev) return null;
        const updatedRewards = (prev.rewards || []).map(r => 
            r.id === updatedReward.id ? updatedReward : r
        );
        return { ...prev, rewards: updatedRewards };
    });
    setRewardToEdit(null);
  }, []);
  
  const requestDeleteReward = useCallback((reward: Reward) => {
      setRewardToDelete(reward);
  }, []);

  const confirmDeleteReward = useCallback(() => {
      if (!rewardToDelete) return;
      setChildInfo(prev => {
          if (!prev) return null;
          const updatedRewards = (prev.rewards || []).filter(r => r.id !== rewardToDelete.id);
          return { ...prev, rewards: updatedRewards };
      });
      setRewardToDelete(null);
  }, [rewardToDelete]);

  const requestRedeemReward = useCallback((reward: Reward) => {
      if ((childInfo?.coins ?? 0) < reward.cost) {
          alert("Moedas insuficientes para resgatar esta recompensa.");
          return;
      }
      setRewardToRedeem(reward);
  }, [childInfo?.coins]);

  const confirmRedeemReward = useCallback(() => {
    if (!rewardToRedeem || !childInfo) return;
    setChildInfo(prev => {
        if (!prev) return null;
        
        const newCoins = (prev.coins ?? 0) - rewardToRedeem.cost;
        
        const updatedRewards = (prev.rewards || []).filter(r => r.id !== rewardToRedeem.id);

        const newRedeemedReward: RedeemedReward = {
            ...rewardToRedeem,
            uniqueId: `${rewardToRedeem.id}-${Date.now()}`,
            redemptionDate: format(new Date(), 'yyyy-MM-dd'),
            used: false,
        };
        const updatedRedeemedRewards = [...(prev.redeemedRewards || []), newRedeemedReward];

        return { ...prev, coins: newCoins, rewards: updatedRewards, redeemedRewards: updatedRedeemedRewards };
    });
    alert(`Recompensa "${rewardToRedeem.name}" resgatada com sucesso!`);
    setRewardToRedeem(null);
  }, [rewardToRedeem, childInfo]);

  const handleToggleRewardUsedStatus = useCallback((uniqueId: string) => {
    setChildInfo(prev => {
        if (!prev || !prev.redeemedRewards) return prev;
        const updatedRedeemedRewards = prev.redeemedRewards.map(reward => {
            if (reward.uniqueId === uniqueId) {
                return { ...reward, used: !reward.used };
            }
            return reward;
        });
        return { ...prev, redeemedRewards: updatedRedeemedRewards };
    });
  }, []);

  const ViewToggleButton: React.FC<{
      view: 'schedule' | 'history' | 'rewards';
      label: string;
      icon: React.ReactElement;
  }> = ({ view, label, icon }) => {
    const sizedIcon = React.cloneElement(icon, {
        className: `w-6 h-6 sm:w-4 sm:h-4 ${icon.props.className || ''}`.trim()
    });
    
    return (
      <button
        onClick={() => setCurrentView(view)}
        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          currentView === view
            ? 'bg-white text-indigo-600 shadow-md'
            : 'bg-transparent text-slate-600 hover:text-indigo-600'
        }`}
      >
        {sizedIcon}
        <span className="text-center">{label}</span>
      </button>
    );
  };

  if (appStatus === 'loading') {
    return <div className="min-h-screen bg-background" />;
  }

  if (appStatus === 'welcome') {
    return (
        <WelcomeScreen 
            onStart={() => setAppStatus('createProfile')} 
        />
    );
  }
  
  if (appStatus === 'createProfile') {
      const getCancelProfileCreationHandler = () => {
        if (currentUser) {
            return () => setAppStatus('main');
        }
        const profilesExist = Object.keys(localStorage).some(key => key.endsWith('_childInfo'));
        if (profilesExist) {
            return () => setAppStatus('login');
        }
        return undefined;
      }
      
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <ChildInfoForm onSave={handleCreateProfile} onCancel={getCancelProfileCreationHandler()} />
      </div>
    );
  }

  if (appStatus === 'login') {
    return <LoginScreen onLogin={handleLogin} onCreateNew={() => setAppStatus('createProfile')} />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header 
          childName={childInfo?.name}
          coins={childInfo?.coins}
          onDeleteAgent={() => setIsDeleteAgentModalOpen(true)}
          onLogout={handleLogout}
          onCreateNew={handleRequestNewProfile}
          onEditAgent={() => setIsEditAgentModalOpen(true)}
          hasData={!!childInfo}
          showInstallButton={!!deferredPrompt}
          onInstall={handleInstallClick}
        />

        {!childInfo ? (
           <div className="mt-16 flex justify-center items-center">
             <ChildInfoForm onSave={(info) => setChildInfo(info)} />
           </div>
        ) : (
          <main className="mt-8">
            <div className="space-y-6">
              <div className="bg-slate-200 p-1 rounded-xl flex items-stretch sm:items-center space-x-1 w-full sm:w-auto sm:max-w-md mx-auto sm:mx-0">
                  <ViewToggleButton view="schedule" label="Missões da Semana" icon={<Rocket />} />
                  <ViewToggleButton view="history" label="Salão de Conquistas" icon={<Trophy />} />
                  <ViewToggleButton view="rewards" label="Recompensas" icon={<Gift />} />
              </div>

              {currentView === 'schedule' ? (
                <ScheduleTable 
                  activities={activities} 
                  onDelete={requestDeleteWeeklyActivity} 
                  onToggleComplete={handleToggleComplete}
                  onEdit={requestEditWeeklyActivity}
                />
              ) : currentView === 'history' ? (
                <HistoryView activities={activities} />
              ) : (
                <RewardsView
                  rewards={childInfo.rewards || []}
                  redeemedRewards={childInfo.redeemedRewards || []}
                  coins={childInfo.coins || 0}
                  onAddReward={handleAddReward}
                  onDeleteReward={requestDeleteReward}
                  onRedeemReward={requestRedeemReward}
                  onEditReward={setRewardToEdit}
                  onToggleUsed={handleToggleRewardUsedStatus}
                />
              )}
            </div>
          </main>
        )}
      </div>

      {childInfo && currentView === 'schedule' && (
        <button
            onClick={() => setIsAddModalOpen(true)}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-indigo-600 text-white rounded-full p-4 shadow-lg shadow-indigo-500/40 hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 z-40"
            aria-label="Adicionar nova missão"
        >
            <Plus size={28} strokeWidth={3} />
        </button>
       )}

      {isAddModalOpen && (
        <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => setIsAddModalOpen(false)}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-pop-in max-h-[90vh] flex flex-col border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
                  <h2 id="add-modal-title" className="text-xl font-extrabold text-slate-800">Criar Nova Missão</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors">
                      <X size={24} />
                  </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <AddActivityForm 
                    onAdd={handleAddActivity}
                />
              </div>
            </div>
        </div>
      )}

      {activityToEdit && (
        <EditActivityModal
          activity={activityToEdit.activity}
          weekStartDate={activityToEdit.weekStartDate}
          onSave={handleSaveWeeklyEdit}
          onCancel={() => setActivityToEdit(null)}
        />
      )}

      {activityToDelete && (
        <ConfirmationModal
          message={`A missão "${activityToDelete.name}" será removida apenas desta semana.`}
          onConfirm={confirmDeleteActivity}
          onCancel={() => setActivityToDelete(null)}
          confirmText="Sim, remover"
        />
      )}

      {isDeleteAgentModalOpen && (
        <ConfirmationModal
            message={`Tem certeza que deseja apagar todos os dados do agente "${currentUser}"? Esta ação não pode ser desfeita.`}
            onConfirm={handleDeleteCurrentAgent}
            onCancel={() => setIsDeleteAgentModalOpen(false)}
            confirmText="Sim, apagar tudo"
        />
      )}

      {isEditAgentModalOpen && childInfo && (
        <EditAgentModal
            currentInfo={childInfo}
            onSave={handleUpdateAgentInfo}
            onCancel={() => setIsEditAgentModalOpen(false)}
        />
      )}

      {rewardToRedeem && (
        <ConfirmationModal
            message={`Deseja resgatar a recompensa "${rewardToRedeem.name}" por ${rewardToRedeem.cost} moedas?`}
            onConfirm={confirmRedeemReward}
            onCancel={() => setRewardToRedeem(null)}
            confirmText="Sim, resgatar"
        />
      )}

      {rewardToDelete && (
          <ConfirmationModal
              message={`Tem certeza que deseja remover a recompensa "${rewardToDelete.name}"?`}
              onConfirm={confirmDeleteReward}
              onCancel={() => setRewardToDelete(null)}
              confirmText="Sim, remover"
          />
      )}
      
      {rewardToEdit && (
        <EditRewardModal
            reward={rewardToEdit}
            onSave={handleUpdateReward}
            onCancel={() => setRewardToEdit(null)}
        />
      )}
    </div>
  );
};

export default App;