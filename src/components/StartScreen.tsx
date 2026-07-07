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
      <div className="w-full flex justify-between items-center px-4 py-2 border-b-2 border-dashed border-neutral-800">
        <div className="font-retro text-[9px] md:text-xs text-neutral-400">
          SCORE: <span className="text-white">00000</span>
        </div>
        <div className="font-retro text-[9px] md:text-xs text-arcade-pink glow-text-pink animate-pulse">
          HIGH SCORE: <span className="text-white">{String(highScore).padStart(5, '0')}</span>
        </div>
      </div>

      {/* Main Title Centerpiece */}
      <div className="flex-1 flex flex-col justify-center items-center gap-4 py-8">
        {/* Animated Icon */}
        <div className="text-5xl md:text-6xl animate-bounce mb-2">
          👨‍🏫🎓
        </div>
        
        {/* Main Title */}
        <h2 className="font-retro text-xl md:text-3xl text-center leading-tight tracking-wider uppercase">
          <span className="text-arcade-yellow glow-text-yellow block mb-2">Simulateur de</span>
          <span className="text-arcade-pink glow-text-pink block">Professeur</span>
        </h2>
        
        <div className="font-retro text-[10px] md:text-xs bg-arcade-cyan/10 border border-arcade-cyan text-arcade-cyan px-4 py-1.5 rounded-full uppercase tracking-widest mt-2 animate-pulse">
          Canadian College
        </div>
      </div>

      {/* Game Rules / Instructions Panel */}
      <div className="w-full max-w-md bg-neutral-950/80 border-2 border-neutral-800 p-4 rounded-xl flex flex-col gap-3 font-sans text-xs md:text-sm">
        <h3 className="font-retro text-[10px] text-arcade-cyan mb-1 text-center uppercase">
          Instructions du Jeu
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-300">
          <div className="flex items-start gap-2.5">
            <span className="text-lg">⌨️</span>
            <div>
              <strong className="text-white">Flèches ⬆️ / ⬇️</strong>
              <p className="text-[11px] text-neutral-400">Changer de rangée instantanément.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-lg">⌨️</span>
            <div>
              <strong className="text-white">Barre Espace</strong>
              <p className="text-[11px] text-neutral-400">Lancer un examen corrigé avec un "0".</p>
            </div>
          </div>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-2 text-[11px] md:text-xs text-neutral-400 px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🧑‍🎓</span>
            <span>Les étudiants en colère avancent vers votre bureau à droite.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <span>Touchez-les avec un <span className="text-arcade-red font-bold">0</span> pour les faire pleurer (😭) et les faire fuir.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>Ne les laissez pas atteindre votre bureau sous peine d'échec !</span>
          </div>
        </div>
      </div>

      {/* Start Button Area */}
      <div className="py-6 flex flex-col items-center gap-2">
        <button
          onClick={onStartGame}
          className="font-retro text-sm md:text-lg bg-gradient-to-r from-arcade-pink to-arcade-purple text-white px-8 py-3.5 rounded-xl border-t-2 border-pink-300 shadow-[0_4px_15px_rgba(236,72,153,0.4)] hover:shadow-[0_4px_25px_rgba(236,72,153,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold select-none group"
        >
          <span className="group-hover:animate-pulse">COMMENCER</span>
        </button>
        
        <p className="font-retro text-[8px] md:text-[9px] text-neutral-500 animate-pulse mt-2">
          (OU APPUYEZ SUR ESPACE / ENTRÉE)
        </p>
      </div>

    </div>
  );
};
