import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♠️', '♥️', '♦️', '♣️'];

const getDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const evaluateHand = (hand: any[]) => {
  // Simplistic evaluator just to give some payouts
  const counts: Record<string, number> = {};
  const suits: Record<string, number> = {};
  hand.forEach(c => {
    counts[c.value] = (counts[c.value] || 0) + 1;
    suits[c.suit] = (suits[c.suit] || 0) + 1;
  });

  const vals = Object.values(counts).sort((a, b) => b - a);
  const isFlush = Object.values(suits).some(c => c === 5);
  
  if (isFlush) return { name: 'Флеш', mult: 6 };
  if (vals[0] === 4) return { name: 'Каре', mult: 25 };
  if (vals[0] === 3 && vals[1] === 2) return { name: 'Фулл Хаус', mult: 9 };
  if (vals[0] === 3) return { name: 'Тройка', mult: 3 };
  if (vals[0] === 2 && vals[1] === 2) return { name: 'Две пары', mult: 2 };
  if (vals[0] === 2) {
    // Jacks or better
    const pairVal = Object.keys(counts).find(k => counts[k] === 2);
    if (['J', 'Q', 'K', 'A'].includes(pairVal || '')) {
      return { name: 'Пара Валетов+', mult: 1 }; // Push essentially
    }
  }
  return { name: 'Старшая карта', mult: 0 };
};

export const PokerGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'holding' | 'finished'>('idle');
  const [deck, setDeck] = useState<any[]>([]);
  const [hand, setHand] = useState<any[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [result, setResult] = useState<{name: string, mult: number} | null>(null);

  const start = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    const newDeck = getDeck();
    const newHand = [];
    for (let i = 0; i < 5; i++) newHand.push(newDeck.pop());
    
    setDeck(newDeck);
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setResult(null);
    setGameState('holding');
  };

  const draw = async () => {
    if (gameState !== 'holding') return;
    
    const newDeck = [...deck];
    const newHand = [...hand];
    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        newHand[i] = newDeck.pop();
      }
    }
    setHand(newHand);
    setDeck(newDeck);
    
    const res = evaluateHand(newHand);
    setResult(res);
    setGameState('finished');

    const payout = Math.floor(Number(bet) * res.mult);
    await apiCall('casino_finish', { bet: Number(bet), payout, game: 'Покер' });
  };

  const toggleHold = (i: number) => {
    if (gameState !== 'holding') return;
    const newHeld = [...held];
    newHeld[i] = !newHeld[i];
    setHeld(newHeld);
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-4 mb-6 shadow-inner border-2 border-[#2A2A2A] relative flex flex-col items-center min-h-[220px]">
          
          <div className="flex gap-2 mb-4 w-full justify-center">
            {hand.map((c, i) => {
              const isRed = c?.suit === '♥️' || c?.suit === '♦️';
              return (
                <motion.div 
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: held[i] ? -10 : 0, opacity: 1 }}
                  onClick={() => toggleHold(i)}
                  className={`relative w-[45px] h-20 bg-white rounded-md flex flex-col justify-between p-1 shadow-md border-2 shrink-0 cursor-pointer ${isRed ? 'text-red-500' : 'text-black'} ${held[i] ? 'border-yellow-400' : 'border-gray-300'}`}
                >
                  <div className="text-xs font-bold leading-none">{c?.value}</div>
                  <div className="text-xl text-center">{c?.suit}</div>
                  <div className="text-xs font-bold leading-none text-right transform rotate-180">{c?.value}</div>
                  {held[i] && <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-yellow-400 font-bold uppercase">Hold</div>}
                </motion.div>
              );
            })}
            {gameState === 'idle' && (
               <div className="w-full h-20 flex items-center justify-center text-gray-500 text-sm">Сделайте ставку</div>
            )}
          </div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{scale:0}} animate={{scale:1}} className={`text-center font-black text-xl mt-4 ${result.mult > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {result.name} {result.mult > 0 && `(x${result.mult})`}
                {result.mult > 0 && <div className="text-sm">+{Math.floor(Number(bet) * result.mult)} D</div>}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <div className="flex flex-col gap-4">
          <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)} disabled={gameState === 'holding'}
            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
          
          {gameState === 'holding' ? (
             <button onClick={draw} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform bg-gradient-to-r from-yellow-600 to-amber-500 text-white shadow-lg`}>
               ЗАМЕНИТЬ КАРТЫ
             </button>
          ) : (
            <button onClick={start} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform bg-gradient-to-r from-indigo-600 to-purple-500 text-white`}>
              СДАТЬ КАРТЫ
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};
