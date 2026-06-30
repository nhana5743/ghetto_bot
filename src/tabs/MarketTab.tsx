import { useState } from 'react';

import { ShoppingCart, ChevronLeft } from 'lucide-react';

interface MarketTabProps {
  apiCall: (action: string, payload?: any) => Promise<any>;
  isDarkMode: boolean;
  config?: any;
}

export function MarketTab({ apiCall, isDarkMode, config }: MarketTabProps) {
  const [activeCategory, setActiveCategory] = useState<any>(null);

  const gradients = [
    'from-[#38513B] to-[#2A3E2D]',
    'from-[#D97736] to-[#B85D24]',
    'from-[#6E8F3C] to-[#55702E]',
    'from-[#1A1A1A] to-[#131313]'
  ];

  if (activeCategory) {
    let items = (config.shopItems as any)[activeCategory.id] || [];
    
    if (activeCategory.id === 'rehab') {
      const addiction = config.stats.addiction || 0;
      if (addiction === 0) {
        items = [];
      } else {
        items = items.map((item: any) => ({ ...item, price: addiction * 100 }));
      }
    }

    const extractEmoji = (text: string) => {
      const match = text.match(/([\p{Emoji_Presentation}\p{Extended_Pictographic}])/u);
      return match ? match[0] : '🛍️';
    };

    const stripEmoji = (text: string) => {
      return text.replace(/([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu, '').trim();
    };

    return (
      <div className="flex flex-col gap-6 pb-24 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`p-2 -ml-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#2A2A2A] text-white' : 'hover:bg-gray-200 text-gray-900'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
             <h2 className={`text-[28px] font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeCategory.name}</h2>
             <p className={`text-[13px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activeCategory.desc}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {items.map((item: any, index: number) => {
            const grad = gradients[index % gradients.length];
            return (
              <div key={item.id} className={`rounded-[1.8rem] p-3 flex flex-col relative shadow-[0_4px_20px_rgba(0,0,0,0.03)] group cursor-pointer transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`} onClick={() => apiCall('buy', { itemId: item.id })}>
                <div className={`w-full aspect-square rounded-[1.3rem] bg-gradient-to-br ${grad} flex items-center justify-center relative shadow-inner`}>
                  <span className={`absolute top-2.5 right-2.5 text-[11px] font-bold px-2 py-1 rounded-full z-10 ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}>
                    {item.price} D
                  </span>
                  <div className="text-5xl drop-shadow-md transform transition-transform group-hover:scale-110">
                    {extractEmoji(item.name)}
                  </div>
                </div>
                <div className="mt-3 px-1 text-center pb-3">
                  <h3 className={`text-[15px] font-bold leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stripEmoji(item.name)}</h3>
                  <p className={`text-[12px] mt-1 font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
                </div>
              </div>
            )
          })}
          {items.length === 0 && activeCategory.id === 'rehab' && (
            <div className={`col-span-2 text-center p-6 rounded-xl font-medium ${isDarkMode ? 'bg-[#2A2A2A] text-gray-300' : 'bg-[#F2F4F5] text-gray-700'}`}>
              Твой торч на нуле, рехаб тебе не нужен! Иди выпей пивка.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <h2 className={`text-[28px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🏪 Наш Гетто Маркет</h2>
      </div>

      <div className="flex flex-col gap-4">
        {config.shopCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat)}
            className={`p-5 rounded-[1.8rem] flex flex-col items-start gap-1.5 text-left transition-transform active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${isDarkMode ? 'bg-[#1E1E1E] hover:bg-[#252525]' : 'bg-white hover:bg-gray-50'}`}
          >
            <h3 className={`text-[18px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.name}</h3>
            <p className={`text-[13px] font-medium leading-snug ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cat.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
