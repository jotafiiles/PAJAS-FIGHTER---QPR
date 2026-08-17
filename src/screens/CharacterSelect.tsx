import React, { useState, useEffect, useRef, useMemo } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { CHARACTERS } from '../data/characters';
import { CharacterData, ColorVariant, GameMode } from '../types';
import { SpriteController } from '../game/animation/SpriteController';
import { VariantSelectModal } from './VariantSelectModal';
import { ArrowLeft, Swords, Lock, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface CharacterSelectProps {
  mode: GameMode;
  onConfirmSelection: (
    p1Char: CharacterData,
    p1Color: ColorVariant,
    p2Char: CharacterData,
    p2Color: ColorVariant
  ) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  mode,
  onConfirmSelection,
  onBack,
}) => {
  const [p1Index, setP1Index] = useState<number>(0);
  const [p2Index, setP2Index] = useState<number>(1);
  const [p1Locked, setP1Locked] = useState<boolean>(false);
  const [p2Locked, setP2Locked] = useState<boolean>(false);

  const [p1Color, setP1Color] = useState<ColorVariant>(CHARACTERS[0].colors[0]);
  const [p2Color, setP2Color] = useState<ColorVariant>(CHARACTERS[1].colors[0] || CHARACTERS[0].colors[1]);

  const [selectingColorFor, setSelectingColorFor] = useState<1 | 2 | null>(null);

  const p1CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const p2CanvasRef = useRef<HTMLCanvasElement | null>(null);

  const p1Char = CHARACTERS[p1Index] || CHARACTERS[0];
  const p2Char = CHARACTERS[p2Index] || CHARACTERS[1];

  // Update default color when index changes
  useEffect(() => {
    if (p1Char && p1Char.colors && p1Char.colors.length > 0) {
      setP1Color(p1Char.colors[0]);
    }
  }, [p1Index]);

  useEffect(() => {
    if (p2Char && p2Char.colors && p2Char.colors.length > 0) {
      setP2Color(p2Char.colors[0]);
    }
  }, [p2Index]);

  // Keyboard navigation for character select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectingColorFor !== null) return;

      const cols = 4;
      const total = CHARACTERS.length;

      // P1 Navigation (W/A/S/D + F to confirm)
      if (!p1Locked) {
        if (e.code === 'KeyD') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev + 1) % total);
        } else if (e.code === 'KeyA') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev - 1 + total) % total);
        } else if (e.code === 'KeyS') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev + cols) % total);
        } else if (e.code === 'KeyW') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev - cols + total) % total);
        } else if (e.code === 'KeyF' || e.code === 'Space') {
          if (!CHARACTERS[p1Index].isLocked) {
            soundSystem.playMenuSelect();
            setSelectingColorFor(1);
          }
        }
      }

      // P2 Navigation (Arrow Keys + K to confirm)
      if (!p2Locked) {
        if (e.code === 'ArrowRight') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev + 1) % total);
        } else if (e.code === 'ArrowLeft') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev - 1 + total) % total);
        } else if (e.code === 'ArrowDown') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev + cols) % total);
        } else if (e.code === 'ArrowUp') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev - cols + total) % total);
        } else if (e.code === 'KeyK' || e.code === 'Enter') {
          if (!CHARACTERS[p2Index].isLocked) {
            soundSystem.playMenuSelect();
            setSelectingColorFor(2);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [p1Index, p2Index, p1Locked, p2Locked, selectingColorFor]);

  const p1SpriteCtrl = useMemo(() => new SpriteController(p1Char), [p1Char]);
  const p2SpriteCtrl = useMemo(() => new SpriteController(p2Char), [p2Char]);

  // Live Canvas Renders for P1 and P2 preview cards
  useEffect(() => {
    let frame = 0;
    let animId: number;

    const render = () => {
      // P1 Preview
      if (p1CanvasRef.current) {
        const ctx1 = p1CanvasRef.current.getContext('2d');
        if (ctx1) {
          ctx1.clearRect(0, 0, p1CanvasRef.current.width, p1CanvasRef.current.height);
          ctx1.save();
          ctx1.translate(p1CanvasRef.current.width / 2, p1CanvasRef.current.height - 15);
          ctx1.scale(1.7, 1.7);
          p1SpriteCtrl.render(
            ctx1,
            p1Locked ? 'victory' : 'idle',
            frame,
            p1Color,
            1,
            false,
            false
          );
          ctx1.restore();
        }
      }

      // P2 Preview
      if (p2CanvasRef.current) {
        const ctx2 = p2CanvasRef.current.getContext('2d');
        if (ctx2) {
          ctx2.clearRect(0, 0, p2CanvasRef.current.width, p2CanvasRef.current.height);
          ctx2.save();
          ctx2.translate(p2CanvasRef.current.width / 2, p2CanvasRef.current.height - 15);
          ctx2.scale(1.7, 1.7);
          p2SpriteCtrl.render(
            ctx2,
            p2Locked ? 'victory' : 'idle',
            frame,
            p2Color,
            -1,
            false,
            false
          );
          ctx2.restore();
        }
      }

      frame += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [p1Color, p2Color, p1Locked, p2Locked, p1SpriteCtrl, p2SpriteCtrl]);

  // Check if both players ready
  useEffect(() => {
    if (p1Locked && p2Locked) {
      const timer = setTimeout(() => {
        onConfirmSelection(p1Char, p1Color, p2Char, p2Color);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [p1Locked, p2Locked, p1Char, p1Color, p2Char, p2Color, onConfirmSelection]);

  // If in Arcade mode, auto-lock P2 CPU
  useEffect(() => {
    if (mode === 'ARCADE' && p1Locked && !p2Locked) {
      // Pick random unlocked fighter for CPU
      const available = CHARACTERS.filter((c) => !c.isLocked);
      const randomCpu = available[Math.floor(Math.random() * available.length)];
      const cpuIndex = CHARACTERS.findIndex((c) => c.id === randomCpu.id);
      setP2Index(cpuIndex);
      setP2Color(randomCpu.colors[0]);
      setP2Locked(true);
    }
  }, [mode, p1Locked, p2Locked]);

  const handleSelectSlot = (index: number, player: 1 | 2) => {
    if (CHARACTERS[index].isLocked) return;
    soundSystem.playMenuMove();

    if (player === 1 && !p1Locked) {
      setP1Index(index);
      setSelectingColorFor(1);
    } else if (player === 2 && !p2Locked) {
      setP2Index(index);
      setSelectingColorFor(2);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-[#0a0a0b] bg-radial-immersive text-white select-none overflow-hidden">
      {/* Background Ambience & Reticle Lines */}
      <div className="absolute inset-0 retro-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff4e00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00f2ff]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-[#2d2e32] pb-3">
        <button
          onClick={() => {
            soundSystem.playMenuCancel();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#151619] border border-[#2d2e32] text-[#8e9299] hover:text-white hover:border-[#ff4e00] transition font-tech text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff4e00]" />
          VOLVER
        </button>

        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ff4e00] to-[#f27d26] leading-none drop-shadow-[0_0_15px_rgba(255,78,0,0.4)]">
            SELECCIÓN DE LUCHADOR
          </h1>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8e9299] font-tech block mt-1">
            {mode === 'ARCADE' ? 'MODO 1P VS CPU • ARCADE MATCH' : 'MODO 2P VERSUS LOCAL • DUAL INPUT'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#ff4e00] font-mono font-bold block uppercase tracking-widest">
            ROSTER V1.0
          </span>
          <span className="text-[10px] text-[#8e9299] font-tech uppercase tracking-wider">
            8 CASILLAS ACTIVAS
          </span>
        </div>
      </header>

      {/* Main Selection Area: P1 Info (Left) - 4x2 Grid (Center) - P2 Info (Right) */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 my-auto items-center py-4">
        {/* P1 CARD & STATS */}
        <section className="relative lg:col-span-3 bg-[#151619] border-t border-r border-b border-[#2d2e32] border-l-4 border-l-[#ff4e00] rounded-xl p-4 shadow-[0_0_30px_rgba(255,78,0,0.15)] overflow-hidden">
          {/* Watermark P1 */}
          <div className="absolute top-0 right-2 text-[110px] font-black text-white/5 italic select-none pointer-events-none leading-none">
            P1
          </div>

          <div className="relative z-10 flex items-center justify-between mb-2">
            <div className="skew-x-[-12deg] px-3 py-0.5 rounded bg-[#ff4e00] text-black font-heading font-black tracking-wider text-xs shadow-[0_0_10px_#ff4e00]">
              <span className="skew-x-[12deg] block">1P {p1Locked ? '✓ LISTO' : 'SELECCIONANDO'}</span>
            </div>
            <span className="text-xs font-mono text-[#8e9299]">P1: W/A/S/D + F</span>
          </div>

          <div className="relative z-10 bg-[#0a0a0b] border border-[#2d2e32] rounded-lg p-2 flex flex-col items-center justify-center h-48 mb-3">
            <canvas ref={p1CanvasRef} width={200} height={180} className="pixelated" />
          </div>

          <div className="relative z-10 space-y-0.5">
            <h2 className="text-2xl font-black text-white font-heading uppercase italic tracking-tight leading-none">
              {p1Char.name}
            </h2>
            <p className="text-xs text-[#ff4e00] font-tech font-bold uppercase tracking-wider">{p1Char.nickname}</p>
            <p className="text-[11px] text-[#8e9299] font-tech line-clamp-2">{p1Char.description}</p>
          </div>

          {/* Stats Bars */}
          <div className="relative z-10 mt-3 space-y-2 border-t border-[#2d2e32] pt-2 text-xs">
            <StatBar label="FUERZA" value={p1Char.stats.strength} color="#ff4e00" />
            <StatBar label="VELOCIDAD" value={p1Char.stats.speed} color="#00f2ff" />
            <StatBar label="DEFENSA" value={p1Char.stats.defense} color="#10b981" />
            <StatBar label="ALCANCE" value={p1Char.stats.reach} color="#f27d26" />
            <StatBar label="TÉCNICA" value={p1Char.stats.technique} color="#c084fc" />
          </div>

          {!p1Locked && (
            <button
              onClick={() => {
                soundSystem.playMenuSelect();
                setSelectingColorFor(1);
              }}
              className="mt-4 w-full py-2.5 bg-[#ff4e00] hover:bg-[#ff6524] text-black font-heading text-lg font-black uppercase tracking-widest rounded transition shadow-[0_0_15px_rgba(255,78,0,0.5)]"
            >
              ELEGIR COLOR Y CONFIRMAR
            </button>
          )}
        </section>

        {/* 4x2 CHARACTER GRID (CENTER) */}
        <section className="lg:col-span-6 flex flex-col items-center">
          <div className="grid grid-cols-4 gap-3 w-full max-w-xl">
            {CHARACTERS.map((char, index) => {
              const isP1Here = p1Index === index;
              const isP2Here = p2Index === index;
              const isLocked = char.isLocked;

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    if (!isLocked) {
                      if (!p1Locked) handleSelectSlot(index, 1);
                      else if (!p2Locked) handleSelectSlot(index, 2);
                    }
                  }}
                  className={`group relative aspect-square rounded-xl p-2 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer overflow-hidden ${
                    isLocked
                      ? 'bg-[#151619] border-2 border-[#2d2e32] opacity-40 grayscale'
                      : isP1Here && isP2Here
                      ? 'bg-[#1e1b29] border-4 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.8)] scale-105 z-20'
                      : isP1Here
                      ? 'bg-[#251515] border-4 border-[#ff4e00] shadow-[0_0_25px_rgba(255,78,0,0.8)] scale-105 z-20'
                      : isP2Here
                      ? 'bg-[#10232e] border-4 border-[#00f2ff] shadow-[0_0_25px_rgba(0,242,255,0.8)] scale-105 z-20'
                      : 'bg-[#151619] border-2 border-[#2d2e32] hover:border-white/40 hover:scale-[1.02]'
                  }`}
                >
                  {/* P1 / P2 Badges */}
                  <div className="absolute top-1 left-1 flex gap-1 z-10">
                    {isP1Here && (
                      <span className="px-1.5 py-0.5 rounded bg-[#ff4e00] text-black text-[9px] font-heading font-black shadow-[0_0_8px_#ff4e00]">
                        1P
                      </span>
                    )}
                    {isP2Here && (
                      <span className="px-1.5 py-0.5 rounded bg-[#00f2ff] text-black text-[9px] font-heading font-black shadow-[0_0_8px_#00f2ff]">
                        2P
                      </span>
                    )}
                  </div>

                  {/* Center Character Art / Icon */}
                  <div className="my-auto flex items-center justify-center">
                    {isLocked ? (
                      <div className="flex flex-col items-center text-[#8e9299]">
                        <Lock className="w-6 h-6 mb-1" />
                        <span className="text-[9px] font-mono">[ ? ]</span>
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-black text-xl text-white shadow-md border border-white/20"
                        style={{ background: char.portraitBg }}
                      >
                        {char.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Name */}
                  <span
                    className={`text-[10px] font-heading font-bold uppercase tracking-wider text-center truncate w-full ${
                      isLocked ? 'text-zinc-600' : 'text-zinc-200'
                    }`}
                  >
                    {isLocked ? 'BLOQUEADO' : char.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-6 text-xs text-[#8e9299] font-tech uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4e00] shadow-[0_0_6px_#ff4e00]" /> P1: W/A/S/D + F
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_6px_#00f2ff]" /> P2: Flechas + K
            </span>
          </div>
        </section>

        {/* P2 CARD & STATS */}
        <section className="relative lg:col-span-3 bg-[#151619] border-t border-l border-b border-[#2d2e32] border-r-4 border-r-[#00f2ff]/80 rounded-xl p-4 shadow-[0_0_30px_rgba(0,242,255,0.15)] overflow-hidden">
          {/* Watermark P2 */}
          <div className="absolute top-0 left-2 text-[110px] font-black text-white/5 italic select-none pointer-events-none leading-none">
            P2
          </div>

          <div className="relative z-10 flex items-center justify-between mb-2">
            <div className="skew-x-[-12deg] px-3 py-0.5 rounded bg-[#00f2ff] text-black font-heading font-black tracking-wider text-xs shadow-[0_0_10px_#00f2ff]">
              <span className="skew-x-[12deg] block">2P {p2Locked ? '✓ LISTO' : mode === 'ARCADE' ? 'CPU' : 'SELECCIONANDO'}</span>
            </div>
            <span className="text-xs font-mono text-[#8e9299]">P2: Flechas + K</span>
          </div>

          <div className="relative z-10 bg-[#0a0a0b] border border-[#2d2e32] rounded-lg p-2 flex flex-col items-center justify-center h-48 mb-3">
            <canvas ref={p2CanvasRef} width={200} height={180} className="pixelated" />
          </div>

          <div className="relative z-10 space-y-0.5">
            <h2 className="text-2xl font-black text-white font-heading uppercase italic tracking-tight leading-none">
              {p2Char.name}
            </h2>
            <p className="text-xs text-[#00f2ff] font-tech font-bold uppercase tracking-wider">{p2Char.nickname}</p>
            <p className="text-[11px] text-[#8e9299] font-tech line-clamp-2">{p2Char.description}</p>
          </div>

          {/* Stats Bars */}
          <div className="relative z-10 mt-3 space-y-2 border-t border-[#2d2e32] pt-2 text-xs">
            <StatBar label="FUERZA" value={p2Char.stats.strength} color="#00f2ff" />
            <StatBar label="VELOCIDAD" value={p2Char.stats.speed} color="#38bdf8" />
            <StatBar label="DEFENSA" value={p2Char.stats.defense} color="#10b981" />
            <StatBar label="ALCANCE" value={p2Char.stats.reach} color="#f27d26" />
            <StatBar label="TÉCNICA" value={p2Char.stats.technique} color="#c084fc" />
          </div>

          {!p2Locked && mode !== 'ARCADE' && (
            <button
              onClick={() => {
                soundSystem.playMenuSelect();
                setSelectingColorFor(2);
              }}
              className="mt-4 w-full py-2.5 bg-[#00f2ff] hover:bg-[#38e6f2] text-black font-heading text-lg font-black uppercase tracking-widest rounded transition shadow-[0_0_15px_rgba(0,242,255,0.5)]"
            >
              ELEGIR COLOR Y CONFIRMAR
            </button>
          )}
        </section>
      </main>

      {/* Footer Instructions */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between py-2 border-t border-[#2d2e32] text-[11px] text-[#8e9299] font-tech">
        <div className="skew-x-[-15deg] bg-[#ff4e00]/10 px-4 py-1 border-l border-r border-[#ff4e00]/40">
          <span className="skew-x-[15deg] text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff4e00] block animate-pulse">
            SELECCIONA TU LUCHADOR Y PERSONALIZA SU PALETA
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0 font-mono text-[10px] text-[#8e9299]">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white">SPACE</kbd> CONFIRMAR
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white">ESC</kbd> SALIR
          </span>
        </div>
      </footer>

      {/* Variant / Color Select Modal */}
      {selectingColorFor === 1 && (
        <VariantSelectModal
          playerNumber={1}
          character={p1Char}
          selectedColor={p1Color}
          onSelectColor={setP1Color}
          onConfirm={() => {
            setP1Locked(true);
            setSelectingColorFor(null);
          }}
        />
      )}

      {selectingColorFor === 2 && (
        <VariantSelectModal
          playerNumber={2}
          character={p2Char}
          selectedColor={p2Color}
          onSelectColor={setP2Color}
          onConfirm={() => {
            setP2Locked(true);
            setSelectingColorFor(null);
          }}
        />
      )}
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-[10px] uppercase font-bold text-[#8e9299] mb-1">
      <span>{label}</span>
      <span className="text-white font-mono">{value}/10</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-none overflow-hidden">
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${(value / 10) * 100}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </div>
  </div>
);
