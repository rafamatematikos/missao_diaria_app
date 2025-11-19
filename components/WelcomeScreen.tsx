import React from 'react';
import { Rocket, CheckCircle, Gift, Trophy } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200 animate-pop-in text-center">
        <Rocket className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
          Bem-vindo à Missão Diária!
        </h1>
        <p className="text-slate-600 mt-4 text-base sm:text-lg">
          Transforme tarefas em aventuras! Ajude seus pequenos agentes a completarem missões, ganharem moedas e resgatarem recompensas incríveis.
        </p>

        <ul className="text-left space-y-3 mt-8 text-slate-700">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span>Crie <strong className="font-bold">missões personalizadas</strong> para a rotina da semana.</span>
          </li>
          <li className="flex items-start">
            <Gift className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span>Ganhe <strong className="font-bold">moedas</strong> ao completar missões e troque por <strong className="font-bold">recompensas</strong>.</span>
          </li>
           <li className="flex items-start">
            <Trophy className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span>Acompanhe o <strong className="font-bold">desempenho</strong> no nosso Salão de Conquistas.</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span>Gerencie múltiplos <strong className="font-bold">perfis de agentes</strong> em um só lugar.</span>
          </li>
        </ul>

        <button
          onClick={onStart}
          className="w-full mt-10 bg-indigo-600 text-white font-extrabold py-4 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-lg shadow-indigo-500/40 text-lg"
        >
          Começar a Aventura!
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
