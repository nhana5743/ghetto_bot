import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface PveMinigameProps {
    enemy: any;
    config: any;
    onComplete: (won: boolean) => void;
    isDarkMode: boolean;
}

export function PveMinigame({ enemy, config, onComplete, isDarkMode }: PveMinigameProps) {
    const [phase, setPhase] = useState<'intro' | 'defense' | 'attack' | 'boss_draw'>('intro');
    const [introTimer, setIntroTimer] = useState(3);
    
    // Stats modifiers
    const playerStrength = config.stats?.strength || 10;
    const playerAgility = config.stats?.agility || 0;
    
    // NPC state (Swipe + Tap)
    const [enemyHp, setEnemyHp] = useState(enemy.hp);
    const [swipeDir, setSwipeDir] = useState<string | null>(null);
    const [swipeTimeLeft, setSwipeTimeLeft] = useState(0);
    const [attackTimeLeft, setAttackTimeLeft] = useState(0);
    
    // Boss state (Drawing)
    const [drawPath, setDrawPath] = useState<{x: number, y: number}[]>([]);
    const [bossTimeLeft, setBossTimeLeft] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Intro timer
    useEffect(() => {
        if (phase === 'intro') {
            if (introTimer > 0) {
                const t = setTimeout(() => setIntroTimer(introTimer - 1), 1000);
                return () => clearTimeout(t);
            } else {
                if (enemy.is_boss) {
                    startBossPhase();
                } else {
                    startDefensePhase();
                }
            }
        }
    }, [phase, introTimer]);

    // NPC: Defense Phase
    const startDefensePhase = () => {
        setPhase('defense');
        const dirs = ['up', 'down', 'left', 'right'];
        setSwipeDir(dirs[Math.floor(Math.random() * dirs.length)]);
        // Agility gives more time. Base time: 1.5s / enemy.speed
        const baseTime = 1500 / enemy.speed;
        const bonusTime = playerAgility * 50;
        setSwipeTimeLeft(baseTime + bonusTime);
    };

    useEffect(() => {
        if (phase === 'defense' && swipeTimeLeft > 0) {
            const t = setTimeout(() => setSwipeTimeLeft(prev => prev - 50), 50);
            return () => clearTimeout(t);
        } else if (phase === 'defense' && swipeTimeLeft <= 0) {
            // Failed to dodge -> instant lose for simplicity, or we can just deduct HP. Let's make it instant lose.
            onComplete(false);
        }
    }, [phase, swipeTimeLeft]);

    // Handle touch swipe
    const touchStart = useRef<{x: number, y: number} | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (phase !== 'defense' || !touchStart.current || !swipeDir) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - touchStart.current.x;
        const dy = endY - touchStart.current.y;
        
        let detectedDir = null;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
            detectedDir = dx > 0 ? 'right' : 'left';
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
            detectedDir = dy > 0 ? 'down' : 'up';
        }
        
        if (detectedDir === swipeDir) {
            startAttackPhase();
        } else if (detectedDir !== null) {
            onComplete(false); // Wrong swipe
        }
        touchStart.current = null;
    };

    // NPC: Attack Phase
    const startAttackPhase = () => {
        setPhase('attack');
        setAttackTimeLeft(3000); // 3 seconds to tap
    };

    useEffect(() => {
        if (phase === 'attack' && attackTimeLeft > 0) {
            const t = setTimeout(() => setAttackTimeLeft(prev => prev - 100), 100);
            return () => clearTimeout(t);
        } else if (phase === 'attack' && attackTimeLeft <= 0) {
            if (enemyHp > 0) {
                // Enemy survived, cycle back to defense
                startDefensePhase();
            }
        }
    }, [phase, attackTimeLeft, enemyHp]);

    const handleTapAttack = () => {
        if (phase !== 'attack') return;
        const damage = 5 + Math.floor(playerStrength * 0.5); // base 5 + 50% strength
        const newHp = enemyHp - damage;
        setEnemyHp(newHp);
        if (newHp <= 0) {
            onComplete(true);
        }
    };

    // Boss: Drawing Phase
    const startBossPhase = () => {
        setPhase('boss_draw');
        setBossTimeLeft(5000 / enemy.speed + playerAgility * 100); // Draw in 5 seconds
        setDrawPath([]);
    };

    useEffect(() => {
        if (phase === 'boss_draw' && bossTimeLeft > 0) {
            const t = setTimeout(() => setBossTimeLeft(prev => prev - 100), 100);
            return () => clearTimeout(t);
        } else if (phase === 'boss_draw' && bossTimeLeft <= 0) {
            // Evaluate drawing
            evaluateDrawing();
        }
    }, [phase, bossTimeLeft]);

    const handleDrawMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (phase !== 'boss_draw') return;
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            setDrawPath(prev => [...prev, {x, y}]);
        }
    };

    const evaluateDrawing = () => {
        // Simplified evaluation: just check if they drew enough points for now
        // In a real game, we'd use shape matching algorithms (e.g. $1 recognizer)
        if (drawPath.length > 20) {
            onComplete(true);
        } else {
            onComplete(false);
        }
    };

    // Render Canvas for Boss
    useEffect(() => {
        if (phase === 'boss_draw' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                
                // Draw target shape (a simple circle or triangle)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.arc(150, 150, 100, 0, Math.PI * 2);
                ctx.stroke();

                // Draw user path
                if (drawPath.length > 0) {
                    ctx.strokeStyle = '#8CD842';
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.moveTo(drawPath[0].x, drawPath[0].y);
                    drawPath.forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.stroke();
                }
            }
        }
    }, [drawPath, phase]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed inset-0 z-[200] flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#131313]' : 'bg-[#F2F4F5]'}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="absolute top-10 text-center">
                <h2 className={`text-2xl font-black ${enemy.is_boss ? 'text-red-500' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {enemy.name}
                </h2>
                {!enemy.is_boss && (
                    <div className="w-48 h-4 bg-gray-200 rounded-full mt-4 overflow-hidden mx-auto">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${Math.max(0, (enemyHp / enemy.hp) * 100)}%` }} />
                    </div>
                )}
            </div>

            {phase === 'intro' && (
                <div className="text-center">
                    <h1 className="text-8xl font-black text-[#8CD842]">{introTimer}</h1>
                    <p className={`mt-4 font-bold text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {enemy.is_boss ? 'Нарисуй руну!' : 'Свайпай и бей!'}
                    </p>
                </div>
            )}

            {phase === 'defense' && (
                <div className="text-center w-full px-10">
                    <h3 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>УВОРОТ! Свайпай:</h3>
                    <div className="flex justify-center items-center h-48">
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="bg-red-500 text-white p-6 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                        >
                            {swipeDir === 'up' && <ChevronUp className="w-16 h-16" />}
                            {swipeDir === 'down' && <ChevronDown className="w-16 h-16" />}
                            {swipeDir === 'left' && <ChevronLeft className="w-16 h-16" />}
                            {swipeDir === 'right' && <ChevronRight className="w-16 h-16" />}
                        </motion.div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-12 overflow-hidden">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${(swipeTimeLeft / (1500 / enemy.speed + playerAgility * 50)) * 100}%` }} />
                    </div>
                </div>
            )}

            {phase === 'attack' && (
                <div className="text-center w-full px-10 h-full flex flex-col justify-center" onClick={handleTapAttack}>
                    <h3 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>БЕЙ! (Затыкивай экран)</h3>
                    <motion.div 
                        whileTap={{ scale: 0.9 }}
                        className="w-48 h-48 bg-[#8CD842] rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(140,216,66,0.4)]"
                    >
                        <Sword className="w-20 h-20 text-white" />
                    </motion.div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-12 overflow-hidden">
                        <div className="h-full bg-[#8CD842]" style={{ width: `${(attackTimeLeft / 3000) * 100}%` }} />
                    </div>
                </div>
            )}

            {phase === 'boss_draw' && (
                <div className="text-center">
                    <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Обведи фигуру!</h3>
                    <canvas 
                        ref={canvasRef}
                        width={300}
                        height={300}
                        className={`border-4 rounded-3xl touch-none ${isDarkMode ? 'bg-[#1E1E1E] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}
                        onTouchMove={handleDrawMove}
                        onMouseMove={handleDrawMove}
                        onMouseDown={handleDrawMove}
                    />
                    <div className="w-[300px] h-2 bg-gray-200 rounded-full mt-6 mx-auto overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${(bossTimeLeft / (5000 / enemy.speed + playerAgility * 100)) * 100}%` }} />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
