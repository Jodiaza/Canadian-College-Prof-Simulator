import React, { useEffect } from 'react';

interface StartScreenProps {
  onStartGame: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, highScore }) => {
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
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-radial from-neutral-900 via-neutral-950 to-black text-white relative select-none">
      
      {/* High Score Banner */}
      <div className="w-full flex justify-between items-center px-4 py-2 border-b border-neutral-900 font-retro text-[9px] md:text-xs">
        <div className="text-neutral-500">SCORE: 00000</div>
        <div className="text-arcade-pink glow-text-pink animate-pulse">
          RECORD: {String(highScore).padStart(5, '0')}
        </div>
      </div>

      {/* Main Title Centerpiece */}
      <div className="flex-1 flex flex-col justify-center items-center gap-3 py-6">
        <div className="text-5xl animate-bounce mb-2">👨‍🏫</div>
        
        <h2 className="font-retro text-lg md:text-2xl text-center leading-tight tracking-wider uppercase">
          <span className="text-arcade-yellow glow-text-yellow block mb-1">Simulateur de</span>
          <span className="text-arcade-pink glow-text-pink block">Professeur</span>
        </h2>
        
        <div className="font-retro text-[8px] md:text-[9px] text-arcade-cyan tracking-widest uppercase">
          Canadian College
        </div>
      </div>

      {/* Simplified Rules Panel */}
      <div className="w-full max-w-xs bg-neutral-950/60 border border-neutral-800 p-4 rounded-xl flex flex-col gap-3 font-sans text-xs text-neutral-300">
        <div className="flex items-center gap-3">
          <span className="text-base">⌨️</span>
          <span><strong className="text-white">Flèches ⬆️ ⬇️</strong> : Bouger le prof</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base">📝</span>
          <span><strong className="text-white">Espace / Bouton</strong> : Lancer un Zéro</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base">🧑‍🎓</span>
          <span>Renvoie les élèves avant le bureau !</span>
        </div>
      </div>

      {/* Start Button Area */}
      <div className="py-6 flex flex-col items-center">
        <button
          onClick={onStartGame}
          className="font-retro text-xs md:text-sm bg-gradient-to-r from-arcade-pink to-arcade-purple text-white px-8 py-3 rounded-xl border-t-2 border-pink-300 shadow-[0_4px_15px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold select-none"
        >
          JOUER
        </button>
      </div>

    </div>
  );
};
