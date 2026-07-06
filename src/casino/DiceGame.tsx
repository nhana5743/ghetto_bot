import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const DiceGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [chance, setChance] = useState(50);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number | null>(null);

  const multiplier = (99 / chance).toFixed(2);

  const roll = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance || isRolling) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    setIsRolling(true);
    setRollResult(null);
    setPayoutAmount(null);

    // Animation fake rolls
    let ticks = 0;
    const interval = setInterval(() => {
      setRollResult(Math.floor(Math.random() * 101));
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        finishRoll(betNum);
      }
    }, 50);
  };

  const finishRoll = async (betNum: number) => {
    const finalRoll = Math.floor(Math.random() * 101); // 0 to 100
    setRollResult(finalRoll);
    setIsRolling(false);

    const won = finalRoll <= chance;
    if (won) {
      const payout = Math.floor(betNum * Number(multiplier));
      setPayoutAmount(payout);
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Кости' });
    } else {
      setPayoutAmount(0);
      await apiCall('casino_finish', { bet: betNum, payout: 0, game: 'Кости' });
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-6 mb-6 shadow-inner border-2 border-[#2A2A2A] relative flex flex-col items-center justify-center min-h-[180px]">
          <div className="text-gray-400 text-sm font-bold mb-2">РЕЗУЛЬТАТ БРОСКА</div>
          <motion.div 
            key={rollResult}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-6xl font-black ${rollResult === null ? 'text-gray-600' : (rollResult <= chance ? 'text-green-500' : 'text-red-500')}`}
          >
            {rollResult !== null ? rollResult : '00'}
          </motion.div>
          
          {payoutAmount !== null && !isRolling && (
            <div className={`mt-4 font-bold text-lg ${payoutAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {payoutAmount > 0 ? `Победа! +${payoutAmount} D` : 'Проигрыш!'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-bold text-gray-500">Шанс победы</span>
            <span className="text-lg font-black text-blue-500">{chance}%</span>
          </div>
          <input 
            type="range" 
            min="1" max="98" 
            value={chance} 
            onChange={(e) => setChance(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            disabled={isRolling}
          />
          <div className="flex justify-between items-center px-1 mb-2">
            <span className="text-sm font-bold text-gray-500">Множитель</span>
            <span className="text-lg font-black text-purple-500">x{multiplier}</span>
          </div>

          <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)} disabled={isRolling}
            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
          
          <button onClick={roll} disabled={isRolling} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${isRolling ? 'opacity-50' : ''} bg-gradient-to-r from-blue-600 to-indigo-600 text-white`}>
            {isRolling ? 'БРОСОК...' : `БРОСИТЬ < ${chance}`}
          </button>
        </div>

      </div>
    </motion.div>
  );
};
