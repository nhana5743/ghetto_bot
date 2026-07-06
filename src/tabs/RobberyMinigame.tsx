import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RobberyMinigameProps {
  target: string;
  isDarkMode: boolean;
  onComplete: (success: boolean) => void;
}

const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

export const RobberyMinigame: React.FC<RobberyMinigameProps> = ({ target, isDarkMode, onComplete }) => {
  const [stage, setStage] = useState<1 | 2>(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(15000);
  
  // Timer effect
  useEffect(() => {
    if ((stage === 1 && isShowingSequence) || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(interval);
          onComplete(false);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [stage, isShowingSequence, onComplete, timeLeft]);

  // Stage 1: Simon Says
  useEffect(() => {
    if (stage === 1) {
      const seq = Array.from({ length: 6 }, () => Math.floor(Math.random() * 4));
      setSequence(seq);
      
      let step = 0;
      const interval = setInterval(() => {
        if (step < seq.length) {
          setActiveColorIndex(seq[step]);
          setTimeout(() => setActiveColorIndex(null), 400);
          step++;
        } else {
          setIsShowingSequence(false);
          clearInterval(interval);
        }
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleColorClick = (idx: number) => {
    if (isShowingSequence) return;
    
    const newSeq = [...playerSequence, idx];
    setPlayerSequence(newSeq);
    
    if (newSeq[newSeq.length - 1] !== sequence[newSeq.length - 1]) {
      // Fail
      onComplete(false);
      return;
    }
    
    if (newSeq.length === sequence.length) {
      // Pass stage 1
      setIsShowingSequence(true); // Stop timer from ticking during transition
      setTimeout(() => {
        setStage(2);
        setTimeLeft(20000);
      }, 500);
    }
  };

  // Stage 2: Lockpicking
  const [pinsUnlocked, setPinsUnlocked] = useState(0);
  const [sliderPos, setSliderPos] = useState(0);
  const [sliderDir, setSliderDir] = useState(1);
  const targetPos = useRef(Math.floor(Math.random() * 60) + 20); // 20 to 80

  useEffect(() => {
    if (stage === 2) {
      const interval = setInterval(() => {
        setSliderPos((prev) => {
          let next = prev + (sliderDir * 3);
          if (next > 100) { next = 100; setSliderDir(-1); }
          if (next < 0) { next = 0; setSliderDir(1); }
          return next;
        });
      }, 15);
      return () => clearInterval(interval);
    }
  }, [stage, sliderDir]);

  const handleLockClick = () => {
    const diff = Math.abs(sliderPos - targetPos.current);
    if (diff <= 10) {
      const newUnlocked = pinsUnlocked + 1;
      setPinsUnlocked(newUnlocked);
      if (newUnlocked >= 3) {
        onComplete(true);
      } else {
        targetPos.current = Math.floor(Math.random() * 60) + 20;
      }
    } else {
      onComplete(false);
    }
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor((ms % 1000) / 100);
    return `${s}.${m}с`;
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-start pt-12 p-4 font-sans ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Ограбление {target}
      </h2>
      
      {!isShowingSequence || stage === 2 ? (
        <div className={`text-xl font-mono font-bold mb-6 ${timeLeft < 5000 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
          ⏳ {formatTime(timeLeft)}
        </div>
      ) : (
         <div className="h-13 mb-6"></div> 
      )}

      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div 
            key="stage1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <p className="mb-4 text-center text-lg font-medium">
              Этап 1: Отключение сигнализации<br/>
              <span className="text-sm opacity-70">Запомни и повтори код</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full aspect-square">
              {COLORS.map((color, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  disabled={isShowingSequence}
                  onClick={() => handleColorClick(i)}
                  className={`w-full h-full rounded-2xl shadow-lg transition-all duration-150 ${color} ${activeColorIndex === i ? 'brightness-150 scale-105' : 'brightness-75'}`}
                />
              ))}
            </div>
            <div className="mt-6 flex space-x-2">
              {sequence.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < playerSequence.length ? 'bg-green-500' : 'bg-gray-400'}`} />
              ))}
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="stage2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <p className="mb-8 text-center text-lg font-medium">
              Этап 2: Вскрытие сейфа<br/>
              <span className="text-sm opacity-70">Жми, когда ползунок в зеленой зоне!</span>
            </p>

            <div className="w-full h-12 bg-gray-300 dark:bg-gray-700 rounded-full relative mb-12 overflow-hidden shadow-inner">
              <div 
                className="absolute h-full bg-green-500/50 border-x-2 border-green-500"
                style={{ left: `${targetPos.current - 10}%`, width: '20%' }}
              />
              <div 
                className="absolute h-full w-2 bg-red-500 shadow-[0_0_10px_red] rounded-full top-0"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              />
            </div>

            <button
              onClick={handleLockClick}
              className="w-32 h-32 rounded-full bg-[#131313] dark:bg-white text-white dark:text-[#131313] font-bold text-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-90 transition-transform"
            >
              ВЗЛОМАТЬ
            </button>

            <div className="mt-8 flex space-x-3">
              {[1, 2, 3].map((pin) => (
                <div key={pin} className={`w-4 h-4 rounded-full ${pin <= pinsUnlocked ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-gray-400'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
