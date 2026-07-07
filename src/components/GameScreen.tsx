import React, { useState, useEffect, useRef } from 'react';

// Retro Synth Audio Player using Web Audio API
const playSound = (type: 'throw' | 'hit' | 'levelUp' | 'gameOver') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
}

const STUDENT_EMOJIS = ['🧑‍🎓', '👨‍🎓', '👩‍🎓', '🙋‍♂️', '🙋‍♀️'];

const STUDENT_EXCUSES = [
  "Pas d'bus ! 🚌",
  "Piscine ! 🏊",
  "Le chien a tout mangé ! 🐶",
  "Pas de réseau ! 📶",
  "Mon Teams a planté ! 💻",
  "Pas réveillé ! ⏰",
  "Pas compris ! 🤨",
  "Y avait des bouchons ! 🚗",
  "J'ai oublié ! 🧠",
  "J'ai pas le lien ! 🔗",
  "Grosse flemme... 😴",
  "Y avait grève ! 🚆",
  "C'est noté ? 🤷‍♂️"
];

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, highScore }) => {
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
  const [, setTick] = useState(0);

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
      if (isGameOverTriggered.current) return;

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
    if (isGameOverTriggered.current) return;

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
          setIsLevelUpBanner(true);
          playSound('levelUp');
          
          setTimeout(() => {
            setIsLevelUpBanner(false);
          }, 1500);
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
      <div className="bg-slate-900/90 border-b-2 border-slate-800 p-3 flex justify-between items-center relative z-10">
        <div className="flex flex-col items-start gap-0.5">
          <div className="font-retro text-[8px] text-neutral-400">SCORE</div>
          <div className="font-retro text-xs md:text-sm text-arcade-cyan glow-text-cyan">
            {String(score).padStart(5, '0')}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="font-retro text-[8px] text-neutral-400 mb-1">DIFICULTÉ</div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`text-[9px] md:text-xs transition-opacity duration-300 ${
                  i < level ? 'opacity-100 animate-pulse text-arcade-yellow' : 'opacity-20 text-neutral-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className="font-retro text-[8px] text-neutral-400">RECORD</div>
          <div className="font-retro text-xs md:text-sm text-arcade-pink glow-text-pink">
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
                  className="absolute bottom-0 top-0 flex flex-col items-center justify-center border-l-2 border-dashed border-neutral-700/60"
                  style={{ left: '80%', width: '6%' }}
                >
                  <div className="text-xl md:text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    🪑
                  </div>
                  <div className="text-[7px] font-retro text-neutral-600 mt-1 uppercase hidden md:block">
                    Bureau
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
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 transition-all duration-300">
            <div className="bg-neutral-900 border-2 border-arcade-yellow p-6 rounded-2xl glow-cyan text-center max-w-xs animate-bounce">
              <span className="text-3xl">🚀</span>
              <h2 className="font-retro text-sm md:text-base text-arcade-yellow glow-text-yellow mt-2 uppercase tracking-widest">
                NIVEAU SUPÉRIEUR !
              </h2>
              <p className="font-retro text-[9px] text-white mt-3">
                Niveau {level} / 5
              </p>
              <p className="font-sans text-xs text-neutral-400 mt-1">
                La vitesse des élèves augmente !
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Controls quick-bar */}
      <div className="bg-slate-950 border-t border-slate-900 px-4 py-2 flex justify-between text-neutral-500 font-retro text-[7px] md:text-[8.5px]">
        <div>
          <span className="text-arcade-cyan font-semibold">HAUT / BAS</span>: Allées
        </div>
        <div>
          <span className="text-arcade-pink font-semibold">ESPACE</span>: Lancer un Zéro
        </div>
        <div>
          PROF: <span className="text-white">👨‍🏫</span> • ÉLÈVE: <span className="text-white">🧑‍🎓</span>
        </div>
      </div>

    </div>
  );
};
