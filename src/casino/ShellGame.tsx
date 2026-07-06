import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ShellGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'shuffling' | 'guessing' | 'revealed'>('idle');
  const [ballIndex, setBallIndex] = useState(-1);
  const [playerGuess, setPlayerGuess] = useState(-1);
  const [shells, setShells] = useState([0, 1, 2]);

  const start = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    setGameState('shuffling');
    setPlayerGuess(-1);
    
    // Animate shuffling
    let shuffles = 0;
    const interval = setInterval(() => {
      setShells(prev => {
        const next = [...prev];
        // Swap two random elements
        const i1 = Math.floor(Math.random() * 3);
        let i2 = Math.floor(Math.random() * 3);
        while (i2 === i1) i2 = Math.floor(Math.random() * 3);
        [next[i1], next[i2]] = [next[i2], next[i1]];
        return next;
      });
      
      shuffles++;
      if (shuffles > 15) {
        clearInterval(interval);
        setBallIndex(Math.floor(Math.random() * 3));
        setGameState('guessing');
      }
    }, 200);
  };

  const handleGuess = async (idx: number) => {
    if (gameState !== 'guessing') return;
    setPlayerGuess(idx);
    setGameState('revealed');
    
    const betNum = Number(bet);
    if (idx === ballIndex) {
      const payout = betNum * 3;
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Наперстки' });
    } else {
      await apiCall('casino_finish', { bet: betNum, payout: 0, game: 'Наперстки' });
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="flex justify-around items-end h-40 mb-8 border-b-4 border-[#2A2A2A] pb-4 relative">
          {shells.map((shellId, i) => (
            <motion.div
              key={shellId}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative cursor-pointer flex flex-col items-center"
              onClick={() => handleGuess(i)}
              whileHover={gameState === 'guessing' ? { y: -10 } : {}}
            >
              <motion.div 
                className="text-6xl z-10"
                animate={gameState === 'revealed' ? { y: -50 } : { y: 0 }}
              >
                🏺
              </motion.div>
              
              {/* Ball */}
              {gameState === 'revealed' && ballIndex === i && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-0 text-3xl z-0"
                >
                  🔴
                </motion.div>
              )}
              {gameState === 'revealed' && playerGuess === i && ballIndex !== i && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-0 text-3xl z-0 opacity-50"
                >
                  ❌
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {gameState === 'idle' || gameState === 'revealed' ? (
          <div className="flex flex-col gap-4">
            {gameState === 'revealed' && (
              <div className={`text-center font-bold text-xl ${playerGuess === ballIndex ? 'text-green-500' : 'text-red-500'}`}>
                {playerGuess === ballIndex ? `Победа! +${Number(bet)*3} D` : 'Мимо!'}
              </div>
            )}
            <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
            
            <button onClick={start} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${isDarkMode ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'}`}>
              {gameState === 'revealed' ? 'СЫГРАТЬ ЕЩЕ' : 'ИГРАТЬ'}
            </button>
          </div>
        ) : (
          <div className="text-center font-bold text-xl animate-pulse text-gray-500">
            {gameState === 'shuffling' ? 'Кручу-верчу...' : 'Где шарик? Выбирай!'}
          </div>
        )}
      </div>
    </motion.div>
  );
};
