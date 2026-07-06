import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ROWS = 8;
const COLS = 4;

export const TowerGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'busted' | 'cashed_out'>('idle');
  const [currentRow, setCurrentRow] = useState(0); // 0 is bottom, ROWS-1 is top
  
  // Each row has one bomb. 0 to COLS-1 indicates bomb position.
  const [bombs, setBombs] = useState<number[]>([]);
  // Store player's choice per row.
  const [choices, setChoices] = useState<number[]>(Array(ROWS).fill(-1));
  const [multiplier, setMultiplier] = useState(1.0);

  const start = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    // Generate bombs
    const newBombs = [];
    for (let i = 0; i < ROWS; i++) {
      newBombs.push(Math.floor(Math.random() * COLS));
    }
    setBombs(newBombs);
    setChoices(Array(ROWS).fill(-1));
    setCurrentRow(0);
    setMultiplier(1.0);
    setGameState('playing');
  };

  const pick = async (colIndex: number) => {
    if (gameState !== 'playing') return;

    const newChoices = [...choices];
    newChoices[currentRow] = colIndex;
    setChoices(newChoices);

    if (bombs[currentRow] === colIndex) {
      // Boom
      setGameState('busted');
      await apiCall('casino_finish', { bet: Number(bet), payout: 0, game: 'Башня' });
    } else {
      // Safe
      const nextRow = currentRow + 1;
      const nextMult = Number((multiplier * 1.35).toFixed(2));
      setMultiplier(nextMult);

      if (nextRow >= ROWS) {
        // Reached top! Auto cashout
        setGameState('cashed_out');
        const payout = Math.floor(Number(bet) * nextMult);
        await apiCall('casino_finish', { bet: Number(bet), payout, game: 'Башня' });
      } else {
        setCurrentRow(nextRow);
      }
    }
  };

  const cashout = async () => {
    if (gameState !== 'playing' || currentRow === 0) return;
    setGameState('cashed_out');
    const payout = Math.floor(Number(bet) * multiplier);
    await apiCall('casino_finish', { bet: Number(bet), payout, game: 'Башня' });
  };

  const rowsRender = [];
  for (let r = ROWS - 1; r >= 0; r--) {
    const isActive = r === currentRow && gameState === 'playing';
    const isPast = r < currentRow || gameState !== 'playing';
    const bombCol = bombs[r];
    const choiceCol = choices[r];

    rowsRender.push(
      <div key={r} className={`flex gap-2 w-full mb-2 ${isActive ? 'ring-2 ring-blue-500 rounded-lg p-1 bg-blue-500/10' : 'p-1'}`}>
        <div className="w-10 text-xs text-gray-500 font-bold flex items-center justify-center shrink-0">
          x{(1.35 ** (r + 1)).toFixed(2)}
        </div>
        {Array.from({ length: COLS }).map((_, c) => {
          let content = '';
          let bg = 'bg-gray-700/50';
          
          if (isPast && choiceCol !== -1) {
            // Row played
            if (choiceCol === c) {
              if (bombCol === c) {
                content = '💥';
                bg = 'bg-red-500';
              } else {
                content = '💎';
                bg = 'bg-green-500';
              }
            } else if (bombCol === c && (gameState === 'busted' || gameState === 'cashed_out')) {
              // Reveal bomb
              content = '💣';
              bg = 'bg-gray-800 opacity-50';
            } else {
              bg = 'bg-gray-800 opacity-50';
            }
          } else if (isActive) {
            bg = 'bg-blue-600 hover:bg-blue-500 cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.5)]';
          }

          return (
            <motion.div 
              key={c}
              whileTap={isActive ? { scale: 0.9 } : {}}
              onClick={() => isActive && pick(c)}
              className={`flex-1 h-10 rounded-md flex items-center justify-center text-xl transition-colors ${bg}`}
            >
              {content}
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-4 mb-6 shadow-inner border-2 border-[#2A2A2A] relative flex flex-col">
          {gameState === 'busted' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/80 px-6 py-2 rounded-xl text-2xl font-black text-red-500 border-2 border-red-500 rotate-12 backdrop-blur-sm">
              ПРОИГРЫШ
            </div>
          )}
          {gameState === 'cashed_out' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/80 px-6 py-2 rounded-xl text-2xl font-black text-green-500 border-2 border-green-500 -rotate-6 backdrop-blur-sm shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              +{Math.floor(Number(bet) * multiplier)} D
            </div>
          )}
          
          <div className="flex flex-col">
            {rowsRender}
          </div>
        </div>

        {gameState === 'idle' || gameState === 'busted' || gameState === 'cashed_out' ? (
          <div className="flex flex-col gap-4">
            <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
            
            <button onClick={start} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform bg-gradient-to-r from-blue-600 to-cyan-500 text-white`}>
              НАЧАТЬ ПОДЪЕМ
            </button>
          </div>
        ) : (
          <button 
            onClick={cashout} 
            disabled={currentRow === 0}
            className={`w-full py-4 rounded-xl font-black active:scale-95 transition-transform text-white ${currentRow === 0 ? 'bg-gray-600 opacity-50' : 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
          >
            ЗАБРАТЬ {Math.floor(Number(bet) * multiplier)} D
          </button>
        )}
      </div>
    </motion.div>
  );
};
