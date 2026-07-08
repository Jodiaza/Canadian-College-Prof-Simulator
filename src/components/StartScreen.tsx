import React, { useEffect } from 'react';

import type { Language } from '../App';

interface StartScreenProps {
  onStartGame: () => void;
  highScore: number;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, highScore, language, onLanguageChange }) => {
  // Listen for Enter or Space key to start the game directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-3 md:p-6 bg-radial from-neutral-900 via-neutral-950 to-black text-white relative select-none overflow-y-auto max-h-full">
      
      {/* Language Selector */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-2 font-retro text-[8px] md:text-[10px]">
        <button 
          onClick={() => onLanguageChange('fr')}
          className={`px-2 py-1 border rounded ${language === 'fr' ? 'bg-arcade-cyan text-black border-arcade-cyan shadow-[0_0_8px_#22d3ee]' : 'bg-transparent text-neutral-500 border-neutral-700 hover:text-white'}`}
        >
          FR
        </button>
        <button 
          onClick={() => onLanguageChange('en')}
          className={`px-2 py-1 border rounded ${language === 'en' ? 'bg-arcade-cyan text-black border-arcade-cyan shadow-[0_0_8px_#22d3ee]' : 'bg-transparent text-neutral-500 border-neutral-700 hover:text-white'}`}
        >
          EN
        </button>
      </div>

      {/* High Score Banner */}
      <div className="w-full flex justify-between items-center px-2 py-1 md:px-4 md:py-2 border-b border-neutral-900 font-retro text-[8px] md:text-xs">
        <div className="text-neutral-500">SCORE: 00000</div>
        <div className="text-arcade-pink glow-text-pink animate-pulse">
          {language === 'fr' ? 'RECORD' : 'HIGHSCORE'}: {String(highScore).padStart(5, '0')}
        </div>
      </div>

      {/* Main Title Centerpiece */}
      <div className="flex-1 flex flex-col justify-center items-center gap-2 md:gap-3 py-3 md:py-6">
        <div className="text-4xl md:text-5xl animate-bounce mb-1">👨‍🏫</div>
        
        <h2 className="font-retro text-sm md:text-2xl text-center leading-tight tracking-wider uppercase">
          <span className="text-arcade-yellow glow-text-yellow block mb-0.5">
            {language === 'fr' ? 'Simulateur de' : 'Simulator'}
          </span>
          <span className="text-arcade-pink glow-text-pink block">
            {language === 'fr' ? 'Professeur' : 'Professor'}
          </span>
        </h2>
        
        <div className="font-retro text-[7px] md:text-[9px] text-arcade-cyan tracking-widest uppercase">
          Canadian College
        </div>
      </div>

      {/* Simplified Rules Panel */}
      <div className="w-full max-w-xs bg-neutral-950/60 border border-neutral-800 p-2.5 md:p-4 rounded-xl flex flex-col gap-2 md:gap-3 font-sans text-[11px] md:text-xs text-neutral-300">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-sm md:text-base">⌨️</span>
          <span>
            <strong className="text-white">
              {language === 'fr' ? 'Flèches ⬆️ ⬇️' : 'Arrows ⬆️ ⬇️'}
            </strong> : {language === 'fr' ? 'Bouger le prof' : 'Move teacher'}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-sm md:text-base">📝</span>
          <span>
            <strong className="text-white">
              {language === 'fr' ? 'Espace / Bouton' : 'Space / Button'}
            </strong> : {language === 'fr' ? 'Lancer un Zéro' : 'Throw a Zero'}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-sm md:text-base">🧑‍🎓</span>
          <span>
            {language === 'fr' ? 'Renvoie les élèves avant le bureau !' : 'Send students back before the desk!'}
          </span>
        </div>
      </div>

      {/* Start Button Area */}
      <div className="py-3 md:py-6 flex flex-col items-center">
        <button
          onClick={onStartGame}
          className="font-retro text-[10px] md:text-sm bg-gradient-to-r from-arcade-pink to-arcade-purple text-white px-6 py-2.5 md:px-8 md:py-3 rounded-xl border-t-2 border-pink-300 shadow-[0_4px_15px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold select-none"
        >
          {language === 'fr' ? 'JOUER' : 'PLAY'}
        </button>
      </div>

    </div>
  );
};
