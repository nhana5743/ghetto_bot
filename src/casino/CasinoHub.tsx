import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MinesGame } from './MinesGame';
import { CrashGame } from './CrashGame';
import { SlotsGame } from './SlotsGame';
import { ShellGame } from './ShellGame';
import { BlackjackGame } from './BlackjackGame';
import { PlinkoGame } from './PlinkoGame';
import { HiLoGame } from './HiLoGame';
import { TowerGame } from './TowerGame';
import { WheelGame } from './WheelGame';
import { DiceGame } from './DiceGame';
import { PokerGame } from './PokerGame';
import { RacingGame } from './RacingGame';

interface CasinoHubProps {
  isDarkMode: boolean;
  onClose: () => void;
  apiCall: (action: string, payload?: any) => Promise<any>;
  balance: number;
}

export const CasinoHub: React.FC<CasinoHubProps> = ({ isDarkMode, onClose, apiCall, balance }) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'mines' | 'crash' | 'slots' | 'shell' | 'blackjack' | 'plinko' | 'hilo' | 'tower' | 'wheel' | 'dice' | 'poker' | 'racing'>('hub');

  const games = [
    { id: 'mines', name: 'Минное поле', icon: '💣', color: 'from-red-500 to-orange-500', desc: 'Открывай ячейки, не нарвись на мину' },
    { id: 'tower', name: 'Башня', icon: '🏰', color: 'from-blue-600 to-cyan-500', desc: 'Поднимайся выше за большим множителем' },
    { id: 'crash', name: 'Краш', icon: '🚀', color: 'from-blue-500 to-indigo-500', desc: 'Забери деньги до обвала графика' },
    { id: 'dice', name: 'Кости', icon: '🎲', color: 'from-indigo-500 to-purple-600', desc: 'Установи шанс победы и брось кости' },
    { id: 'plinko', name: 'Плинко', icon: '🔮', color: 'from-pink-500 to-rose-500', desc: 'Сбрось шарик в ячейку с джекпотом' },
    { id: 'wheel', name: 'Колесо Фортуны', icon: '🎡', color: 'from-fuchsia-500 to-pink-500', desc: 'Крути колесо и забирай выигрыш' },
    { id: 'blackjack', name: 'Блэкджек', icon: '🃏', color: 'from-emerald-600 to-teal-600', desc: 'Обыграй дилера и собери 21' },
    { id: 'poker', name: 'Видео Покер', icon: '♣️', color: 'from-purple-600 to-indigo-600', desc: 'Собери лучшую покерную комбинацию' },
    { id: 'hilo', name: 'Больше-Меньше', icon: '📈', color: 'from-yellow-500 to-orange-500', desc: 'Угадай следующую карту' },
    { id: 'shell', name: 'Наперстки', icon: '🏺', color: 'from-green-500 to-emerald-500', desc: 'Угадай, где спрятан шарик' },
    { id: 'slots', name: 'Слоты', icon: '🎰', color: 'from-purple-500 to-fuchsia-500', desc: 'Крути барабаны и лови джекпот' },
    { id: 'racing', name: 'Скачки', icon: '🐌', color: 'from-lime-500 to-green-500', desc: 'Поставь на быстрейшую улитку' },
  ];

  return (
    <div className={`w-full h-full flex flex-col items-center justify-start pt-6 p-4 pb-20 font-sans overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      <div className="w-full flex justify-between items-center mb-6 px-2 shrink-0">
        <button 
          onClick={() => activeGame === 'hub' ? onClose() : setActiveGame('hub')}
          className="text-lg font-bold p-2 active:scale-90 transition-transform"
        >
          {activeGame === 'hub' ? '← Назад' : '← В Казино'}
        </button>
        <div className="font-bold text-lg">💰 {balance} D</div>
      </div>

      <AnimatePresence mode="wait">
        {activeGame === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <h2 className="text-3xl font-black mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              КАЗИНО
            </h2>
            
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id as any)}
                className={`w-full rounded-[1.8rem] p-6 flex items-center gap-4 shadow-lg active:scale-95 transition-transform bg-gradient-to-br ${game.color} text-white relative overflow-hidden`}
              >
                <div className="text-4xl z-10">{game.icon}</div>
                <div className="flex flex-col items-start z-10 text-left">
                  <span className="text-xl font-bold">{game.name}</span>
                  <span className="text-sm opacity-80">{game.desc}</span>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              </button>
            ))}
          </motion.div>
        )}

        {activeGame === 'mines' && <MinesGame key="mines" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'crash' && <CrashGame key="crash" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'blackjack' && <BlackjackGame key="blackjack" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'slots' && <SlotsGame key="slots" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'shell' && <ShellGame key="shell" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'plinko' && <PlinkoGame key="plinko" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'hilo' && <HiLoGame key="hilo" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'tower' && <TowerGame key="tower" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'wheel' && <WheelGame key="wheel" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'dice' && <DiceGame key="dice" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'poker' && <PokerGame key="poker" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
        {activeGame === 'racing' && <RacingGame key="racing" apiCall={apiCall} isDarkMode={isDarkMode} balance={balance} />}
      </AnimatePresence>
    </div>
  );
};
