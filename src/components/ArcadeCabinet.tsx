import React from 'react';

interface ArcadeCabinetProps {
  children: React.ReactNode;
}

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 md:p-8 retro-grid relative">
      {/* Background neon ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-arcade-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-arcade-pink/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Cabinet Wrapper */}
      <div className="w-full max-w-4xl bg-neutral-900 border-x-8 border-t-8 border-neutral-800 rounded-t-3xl shadow-2xl relative flex flex-col glow-purple overflow-hidden">
        
        {/* Cabinet Marquee Header */}
        <div className="bg-neutral-950 border-b-4 border-neutral-800 p-4 relative flex flex-col items-center justify-center overflow-hidden">
          {/* Top Marquee Neon Strip */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-arcade-pink via-arcade-purple to-arcade-cyan shadow-[0_0_10px_#ec4899]" />
          
          {/* Backlit Marquee Text */}
          <h1 className="font-retro text-lg md:text-2xl tracking-widest text-center py-2 select-none animate-pulse">
            <span className="text-arcade-pink glow-text-pink">CANADIAN</span>{' '}
            <span className="text-white">COLLEGE</span>{' '}
            <span className="text-arcade-cyan glow-text-cyan">TAPPER</span>
          </h1>
          


          {/* Speaker Grills */}
          <div className="w-full flex justify-between px-8 mt-2 opacity-40">
            <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-6 bg-neutral-700 rounded-full" />
              ))}
            </div>
            <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-6 bg-neutral-700 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* CRT Bevel and Screen Area */}
        <div className="bg-neutral-950 p-3 md:p-6 flex-1 flex flex-col justify-center items-center relative">
          {/* Side Art / Bevel borders */}
          <div className="absolute left-0 top-0 bottom-0 w-2 md:w-4 bg-gradient-to-r from-neutral-800 to-neutral-950" />
          <div className="absolute right-0 top-0 bottom-0 w-2 md:w-4 bg-gradient-to-l from-neutral-800 to-neutral-950" />

          {/* CRT Screen Wrapper */}
          <div className="w-full aspect-[4/5] md:aspect-[4/3] max-w-3xl bg-neutral-950 border-4 border-neutral-800 rounded-2xl relative overflow-hidden crt-container shadow-inner">
            {/* Scanline overlay */}
            <div className="scanline-effect" />
            
            {/* CRT Flicker wrapper */}
            <div className="w-full h-full crt-flicker relative bg-neutral-950 flex flex-col">
              {children}
            </div>
          </div>
        </div>

        {/* Cabinet Control Panel */}
        <div className="bg-neutral-950 border-t-8 border-neutral-800 p-3 md:p-4 relative flex flex-row justify-between items-center gap-2 md:gap-4 overflow-hidden">
          {/* Joystick Visual */}
          <div className="flex items-center gap-2 md:gap-4 scale-90 sm:scale-100 origin-left pl-2">
            <div className="relative w-8 h-8 md:w-12 md:h-12 bg-neutral-800 rounded-full border-2 md:border-4 border-neutral-700 flex items-center justify-center">
              <div className="w-2 h-2 md:w-4 md:h-4 bg-neutral-900 rounded-full shadow-inner" />
              <div className="absolute -top-2 md:-top-3 w-4 h-4 md:w-6 md:h-6 bg-arcade-red rounded-full shadow-[0_0_8px_#ef4444] animate-bounce" />
            </div>
          </div>

          {/* Coin Slot Decor in the Center */}
          <div className="hidden md:flex flex-col items-center border border-neutral-800 rounded p-1.5 bg-neutral-900/50">
            <div className="text-[8px] font-retro text-neutral-500 mb-1">INSERT COIN</div>
            <div className="flex gap-3">
              <div className="w-4 h-6 border-2 border-arcade-red bg-neutral-950 rounded flex items-center justify-center relative">
                <div className="w-0.5 h-3 bg-arcade-yellow shadow-[0_0_4px_#f59e0b]" />
              </div>
              <div className="w-4 h-6 border-2 border-arcade-red bg-neutral-950 rounded flex items-center justify-center relative">
                <div className="w-0.5 h-3 bg-arcade-yellow shadow-[0_0_4px_#f59e0b]" />
              </div>
            </div>
          </div>

          {/* Action Buttons Visual */}
          <div className="flex items-center gap-2 md:gap-4 scale-90 sm:scale-100 origin-right pr-2">
            <div className="flex gap-1 md:gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-arcade-pink rounded-full border border-pink-300 shadow-[0_0_6px_#ec4899]" />
              <div className="w-6 h-6 md:w-8 md:h-8 bg-arcade-cyan rounded-full border border-cyan-300 shadow-[0_0_6px_#06b6d4]" />
            </div>
          </div>
        </div>
      </div>

      {/* Retro Credits Footer */}
      <footer className="mt-4 text-[9px] md:text-[11px] font-retro text-neutral-500 text-center tracking-wider">
        © 2026 CANADIAN COLLEGE ARCADE INC. • DÉVELOPPÉ AVEC ❤️
      </footer>
    </div>
  );
};
