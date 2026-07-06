import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Swords, RefreshCw, X, Shield, Star, Crown } from 'lucide-react';
import { PveMinigame } from './PveMinigame';

interface Enemy {
    id: number;
    name: string;
    is_boss: boolean;
    hp: number;
    reward_money: number;
    reward_items: any[];
    penalty_money: number;
    speed: number;
}

interface PveRoadmapProps {
    apiCall: (action: string, payload?: any) => Promise<any>;
    isDarkMode: boolean;
    config: any;
    onClose?: () => void;
}

export function PveRoadmap({ apiCall, isDarkMode, config, onClose }: PveRoadmapProps) {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);
    const [minigameOpen, setMinigameOpen] = useState(false);

    const fetchStatus = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin);
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            const tg_id = tgUser?.id || 123456789;
            const res = await fetch(`${API_URL}/api/pve_status?tg_id=${tg_id}`, { headers: { 'ngrok-skip-browser-warning': 'true' }});
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleStartFight = async (enemy: Enemy) => {
        if (status.fights_today >= status.max_fights) {
            alert("На сегодня хватит драк!");
            return;
        }
        if (enemy.id > status.progress) {
            alert("Сначала победи предыдущих!");
            return;
        }
        
        const res = await apiCall("pve_start", { enemy_id: enemy.id });
        if (res.success) {
            setActiveEnemy(enemy);
            setMinigameOpen(true);
        } else {
            alert(res.error || "Ошибка старта");
        }
    };

    const handleMinigameComplete = async (won: boolean) => {
        setMinigameOpen(false);
        const res = await apiCall("pve_finish", { won, enemy_id: activeEnemy!.id });
        alert(res.message || res.error);
        fetchStatus(); // refresh roadmap
    };

    if (loading || !status) return <div className="text-center p-10">Загрузка...</div>;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col ${isDarkMode ? 'bg-[#131313]' : 'bg-[#F2F4F5]'}`}>
            <div className={`p-4 flex items-center justify-between shadow-sm z-10 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
                <div>
                    <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Разборки на районе</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Боев сегодня: {status.fights_today} / {status.max_fights}</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className={`p-2 rounded-full ${isDarkMode ? 'bg-[#2A2A2A] text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-32">
                {status.enemies.map((enemy: Enemy, idx: number) => {
                    const isUnlocked = enemy.id <= status.progress;
                    const isDefeated = enemy.id < status.progress;
                    const isCurrent = enemy.id === status.progress;

                    return (
                        <div key={enemy.id} className="relative">
                            {/* Connectors */}
                            {idx < status.enemies.length - 1 && (
                                <div className={`absolute left-1/2 -bottom-8 w-1 h-8 -translate-x-1/2 ${isDefeated ? 'bg-[#8CD842]' : (isDarkMode ? 'bg-[#2A2A2A]' : 'bg-gray-200')}`} />
                            )}
                            
                            <button
                                onClick={() => handleStartFight(enemy)}
                                disabled={!isUnlocked}
                                className={`w-full rounded-[2rem] p-5 flex items-center gap-4 transition-all ${!isUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95 shadow-md'} ${isCurrent ? 'ring-4 ring-[#8CD842] scale-105' : ''} ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${enemy.is_boss ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                                    {enemy.is_boss ? <Crown className="w-8 h-8 text-white" /> : <Skull className="w-8 h-8 text-white" />}
                                </div>
                                
                                <div className="flex-1 text-left">
                                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{enemy.name}</h3>
                                    <p className={`text-sm font-medium mt-1 ${isDefeated ? 'text-[#8CD842]' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                        {isDefeated ? `Пройден! Награда урезана (-80%)` : `Награда: ${enemy.reward_money} D`}
                                    </p>
                                    {enemy.reward_items && enemy.reward_items.length > 0 && !isDefeated && (
                                        <p className="text-xs text-yellow-500 font-bold mt-1">🎁 ЛУТ: {enemy.reward_items[0].name}</p>
                                    )}
                                </div>
                                
                                {isUnlocked && (
                                    <div className="w-10 h-10 rounded-full bg-[#131313] text-white flex items-center justify-center">
                                        <Swords className="w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {minigameOpen && activeEnemy && (
                    <PveMinigame 
                        enemy={activeEnemy} 
                        config={config} 
                        onComplete={handleMinigameComplete} 
                        isDarkMode={isDarkMode} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
