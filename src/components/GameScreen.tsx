import React, { useState, useEffect, useRef } from 'react';

// Shared AudioContext to prevent exceeding maximum audio context count in browser
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch((e) => console.warn('Failed to resume AudioContext', e));
  }
  return sharedAudioCtx;
};

// Retro Synth Audio Player using Web Audio API
const playSound = (type: 'throw' | 'hit' | 'levelUp' | 'gameOver') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'throw') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hit') {
      // Double beep for arcade feel
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.07); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'levelUp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.08);
      osc.frequency.setValueAtTime(659.25, now + 0.16);
      osc.frequency.setValueAtTime(880.00, now + 0.24);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'gameOver') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.65);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.65);
    }
  } catch (e) {
    console.warn('Web Audio not allowed or supported yet.', e);
  }
};

interface Student {
  id: number;
  lane: number;
  x: number; // 0 to 100
  status: 'active' | 'retreating';
  emoji: string;
  excuse: string;
}

interface Exam {
  id: number;
  lane: number;
  x: number; // 0 to 100
}

interface HitPopup {
  id: number;
  lane: number;
  x: number;
  text: string;
  age: number; // for animation frames
}

interface GameScreenProps {
  onGameOver: (score: number, level: number) => void;
  highScore: number;
  onExit: () => void;
}

const STUDENT_EMOJIS = ['🧑‍🎓', '👨‍🎓', '👩‍🎓', '🙋‍♂️', '🙋‍♀️'];

