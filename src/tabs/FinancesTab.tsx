import { useState, useEffect } from 'react';

import { Briefcase, Dice5, Send, HandMetal, ChevronLeft } from 'lucide-react';
import { Modal } from '../components/Modal';

interface FinancesTabProps {
  apiCall: (action: string, payload?: any) => Promise<any>;
  isDarkMode: boolean;
  config?: any;
}

export function FinancesTab({ apiCall, isDarkMode, config }: FinancesTabProps) {
  const [betAmount, setBetAmount] = useState('');
  const [robTarget, setRobTarget] = useState(config.users[0]);
  const [transferTarget, setTransferTarget] = useState(config.users[0]);

  useEffect(() => {
    if (config.users && config.users.length > 0) {
      if (!config.users.includes(robTarget)) setRobTarget(config.users[0]);
      if (!config.users.includes(transferTarget)) setTransferTarget(config.users[0]);
    }
  }, [config.users]);

  const [transferAmount, setTransferAmount] = useState('');

  const [activeView, setActiveView] = useState<'main' | 'jobs' | 'job_detail'>('main');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobResultOpen, setJobResultOpen] = useState(false);
  const [jobResultText, setJobResultText] = useState('');

  const [allowanceCooldown, setAllowanceCooldown] = useState(0);
  const [jobCooldowns, setJobCooldowns] = useState<Record<string, number>>({});

  useEffect(() => {
    if (config?.stats) {
      const serverTimeOffset = config.server_time ? Math.floor(Date.now()/1000) - config.server_time : 0;
      const now = Math.floor(Date.now()/1000) - serverTimeOffset;
      const posobieCd = Math.max(0, 43200 - (now - (config.stats.last_posobie || 0)));
      setAllowanceCooldown(posobieCd);

      const jCd: Record<string, number> = {};
      if (config.jobs && config.job_timers) {
        config.jobs.forEach((job: any) => {
          const lastTime = config.job_timers[job.id] || 0;
          const remaining = Math.max(0, job.cd - (now - lastTime));
          if (remaining > 0) jCd[job.id] = remaining;
        });
      }
      setJobCooldowns(jCd);
    }

    const timer = setInterval(() => {
      setAllowanceCooldown(prev => Math.max(0, prev - 1));
      setJobCooldowns(prev => {
        const next = { ...prev };
        let changed = false;
        for (const id in next) {
          if (next[id] > 0) {
            next[id]--;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [config]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleJobAction = async (actionName: string) => {
    setJobResultText('Работаем...');
    setJobResultOpen(true);
    const res = await apiCall('job_action', { jobId: selectedJob.id, action: actionName });
    if (res && res.success) {
      setJobResultText(res.job_result || res.message);
      setJobCooldowns(prev => ({ ...prev, [selectedJob.id]: selectedJob.cd || 3600 }));
    } else {
      setJobResultText(res?.error || 'Ошибка');
    }
  };

  if (activeView === 'jobs') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in pb-24">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => setActiveView('main')}
            className={`p-2 -ml-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#2A2A2A] text-white' : 'hover:bg-gray-200 text-gray-900'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>💼 Биржа Труда</h2>
        </div>
        <div className="flex flex-col gap-4">
          {config.jobs.map(job => {
            const cd = jobCooldowns[job.id] || 0;
            const isOnCooldown = cd > 0;
            return (
              <button
                key={job.id}
                onClick={() => {
                  if (isOnCooldown) return;
                  setSelectedJob(job);
                  setActiveView('job_detail');
                }}
                disabled={isOnCooldown}
                className={`p-5 rounded-[1.8rem] flex flex-col items-start gap-2 text-left transition-transform shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${isOnCooldown ? (isDarkMode ? 'bg-[#1a1a1a] opacity-60 cursor-not-allowed' : 'bg-gray-100 opacity-60 cursor-not-allowed') : (isDarkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] active:scale-[0.98]' : 'bg-white hover:bg-gray-50 active:scale-[0.98]')}`}
              >
                <h3 className={`text-[18px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.name}</h3>
                {isOnCooldown ? (
                  <div className={`text-[14px] font-mono font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-[#333333] text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    {formatTime(cd)}
                  </div>
                ) : (
                  <p className={`text-[14px] font-medium leading-snug ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{job.desc}</p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  if (activeView === 'job_detail' && selectedJob) {
    return (
      <>
      <div className="flex flex-col gap-6 animate-fade-in pb-24">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => {
              setSelectedJob(null);
              setActiveView('jobs');
            }}
            className={`p-2 -ml-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#2A2A2A] text-white' : 'hover:bg-gray-200 text-gray-900'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className={`text-[28px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedJob.name}</h2>
        </div>
        <div className={`p-6 rounded-[2rem] flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
          <div className={`p-4 rounded-xl text-[15px] leading-relaxed font-medium ${isDarkMode ? 'bg-[#2A2A2A] text-gray-300' : 'bg-[#F2F4F5] text-gray-700'}`}>
            {selectedJob.desc}
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Действия:</h3>
            {selectedJob.actions && Object.keys(selectedJob.actions).map(act_key => {
              const act = selectedJob.actions[act_key];
              return (
                <button 
                  key={act_key}
                  onClick={() => handleJobAction(act.text)}
                  className={`w-full py-3.5 px-2 h-auto min-h-[50px] leading-tight rounded-xl font-bold active:scale-95 transition-transform shadow-sm ${isDarkMode ? 'bg-[#2A2A2A] text-white hover:bg-[#333333]' : 'bg-[#F2F4F5] text-gray-900 hover:bg-[#E5E7E8]'}`}
                >
                  {act.text}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <Modal isOpen={jobResultOpen} onClose={() => setJobResultOpen(false)} title="Результат работы" isDarkMode={isDarkMode}>
        <div className="flex flex-col gap-4 mt-2">
          <div className={`p-4 rounded-xl text-[15px] leading-relaxed font-medium italic ${isDarkMode ? 'bg-[#2A2A2A] text-gray-300' : 'bg-[#F2F4F5] text-gray-700'}`}>
            {jobResultText.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
          <button 
            onClick={() => {
              setJobResultOpen(false);
              setActiveView('jobs');
              setSelectedJob(null);
            }}
            className={`w-full py-4 rounded-full font-bold text-[17px] active:scale-95 transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
          >
            Закрыть
          </button>
        </div>
      </Modal>
    </>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fade-in">
      <h2 className={`text-[28px] font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>💰 Финансы и Казино</h2>

      {/* Work & Allowance */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveView('jobs')}
          className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 rounded-[1.8rem] flex flex-col items-center justify-center gap-3 transition-colors active:scale-95 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'}`}>
            <Briefcase className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          </div>
          <span className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>💼 Биржа Труда</span>
        </button>
        <button 
          onClick={() => {
            if (allowanceCooldown > 0) return;
            apiCall('posobie');
            setAllowanceCooldown(43200); // 12 hour cooldown
          }}
          disabled={allowanceCooldown > 0}
          className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 rounded-[1.8rem] flex flex-col items-center justify-center gap-3 transition-colors ${allowanceCooldown > 0 ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'} ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-[#F2F4F5]'}`}>
            <HandMetal className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          </div>
          {allowanceCooldown > 0 ? (
            <div className={`text-[14px] font-mono font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-[#333333] text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              {formatTime(allowanceCooldown)}
            </div>
          ) : (
            <span className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>💸 Забрать Пособие</span>
          )}
        </button>
      </div>

      {/* Casino */}
      <div className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 rounded-[1.8rem] transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="flex items-center gap-3 mb-5">
          <Dice5 className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🎲 Ставка в Казино</h3>
        </div>
        <div className="flex gap-3">
          <input 
            type="number" 
            placeholder="Сумма" 
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className={`flex-1 rounded-[1.2rem] px-5 py-3.5 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all w-full ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
          />
          <button 
            onClick={() => {
              if(!betAmount) return;
              apiCall('bet', { amount: Number(betAmount) });
              setBetAmount('');
            }}
            className={`font-bold px-6 rounded-[1.2rem] active:scale-95 transition-all whitespace-nowrap shadow-md ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
          >
            Сыграть
          </button>
        </div>
      </div>

      {/* Robbery */}
      <div className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 rounded-[1.8rem] transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="flex items-center gap-2 mb-5">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🥷 Ограбить лоха</h3>
        </div>
        <div className="flex flex-col gap-3">
          <select 
            value={robTarget}
            onChange={(e) => setRobTarget(e.target.value)}
            className={`w-full rounded-[1.2rem] px-5 py-3.5 font-medium focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all appearance-none ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
          >
            {config.users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button 
            onClick={() => apiCall('rob', { target: robTarget })}
            className={`border-2 font-bold py-3.5 rounded-[1.2rem] active:scale-95 transition-all ${isDarkMode ? 'bg-transparent border-white text-white hover:bg-white/10' : 'bg-white border-[#131313] text-[#131313] hover:bg-gray-50'}`}
          >
            Ограбить
          </button>
        </div>
      </div>

      {/* Transfer */}
      <div className={`shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 rounded-[1.8rem] transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="flex items-center gap-3 mb-5">
          <Send className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>💳 Отсыпать шекелей</h3>
        </div>
        <div className="flex flex-col gap-3">
          <select 
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
            className={`w-full rounded-[1.2rem] px-5 py-3.5 font-medium focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all appearance-none ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
          >
             {config.users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <div className="flex gap-3">
            <input 
              type="number" 
              placeholder="Сумма" 
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className={`flex-1 rounded-[1.2rem] px-5 py-3.5 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#131313] transition-all w-full ${isDarkMode ? 'bg-[#2A2A2A] text-white focus:ring-white' : 'bg-[#F2F4F5] text-gray-900 focus:ring-[#131313]'}`}
            />
            <button 
              onClick={() => {
                if(!transferAmount) return;
                apiCall('pay', { target: transferTarget, amount: Number(transferAmount) });
                setTransferAmount('');
              }}
              className={`font-bold px-6 rounded-[1.2rem] active:scale-95 transition-all shadow-md whitespace-nowrap ${isDarkMode ? 'bg-white text-[#131313]' : 'bg-[#131313] text-white'}`}
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
