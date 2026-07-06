import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const MinesGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [minesCount, setMinesCount] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'cashout' | 'busted'>('idle');
  const [grid, setGrid] = useState<{isMine: boolean, revealed: boolean}[]>([]);
  const [multiplier, setMultiplier] = useState(1.00);
  const [safeOpened, setSafeOpened] = useState(0);

  const start = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    // Generate grid
    const totalCells = 25;
    const newGrid = Array.from({length: totalCells}, () => ({isMine: false, revealed: false}));
    let minesPlaced = 0;
    while(minesPlaced < minesCount) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!newGrid[idx].isMine) {
        newGrid[idx].isMine = true;
        minesPlaced++;
      }
    }
    setGrid(newGrid);
    setGameState('playing');
    setMultiplier(1.00);
    setSafeOpened(0);
  };

  const handleCellClick = async (index: number) => {
    if (gameState !== 'playing' || grid[index].revealed) return;

    const newGrid = [...grid];
    newGrid[index].revealed = true;
    setGrid(newGrid);

    if (newGrid[index].isMine) {
      // Busted
      setGameState('busted');
      revealAll();
      await apiCall('casino_finish', { bet: Number(bet), payout: 0, game: 'Минное поле' });
    } else {
      // Safe
      const nextSafe = safeOpened + 1;
      setSafeOpened(nextSafe);
      
      // Calculate multiplier (simplified logic)
      const newMult = 1 + (nextSafe * (minesCount / 25)) * 1.5;
      setMultiplier(Number(newMult.toFixed(2)));
      
      // Auto win if all safe opened
      if (nextSafe === 25 - minesCount) {
        handleCashout(newMult);
      }
    }
  };

  const handleCashout = async (forcedMult?: number) => {
    if (gameState !== 'playing') return;
    setGameState('cashout');
    revealAll();
    const finalMult = forcedMult || multiplier;
    const payout = Math.floor(Number(bet) * finalMult);
    await apiCall('casino_finish', { bet: Number(bet), payout, game: 'Минное поле' });
  };

  const revealAll = () => {
    setGrid(prev => prev.map(c => ({...c, revealed: true})));
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        {gameState === 'idle' ? (
          <div className="flex flex-col gap-4">
            <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
            
            <div className="flex justify-between items-center px-1">
              <span>Кол-во мин: {minesCount}</span>
              <input type="range" min="1" max="24" value={minesCount} onChange={e => setMinesCount(Number(e.target.value))} className="w-1/2" />
            </div>
            
            <button onClick={start} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${isDarkMode ? 'bg-white text-black' : 'bg-[#131313] text-white'}`}>
              ИГРАТЬ
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <div className={`text-3xl font-black ${gameState === 'busted' ? 'text-red-500' : 'text-green-500'}`}>
              x{multiplier.toFixed(2)}
            </div>
            
            <div className="grid grid-cols-5 gap-2 w-full aspect-square">
              {grid.map((cell, i) => (
                <button
                  key={i}
                  disabled={gameState !== 'playing'}
                  onClick={() => handleCellClick(i)}
                  className={`w-full h-full rounded-lg flex items-center justify-center text-2xl transition-all
                    ${cell.revealed 
                      ? (cell.isMine ? 'bg-red-500/20' : 'bg-green-500/20')
                      : (isDarkMode ? 'bg-[#2A2A2A] hover:bg-[#333]' : 'bg-[#F2F4F5] hover:bg-[#E5E7E8]')}
                    ${gameState === 'playing' && !cell.revealed ? 'active:scale-90 cursor-pointer shadow-md' : ''}
                  `}
                >
                  {cell.revealed && (cell.isMine ? '💣' : '💎')}
                </button>
              ))}
            </div>

            {gameState === 'playing' ? (
              <button onClick={() => handleCashout()} className="w-full py-4 rounded-xl font-bold bg-green-500 text-white active:scale-95 mt-2">
                ЗАБРАТЬ {Math.floor(Number(bet) * multiplier)} D
              </button>
            ) : (
              <button onClick={() => setGameState('idle')} className={`w-full py-4 rounded-xl font-bold active:scale-95 mt-2 ${isDarkMode ? 'bg-[#333] text-white' : 'bg-gray-200 text-black'}`}>
                {gameState === 'busted' ? 'ПОПРОБОВАТЬ СНОВА' : 'ИГРАТЬ ЕЩЕ'}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
