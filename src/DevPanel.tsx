import { useState } from 'react';
import { Modal } from './components/Modal';


interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiCall: (action: string, payload?: any) => void;
  isDarkMode: boolean;
  config: any;
}

type ActionType = 
  | 'give_money' | 'take_money' 
  | 'heal_disease' | 'infect_disease' | 'clear_diseases'
  | 'clear_inventory' | 'give_item' 
  | 'take_shares' | 'give_shares' 
  | 'add_strength' | 'remove_strength'
  | 'add_agility' | 'remove_agility';

export function DevPanel({ isOpen, onClose, apiCall, isDarkMode, config }: DevPanelProps) {
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [step, setStep] = useState<'username' | 'item' | 'amount'>('username');
  
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleActionClick = (action: ActionType) => {
    setActiveAction(action);
    setStep('username');
    setTargetUsername('');
    setAmount('');
    setSelectedItem(null);
  };

  const handleBack = () => {
    if (step === 'amount' && (activeAction === 'give_item' || activeAction === 'give_shares')) {
      setStep('item');
    } else if (step === 'amount' || step === 'item') {
      setStep('username');
    } else {
      setActiveAction(null);
    }
  };

  const handleSubmit = () => {
    if (!targetUsername) return;
    
    // Send API call to backend (Python script will handle this)
    const payload: any = { target: targetUsername };
    
    if (['give_money', 'take_money', 'add_strength', 'remove_strength', 'add_agility', 'remove_agility'].includes(activeAction!)) {
      if (!amount) return;
      payload.amount = parseInt(amount, 10);
    }
    
    if (activeAction === 'give_item' || activeAction === 'give_shares') {
      if (!selectedItem || !amount) return;
      payload.itemId = selectedItem.id;
      payload.amount = parseInt(amount, 10);
    }

    apiCall(`dev_${activeAction}`, payload);
    setActiveAction(null);
  };

  const renderActiveAction = () => {
    if (!activeAction) return null;

    const needsAmount = ['give_money', 'take_money', 'add_strength', 'remove_strength', 'add_agility', 'remove_agility'].includes(activeAction);
    const needsItemSelection = activeAction === 'give_item' || activeAction === 'give_shares';

    if (step === 'username') {
      return (
        <div className="flex flex-col gap-4 mt-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Введите username цели (без @):</p>
          <input 
            type="text" 
            placeholder="username" 
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            className={`w-full rounded-[1.2rem] px-5 py-3.5 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
          />
          
          <div className="flex gap-3">
            <button onClick={handleBack} className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-[#2A2A2A] text-white hover:bg-[#333333]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>
              Назад
            </button>
            <button 
              onClick={() => {
                if (!targetUsername) return;
                if (needsItemSelection) {
                  setStep('item');
                } else if (needsAmount) {
                  setStep('amount');
                } else {
                  handleSubmit();
                }
              }} 
              className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
            >
              {(!needsAmount && !needsItemSelection) ? 'Подтвердить' : 'Далее'}
            </button>
          </div>
        </div>
      );
    }

    if (step === 'item' && needsItemSelection) {
      const allItems = [
        ...config.backpack,
        ...Object.values(config.shopItems).flat()
      ].filter((item: any, index, self) => index === self.findIndex((t: any) => t.id === item.id));

      const itemsList = activeAction === 'give_item' 
        ? allItems 
        : config.shopItems.business; // using business as shares

      return (
        <div className="flex flex-col gap-4 mt-2">
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Выберите объект для выдачи:</h3>
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            {itemsList.map((item: any) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setStep('amount');
                }}
                className={`p-3 rounded-xl text-left transition-colors font-medium ${isDarkMode ? 'bg-[#2A2A2A] hover:bg-[#333333] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <button onClick={handleBack} className={`mt-2 py-3.5 rounded-xl font-bold transition-colors active:scale-95 ${isDarkMode ? 'bg-[#333333] text-white' : 'bg-gray-200 text-gray-900'}`}>
            Назад
          </button>
        </div>
      );
    }

    if (step === 'amount') {
      return (
        <div className="flex flex-col gap-4 mt-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {selectedItem ? `Количество (${selectedItem.name}):` : 'Значение (кол-во):'}
          </p>
          <input 
            type="number" 
            placeholder="0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full rounded-[1.2rem] px-5 py-3.5 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
          />
          <div className="flex gap-3 mt-2">
            <button onClick={handleBack} className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-[#2A2A2A] text-white hover:bg-[#333333]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>
              Назад
            </button>
            <button onClick={handleSubmit} className={`flex-1 py-3.5 rounded-xl font-bold transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}>
              Подтвердить
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const actionButtons = [
    { id: 'give_money', label: 'Выдать деньги' },
    { id: 'take_money', label: 'Отобрать деньги' },
    { id: 'heal_disease', label: 'Снять болезни' },
    { id: 'infect_disease', label: 'Заразить болезнью' },
    { id: 'clear_inventory', label: 'Очистить инвентарь' },
    { id: 'give_item', label: 'Добавить предмет' },
    { id: 'clear_diseases', label: 'Очистить болезни' },
    { id: 'take_shares', label: 'Отобрать все акции' },
    { id: 'give_shares', label: 'Выдать акции' },
    { id: 'add_strength', label: 'Добавить силу' },
    { id: 'remove_strength', label: 'Убавить силу' },
    { id: 'add_agility', label: 'Добавить ловкость' },
    { id: 'remove_agility', label: 'Убавить ловкость' }
  ];

  const globalButtons = [
    { id: 'reset_train_cd', label: 'Сброс КД тренировки (Всем)' },
    { id: 'reset_allowance_cd', label: 'Сброс КД пособия (Всем)' },
    { id: 'reset_addiction', label: 'Сброс жажды дозы (Всем)' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setActiveAction(null); }} title="🛠 DEV PANEL" isDarkMode={isDarkMode}>
      {!activeAction ? (
        <div className="flex flex-col gap-6 mt-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1 pb-4">
          <div>
            <h3 className={`font-bold text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Действия с игроками:</h3>
            <div className="flex flex-row flex-wrap gap-2">
              {actionButtons.map(btn => (
                <button 
                  key={btn.id}
                  onClick={() => handleActionClick(btn.id as ActionType)} 
                  className={`px-3 py-2 rounded-lg font-medium text-[13px] transition-colors whitespace-nowrap active:scale-95 ${isDarkMode ? 'bg-[#2A2A2A] text-white hover:bg-[#333333]' : 'bg-[#F2F4F5] text-gray-900 hover:bg-[#E5E7E8]'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className={`font-bold text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Глобальные действия:</h3>
            <div className="flex flex-col gap-2">
              {globalButtons.map(btn => (
                <button 
                  key={btn.id}
                  onClick={() => apiCall(`dev_${btn.id}`)} 
                  className={`w-full p-3 rounded-xl font-bold text-[14px] text-center transition-colors active:scale-[0.98] ${isDarkMode ? 'bg-[#3A2E1E] text-[#FFD700] hover:bg-[#4A3A25]' : 'bg-[#FFF9E5] text-[#B8860B] hover:bg-[#FFF0B2]'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        renderActiveAction()
      )}
    </Modal>
  );
}
