import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♠️', '♥️', '♦️', '♣️'];

const getRandomCard = () => {
  const value = VALUES[Math.floor(Math.random() * VALUES.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { value, suit, weight: VALUES.indexOf(value) };
};

export const HiLoGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'busted'>('idle');
  const [currentCard, setCurrentCard] = useState(getRandomCard());
  const [history, setHistory] = useState<{value: string, suit: string, weight: number}[]>([]);
  const [multiplier, setMultiplier] = useState(1.0);

  const start = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    setCurrentCard(getRandomCard());
    setHistory([]);
    setMultiplier(1.0);
    setGameState('playing');
  };

  const guess = async (isHigh: boolean) => {
    if (gameState !== 'playing') return;
    
    const nextCard = getRandomCard();
    const isSame = nextCard.weight === currentCard.weight;
    const correctHigh = nextCard.weight > currentCard.weight;
    const correctLow = nextCard.weight < currentCard.weight;

    const won = isSame || (isHigh ? correctHigh : correctLow);

    if (won) {
      // Calculate odds based on current card
      let prob = 0.5;
      if (isHigh) {
        prob = (VALUES.length - currentCard.weight) / VALUES.length;
      } else {
        prob = (currentCard.weight + 1) / VALUES.length;
      }
      // Max out to prevent crazy values, add base 0.1 for same card case
      prob = Math.max(0.1, prob);
      
      const addedMult = 0.95 / prob; // house edge included
      const nextMult = Number((multiplier * (1 + (addedMult - 1) * 0.2)).toFixed(2));
      
      setHistory([...history, currentCard]);
      setCurrentCard(nextCard);
      setMultiplier(nextMult);
    } else {
      setHistory([...history, currentCard]);
      setCurrentCard(nextCard);
      setGameState('busted');
      await apiCall('casino_finish', { bet: Number(bet), payout: 0, game: 'Больше Меньше' });
    }
  };

  const cashout = async () => {
    if (gameState !== 'playing') return;
    const betNum = Number(bet);
    const payout = Math.floor(betNum * multiplier);
    setGameState('idle');
    await apiCall('casino_finish', { bet: betNum, payout, game: 'Больше Меньше' });
  };

  const renderCard = (c: any, index?: number) => {
    const isRed = c.suit === '♥️' || c.suit === '♦️';
    return (
      <motion.div 
        key={index ?? 'current'}
        initial={index === undefined ? { y: -50, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        className={`w-20 h-28 bg-white rounded-xl flex flex-col justify-between p-2 shadow-lg border-2 border-gray-200 shrink-0 ${isRed ? 'text-red-500' : 'text-black'}`}
      >
        <div className="text-lg font-bold leading-none">{c.value}</div>
        <div className="text-3xl text-center">{c.suit}</div>
        <div className="text-lg font-bold leading-none text-right transform rotate-180">{c.value}</div>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-4 mb-6 shadow-inner border-2 border-[#2A2A2A] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-bold">Множитель:</span>
            <span className={`text-xl font-black ${gameState === 'busted' ? 'text-red-500' : 'text-green-400'}`}>x{multiplier.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-center h-32 relative">
            {gameState === 'busted' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                <span className="text-3xl font-black text-red-500 transform -rotate-12 border-4 border-red-500 p-2 rounded-lg">BUSTED</span>
              </div>
            )}
            {renderCard(currentCard)}
          </div>

          {history.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 custom-scrollbar opacity-50 scale-75 origin-left">
              {history.map((c, i) => renderCard(c, i))}
            </div>
          )}
        </div>

        {gameState === 'idle' || gameState === 'busted' ? (
          <div className="flex flex-col gap-4">
            <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
            
            <button onClick={start} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform bg-gradient-to-r from-yellow-500 to-orange-500 text-white`}>
              ИГРАТЬ
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button onClick={() => guess(true)} className="flex-1 py-4 rounded-xl font-bold bg-gray-700 text-white active:scale-95 transition-transform flex flex-col items-center leading-tight">
                <span className="text-2xl">⬆️</span>
                <span className="text-xs">Выше или равно</span>
              </button>
              <button onClick={() => guess(false)} className="flex-1 py-4 rounded-xl font-bold bg-gray-700 text-white active:scale-95 transition-transform flex flex-col items-center leading-tight">
                <span className="text-2xl">⬇️</span>
                <span className="text-xs">Ниже или равно</span>
              </button>
            </div>
            <button onClick={cashout} className="w-full py-4 rounded-xl font-black active:scale-95 transition-transform bg-green-500 text-white">
              ЗАБРАТЬ {Math.floor(Number(bet) * multiplier)} D
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
