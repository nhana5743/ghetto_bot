import { useState, useEffect } from 'react';

import { Swords, Dumbbell } from 'lucide-react';
import { Modal } from '../components/Modal';

interface CombatTabProps {
  apiCall: (action: string, payload?: any) => void;
  isDarkMode: boolean;
  config?: any;
}

export function CombatTab({ apiCall, isDarkMode, config }: CombatTabProps) {
  const [fightTarget, setFightTarget] = useState(config.users[0]);

  useEffect(() => {
    if (config.users && config.users.length > 0) {
      if (!config.users.includes(fightTarget)) setFightTarget(config.users[0]);
    }
  }, [config.users]);

  const [fightModalOpen, setFightModalOpen] = useState(false);
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [trainCooldown, setTrainCooldown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTrainCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const [fightResultText, setFightResultText] = useState('Ожидание...');

  const handleFight = async () => {
    setFightModalOpen(true);
    setFightResultText('Пишем замес...');
    const res = await apiCall('fight', { target: fightTarget });
    if (res && res.success) {
      setFightResultText(res.fight_result || res.message);
    } else {
      setFightResultText(res?.error || 'Ошибка боя');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <h2 className={`text-[28px] font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🥊 БОЙЦОВСКИЙ КЛУБ</h2>

      <div className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-center transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-[#6E8F3C] to-[#55702E] flex items-center justify-center relative shadow-inner">
          <Dumbbell className="w-10 h-10 text-white drop-shadow-md" />
        </div>
        <div>
          <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Тренировка (Кач)</h3>
          <p className={`text-[15px] px-4 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            С чем качаться будем, доходяга?
          </p>
        </div>
        <button 
          onClick={() => {
            if (trainCooldown > 0) return;
            setIsTrainModalOpen(true);
          }}
          disabled={trainCooldown > 0}
          className={`w-full mt-3 font-bold py-4 rounded-full transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.15)] text-[17px] ${trainCooldown > 0 ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'} ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
        >
          {trainCooldown > 0 ? formatTime(trainCooldown) : '💪 Тренировка (Кач)'}
        </button>
      </div>

      <div className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 rounded-[2rem] relative overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="absolute -top-4 -right-4 p-4 rotate-12 pointer-events-none opacity-[0.03]">
          <Swords className={`w-40 h-40 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
        </div>
        <h3 className={`font-bold relative z-10 flex items-center text-xl mb-5 gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
           <Swords className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
           🥊 Набить ебало
        </h3>
        <div className="flex flex-col gap-4 relative z-10">
          <select 
            value={fightTarget}
            onChange={(e) => setFightTarget(e.target.value)}
            className={`w-full rounded-[1.2rem] px-5 py-4 text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all appearance-none ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
          >
             {config.users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button 
            onClick={handleFight}
            className={`w-full border-2 font-bold py-4 rounded-full active:scale-95 transition-transform text-[17px] ${isDarkMode ? 'bg-transparent border-white text-white hover:bg-white/10' : 'bg-white border-[#131313] text-[#131313] hover:bg-gray-50'}`}
          >
            🥊 Набить ебало
          </button>
        </div>
      </div>

      <Modal isOpen={fightModalOpen} onClose={() => setFightModalOpen(false)} title="🥊 Набить ебало" isDarkMode={isDarkMode}>
        <div className="flex flex-col gap-4 mt-2">
          <div className={`p-4 rounded-xl text-[15px] leading-relaxed font-medium italic ${isDarkMode ? 'bg-[#2A2A2A] text-gray-300' : 'bg-[#F2F4F5] text-gray-700'}`}>
            {fightResultText}
          </div>
          <button 
            onClick={() => setFightModalOpen(false)}
            className={`w-full py-4 rounded-full font-bold text-[17px] active:scale-95 transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
          >
            Закрыть
          </button>
        </div>
      </Modal>

      <Modal isOpen={isTrainModalOpen} onClose={() => setIsTrainModalOpen(false)} title="💪 ВЫБОР РАСХОДНИКА ДЛЯ КАЧА" isDarkMode={isDarkMode}>
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => {
              apiCall('train');
              setIsTrainModalOpen(false);
              // Сюда будет передаваться время кулдауна из python скрипта
              setTrainCooldown(3600); 
            }}
            className={`rounded-xl p-4 flex justify-between items-center transition-colors text-left active:scale-[0.98] ${isDarkMode ? 'bg-[#2A2A2A] hover:bg-[#333333]' : 'bg-[#F2F4F5] hover:bg-[#E5E7E8]'}`}
          >
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Всухую (без расходника)</span>
            <span className={`text-[11px] px-2 py-1 rounded-md font-semibold shadow-sm ${isDarkMode ? 'bg-[#333333] text-gray-300' : 'bg-white text-gray-600'}`}>
              Всухую
            </span>
          </button>

          {config.backpack.filter(i => i.type === 'grocery').map(item => (
            <button
              key={item.id}
              onClick={() => {
                apiCall('train', { itemId: item.id });
                setIsTrainModalOpen(false);
                // Сюда будет передаваться время кулдауна из python скрипта
                setTrainCooldown(3600);
              }}
              className={`rounded-xl p-4 flex justify-between items-center transition-colors text-left active:scale-[0.98] ${isDarkMode ? 'bg-[#2A2A2A] hover:bg-[#333333]' : 'bg-[#F2F4F5] hover:bg-[#E5E7E8]'}`}
            >
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
              <span className={`text-[11px] px-2 py-1 rounded-md font-semibold shadow-sm ${isDarkMode ? 'bg-[#333333] text-gray-300' : 'bg-white text-gray-600'}`}>
                Сожрать
              </span>
            </button>
          ))}
          {config.backpack.filter(i => i.type === 'grocery').length === 0 && (
            <p className="text-center text-gray-500 py-4 font-medium text-sm">Нет подходящих предметов</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
