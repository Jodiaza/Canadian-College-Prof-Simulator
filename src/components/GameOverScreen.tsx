import React, { useEffect } from 'react';

interface GameOverScreenProps {
  score: number;
  level: number;
  highScore: number;
  onRestart: () => void;
}

const getProfessorTitle = (score: number) => {
  if (score < 100) return { title: 'Vacataire Dépassé 😭', color: 'text-neutral-500' };
  if (score < 300) return { title: 'Remplaçant Fatigué 😴', color: 'text-arcade-yellow' };
  if (score < 600) return { title: 'Professeur Titulaire 👨‍🏫', color: 'text-arcade-cyan' };
  if (score < 1000) return { title: 'Directeur de Département 🎓', color: 'text-arcade-purple' };
  return { title: 'Doyen Légendaire du Canadian College 👑', color: 'text-arcade-pink glow-text-pink' };
};

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  highScore,
  onRestart,
}) => {
  const { title, color } = getProfessorTitle(score);
  const isNewRecord = score > highScore;

  // Listen for Enter or Space key to restart the game directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-radial from-neutral-900 via-neutral-950 to-black text-white relative select-none">
      
      {/* Header Banner */}
      <div className="w-full flex justify-center items-center py-2 border-b-2 border-dashed border-neutral-800">
        <h3 className="font-retro text-xs md:text-sm text-arcade-red glow-text-red tracking-widest animate-pulse">
          ⚡ GAME OVER ⚡
        </h3>
      </div>

      {/* Main Stats Block */}
      <div className="flex-1 flex flex-col justify-center items-center gap-6 py-6 w-full max-w-sm">
        
        {/* Skull and Chalkboard badge */}
        <div className="text-4xl md:text-5xl animate-bounce">
          💀🏫
        </div>

        <h2 className="font-retro text-lg md:text-2xl text-center text-arcade-red tracking-wider">
          CLASSE ENVAHIE !
        </h2>

        {/* Score & Level Display */}
        <div className="w-full bg-neutral-950/80 border-2 border-neutral-800 p-4 rounded-xl flex flex-col gap-3 font-sans">
          <div className="flex justify-between items-center text-xs md:text-sm">
            <span className="text-neutral-400 font-retro text-[9px] uppercase">Score Final :</span>
            <span className="font-retro text-sm text-arcade-cyan">{score} pts</span>
          </div>

          <div className="flex justify-between items-center text-xs md:text-sm">
            <span className="text-neutral-400 font-retro text-[9px] uppercase">Niveau Atteint :</span>
            <span className="font-retro text-sm text-arcade-yellow">Niv. {level}</span>
          </div>

          {isNewRecord && (
            <div className="bg-arcade-pink/15 border border-arcade-pink px-3 py-1.5 rounded-lg text-center mt-1 animate-pulse">
              <span className="font-retro text-[9px] text-arcade-pink block font-bold">🎉 NOUVEAU RECORD ! 🎉</span>
            </div>
          )}

          <hr className="border-neutral-800" />

          {/* Evaluation Grade */}
          <div className="text-center py-1">
            <span className="text-[8px] font-retro text-neutral-500 block uppercase mb-1">
              Évaluation Académique
            </span>
            <span className={`font-retro text-[10px] md:text-xs font-extrabold ${color} block leading-normal`}>
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* Action Restart Button */}
      <div className="py-6 flex flex-col items-center gap-2">
        <button
          onClick={onRestart}
          className="font-retro text-xs md:text-sm bg-gradient-to-r from-arcade-red to-arcade-yellow text-neutral-950 px-8 py-3.5 rounded-xl border-t-2 border-yellow-200 shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold select-none group"
        >
          <span className="group-hover:animate-pulse">RECOMMENCER</span>
        </button>
        
        <p className="font-retro text-[8px] md:text-[9px] text-neutral-500 animate-pulse mt-2">
          (OU APPUYEZ SUR ESPACE / ENTRÉE)
        </p>
      </div>

    </div>
  );
};
