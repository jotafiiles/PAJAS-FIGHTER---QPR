import React, { useState, useEffect } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { STAGES } from '../data/stages';
import { CharacterData, ColorVariant, StageData } from '../types';
import { ArrowLeft, Swords, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface StageSelectProps {
  p1Char: CharacterData;
  p1Color: ColorVariant;
  p2Char: CharacterData;
  p2Color: ColorVariant;
  onConfirmStage: (stage: StageData) => void;
  onBack: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({
  p1Char,
  p1Color,
  p2Char,
  p2Color,
  onConfirmStage,
  onBack,
}) => {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const currentStage = STAGES[selectedStageIndex] || STAGES[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        soundSystem.playMenuMove();
        setSelectedStageIndex((prev) => (prev + 1) % STAGES.length);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        soundSystem.playMenuMove();
        setSelectedStageIndex((prev) => (prev - 1 + STAGES.length) % STAGES.length);
      } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyF') {
        soundSystem.playMenuSelect();
        onConfirmStage(currentStage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, onConfirmStage]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 bg-[#0a0a0b] bg-radial-immersive text-white select-none overflow-hidden">
      <div className="absolute inset-0 retro-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff4e00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00f2ff]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-[#2d2e32] pb-3">
        <button
          onClick={() => {
            soundSystem.playMenuCancel();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#151619] border border-[#2d2e32] text-[#8e9299] hover:text-white hover:border-[#ff4e00] transition font-tech text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff4e00]" />
          VOLVER A LUCHADORES
        </button>

        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ff4e00] to-[#f27d26] leading-none drop-shadow-[0_0_15px_rgba(255,78,0,0.4)]">
            SELECCIÓN DE ESCENARIO
          </h1>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8e9299] font-tech block mt-1">
            ELIGE EL CAMPO DE BATALLA
          </span>
        </div>

        {/* Versus matchup thumbnail */}
        <div className="flex items-center gap-3 bg-[#151619] px-3.5 py-1.5 rounded-lg border border-[#2d2e32]">
          <span className="text-xs font-heading font-black text-[#ff4e00] uppercase tracking-wider">{p1Char.name}</span>
          <span className="text-[10px] text-[#8e9299] font-mono font-bold">VS</span>
          <span className="text-xs font-heading font-black text-[#00f2ff] uppercase tracking-wider">{p2Char.name}</span>
        </div>
      </header>

      {/* Stage Carousel */}
      <main className="relative z-10 my-auto flex flex-col items-center max-w-4xl mx-auto w-full py-6">
        <div className="relative w-full aspect-video max-h-[380px] rounded-2xl overflow-hidden border-2 border-[#ff4e00] shadow-[0_0_50px_rgba(255,78,0,0.3)] bg-[#151619] flex flex-col justify-between p-6">
          {/* Top Location Badge */}
          <div className="flex items-center justify-between">
            <div className="skew-x-[-12deg] px-3 py-1 bg-black/70 backdrop-blur-md border border-[#2d2e32] text-xs font-tech text-[#f27d26] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#ff4e00] skew-x-[12deg]" />
              <span className="skew-x-[12deg] font-bold uppercase tracking-wider">{currentStage.location}</span>
            </div>

            <div className="skew-x-[-12deg] px-3 py-1 bg-black/70 border border-[#2d2e32] text-xs font-mono text-[#8e9299]">
              <span className="skew-x-[12deg] block font-bold">STAGE {selectedStageIndex + 1} / {STAGES.length}</span>
            </div>
          </div>

          {/* Stage Visual representation with neon graphics */}
          <div className="my-auto text-center space-y-2">
            <div className="inline-block p-4 rounded-2xl bg-black/60 border border-[#2d2e32] backdrop-blur-sm">
              <h2
                className="text-4xl sm:text-6xl font-black font-heading tracking-widest uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] italic"
                style={{ color: currentStage.previewColor }}
              >
                {currentStage.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto font-tech bg-black/60 p-2.5 rounded-lg backdrop-blur-sm border border-[#2d2e32]">
              {currentStage.description}
            </p>
          </div>

          {/* Nav buttons overlay */}
          <button
            onClick={() => {
              soundSystem.playMenuMove();
              setSelectedStageIndex((prev) => (prev - 1 + STAGES.length) % STAGES.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 hover:bg-[#ff4e00] border border-[#2d2e32] hover:border-[#ff4e00] flex items-center justify-center text-white hover:text-black transition shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              soundSystem.playMenuMove();
              setSelectedStageIndex((prev) => (prev + 1) % STAGES.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 hover:bg-[#ff4e00] border border-[#2d2e32] hover:border-[#ff4e00] flex items-center justify-center text-white hover:text-black transition shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Stage Selector Dots */}
        <div className="flex gap-2.5 mt-4">
          {STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                soundSystem.playMenuMove();
                setSelectedStageIndex(idx);
              }}
              className={`h-2.5 rounded-full transition-all ${
                selectedStageIndex === idx
                  ? 'w-8 bg-[#ff4e00] shadow-[0_0_8px_#ff4e00]'
                  : 'w-2.5 bg-[#2d2e32] hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        {/* Confirm Match Button */}
        <button
          onClick={() => {
            soundSystem.playFightBell();
            onConfirmStage(currentStage);
          }}
          className="mt-6 w-full max-w-md py-4 bg-[#ff4e00] hover:bg-[#ff6524] text-black font-black font-heading text-2xl tracking-widest uppercase rounded-xl transition shadow-[0_0_30px_rgba(255,78,0,0.5)] hover:scale-[1.02] flex items-center justify-center gap-3 border border-white/20"
        >
          <Swords className="w-7 h-7 text-black" />
          ¡COMENZAR COMBATE!
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 border-t border-[#2d2e32] text-[11px] text-[#8e9299] font-tech uppercase tracking-wider">
        USA LAS FLECHAS O A/D PARA CAMBIAR ESCENARIO • PRESIONA ENTER O ESPACIO PARA CONFIRMAR
      </footer>
    </div>
  );
};
