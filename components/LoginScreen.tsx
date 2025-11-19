import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Rocket } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  onCreateNew: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onCreateNew }) => {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const keys = Object.keys(localStorage);
      const profileNames = new Set<string>();
      keys.forEach(key => {
        if (key.endsWith('_childInfo')) {
          const profile = key.split('_')[0];
          if (profile) {
              profileNames.add(profile);
          }
        }
      });
      setProfiles(Array.from(profileNames));
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);
  
  const handleProfileSelect = (profile: string) => {
    onLogin(profile);
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 animate-pop-in">
        <div className="text-center">
            <Rocket className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-extrabold text-slate-800">Missão Diária</h1>
            <p className="text-slate-500 mt-2">Bem-vindo de volta à Central!</p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Users size={20} /> Selecionar Agente</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {profiles.map(profile => (
              <button
                key={profile}
                onClick={() => handleProfileSelect(profile)}
                className="w-44 text-center p-4 bg-slate-100 text-slate-800 font-bold rounded-lg hover:bg-indigo-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                {profile}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm font-semibold text-slate-500">OU</span>
              </div>
            </div>
            <button
                onClick={onCreateNew}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-extrabold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-lg shadow-indigo-500/40"
            >
                <UserPlus size={20} />
                Recrutar Novo Agente
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;