import React, { useEffect } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { GameMode, GameScreen } from '../types';
import { Swords, Bot, Award, Sliders, HelpCircle, Disc, Volume2, Sparkles } from 'lucide-react';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenOptions: () => void;
  onOpenControls: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectMode,
  onOpenOptions,
  onOpenControls,
}) => {
  useEffect(() => {
    soundSystem.startMusic('MENU');
    return () => {
      // do not necessarily stop music immediately if transitioning
    };
  }, []);

  const handleStartMode = (mode: GameMode) => {
    soundSystem.playMenuSelect();
    onSelectMode(mode);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 bg-[#0a0a0b] bg-radial-immersive text-white overflow-hidden select-none">
      {/* Background ambient vinyl record glow & grid */}
      <div className="absolute inset-0 retro-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff4e00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00f2ff]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2 border-b border-[#2d2e32] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-[#ff4e00] to-[#f27d26] flex items-center justify-center shadow-[0_0_20px_rgba(255,78,0,0.5)] skew-x-[-10deg]">
            <Disc className="w-6 h-6 text-black skew-x-[10deg] animate-spin-slow" />
          </div>
          <div>
            <span className="font-heading text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ff4e00] block leading-tight">
              QUE PAJA RECORDS
            </span>
            <span className="text-[10px] text-[#8e9299] font-mono tracking-widest uppercase">
              ARCADE FIGHTER • ORIGINAL ENGINE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => soundSystem.toggleMute()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#151619] border border-[#2d2e32] text-[#8e9299] hover:text-white hover:border-[#ff4e00] transition text-xs font-tech uppercase tracking-wider"
          >
            <Volume2 className="w-4 h-4 text-[#ff4e00]" />
            AUDIO ON
          </button>
        </div>
      </header>

      {/* Center Hero Title */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
        <div className="relative mb-4 text-center">
          <div className="absolute -inset-8 bg-[#ff4e00]/15 blur-2xl rounded-full pointer-events-none" />
          
          <div className="inline-block skew-x-[-15deg] bg-[#ff4e00]/10 px-6 py-1.5 border-l border-r border-[#ff4e00]/40 mb-3">
            <span className="skew-x-[15deg] text-xs font-bold uppercase tracking-[0.3em] font-tech text-[#ff4e00] block animate-pulse">
              QUE PAJA RECORDS PRESENTA
            </span>
          </div>

          <h1 className="text-7xl sm:text-9xl font-black font-heading tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ff4e00] via-white to-[#f27d26] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] text-center leading-none">
            PAJAS
          </h1>
          
          <div className="flex items-center justify-center gap-4 mt-1">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-[#ff4e00]" />
            <span className="text-4xl sm:text-6xl font-black italic text-white font-heading tracking-widest uppercase arcade-text-glow">
              FIGHTER
            </span>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-[#ff4e00]" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#8e9299] max-w-md text-center font-tech mb-8 tracking-wide uppercase">
          Videojuego de lucha 2D Arcade del sello discográfico. Combates 1v1 con ondas sónicas y golpes demoledores.
        </p>

        {/* Arcade Menu Buttons */}
        <div className="w-full max-w-md space-y-3">
          {/* 1. VERSUS 2P LOCAL (PRIMARY FLOW) */}
          <button
            onClick={() => handleStartMode('VERSUS')}
            onMouseEnter={() => soundSystem.playMenuMove()}
            className="group relative w-full py-4 px-6 bg-[#151619] hover:bg-[#1a171d] border-2 border-[#ff4e00] text-white rounded-xl font-heading text-2xl tracking-wider transition-all duration-200 shadow-[0_0_25px_rgba(255,78,0,0.3)] hover:shadow-[0_0_35px_rgba(255,78,0,0.6)] hover:scale-[1.02] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded bg-[#ff4e00] flex items-center justify-center text-black font-black">
                <Swords className="w-6 h-6 text-black group-hover:rotate-12 transition-transform" />
              </div>
              <div className="text-left">
                <span className="block leading-none font-black italic uppercase text-white">MODO VERSUS (2P)</span>
                <span className="text-[11px] font-tech text-[#8e9299] uppercase tracking-wider">
                  2 Jugadores • Mismo teclado
                </span>
              </div>
            </div>
            <div className="skew-x-[-12deg] px-3 py-1 bg-[#ff4e00] text-black font-heading font-black text-xs tracking-widest uppercase">
              <span className="skew-x-[12deg] block">JUGAR</span>
            </div>
          </button>

          {/* 2. ARCADE VS CPU */}
          <button
            onClick={() => handleStartMode('ARCADE')}
            onMouseEnter={() => soundSystem.playMenuMove()}
            className="group relative w-full py-3.5 px-6 bg-[#151619] hover:bg-[#121c24] text-white rounded-xl font-heading text-xl tracking-wider transition-all duration-200 border-2 border-[#2d2e32] hover:border-[#00f2ff] shadow-md hover:shadow-[0_0_25px_rgba(0,242,255,0.3)] hover:scale-[1.01] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded bg-[#00f2ff]/20 border border-[#00f2ff]/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#00f2ff] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <span className="block leading-none font-black italic uppercase">MODO ARCADE</span>
                <span className="text-[11px] font-tech text-[#8e9299] uppercase tracking-wider">1P vs CPU Inteligente</span>
              </div>
            </div>
            <div className="skew-x-[-12deg] px-2.5 py-0.5 bg-[#00f2ff]/20 border border-[#00f2ff]/50 text-[#00f2ff] font-heading font-bold text-xs tracking-widest uppercase">
              <span className="skew-x-[12deg] block">1P VS CPU</span>
            </div>
          </button>

          {/* 3. TRAINING / PRÁCTICA */}
          <button
            onClick={() => handleStartMode('TRAINING')}
            onMouseEnter={() => soundSystem.playMenuMove()}
            className="group relative w-full py-3.5 px-6 bg-[#151619] hover:bg-[#15231c] text-white rounded-xl font-heading text-xl tracking-wider transition-all duration-200 border-2 border-[#2d2e32] hover:border-[#10b981] shadow-md hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.01] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#10b981] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <span className="block leading-none font-black italic uppercase">MODO PRÁCTICA</span>
                <span className="text-[11px] font-tech text-[#8e9299] uppercase tracking-wider">Dummy de entrenamiento</span>
              </div>
            </div>
            <div className="skew-x-[-12deg] px-2.5 py-0.5 bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] font-heading font-bold text-xs tracking-widest uppercase">
              <span className="skew-x-[12deg] block">TRAINING</span>
            </div>
          </button>

          {/* 4. CONTROLS GUIDE */}
          <button
            onClick={() => {
              soundSystem.playMenuMove();
              onOpenControls();
            }}
            className="w-full py-3 px-6 bg-[#151619] hover:bg-[#1f2026] text-[#8e9299] hover:text-white rounded-xl font-heading text-lg tracking-wider transition border border-[#2d2e32] hover:border-[#ff4e00]/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#ff4e00]" />
              <span className="font-bold uppercase tracking-wider">CONTROLES Y CÓMO JUGAR</span>
            </div>
            <span className="text-[10px] text-[#8e9299] font-mono uppercase tracking-widest">WASD & FLECHAS</span>
          </button>

          {/* 5. OPTIONS */}
          <button
            onClick={() => {
              soundSystem.playMenuMove();
              onOpenOptions();
            }}
            className="w-full py-3 px-6 bg-[#151619] hover:bg-[#1f2026] text-[#8e9299] hover:text-white rounded-xl font-heading text-lg tracking-wider transition border border-[#2d2e32] hover:border-[#ff4e00]/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-[#8e9299]" />
              <span className="font-bold uppercase tracking-wider">OPCIONES Y AJUSTES</span>
            </div>
            <span className="text-[10px] text-[#8e9299] font-mono uppercase tracking-widest">AUDIO & HITBOXES</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[#2d2e32] text-[11px] text-[#8e9299] font-tech uppercase tracking-wider">
        <span>© 2026 QUE PAJA RECORDS. PROTOTIPO ARCADE ORIGINAL.</span>
        <span className="text-[#ff4e00] font-mono mt-1 sm:mt-0 font-bold">
          PRESIONA ESPACIO O HAZ CLIC PARA SELECCIONAR
        </span>
      </footer>
    </div>
  );
};
