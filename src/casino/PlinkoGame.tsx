import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROWS = 8;
const MULTIPLIERS = [10, 3, 1.5, 0.5, 0.2, 0.5, 1.5, 3, 10]; // 9 buckets for 8 rows

export const PlinkoGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [balls, setBalls] = useState<any[]>([]);
  const [ballIdCounter, setBallIdCounter] = useState(0);

  const dropBall = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    // Simulate path: 8 steps. 0 = left, 1 = right
    let path = [];
    let position = 0; // x-offset
    for (let i = 0; i < ROWS; i++) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      position += dir;
      path.push(position);
    }
    
    // final position determines bucket
    // min position = -8, max = +8
    // mapped to 0..8
    const bucketIndex = (position + ROWS) / 2;
    const mult = MULTIPLIERS[bucketIndex];

    const newBall = {
      id: ballIdCounter,
      path,
      mult,
      betNum,
      bucketIndex
    };
    
    setBallIdCounter(prev => prev + 1);
    setBalls(prev => [...prev, newBall]);

    // Cleanup and payout after animation (approx 2s)
    setTimeout(async () => {
      setBalls(prev => prev.filter(b => b.id !== newBall.id));
      const payout = Math.floor(betNum * mult);
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Плинко' });
    }, 2500);
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-4 mb-6 shadow-inner border-2 border-[#2A2A2A] relative flex flex-col items-center justify-start min-h-[280px] overflow-hidden">
          
          <div className="relative w-full h-[200px] flex justify-center pt-2">
            {/* Draw Pegs */}
            {Array.from({length: ROWS}).map((_, rowIndex) => (
              <div key={rowIndex} className="absolute flex gap-6" style={{ top: `${rowIndex * 24}px` }}>
                {Array.from({length: rowIndex + 3}).map((_, colIndex) => (
                  <div key={colIndex} className="w-2 h-2 rounded-full bg-gray-600 shadow-[0_0_5px_rgba(255,255,255,0.2)]"></div>
                ))}
              </div>
            ))}

            {/* Balls Animation */}
            <AnimatePresence>
              {balls.map(ball => {
                const anims = ball.path.map((pos: number, i: number) => ({
                  x: pos * 12, // 12px per step
                  y: (i + 1) * 24
                }));

                return (
                  <motion.div
                    key={ball.id}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: [0, ...anims.map((a: any) => a.x)],
                      y: [0, ...anims.map((a: any) => a.y)]
                    }}
                    transition={{
                      duration: 2,
                      ease: "linear",
                      times: [0, ...ball.path.map((_: any, i: number) => (i + 1) / ROWS)]
                    }}
                    className="absolute top-2 w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,1)] z-10"
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* Buckets */}
          <div className="absolute bottom-2 w-full flex justify-center gap-1 px-2">
            {MULTIPLIERS.map((m, i) => {
              const color = m >= 10 ? 'bg-red-500' : m >= 3 ? 'bg-orange-500' : m >= 1.5 ? 'bg-yellow-500' : 'bg-gray-600';
              return (
                <div key={i} className={`flex-1 h-8 ${color} rounded-sm flex items-center justify-center text-[10px] font-bold text-white shadow-inner`}>
                  x{m}
                </div>
              );
            })}
          </div>

        </div>

        <div className="flex flex-col gap-4">
          <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
          
          <button onClick={dropBall} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]`}>
            БРОСИТЬ ШАРИК
          </button>
        </div>

      </div>
    </motion.div>
  );
};
