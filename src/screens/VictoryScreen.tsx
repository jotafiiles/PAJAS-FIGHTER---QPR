import React, { useEffect, useRef } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { MatchResult } from '../types';
import { ProceduralSpriteRenderer } from '../game/animation/ProceduralSpriteRenderer';
import { Trophy, RotateCcw, Users, MapPin, Home, Zap, Clock, ShieldCheck } from 'lucide-react';

interface VictoryScreenProps {
  result: MatchResult;
  onRematch: () => void;
  onChangeCharacters: () => void;
  onChangeStage: () => void;
  onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  result,
  onRematch,
  onChangeCharacters,
  onChangeStage,
  onMainMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const winnerChar = result.winnerPlayer === 1 ? result.p1Character : result.p2Character;
  const winnerColor = result.winnerPlayer === 1 ? result.p1Color : result.p2Color;

  useEffect(() => {
    soundSystem.playVictoryFanfare();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height - 20);
      ctx.scale(2.4, 2.4);

      ProceduralSpriteRenderer.renderFighter(
        ctx,
        'victory',
        frame,
        winnerColor,
        1,
        false,
        false
      );
      ctx.restore();

      frame += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [winnerColor]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 bg-[#0a0a0b] bg-radial-immersive text-white select-none overflow-hidden">
      <div className="absolute inset-0 retro-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff4e00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00f2ff]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <header className="relative z-10 text-center pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 skew-x-[-12deg] bg-[#ff4e00]/20 border border-[#ff4e00]/50 text-[#ff4e00] font-tech text-xs mb-2">
          <Trophy className="w-4 h-4 text-[#ff4e00] skew-x-[12deg]" />
          <span className="skew-x-[12deg] font-bold uppercase tracking-widest">RESULTADO FINAL DEL COMBATE</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black font-heading tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff4e00] to-[#f27d26] uppercase arcade-text-glow drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
          ¡JUGADOR {result.winnerPlayer} VICTORIOSO!
        </h1>
      </header>

      {/* Center Winner Spotlight & Match Stats */}
      <main className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full items-center my-auto py-4">
        {/* Winner Showcase Card */}
        <div className="bg-[#151619] border-2 border-[#ff4e00] rounded-3xl p-6 shadow-[0_0_50px_rgba(255,78,0,0.3)] flex flex-col items-center text-center">
          <div className="bg-black/60 border border-[#2d2e32] rounded-2xl p-4 w-full h-64 flex items-center justify-center mb-4">
            <canvas ref={canvasRef} width={260} height={230} className="pixelated" />
          </div>

          <div className="skew-x-[-12deg] px-3 py-1 bg-[#ff4e00]/20 border border-[#ff4e00]/40 text-[#ff4e00] font-mono text-xs font-bold mb-2">
            <span className="skew-x-[12deg] block uppercase tracking-widest">CAMPEÓN DEL MATCH</span>
          </div>
          <h2 className="text-4xl font-black font-heading italic uppercase text-white tracking-wider">
            {winnerChar.name}
          </h2>
          <p className="text-xs text-[#ff4e00] font-tech font-bold uppercase tracking-wider">{winnerChar.nickname}</p>
          <p className="text-xs text-[#8e9299] font-tech mt-2 italic">
            "{winnerChar.tagline}"
          </p>
        </div>

        {/* Match Statistics & Summary */}
        <div className="space-y-4">
          <div className="bg-[#151619] border border-[#2d2e32] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#8e9299] uppercase tracking-widest border-b border-[#2d2e32] pb-2 flex items-center gap-2 font-tech">
              <ShieldCheck className="w-4 h-4 text-[#ff4e00]" />
              ESTADÍSTICAS DEL ENCUENTRO
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0f1012] p-3 rounded-xl border border-[#2d2e32]">
                <span className="text-[#8e9299] font-tech block mb-1 uppercase tracking-wider">ROUNDS GANADOS</span>
                <span className="text-2xl font-black font-heading italic text-white">
                  P1: {result.p1Rounds} — {result.p2Rounds} :P2
                </span>
              </div>

              <div className="bg-[#0f1012] p-3 rounded-xl border border-[#2d2e32]">
                <span className="text-[#8e9299] font-tech block mb-1 uppercase tracking-wider">DURACIÓN TOTAL</span>
                <span className="text-2xl font-black font-heading italic text-[#f27d26] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#ff4e00]" />
                  {result.totalTimeSeconds}s
                </span>
              </div>

              <div className="bg-[#0f1012] p-3 rounded-xl border border-[#2d2e32]">
                <span className="text-[#8e9299] font-tech block mb-1 uppercase tracking-wider">MAX COMBO P1</span>
                <span className="text-2xl font-black font-heading italic text-[#ff4e00] flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {result.maxComboP1} HITS
                </span>
              </div>

              <div className="bg-[#0f1012] p-3 rounded-xl border border-[#2d2e32]">
                <span className="text-[#8e9299] font-tech block mb-1 uppercase tracking-wider">MAX COMBO P2</span>
                <span className="text-2xl font-black font-heading italic text-[#00f2ff] flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {result.maxComboP2} HITS
                </span>
              </div>
            </div>

            <div className="bg-[#0f1012] p-3 rounded-xl border border-[#2d2e32] flex items-center justify-between text-xs font-tech">
              <span className="text-[#8e9299] uppercase tracking-wider">ESCENARIO:</span>
              <span className="text-[#ff4e00] font-bold uppercase">{result.stage.name}</span>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundSystem.playFightBell();
                onRematch();
              }}
              className="py-3.5 px-4 bg-[#ff4e00] hover:bg-[#ff6524] text-black font-black font-heading text-xl uppercase tracking-wider rounded-xl transition shadow-[0_0_25px_rgba(255,78,0,0.4)] flex items-center justify-center gap-2 border border-white/20"
            >
              <RotateCcw className="w-5 h-5" />
              REVANCHA
            </button>

            <button
              onClick={() => {
                soundSystem.playMenuSelect();
                onChangeCharacters();
              }}
              className="py-3.5 px-4 bg-[#151619] hover:bg-[#1e2026] border border-[#2d2e32] hover:border-[#ff4e00] text-white font-heading text-lg font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#ff4e00]" />
              PERSONAJES
            </button>

            <button
              onClick={() => {
                soundSystem.playMenuSelect();
                onChangeStage();
              }}
              className="py-3 px-4 bg-[#151619] hover:bg-[#1e2026] border border-[#2d2e32] hover:border-[#00f2ff] text-white font-heading text-lg font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#00f2ff]" />
              ESCENARIO
            </button>

            <button
              onClick={() => {
                soundSystem.playMenuCancel();
                onMainMenu();
              }}
              className="py-3 px-4 bg-red-950/30 hover:bg-red-950/60 border border-red-900/50 hover:border-red-600 text-red-300 font-heading text-lg font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-red-400" />
              MENÚ
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 border-t border-[#2d2e32] text-[11px] text-[#8e9299] font-tech uppercase tracking-wider">
        QUE PAJA RECORDS • PROTOTIPO ARCADE ORIGINAL
      </footer>
    </div>
  );
};
