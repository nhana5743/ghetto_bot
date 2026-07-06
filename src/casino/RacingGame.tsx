import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SNAILS = [
  { id: 0, name: '🐌 Медляш', mult: 1.5, color: 'text-blue-500', bg: 'bg-blue-500' },
  { id: 1, name: '🐌 Турбо', mult: 2.5, color: 'text-red-500', bg: 'bg-red-500' },
  { id: 2, name: '🐌 Соник', mult: 5.0, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  { id: 3, name: '🐌 Ветерок', mult: 10.0, color: 'text-green-500', bg: 'bg-green-500' },
];

export const RacingGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [selectedSnail, setSelectedSnail] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [positions, setPositions] = useState([0, 0, 0, 0]);
  const [winner, setWinner] = useState<number | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number | null>(null);

  const startRace = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance || selectedSnail === null || isRacing) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    setIsRacing(true);
    setPositions([0, 0, 0, 0]);
    setWinner(null);
    setPayoutAmount(null);

    // Determine winner based on odds
    // Higher multiplier = lower chance. Let's do simple weighted random.
    const weights = SNAILS.map(s => 1 / s.mult);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let targetWinner = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) {
        targetWinner = i;
        break;
      }
    }

    let currentPos = [0, 0, 0, 0];
    const interval = setInterval(() => {
      let raceFinished = false;
      const newPos = [...currentPos];
      
      for (let i = 0; i < 4; i++) {
        // Winner moves faster on average
        const baseSpeed = i === targetWinner ? 4 : 2;
        newPos[i] += baseSpeed + Math.random() * 4;
        if (newPos[i] >= 100) {
          newPos[i] = 100;
          raceFinished = true;
        }
      }
      
      currentPos = newPos;
      setPositions(newPos);

      if (raceFinished) {
        clearInterval(interval);
        finishRace(targetWinner, betNum);
      }
    }, 100);
  };

  const finishRace = async (winIndex: number, betNum: number) => {
    setIsRacing(false);
    setWinner(winIndex);
    
    if (selectedSnail === winIndex) {
      const payout = Math.floor(betNum * SNAILS[winIndex].mult);
      setPayoutAmount(payout);
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Скачки' });
    } else {
      setPayoutAmount(0);
      await apiCall('casino_finish', { bet: betNum, payout: 0, game: 'Скачки' });
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-4 mb-6 shadow-inner border-2 border-[#2A2A2A] relative flex flex-col gap-2 overflow-hidden min-h-[220px]">
          
          {/* Finish Line */}
          <div className="absolute right-4 top-0 bottom-0 w-2 bg-gradient-to-b from-white via-black to-white opacity-50 repeating-linear-gradient"></div>

          {SNAILS.map((snail, i) => (
            <div key={i} className="w-full h-10 bg-gray-800/50 rounded-lg relative overflow-hidden flex items-center cursor-pointer border border-transparent hover:border-gray-500" onClick={() => !isRacing && setSelectedSnail(i)}>
              {/* Progress bar */}
              <motion.div 
                className={`absolute left-0 top-0 bottom-0 ${snail.bg} opacity-20`} 
                animate={{ width: `${positions[i]}%` }}
              />
              
              <motion.div 
                className={`absolute left-0 text-2xl z-10`}
                animate={{ left: `calc(${positions[i]}% - 30px)` }}
                transition={{ duration: 0.1 }}
              >
                {snail.name.split(' ')[0]}
              </motion.div>
              
              <div className="ml-10 z-10 flex gap-2 items-center">
                <span className={`text-xs font-bold ${snail.color}`}>{snail.name.split(' ')[1]}</span>
                <span className="text-[10px] text-gray-400">x{snail.mult}</span>
                {selectedSnail === i && <span className="text-xs">🎯</span>}
              </div>

              {winner === i && (
                <div className="absolute right-8 z-20 text-yellow-500 font-bold text-sm animate-bounce">
                  WINNER!
                </div>
              )}
            </div>
          ))}

          <AnimatePresence>
            {payoutAmount !== null && (
              <motion.div initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} className={`text-center font-black text-xl mt-2 ${payoutAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {payoutAmount > 0 ? `Твоя улитка пришла первой! +${payoutAmount} D` : 'Твоя улитка проиграла!'}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <div className="flex flex-col gap-4">
          <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)} disabled={isRacing}
            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
          
          <button onClick={startRace} disabled={isRacing || selectedSnail === null} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${isRacing || selectedSnail === null ? 'opacity-50' : ''} bg-gradient-to-r from-emerald-600 to-green-500 text-white`}>
            {isRacing ? 'СКАЧКИ ИДУТ...' : (selectedSnail === null ? 'ВЫБЕРИ УЛИТКУ' : 'СТАРТ')}
          </button>
        </div>

      </div>
    </motion.div>
  );
};
