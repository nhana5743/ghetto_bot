import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Wallet, Swords, ShoppingCart, Activity, Wrench, Sun, Moon, Settings } from 'lucide-react';
import { ProfileTab } from './tabs/ProfileTab';
import { FinancesTab } from './tabs/FinancesTab';
import { CombatTab } from './tabs/CombatTab';
import { MarketTab } from './tabs/MarketTab';
import { FeedTab } from './tabs/FeedTab';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import { DevPanel } from './DevPanel';
import { config } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [username, setUsername] = useState('@wlyrx');
  const [firstName, setFirstName] = useState('Игрок');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Dev panel state
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [devAccessDenied, setDevAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
      
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        if (tgUser.username) setUsername('@' + tgUser.username);
        if (tgUser.first_name) setFirstName(tgUser.first_name);
        if (tgUser.photo_url) setAvatar(tgUser.photo_url);
      }
      
      // Init theme from TG if available
      if (tg.colorScheme === 'dark') {
        setIsDarkMode(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const [userData, setUserData] = useState({
    stats: config.stats,
    backpack: config.backpack,
    users: config.users,
    logs: config.logs || [],
    shopCategories: config.shopCategories,
    shopItems: config.shopItems,
    jobs: config.jobs,
    server_time: Math.floor(Date.now() / 1000),
    job_timers: {}
  });

  const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin);

  const fetchUserData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const tg_id = tgUser?.id || 123456789;
      const username = (tgUser?.username || "wlyrx").replace('@', '');

      const res = await fetch(`${API_URL}/api/user?tg_id=${tg_id}&username=${username}`);
      const data = await res.json();
      
      const configRes = await fetch(`${API_URL}/api/config`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const configData = await configRes.json();
      
      const feedRes = await fetch(`${API_URL}/api/feed`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const feedData = await feedRes.json();
      
      setUserData(prev => ({
        ...prev,
        stats: data.stats || prev.stats,
        backpack: data.backpack || prev.backpack,
        users: data.users || prev.users,
        shopCategories: configData.shopCategories || prev.shopCategories,
        shopItems: configData.shopItems || prev.shopItems,
        jobs: configData.jobs || prev.jobs,
        logs: feedData.logs || prev.logs,
        server_time: data.server_time || prev.server_time,
        job_timers: data.job_timers || prev.job_timers
      }));;
      setIsLoading(false);
      
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const apiCall = async (action: string, payload?: any) => {
    try {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const tg_id = tgUser?.id || 123456789;
      const username = tgUser?.username || "wlyrx";

      const res = await fetch(`${API_URL}/api/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ tg_id, username, action, payload: payload || {} })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Успешно`);
        await fetchUserData();
      } else {
        showToast(data.error || `Ошибка`);
      }
      return data;
    } catch (e) {
      showToast("Ошибка сети");
    }
  };

  const handleDevClick = () => {
    if (username === '@wlyrx') {
      setIsDevModalOpen(true);
    } else {
      setDevAccessDenied(true);
    }
  };

  const tabs = [
    { id: 0, icon: User, label: 'Профиль' },
    { id: 1, icon: Wallet, label: 'Финансы' },
    { id: 2, icon: Swords, label: 'Бои' },
    { id: 3, icon: ShoppingCart, label: 'Маркет' },
    { id: 4, icon: Activity, label: 'Лента' },
  ];

  if (isLoading) {
    return (
      <div className={`w-full max-w-md mx-auto min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-[#F2F4F5]'} flex items-center justify-center font-sans`}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent border-gray-500 rounded-full"
        />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`w-full max-w-md mx-auto min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-[#F2F4F5]'} flex flex-col items-center justify-center font-sans p-6 text-center`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-[#3A1E1E]' : 'bg-red-100'}`}>
          <span className="text-4xl">🔌</span>
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ошибка Подключения</h2>
        <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{errorMsg || 'Сервер временно недоступен. Бот мог перезагрузиться.'}</p>
        <button 
          onClick={() => fetchUserData()}
          className={`w-full py-4 rounded-full font-bold text-[17px] active:scale-95 transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-[#F2F4F5]'} font-sans flex flex-col relative overflow-hidden transition-colors duration-300`}>
      {/* Header */}
      <div className="pt-12 px-6 flex justify-between items-center z-10 shrink-0">
        <h1 className={`text-[32px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dегенерат</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm relative active:scale-95 transition-all ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-gray-900'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleDevClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm relative active:scale-95 transition-all ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-gray-900'}`}
          >
            <Wrench className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-28 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 0 && <ProfileTab username={username} firstName={firstName} avatar={avatar} isDarkMode={isDarkMode} apiCall={apiCall} config={userData} />}
            {activeTab === 1 && <FinancesTab apiCall={apiCall} isDarkMode={isDarkMode} config={userData} />}
            {activeTab === 2 && <CombatTab apiCall={apiCall} isDarkMode={isDarkMode} config={userData} />}
            {activeTab === 3 && <MarketTab apiCall={apiCall} isDarkMode={isDarkMode} config={userData} />}
            {activeTab === 4 && <FeedTab isDarkMode={isDarkMode} config={userData} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Nav */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4.5 rounded-full flex items-center gap-8 shadow-2xl z-40 transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-[#131313]'}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center justify-center transition-transform active:scale-90"
            >
              <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`} />
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Overlays */}
      <Toast message={toastMsg} visible={toastVisible} isDarkMode={isDarkMode} />
      
      <Modal isOpen={devAccessDenied} onClose={() => setDevAccessDenied(false)} title="Системная Ошибка" isDarkMode={isDarkMode}>
        <div className="flex flex-col items-center py-4 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#3A1E1E]' : 'bg-red-100'}`}>
             <span className="text-3xl">🖕</span>
          </div>
          <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Доступ запрещен.</p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Твои пальцы слишком воняют для божественных кнопок создателя!</p>
        </div>
      </Modal>

      <DevPanel 
        isOpen={isDevModalOpen} 
        onClose={() => setIsDevModalOpen(false)} 
        apiCall={apiCall} 
        isDarkMode={isDarkMode} 
        config={userData}
      />
    </div>
  );
}
