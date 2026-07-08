import React, { useEffect } from 'react';
import type { Language } from '../App';

interface GameOverScreenProps {
  score: number;
  level: number;
  highScore: number;
  onRestart: () => void;
  language: Language;
}

const getProfessorTitle = (score: number, language: Language) => {
  if (language === 'fr') {
    if (score < 100) return { title: 'Vacataire Dépassé 😭', color: 'text-neutral-500' };
    if (score < 300) return { title: 'Remplaçant Fatigué 😴', color: 'text-arcade-yellow' };
    if (score < 600) return { title: 'Professeur Titulaire 👨‍🏫', color: 'text-arcade-cyan' };
    if (score < 1000) return { title: 'Directeur de Département 🎓', color: 'text-arcade-purple' };
    return { title: 'Doyen Légendaire 👑', color: 'text-arcade-pink glow-text-pink' };
  } else {
    if (score < 100) return { title: 'Overwhelmed Sub 😭', color: 'text-neutral-500' };
    if (score < 300) return { title: 'Tired Temp 😴', color: 'text-arcade-yellow' };
    if (score < 600) return { title: 'Tenured Prof 👨‍🏫', color: 'text-arcade-cyan' };
    if (score < 1000) return { title: 'Department Head 🎓', color: 'text-arcade-purple' };
    return { title: 'Legendary Dean 👑', color: 'text-arcade-pink glow-text-pink' };
  }
};

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  highScore,
  onRestart,
  language
}) => {
  const { title, color } = getProfessorTitle(score, language);
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
    <div className="flex-1 flex flex-col items-center justify-between p-3 md:p-6 bg-radial from-neutral-900 via-neutral-950 to-black text-white relative select-none overflow-y-auto max-h-full">
      
      {/* Header Banner */}
      <div className="w-full flex justify-center items-center py-1 md:py-2 border-b border-neutral-900">
        <h3 className="font-retro text-[8px] md:text-xs text-arcade-red glow-text-red tracking-widest animate-pulse">
          {language === 'fr' ? '⚡ FIN DE LA PARTIE ⚡' : '⚡ GAME OVER ⚡'}
        </h3>
      </div>

      {/* Main Stats Block */}
      <div className="flex-1 flex flex-col justify-center items-center gap-3 md:gap-5 py-3 md:py-6 w-full max-w-xs">
        <div className="text-3xl md:text-4xl animate-bounce">💀</div>

        <h2 className="font-retro text-xs md:text-base text-center text-arcade-red tracking-wider">
          {language === 'fr' ? 'CLASSE ENVAHIE !' : 'CLASS INVADED !'}
        </h2>

        {/* Score & Level Display */}
        <div className="w-full bg-neutral-950/60 border border-neutral-800 p-3 md:p-4 rounded-xl flex flex-col gap-2.5 md:gap-3 font-sans text-xs">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-retro text-[7px] md:text-[8px]">{language === 'fr' ? 'SCORE :' : 'SCORE:'}</span>
            <span className="font-retro text-xs text-arcade-cyan">{score} pts</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-retro text-[7px] md:text-[8px]">{language === 'fr' ? 'NIVEAU :' : 'LEVEL:'}</span>
            <span className="font-retro text-xs text-arcade-yellow">{language === 'fr' ? 'Niv.' : 'Lvl.'} {level}</span>
          </div>

          {isNewRecord && (
            <div className="bg-arcade-pink/10 border border-arcade-pink px-2 py-1 rounded text-center mt-1">
              <span className="font-retro text-[8px] text-arcade-pink font-bold">
                {language === 'fr' ? '🎉 NOUVEAU RECORD ! 🎉' : '🎉 NEW HIGHSCORE ! 🎉'}
              </span>
            </div>
          )}

          <hr className="border-neutral-800" />

          {/* Evaluation Grade */}
          <div className="text-center py-1">
            <span className="text-[7px] font-retro text-neutral-500 block mb-1">
              {language === 'fr' ? 'RÉSULTAT ACADÉMIQUE' : 'ACADEMIC RESULT'}
            </span>
            <span className={`font-retro text-[9px] md:text-[10px] font-extrabold ${color} block leading-normal`}>
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* Action Restart Button */}
      <div className="py-3 md:py-6 flex flex-col items-center">
        <button
          onClick={onRestart}
          className="font-retro text-[10px] md:text-xs bg-gradient-to-r from-arcade-red to-arcade-yellow text-neutral-950 px-6 py-2.5 md:px-8 md:py-3 rounded-xl border-t-2 border-yellow-200 shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold select-none"
        >
          {language === 'fr' ? 'REJOUER' : 'PLAY AGAIN'}
        </button>
      </div>

    </div>
  );
};
