import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SEGMENTS = [
  { mult: 0, color: '#ef4444' }, // red
  { mult: 1.5, color: '#3b82f6' }, // blue
  { mult: 0.5, color: '#6b7280' }, // gray
  { mult: 2, color: '#10b981' }, // green
  { mult: 0, color: '#ef4444' }, 
  { mult: 1.5, color: '#3b82f6' }, 
  { mult: 0.5, color: '#6b7280' }, 
  { mult: 5, color: '#eab308' }, // gold
];

export const WheelGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultMsg, setResultMsg] = useState('');
  const [winAmount, setWinAmount] = useState(0);

  const spin = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance || isSpinning) return;
    
    setResultMsg('');
    setWinAmount(0);
    setIsSpinning(true);

    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) {
      setIsSpinning(false);
      return;
    }

    // Determine target
    const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
    const sliceAngle = 360 / SEGMENTS.length;
    // Base spins (e.g. 5 full rotations = 1800 deg)
    const baseSpins = 1800;
    const targetAngle = baseSpins + (SEGMENTS.length - targetIndex) * sliceAngle - (sliceAngle / 2);

    setRotation(prev => prev + targetAngle - (prev % 360));

    // Wait for animation
    setTimeout(async () => {
      setIsSpinning(false);
      const wonMult = SEGMENTS[targetIndex].mult;
      const payout = Math.floor(betNum * wonMult);
      setWinAmount(payout);
      
      if (wonMult > 0) {
        setResultMsg(`Выигрыш! x${wonMult}`);
      } else {
        setResultMsg('Мимо!');
      }

      await apiCall('casino_finish', { bet: betNum, payout, game: 'Колесо' });
    }, 4000); // 4 seconds animation
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg overflow-hidden`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-6 mb-6 shadow-inner border-2 border-[#2A2A2A] relative flex flex-col items-center justify-center">
          
          <div className="relative w-48 h-48 mb-4">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 z-10 text-3xl">👇</div>
            
            <motion.div 
              className="w-full h-full rounded-full border-4 border-[#2A2A2A] relative overflow-hidden shadow-2xl"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.15, 0.85, 0.25, 1] }}
            >
              {SEGMENTS.map((seg, i) => {
                const angle = 360 / SEGMENTS.length;
                const rot = i * angle;
                return (
                  <div 
                    key={i} 
                    className="absolute w-[50%] h-[50%] origin-bottom-right flex items-center justify-center border-l-2 border-white/20"
                    style={{
                      backgroundColor: seg.color,
                      transform: `rotate(${rot}deg) skewY(${90 - angle}deg)`,
                      top: 0,
                      left: 0
                    }}
                  >
                    <span 
                      className="text-white font-bold text-xs"
                      style={{ transform: `skewY(-${90 - angle}deg) rotate(${angle/2}deg) translate(20px, 10px)` }}
                    >
                      x{seg.mult}
                    </span>
                  </div>
                );
              })}
              {/* Inner Circle hole */}
              <div className="absolute inset-0 m-auto w-10 h-10 bg-[#131313] rounded-full z-10 border-2 border-gray-700 shadow-inner flex items-center justify-center">
                <span className="text-[10px]">🎡</span>
              </div>
            </motion.div>
          </div>

          <div className="h-8 flex items-center justify-center">
            {resultMsg && !isSpinning && (
              <span className={`text-xl font-black ${winAmount > 0 ? 'text-green-500 animate-pulse' : 'text-red-500'}`}>
                {resultMsg} {winAmount > 0 && `(+${winAmount})`}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)} disabled={isSpinning}
            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
          
          <button onClick={spin} disabled={isSpinning} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${isSpinning ? 'opacity-50' : ''} bg-gradient-to-r from-pink-600 to-rose-500 text-white`}>
            {isSpinning ? 'КРУТИТСЯ...' : 'КРУТИТЬ КОЛЕСО'}
          </button>
        </div>

      </div>
    </motion.div>
  );
};
