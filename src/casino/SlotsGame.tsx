import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SYMBOLS = ['🍒', '🍋', '🍉', '💎', '7️⃣'];
const MULTIPLIERS: Record<string, number> = {
  '🍒🍒🍒': 2,
  '🍋🍋🍋': 3,
  '🍉🍉🍉': 5,
  '💎💎💎': 10,
  '7️⃣7️⃣7️⃣': 50,
};

export const SlotsGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState(['🍒', '🍒', '🍒']);
  const [resultMsg, setResultMsg] = useState('');
  const [winAmount, setWinAmount] = useState(0);

  const spin = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance || spinning) return;
    
    setResultMsg('');
    setWinAmount(0);
    setSpinning(true);

    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) {
      setSpinning(false);
      return;
    }

    // Animation frames
    let counter = 0;
    const interval = setInterval(() => {
      setSlots([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      counter++;
      if (counter > 20) {
        clearInterval(interval);
        finishSpin(betNum);
      }
    }, 50);
  };

  const finishSpin = async (betNum: number) => {
    const finalSlots = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
    setSlots(finalSlots);
    setSpinning(false);

    const key = finalSlots.join('');
    if (MULTIPLIERS[key]) {
      const payout = betNum * MULTIPLIERS[key];
      setWinAmount(payout);
      setResultMsg(`ДЖЕКПОТ! x${MULTIPLIERS[key]}`);
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Слоты' });
    } else if (finalSlots[0] === finalSlots[1] || finalSlots[1] === finalSlots[2] || finalSlots[0] === finalSlots[2]) {
      // 2 matching
      const payout = Math.floor(betNum * 1.5);
      setWinAmount(payout);
      setResultMsg(`Неплохо! x1.5`);
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Слоты' });
    } else {
      setResultMsg('Проигрыш!');
      await apiCall('casino_finish', { bet: betNum, payout: 0, game: 'Слоты' });
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className={`w-full bg-[#131313] rounded-2xl p-4 mb-6 shadow-inner border-4 ${winAmount > 0 ? 'border-yellow-500' : 'border-[#2A2A2A]'}`}>
          <div className="flex justify-between items-center bg-white dark:bg-black rounded-xl p-4 overflow-hidden">
            {slots.map((s, i) => (
              <motion.div 
                key={i} 
                animate={spinning ? { y: [0, -50, 50, 0] } : { y: 0 }}
                transition={spinning ? { repeat: Infinity, duration: 0.2, delay: i * 0.1 } : {}}
                className="text-6xl"
              >
                {s}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-center h-8">
            {resultMsg && (
              <span className={`font-black text-xl ${winAmount > 0 ? 'text-yellow-400 animate-pulse' : 'text-red-500'}`}>
                {resultMsg} {winAmount > 0 ? `(+${winAmount} D)` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)} disabled={spinning}
            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
          
          <button onClick={spin} disabled={spinning} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${spinning ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'} shadow-lg`}>
            КРУТИТЬ
          </button>
        </div>

      </div>
    </motion.div>
  );
};