const STUDENT_EXCUSES = [
  "En retard ! 🏃‍♂️",
  "Pas d'bus ! 🚌",
  "J'ai piscine ! 🏊",
  "Le chien a tout mangé ! 🐶",
  "Pas de réseau ! 📶",
  "Zoom a planté ! 💻",
  "Pas réveillé ! ⏰",
  "Les bouchons ! 🚗",
  "J'ai oublié ! 🧠",
  "Mon micro buggait ! 🎙️",
  "J'avais la flemme ! 🥱",
  "Y avait grève ! 🚆",
  "C'est noté ? 🤷‍♂️",
  "Plateforme en panne ! ❌",
  "Panne de courant ! 🔌",
  "J'étais bloqué ! 🔒",
  "Pas d'ordinateur ! 🖥️",
  "Mot de passe perdu ! 🔑",
  "Pas vu l'heure ! 🕛",
  "Mon chat est malade ! 🐱",
  "J'ai pas le livre ! 📖",
  "Pas reçu le lien ! 🔗",
  "Y a match ce soir ! ⚽",
  "Me suis endormi ! 😴",
  "Le SPC buggait ! ❌",
  "Caméra en panne ! 📷"
];

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, highScore, onExit }) => {
  // Safe ref for parent callbacks to avoid stale closures in requestAnimationFrame loop
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Game state synced to React for rendering UI
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [professorLane, setProfessorLane] = useState(1); // Starting lane (0 to 3)
  const [isLevelUpBanner, setIsLevelUpBanner] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [, setTick] = useState(0);

  const isPausedRef = useRef(false);
  const isLevelUpRef = useRef(false);

  const togglePause = () => {
    const nextPaused = !isPausedRef.current;
    isPausedRef.current = nextPaused;
    setIsPaused(nextPaused);

    if (!nextPaused) {
      previousTimeRef.current = null;
      requestRef.current = requestAnimationFrame(updateGame);
    }
  };

  const handleContinueNextLevel = () => {
    setIsLevelUpBanner(false);
    isLevelUpRef.current = false;
    previousTimeRef.current = null;
    lastSpawnTime.current = performance.now();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  // References for fast-paced physics loop
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const studentsRef = useRef<Student[]>([]);
  const examsRef = useRef<Exam[]>([]);
  const popupsRef = useRef<HitPopup[]>([]);
  const professorLaneRef = useRef<number>(1);
  const scoreRef = useRef<number>(0);
  const levelRef = useRef<number>(1);
  const isGameOverTriggered = useRef<boolean>(false);

  const nextStudentId = useRef(0);
  const nextExamId = useRef(0);
  const nextPopupId = useRef(0);
  const lastSpawnTime = useRef(0);

  // Sync React state to refs to keep game loop updated without stale closures
  useEffect(() => {
    professorLaneRef.current = professorLane;
  }, [professorLane]);

  // Handle Controls (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (isGameOverTriggered.current || isPausedRef.current || isLevelUpRef.current) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setProfessorLane((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setProfessorLane((prev) => Math.min(3, prev + 1));
      } else if (e.code === 'Space') {
        e.preventDefault();
        shootExam();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Launch a zero mark exam
  const shootExam = () => {
    const currentLane = professorLaneRef.current;
    
    // Prevent spamming too many exams in the same lane (limit to 3 active per lane)
    const activeExamsInLane = examsRef.current.filter((ex) => ex.lane === currentLane);
    if (activeExamsInLane.length >= 3) return;

    playSound('throw');
    
    const newExam: Exam = {
      id: nextExamId.current++,
      lane: currentLane,
      x: 78, // spawn in front of the desk (which is at x=80)
    };

    examsRef.current.push(newExam);
  };

  // Touch debounce to prevent browser-simulated mouse events after touch events on mobile
  const lastTouchTimeRef = useRef(0);

  const handleMoveUp = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (e.type === 'mousedown' && Date.now() - lastTouchTimeRef.current < 500) return;
    if (e.type === 'touchstart') lastTouchTimeRef.current = Date.now();

    if (isGameOverTriggered.current) return;
    setProfessorLane((prev) => Math.max(0, prev - 1));
  };

  const handleMoveDown = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (e.type === 'mousedown' && Date.now() - lastTouchTimeRef.current < 500) return;
    if (e.type === 'touchstart') lastTouchTimeRef.current = Date.now();

    if (isGameOverTriggered.current) return;
    setProfessorLane((prev) => Math.min(3, prev + 1));
  };

  const handleShoot = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (e.type === 'mousedown' && Date.now() - lastTouchTimeRef.current < 500) return;
    if (e.type === 'touchstart') lastTouchTimeRef.current = Date.now();

    if (isGameOverTriggered.current) return;
    shootExam();
  };

  // Trigger floating text points popup
  const spawnPopup = (lane: number, x: number, text: string) => {
    const newPopup: HitPopup = {
      id: nextPopupId.current++,
      lane,
      x,
      text,
      age: 0,
    };
    popupsRef.current.push(newPopup);
  };

  // Game Loop physics calculations
  const updateGame = (time: number) => {
    if (isGameOverTriggered.current || isPausedRef.current || isLevelUpRef.current) return;

    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
      lastSpawnTime.current = time;
    }

    const elapsed = time - previousTimeRef.current;
    previousTimeRef.current = time;

    // Difficulty settings per level
    // Speeds are measured in coordinate units per millisecond (approx 60FPS scale)
    const baseSpeed = 0.0068 + levelRef.current * 0.0022; // student speed increases with level
    const spawnInterval = Math.max(800, 3000 - levelRef.current * 500); // students spawn faster with level

    // 1. Spawning Students
    if (time - lastSpawnTime.current > spawnInterval) {
      lastSpawnTime.current = time;

      // Select a random lane
      const lane = Math.floor(Math.random() * 4);
      
      // Limit number of students in the same lane to 2 at once to keep it playable
      const studentsInLane = studentsRef.current.filter((s) => s.lane === lane);
      if (studentsInLane.length < 2) {
        const randomEmoji = STUDENT_EMOJIS[Math.floor(Math.random() * STUDENT_EMOJIS.length)];
        const randomExcuse = STUDENT_EXCUSES[Math.floor(Math.random() * STUDENT_EXCUSES.length)];
        studentsRef.current.push({
          id: nextStudentId.current++,
          lane,
          x: 0, // start at left end
          status: 'active',
          emoji: randomEmoji,
          excuse: randomExcuse,
        });
      }
    }

    // 2. Update Exams Position (Moving Left)
    const examSpeedX = 0.025; // Speed of exams
    examsRef.current = examsRef.current
      .map((ex) => ({
        ...ex,
        x: ex.x - examSpeedX * elapsed,
      }))
      .filter((ex) => ex.x > 0); // Keep on screen

    // 3. Update Students Position (Moving Right or Left depending on status)
    const retreatSpeedX = 0.035; // Fast retreat speed when crying
    studentsRef.current = studentsRef.current
      .map((st) => {
        if (st.status === 'retreating') {
          return { ...st, x: st.x - retreatSpeedX * elapsed };
        } else {
          return { ...st, x: st.x + baseSpeed * elapsed };
        }
      })
      .filter((st) => st.x >= 0); // Remove if they retreat past the left edge

    // 4. Update floating score popups
    popupsRef.current = popupsRef.current
      .map((p) => ({ ...p, age: p.age + 1 }))
      .filter((p) => p.age < 30); // Live for 30 frames

    // 5. Collision Detection (Exams vs Students)
    const hitDistance = 4.5; // X-axis distance for collision
    
    examsRef.current.forEach((exam, examIdx) => {
      // Find the closest active student in the same lane
      const hitStudent = studentsRef.current.find(
        (st) => st.lane === exam.lane && st.status === 'active' && Math.abs(st.x - exam.x) < hitDistance
      );

      if (hitStudent) {
        // Change student status to retreating (crying)
        hitStudent.status = 'retreating';
        
        // Remove exam
        examsRef.current.splice(examIdx, 1);
        
        // Increment Score
        const points = 20;
        scoreRef.current += points;
        setScore(scoreRef.current);
        
        // Play coin sound
        playSound('hit');

        // Spawn hit points popup
        spawnPopup(exam.lane, exam.x, `+${points}`);

        // Check for Level Up (Every 400 points, max 5)
        const nextLevel = Math.min(5, Math.floor(scoreRef.current / 400) + 1);
        if (nextLevel > levelRef.current) {
          levelRef.current = nextLevel;
          setLevel(nextLevel);
          
          isLevelUpRef.current = true;
          setIsLevelUpBanner(true);
          playSound('levelUp');

          // Reset all active entities so the new level starts fresh from scratch
          studentsRef.current = [];
          examsRef.current = [];
          popupsRef.current = [];
        }
      }
    });

    // 6. Check Game Over Condition
    // If any active student reaches x >= 80 (the desk position)
    const breachedStudent = studentsRef.current.find((st) => st.status === 'active' && st.x >= 80);
    if (breachedStudent) {
      isGameOverTriggered.current = true;
      setIsShaking(true);
      playSound('gameOver');

      // Let the screen shake for 600ms before showing Game Over screen
      setTimeout(() => {
        onGameOverRef.current(scoreRef.current, levelRef.current);
      }, 600);
      return;
    }

    // Force React render loop sync (dummy state tick)
    setTick((t) => t + 1);
    requestRef.current = requestAnimationFrame(updateGame);
  };

  // Start & clean up the game loop animation frame
  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex-1 flex flex-col bg-slate-950 text-white select-none relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      
      {/* Top HUD (Scoreboard & Stats) */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-2 md:p-3 flex justify-between items-center relative z-10 font-retro">
        
        {/* Score column */}
        <div className="flex flex-col items-start">
          <div className="text-[7px] text-neutral-500">SCORE</div>
          <div className="text-[11px] text-arcade-cyan glow-text-cyan mt-0.5">
            {String(score).padStart(5, '0')}
          </div>
        </div>

        {/* Center: Difficulty & Pause */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-[7px] text-neutral-500 mb-0.5">NIV. {level}</div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-[8px] ${
                    i < level ? 'text-arcade-yellow animate-pulse' : 'text-neutral-800'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <button 
            onClick={togglePause}
            className="px-2.5 py-1.5 bg-arcade-yellow text-neutral-950 border-t border-yellow-200 rounded font-retro text-[8px] font-bold shadow-[0_0_8px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-90 transition-transform cursor-pointer select-none"
          >
            ⏸ PAUSE
          </button>
        </div>

        {/* Highscore column */}
        <div className="flex flex-col items-end">
          <div className="text-[7px] text-neutral-500 font-retro">RECORD</div>
          <div className="text-[11px] text-arcade-pink glow-text-pink mt-0.5">
            {String(Math.max(highScore, score)).padStart(5, '0')}
          </div>
        </div>
      </div>

      {/* Classroom Game Board */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-neutral-950 to-black p-2 md:p-4">
        
        {/* Retro Classroom Chalkboard Style Background */}
        <div className="absolute inset-4 rounded-xl border border-slate-900 bg-emerald-950/20 retro-grid opacity-35 pointer-events-none" />
        
        {/* 4 Lanes (Rows) */}
        <div className="flex-1 flex flex-col justify-around relative h-full">
          {[0, 1, 2, 3].map((laneIndex) => {
            const isProfHere = professorLane === laneIndex;
            
            return (
              <div 
                key={laneIndex} 
                className={`relative w-full h-[20%] flex items-center border-y border-dashed border-slate-800/40 bg-gradient-to-r ${
                  isProfHere ? 'from-transparent via-arcade-purple/5 to-transparent' : 'from-transparent'
                }`}
              >
                {/* Lane Track Floor markings */}
                <div className="absolute left-0 right-[20%] h-0.5 bg-neutral-800/30 top-1/2 -translate-y-1/2" />

                {/* Left Spawn Portal Border Indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-arcade-cyan to-transparent opacity-50" />

                {/* Classroom desks Barrier (at X = 80%) */}
                <div 
                  className="absolute bottom-0 top-0 flex items-center justify-center border-l-2 border-dashed border-neutral-700/60"
                  style={{ left: '80%', width: '6%' }}
                >
                  <div className="text-lg md:text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    🪑
                  </div>
                </div>

                {/* Render Students in this lane */}
                {studentsRef.current
                  .filter((st) => st.lane === laneIndex)
                  .map((student) => (
                    <div
                      key={student.id}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center select-none"
                      style={{ left: `${student.x}%`, zIndex: 10 }}
                    >
                      {/* Emotion Indicator above student */}
                      <span className={`text-[6.5px] md:text-[8px] font-retro px-1.5 py-0.5 rounded absolute -top-5 font-bold border transition-colors whitespace-nowrap ${
                        student.status === 'retreating' 
                          ? 'bg-red-950/90 text-arcade-red border-arcade-red animate-bounce' 
                          : 'bg-slate-900/90 text-arcade-yellow border-slate-800'
                      }`}>
                        {student.status === 'retreating' ? 'Rattrapage ! 😭' : student.excuse}
                      </span>
                      
                      {/* Student Body (Emoji) */}
                      <div className={`text-2xl md:text-3.5xl filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] ${
                        student.status === 'retreating' ? 'opacity-85 animate-pulse' : ''
                      }`}>
                        {student.status === 'retreating' ? '😭' : student.emoji}
                      </div>
                    </div>
                  ))}

                {/* Render Exams in this lane */}
                {examsRef.current
                  .filter((ex) => ex.lane === laneIndex)
                  .map((exam) => (
                    <div
                      key={exam.id}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center select-none"
                      style={{ left: `${exam.x}%`, zIndex: 5 }}
                    >
                      {/* Zero Mark Glowing Paper */}
                      <div className="relative animate-spin-slow">
                        <div className="text-lg md:text-xl filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                          📄
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center font-retro text-[9px] text-arcade-red font-extrabold select-none">
                          0
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Render Hit Point Popups */}
                {popupsRef.current
                  .filter((p) => p.lane === laneIndex)
                  .map((popup) => (
                    <div
                      key={popup.id}
                      className="absolute font-retro text-[9px] md:text-xs text-arcade-green glow-text-green font-bold pointer-events-none"
                      style={{
                        left: `${popup.x}%`,
                        top: `calc(50% - ${popup.age * 1.5}px)`,
                        opacity: (30 - popup.age) / 30,
                      }}
                    >
                      {popup.text}
                    </div>
                  ))}

                {/* Professor position (Right side desk at x = 90%) */}
                {isProfHere && (
                  <div className="absolute right-[4%] top-1/2 -translate-y-1/2 flex flex-col items-center select-none z-15">
                    {/* Glowing status bubble */}
                    <div className="bg-arcade-pink/90 border border-pink-300 font-retro text-[7px] md:text-[8px] text-white px-1.5 py-0.5 rounded shadow-[0_0_8px_#ec4899] mb-1 animate-pulse">
                      PROF
                    </div>
                    {/* Professor Character Emoji */}
                    <div className="text-3xl md:text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] animate-pulse">
                      👨‍🏫
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Level Up Banner Alert Overlay */}
        {isLevelUpBanner && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-30">
            <div className="bg-neutral-900 border-2 border-arcade-yellow p-5 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.5)] text-center max-w-xs flex flex-col items-center gap-3">
              <span className="text-3xl animate-bounce">🚀</span>
              <h2 className="font-retro text-[10px] md:text-xs text-arcade-yellow glow-text-yellow uppercase tracking-widest leading-normal">
                NIVEAU SUPÉRIEUR !
              </h2>
              <p className="font-retro text-[9px] text-white mt-1">
                NIVEAU {level} / 5
              </p>
              <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                Félicitations ! Les étudiants avancent maintenant plus vite.
              </p>
              
              <button
                onClick={handleContinueNextLevel}
                className="mt-2 bg-arcade-yellow text-neutral-950 font-retro text-[8px] font-bold px-6 py-2.5 rounded-lg border-t border-yellow-200 active:scale-95 transition-transform cursor-pointer select-none"
              >
                CONTINUER
              </button>
            </div>
          </div>
        )}

        {/* Pause Modal Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40">
            <div className="bg-neutral-900 border-2 border-arcade-cyan p-6 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.5)] text-center max-w-xs flex flex-col gap-4">
              <h2 className="font-retro text-xs text-arcade-cyan glow-text-cyan uppercase tracking-widest animate-pulse">
                JEU EN PAUSE
              </h2>
              
              <div className="flex flex-col gap-3 font-retro text-[9px] mt-2">
                <button
                  onClick={togglePause}
                  className="bg-arcade-cyan text-neutral-950 px-6 py-2.5 rounded-lg border-t border-cyan-200 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                >
                  REPRENDRE
                </button>
                <button
                  onClick={() => onExit()}
                  className="bg-neutral-800 text-arcade-red border border-arcade-red px-6 py-2.5 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                >
                  QUITTER
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Touch Controls Overlay */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-between items-end p-3 z-30 md:hidden pb-4">
          {/* Left Side: Up & Down Navigation */}
          <div className="flex flex-col gap-2.5 pointer-events-auto">
            <button 
              onTouchStart={handleMoveUp}
              onMouseDown={handleMoveUp}
              className="w-12 h-12 rounded-full bg-slate-900/85 border-2 border-arcade-cyan flex items-center justify-center text-white active:bg-arcade-cyan active:text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)] select-none text-base"
            >
              ▲
            </button>
            <button 
              onTouchStart={handleMoveDown}
              onMouseDown={handleMoveDown}
              className="w-12 h-12 rounded-full bg-slate-900/85 border-2 border-arcade-cyan flex items-center justify-center text-white active:bg-arcade-cyan active:text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)] select-none text-base"
            >
              ▼
            </button>
          </div>

          {/* Right Side: Shoot Button */}
          <div className="pointer-events-auto">
            <button 
              onTouchStart={handleShoot}
              onMouseDown={handleShoot}
              className="w-14 h-14 rounded-full bg-arcade-pink/90 border-2 border-pink-300 flex flex-col items-center justify-center text-white active:bg-arcade-pink active:scale-95 shadow-[0_0_15px_rgba(236,72,153,0.7)] font-retro select-none"
            >
              <span className="text-[7.5px] md:text-[8px] uppercase font-bold tracking-widest leading-none">Tirer</span>
              <span className="text-[11px] font-bold mt-1 leading-none">0</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
