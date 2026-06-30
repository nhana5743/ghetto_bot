import { useState } from 'react';
import { User, Activity, Skull, Coins, Zap, Backpack } from 'lucide-react';

import { Modal } from '../components/Modal';

interface ProfileTabProps {
  username: string;
  firstName: string;
  isDarkMode: boolean;
  apiCall: (action: string, payload?: any) => Promise<any>;
  config?: any;
  avatar?: string;
}

export function ProfileTab({ username, firstName, avatar, isDarkMode, apiCall, config }: ProfileTabProps) {
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isInjecting, setIsInjecting] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<any>(null);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [isInjectConfirmationOpen, setIsInjectConfirmationOpen] = useState(false);

  const handlePlayerClick = async (player: string) => {
    setIsFetchingStats(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(`${API_URL}/api/user_stats?username=${player.replace('@', '')}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPlayerStats({...data.stats, username: player});
        setIsStatsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingStats(false);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsInjecting(false);
    setIsInjectConfirmationOpen(false);
    setTargetUsername('');
  };

  const handleAction = (action: string) => {
    let apiAction = action;
    if (action === 'use') {
      if (selectedItem?.type === 'grocery') apiAction = 'consume';
      if (selectedItem?.type === 'drug') apiAction = 'use_drug';
    }
    apiCall('inventory_action', { itemId: selectedItem?.id, action: apiAction, target: targetUsername });
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col h-full gap-4 pb-24">
      {/* Profile Header */}
      <button 
        onClick={() => setIsPlayersModalOpen(true)}
        className={`w-full rounded-[1.8rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4 transition-transform active:scale-[0.98] text-left ${isDarkMode ? 'bg-[#1E1E1E] hover:bg-[#252525]' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-[#6E8F3C] to-[#55702E] shadow-inner flex items-center justify-center shrink-0 overflow-hidden">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-white drop-shadow-md" />
          )}
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-xs text-gray-500 mb-0.5">{firstName}</p>
          <h2 className={`text-[22px] font-bold tracking-wide truncate leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{username}</h2>
        </div>
        <div className={`p-2 rounded-full ${isDarkMode ? 'bg-[#2A2A2A] text-gray-400' : 'bg-[#F2F4F5] text-gray-500'}`}>
          <Activity className="w-5 h-5" />
        </div>
      </button>

      {/* Addiction Card - CURRENT PLAYER */}
      <div className={`rounded-[1.5rem] p-5 flex flex-col gap-3 transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Activity className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
          <span className="text-[14px] font-semibold">Жажда дозы</span>
        </div>
        {config.stats.addiction === 0 ? (
          <span className={`text-[18px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>0%</span>
        ) : (
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center">
              <span className={`text-[15px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Жажда дозы</span>
              <span className={`text-[15px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{config.stats.addiction}%</span>
            </div>
            <div className={`w-full h-3.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-200'}`}>
              <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${config.stats.addiction}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid - CURRENT PLAYER */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}>
          <div className="flex items-center gap-2 text-gray-500">
            <Coins className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
            <span className="text-[13px] font-semibold">Баланс</span>
          </div>
          <span className={`text-[22px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{config.stats.balance} <span className="text-sm text-gray-400">D</span></span>
        </div>
        <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}>
          <div className="flex items-center gap-2 text-gray-500">
            <Zap className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
            <span className="text-[13px] font-semibold">Ловкость</span>
          </div>
          <span className={`text-[22px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{config.stats.agility}</span>
        </div>
        <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}>
          <div className="flex items-center gap-2 text-gray-500">
            <Activity className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
            <span className="text-[13px] font-semibold">Сила</span>
          </div>
          <span className={`text-[22px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{config.stats.strength}</span>
        </div>
        {config.stats.disease !== 'Чист' ? (
          <button 
            onClick={() => setIsDiseaseModalOpen(true)}
            className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors text-left active:scale-[0.98] ${isDarkMode ? 'bg-[#1E1E1E] hover:bg-[#252525]' : 'bg-white hover:bg-gray-50'} shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}
          >
            <div className="flex items-center gap-2 text-gray-500">
              <Skull className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
              <span className="text-[13px] font-semibold">Зараза</span>
            </div>
            <span className={`text-lg font-bold mt-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{config.stats.disease}</span>
          </button>
        ) : (
          <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors text-left ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}>
            <div className="flex items-center gap-2 text-gray-500">
              <Skull className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
              <span className="text-[13px] font-semibold">Зараза</span>
            </div>
            <span className={`text-lg font-bold mt-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{config.stats.disease}</span>
          </div>
        )}
      </div>

      <Modal isOpen={isPlayersModalOpen} onClose={() => setIsPlayersModalOpen(false)} title="👥 Игроки Гетто" isDarkMode={isDarkMode}>
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 mt-2">
          {config.users && config.users.length > 0 ? config.users.map((u: string) => (
            <button 
              key={u}
              onClick={() => handlePlayerClick(u)}
              disabled={isFetchingStats}
              className={`p-4 rounded-xl text-left font-bold transition-transform active:scale-[0.98] ${isDarkMode ? 'bg-[#2A2A2A] hover:bg-[#333333] text-white' : 'bg-[#F2F4F5] hover:bg-gray-200 text-gray-900'} ${isFetchingStats ? 'opacity-50' : ''}`}
            >
              {u}
            </button>
          )) : (
            <p className="text-center text-gray-500 py-4 font-medium text-sm">Нет других игроков</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={isStatsModalOpen} onClose={() => {setIsStatsModalOpen(false); setSelectedPlayerStats(null);}} title={selectedPlayerStats ? `📊 Статы ${selectedPlayerStats.username}` : "📊 Статистика"} isDarkMode={isDarkMode}>
        {selectedPlayerStats ? (
          <div className="flex flex-col gap-4 mt-2">
            <div className={`rounded-[1.5rem] p-5 flex flex-col gap-3 transition-colors ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'}`}>
              <div className="flex items-center gap-2 text-gray-500">
                <Activity className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
                <span className="text-[14px] font-semibold">Жажда дозы</span>
              </div>
              {selectedPlayerStats.addiction === 0 ? (
                <span className={`text-[18px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>0%</span>
              ) : (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-[15px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Жажда дозы</span>
                    <span className={`text-[15px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedPlayerStats.addiction}%</span>
                  </div>
                  <div className={`w-full h-3.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-300'}`}>
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${selectedPlayerStats.addiction}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'}`}>
                <div className="flex items-center gap-2 text-gray-500">
                  <Coins className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
                  <span className="text-[13px] font-semibold">Баланс</span>
                </div>
                <span className={`text-[22px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPlayerStats.balance} <span className="text-sm text-gray-400">D</span></span>
              </div>
              <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'}`}>
                <div className="flex items-center gap-2 text-gray-500">
                  <Zap className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
                  <span className="text-[13px] font-semibold">Ловкость</span>
                </div>
                <span className={`text-[22px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPlayerStats.agility}</span>
              </div>
              <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'}`}>
                <div className="flex items-center gap-2 text-gray-500">
                  <Activity className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
                  <span className="text-[13px] font-semibold">Сила</span>
                </div>
                <span className={`text-[22px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPlayerStats.strength}</span>
              </div>
              <div className={`p-5 rounded-[1.5rem] flex flex-col gap-2 transition-colors text-left ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'}`}>
                <div className="flex items-center gap-2 text-gray-500">
                  <Skull className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
                  <span className="text-[13px] font-semibold">Зараза</span>
                </div>
                <span className={`text-lg font-bold mt-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPlayerStats.disease}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">Загрузка...</div>
        )}
      </Modal>

      {/* Backpack Button */}
      <button 
        onClick={() => setIsBackpackOpen(true)}
        className={`w-full mt-2 py-4 rounded-full text-[17px] font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
      >
        <Backpack className="w-5 h-5" />
        Открыть Рюкзак
      </button>

      <Modal isOpen={isBackpackOpen} onClose={() => setIsBackpackOpen(false)} title="🎒 Рюкзак" isDarkMode={isDarkMode}>
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          {config.backpack.map((item: any) => (
            <button 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className={`rounded-xl p-4 flex justify-between items-center transition-colors text-left active:scale-[0.98] ${isDarkMode ? 'bg-[#2A2A2A] hover:bg-[#333333]' : 'bg-[#F2F4F5] hover:bg-[#E5E7E8]'}`}
            >
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
              <span className={`text-[11px] px-2 py-1 rounded-md font-semibold shadow-sm ${isDarkMode ? 'bg-[#333333] text-gray-300' : 'bg-white text-gray-600'}`}>
                {item.type === 'weapon' ? 'Оружие' : item.type === 'grocery' ? 'Жратва' : item.type === 'drug' ? 'Наркотик' : item.type}
              </span>
            </button>
          ))}
          {config.backpack.length === 0 && (
            <p className="text-center text-gray-500 py-4 font-medium text-sm">Рюкзак пуст</p>
          )}
        </div>
      </Modal>

      {/* Item Action Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.name || ''} isDarkMode={isDarkMode}>
        {!isInjecting ? (
          <div className="flex flex-col gap-3 mt-2">
            {selectedItem?.type === 'weapon' && (
              <>
                <button 
                  onClick={() => handleAction('equip')}
                  className={`w-full py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
                >
                  Экипировать
                </button>
                <button 
                  onClick={() => handleAction('drop')}
                  className={`w-full py-3.5 rounded-xl font-bold transition-transform active:scale-95 border-2 ${isDarkMode ? 'border-[#FF3333] text-[#FF3333] hover:bg-[#FF3333]/10' : 'border-red-500 text-red-500 hover:bg-red-50'}`}
                >
                  Выбросить
                </button>
              </>
            )}
            {selectedItem?.type === 'grocery' && (
              <button 
                onClick={() => handleAction('use')}
                className={`w-full py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
              >
                Использовать
              </button>
            )}
            {selectedItem?.type === 'drug' && (
              <>
                <button 
                  onClick={() => handleAction('use')}
                  className={`w-full py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
                >
                  Использовать
                </button>
                <button 
                  onClick={() => setIsInjecting(true)}
                  className={`w-full py-3.5 rounded-xl font-bold transition-transform active:scale-95 border-2 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-[#131313] text-[#131313] hover:bg-gray-50'}`}
                >
                  Уколоть другого
                </button>
              </>
            )}
          </div>
        ) : isInjectConfirmationOpen ? (
          <div className="flex flex-col gap-4 mt-2 text-center">
            <p className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Подтвердите диверсию</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Уколоть @{targetUsername} обойдется в 20,000 D. Продолжить?</p>
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setIsInjectConfirmationOpen(false)}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-[#2A2A2A] text-white hover:bg-[#333333]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Отмена
              </button>
              <button 
                onClick={() => {
                  handleAction('inject');
                  setIsInjectConfirmationOpen(false);
                }}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-[#FF3333] text-white' : 'bg-red-500 text-white'}`}
              >
                Оплатить 20k D
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Введите username жертвы:</p>
            <input 
              type="text" 
              placeholder="@username" 
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value.replace('@', ''))}
              className={`w-full rounded-[1.2rem] px-5 py-3.5 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setIsInjecting(false)}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-[#2A2A2A] text-white hover:bg-[#333333]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Назад
              </button>
              <button 
                onClick={() => {
                  if(!targetUsername) return;
                  setIsInjectConfirmationOpen(true);
                }}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
              >
                Далее
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isDiseaseModalOpen} onClose={() => setIsDiseaseModalOpen(false)} title="🏥 Лечение ЗППП" isDarkMode={isDarkMode}>
        <div className="flex flex-col gap-4 mt-2">
          <p className={`text-[15px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Прогресс лечения {config.stats.disease}:
          </p>
          <div className={`w-full h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-200'}`}>
             <div className="h-full bg-red-500 w-[30%]"></div>
          </div>
          <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>30% (Осталось 2 укола)</p>
        </div>
      </Modal>
    </div>
  );
}
