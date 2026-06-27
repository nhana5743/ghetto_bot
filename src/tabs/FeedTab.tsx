import { config } from '../config';

interface FeedTabProps {
  isDarkMode: boolean;
}

export function FeedTab({ isDarkMode }: FeedTabProps) {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3 mb-2 shrink-0">
        <h2 className={`text-[28px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Лента</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pb-24 pr-1">
        {config.logs.map(log => (
          <div key={log.id} className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 rounded-[1.5rem] flex gap-4 items-start relative overflow-hidden transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDarkMode ? 'bg-[#333333]' : 'bg-[#131313]'}`} />
            <div className={`text-[12px] font-semibold pt-0.5 w-12 shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {log.time}
            </div>
            <p className={`text-[15px] leading-relaxed font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {log.text.split(' ').map((word, i) => 
                word.startsWith('@') 
                  ? <span key={i} className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{word} </span> 
                  : <span key={i}>{word} </span>
              )}
            </p>
          </div>
        ))}
        {/* Empty state padding */}
        <div className="h-4 shrink-0" />
      </div>
    </div>
  );
}
