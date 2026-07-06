import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const CrashGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'cashed_out'>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [payout, setPayout] = useState(0);

  const start = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    // Generate crash point (house edge: 5% instant crash at 1.00x)
    const e = 100;
    const h = Math.random() * 100;
    let cp = 1.00;
    if (h >= 5) {
      cp = Math.max(1.00, (100 / (100 - h)) * 0.95);
      // Cap at 1000x
      if (cp > 1000) cp = 1000;
    }
    setCrashPoint(cp);
    setMultiplier(1.00);
    setGameState('playing');
  };

  useEffect(() => {
    let interval: any;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setMultiplier(prev => {
          // Exponential growth
          const next = prev + (prev * 0.05);
          if (next >= crashPoint) {
            clearInterval(interval);
            handleCrash();
            return crashPoint;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, crashPoint]);

  const handleCrash = async () => {
    setGameState('crashed');
    await apiCall('casino_finish', { bet: Number(bet), payout: 0, game: 'Краш' });
  };

  const cashout = async () => {
    if (gameState !== 'playing') return;
    setGameState('cashed_out');
    const finalPayout = Math.floor(Number(bet) * multiplier);
    setPayout(finalPayout);
    await apiCall('casino_finish', { bet: Number(bet), payout: finalPayout, game: 'Краш' });
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        {gameState === 'idle' ? (
          <div className="flex flex-col gap-4">
            <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
            
            <button onClick={start} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${isDarkMode ? 'bg-white text-black' : 'bg-[#131313] text-white'}`}>
              СТАРТ
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-center w-full">
            <div className={`relative w-full h-48 rounded-xl flex items-center justify-center overflow-hidden
              ${gameState === 'crashed' ? 'bg-red-500/10' : (gameState === 'cashed_out' ? 'bg-green-500/10' : (isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'))}
            `}>
              {/* Simple visual curve */}
              <svg className="absolute bottom-0 left-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d={`M 0 100 Q 50 ${100 - Math.min(100, (multiplier/3)*100)} 100 ${100 - Math.min(100, multiplier*10)}`} fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              
              <div className="flex flex-col items-center z-10">
                <span className={`text-5xl font-black font-mono tracking-tighter
                  ${gameState === 'crashed' ? 'text-red-500' : (gameState === 'cashed_out' ? 'text-green-500' : (isDarkMode ? 'text-white' : 'text-gray-900'))}
                `}>
                  {multiplier.toFixed(2)}x
                </span>
                {gameState === 'crashed' && <span className="text-red-500 font-bold mt-2">CRASHED</span>}
                {gameState === 'cashed_out' && <span className="text-green-500 font-bold mt-2">+{payout} D</span>}
              </div>
            </div>

            {gameState === 'playing' ? (
              <button onClick={cashout} className="w-full py-4 rounded-xl font-bold bg-green-500 text-white active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                ВЫВЕСТИ {Math.floor(Number(bet) * multiplier)} D
              </button>
            ) : (
              <button onClick={() => setGameState('idle')} className={`w-full py-4 rounded-xl font-bold active:scale-95 mt-2 ${isDarkMode ? 'bg-[#333] text-white' : 'bg-gray-200 text-black'}`}>
                {gameState === 'crashed' ? 'ПОПРОБОВАТЬ СНОВА' : 'ИГРАТЬ ЕЩЕ'}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
