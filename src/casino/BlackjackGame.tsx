import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

interface Card {
  suit: string;
  value: string;
  hidden?: boolean;
}

const getDeck = () => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calcScore = (cards: Card[]) => {
  let score = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.hidden) continue;
    if (c.value === 'A') {
      aces += 1;
      score += 11;
    } else if (['J', 'Q', 'K'].includes(c.value)) {
      score += 10;
    } else {
      score += parseInt(c.value, 10);
    }
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

export const BlackjackGame = ({ apiCall, balance, isDarkMode }: any) => {
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'dealerTurn' | 'finished'>('idle');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [message, setMessage] = useState('');
  const [payoutAmount, setPayoutAmount] = useState(0);

  const start = async () => {
    const betNum = Number(bet);
    if (!betNum || betNum <= 0 || betNum > balance) return;
    
    const res = await apiCall('casino_start', { amount: betNum });
    if (!res.success) return;

    const newDeck = getDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, { ...newDeck.pop()!, hidden: true }];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setMessage('');
    setPayoutAmount(0);
    setGameState('playing');

    if (calcScore(pHand) === 21) {
      handleBlackjack(betNum, dHand);
    }
  };

  const handleBlackjack = async (betNum: number, dHand: Card[]) => {
    setGameState('finished');
    dHand[1].hidden = false;
    setDealerHand([...dHand]);
    const dScore = calcScore(dHand);
    if (dScore === 21) {
      setMessage('Ничья (Push)');
      setPayoutAmount(betNum);
      await apiCall('casino_finish', { bet: betNum, payout: betNum, game: 'Блэкджек' });
    } else {
      setMessage('БЛЭКДЖЕК! x2.5');
      const payout = Math.floor(betNum * 2.5);
      setPayoutAmount(payout);
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Блэкджек' });
    }
  };

  const hit = async () => {
    if (gameState !== 'playing') return;
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    setDeck(newDeck);
    setPlayerHand(newHand);

    if (calcScore(newHand) > 21) {
      setGameState('finished');
      setMessage('Перебор! (Bust)');
      await apiCall('casino_finish', { bet: Number(bet), payout: 0, game: 'Блэкджек' });
    }
  };

  const stand = () => {
    if (gameState !== 'playing') return;
    setGameState('dealerTurn');
  };

  useEffect(() => {
    if (gameState === 'dealerTurn') {
      const playDealer = async () => {
        let currentDeck = [...deck];
        let dHand = [...dealerHand];
        dHand[1].hidden = false;
        
        while (calcScore(dHand) < 17) {
          dHand.push(currentDeck.pop()!);
          setDealerHand([...dHand]);
          await new Promise(r => setTimeout(r, 600)); // small delay for animation effect
        }
        
        setDeck(currentDeck);
        setDealerHand(dHand);
        finishGame(dHand);
      };
      playDealer();
    }
  }, [gameState]);

  const finishGame = async (dHand: Card[]) => {
    setGameState('finished');
    const pScore = calcScore(playerHand);
    const dScore = calcScore(dHand);
    const betNum = Number(bet);

    if (dScore > 21 || pScore > dScore) {
      setMessage('Победа!');
      const payout = betNum * 2;
      setPayoutAmount(payout);
      await apiCall('casino_finish', { bet: betNum, payout, game: 'Блэкджек' });
    } else if (pScore === dScore) {
      setMessage('Ничья (Push)');
      setPayoutAmount(betNum);
      await apiCall('casino_finish', { bet: betNum, payout: betNum, game: 'Блэкджек' });
    } else {
      setMessage('Поражение!');
      setPayoutAmount(0);
      await apiCall('casino_finish', { bet: betNum, payout: 0, game: 'Блэкджек' });
    }
  };

  const renderCard = (c: Card, i: number) => {
    if (c.hidden) {
      return (
        <motion.div initial={{scale:0}} animate={{scale:1}} key={i} className={`w-16 h-24 rounded-lg flex items-center justify-center border shadow-md -ml-8 first:ml-0 bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-700`}>
          <div className="w-12 h-20 border-2 border-white/20 rounded-md"></div>
        </motion.div>
      );
    }
    const isRed = c.suit === '♥️' || c.suit === '♦️';
    return (
      <motion.div initial={{scale:0}} animate={{scale:1}} key={i} className={`w-16 h-24 bg-white rounded-lg flex flex-col justify-between p-2 border shadow-md -ml-8 first:ml-0 ${isRed ? 'text-red-500' : 'text-black'}`}>
        <div className="text-sm font-bold leading-none">{c.value}</div>
        <div className="text-2xl text-center">{c.suit}</div>
        <div className="text-sm font-bold leading-none text-right transform rotate-180">{c.value}</div>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex flex-col items-center max-w-sm">
      <div className={`p-6 rounded-[1.8rem] w-full mb-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-lg`}>
        
        <div className="w-full bg-[#131313] rounded-2xl p-4 mb-6 shadow-inner border-2 border-[#2A2A2A] relative min-h-[220px]">
          {gameState !== 'idle' && (
            <>
              {/* Dealer */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs uppercase font-bold">Дилер</span>
                  {gameState === 'finished' && <span className="text-white text-xs">{calcScore(dealerHand)}</span>}
                </div>
                <div className="flex ml-4">
                  {dealerHand.map((c, i) => renderCard(c, i))}
                </div>
              </div>
              
              {/* Player */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs uppercase font-bold">Ты</span>
                  <span className="text-white text-xs">{calcScore(playerHand)}</span>
                </div>
                <div className="flex ml-4">
                  {playerHand.map((c, i) => renderCard(c, i))}
                </div>
              </div>
            </>
          )}

          <AnimatePresence>
            {gameState === 'finished' && (
              <motion.div initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm z-10">
                <span className={`text-2xl font-black ${payoutAmount > 0 ? (payoutAmount > Number(bet) ? 'text-green-500' : 'text-yellow-500') : 'text-red-500'}`}>
                  {message}
                </span>
                {payoutAmount > 0 && <span className="text-white font-bold mt-1">+{payoutAmount} D</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {gameState === 'idle' || gameState === 'finished' ? (
          <div className="flex flex-col gap-4">
            <input type="number" placeholder="Ставка" value={bet} onChange={e => setBet(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#131313] ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-[#F2F4F5]'}`} />
            
            <button onClick={start} className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${isDarkMode ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>
              РАЗДАТЬ
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button onClick={hit} disabled={gameState !== 'playing'} className="flex-1 py-4 rounded-xl font-bold bg-green-600 text-white active:scale-95 transition-transform disabled:opacity-50">
              ЕЩЕ
            </button>
            <button onClick={stand} disabled={gameState !== 'playing'} className="flex-1 py-4 rounded-xl font-bold bg-red-600 text-white active:scale-95 transition-transform disabled:opacity-50">
              ХВАТИТ
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
