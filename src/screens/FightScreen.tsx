import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { Camera } from '../game/engine/Camera';
import { InputManager } from '../game/engine/InputManager';
import { ParticleSystem } from '../game/engine/ParticleSystem';
import { ScreenShake } from '../game/engine/ScreenShake';
import { StageRenderer } from '../game/engine/StageRenderer';
import { Fighter } from '../game/entities/Fighter';
import { CombatEngine } from '../game/combat/CombatEngine';
import { Collision } from '../game/collision/Collision';
import { DEFAULT_P1_CONTROLS, DEFAULT_P2_CONTROLS } from '../data/controls';
import {
  CharacterData,
  ColorVariant,
  GameMode,
  GameSettings,
  MatchResult,
  StageData,
} from '../types';
import { Pause, Play, RotateCcw, Home, Swords, Volume2, Shield } from 'lucide-react';

interface FightScreenProps {
  mode: GameMode;
  p1Char: CharacterData;
  p1Color: ColorVariant;
  p2Char: CharacterData;
  p2Color: ColorVariant;
  stage: StageData;
  settings: GameSettings;
  onMatchEnd: (result: MatchResult) => void;
  onExitToMenu: () => void;
}

export const FightScreen: React.FC<FightScreenProps> = ({
  mode,
  p1Char,
  p1Color,
  p2Char,
  p2Color,
  stage,
  settings,
  onMatchEnd,
  onExitToMenu,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hudState, setHudState] = useState<{
    p1Health: number;
    p2Health: number;
    p1Super: number;
    p2Super: number;
    timer: number;
    round: number;
    p1Rounds: number;
    p2Rounds: number;
    p1Combo: number;
    p2Combo: number;
    announcement: string;
    announcementSubtext: string;
  }>({
    p1Health: 100,
    p2Health: 100,
    p1Super: 0,
    p2Super: 0,
    timer: settings.roundTimerSeconds,
    round: 1,
    p1Rounds: 0,
    p2Rounds: 0,
    p1Combo: 0,
    p2Combo: 0,
    announcement: 'ROUND 1',
    announcementSubtext: 'READY...',
  });

  const engineRef = useRef<CombatEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);

  // Initialize engine and game loop
  useEffect(() => {
    soundSystem.startMusic('FIGHT');

    const particles = new ParticleSystem();
    const screenShake = new ScreenShake();
    const camera = new Camera();

    const isP2CPU = mode === 'ARCADE';
    const p1 = new Fighter(1, p1Char, p1Color, stage.width * 0.35, false);
    const p2 = new Fighter(2, p2Char, p2Color, stage.width * 0.65, isP2CPU);

    const inputManager = new InputManager(DEFAULT_P1_CONTROLS, DEFAULT_P2_CONTROLS);
    inputManagerRef.current = inputManager;

    const combatEngine = new CombatEngine(
      p1,
      p2,
      stage,
      settings,
      particles,
      screenShake,
      camera
    );

    combatEngine.onMatchEnd = (result) => {
      onMatchEnd(result);
    };

    engineRef.current = combatEngine;
    combatEngine.startRound();

    let animationFrameId: number;
    let lastTime = performance.now();
    let animTime = 0;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      animTime += dt;

      const canvas = canvasRef.current;
      if (canvas && combatEngine) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 1. UPDATE GAME STATE IF NOT PAUSED
          if (!isPaused) {
            const p1Input = inputManager.getP1Input();
            const p2Input = inputManager.getP2Input(p2, p1, settings.aiDifficulty);

            p1.update(p1Input, p2, stage.width, dt);
            p2.update(p2Input, p1, stage.width, dt);

            // In Training Mode, replenish dummy health and P1 special meter
            if (mode === 'TRAINING') {
              if (p2.health < 40) p2.health = Math.min(100, p2.health + 0.4);
              if (p1.specialMeter < 100) p1.specialMeter = Math.min(100, p1.specialMeter + 0.2);
            }

            combatEngine.update(dt);
            particles.update();

            // Update React HUD state periodically
            setHudState({
              p1Health: p1.health,
              p2Health: p2.health,
              p1Super: p1.specialMeter,
              p2Super: p2.specialMeter,
              timer: combatEngine.roundState.timer,
              round: combatEngine.roundState.currentRound,
              p1Rounds: combatEngine.roundState.p1RoundsWon,
              p2Rounds: combatEngine.roundState.p2RoundsWon,
              p1Combo: combatEngine.p1Combo,
              p2Combo: combatEngine.p2Combo,
              announcement: combatEngine.roundState.announcementText,
              announcementSubtext: combatEngine.roundState.announcementSubtext,
            });
          }

          // 2. RENDER STAGE, FIGHTERS & PARTICLES ON CANVAS
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          // Apply Camera & Screen Shake
          const shakeX = screenShake.offsetX;
          const shakeY = screenShake.offsetY;
          ctx.translate(-camera.x + shakeX, shakeY);

          // Render Stage Background
          StageRenderer.renderStage(
            ctx,
            stage,
            camera.x,
            animTime,
            canvas.width,
            canvas.height
          );

          // Ground shadow / stage alignment
          const groundY = canvas.height - stage.groundY;

          // Render Fighters (at ground anchor)
          ctx.save();
          ctx.translate(0, groundY);

          // Render Hurtbox / Hitbox debug if enabled
          if (settings.showHitboxes) {
            Collision.renderDebugBoxes(
              ctx,
              p1.getActiveHitbox(),
              p1.getHurtbox(),
              p1.getPushbox()
            );
            Collision.renderDebugBoxes(
              ctx,
              p2.getActiveHitbox(),
              p2.getHurtbox(),
              p2.getPushbox()
            );
          }

          p1.render(ctx, false, combatEngine.hitstopRemaining > 0);
          p2.render(ctx, false, combatEngine.hitstopRemaining > 0);

          // Render Projectiles
          combatEngine.renderProjectiles(ctx);

          // Render Particles
          particles.render(ctx);

          ctx.restore();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Window pause on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      inputManager.destroy();
    };
  }, [p1Char, p1Color, p2Char, p2Color, stage, mode, settings, onMatchEnd]);

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.roundState.p1RoundsWon = 0;
      engineRef.current.roundState.p2RoundsWon = 0;
      engineRef.current.startRound();
      setIsPaused(false);
      soundSystem.playFightBell();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-[#0a0a0b] bg-radial-immersive flex items-center justify-center overflow-hidden select-none ${
        settings.crtScanlines ? 'crt-overlay' : ''
      }`}
    >
      {/* 2D HTML5 Canvas Arena */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="w-full max-w-6xl h-auto max-h-[85vh] aspect-[5/3] bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)] border-4 border-[#2d2e32] rounded-lg pixelated"
      />

      {/* RETRO ARCADE HUD OVERLAY */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Top HUD: P1 Health - Timer - P2 Health */}
        <div className="flex items-start justify-between gap-4">
          {/* P1 HEALTH BAR */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-heading font-black text-xl text-white border-2 border-[#ff4e00] shadow-[0_0_10px_rgba(255,78,0,0.4)]"
                style={{ background: p1Char.portraitBg }}
              >
                {p1Char.name.charAt(0)}
              </div>
              <div>
                <span className="font-heading font-black italic text-xl text-[#ff4e00] tracking-wider block leading-none">
                  {p1Char.name}
                </span>
                <div className="flex gap-1 mt-1">
                  {/* Round badges */}
                  {[...Array(settings.roundCount === 1 ? 1 : 2)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border border-[#ff4e00]/60 ${
                        i < hudState.p1Rounds
                          ? 'bg-[#ff4e00] shadow-[0_0_8px_#ff4e00]'
                          : 'bg-[#151619]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Health Meter container */}
            <div className="h-6 bg-[#151619] border-2 border-[#ff4e00]/80 rounded overflow-hidden p-0.5 flex">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-[#ff4e00] rounded-none transition-all duration-150 shadow-[0_0_10px_#ff4e00]"
                style={{ width: `${hudState.p1Health}%` }}
              />
            </div>

            {/* P1 Combo popup */}
            {hudState.p1Combo > 1 && (
              <div className="mt-2 text-2xl font-black font-heading italic text-[#ff4e00] arcade-text-glow animate-bounce">
                {hudState.p1Combo} HITS COMBO!
              </div>
            )}
          </div>

          {/* MATCH TIMER & ROUND INFO (CENTER) */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-14 bg-[#151619] border-2 border-[#ff4e00] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,78,0,0.4)] skew-x-[-8deg]">
              <span
                className={`font-heading font-black text-4xl skew-x-[8deg] ${
                  hudState.timer <= 15 ? 'text-red-500 animate-pulse' : 'text-white'
                }`}
              >
                {hudState.timer}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8e9299] mt-1 uppercase tracking-widest font-bold">
              ROUND {hudState.round}
            </span>
          </div>

          {/* P2 HEALTH BAR */}
          <div className="flex-1 flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1 flex-row-reverse">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-heading font-black text-xl text-white border-2 border-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.4)]"
                style={{ background: p2Char.portraitBg }}
              >
                {p2Char.name.charAt(0)}
              </div>
              <div className="text-right">
                <span className="font-heading font-black italic text-xl text-[#00f2ff] tracking-wider block leading-none">
                  {p2Char.name}
                </span>
                <div className="flex gap-1 mt-1 justify-end">
                  {[...Array(settings.roundCount === 1 ? 1 : 2)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border border-[#00f2ff]/60 ${
                        i < hudState.p2Rounds
                          ? 'bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]'
                          : 'bg-[#151619]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Health Meter container (reversed for P2) */}
            <div className="w-full h-6 bg-[#151619] border-2 border-[#00f2ff]/80 rounded overflow-hidden p-0.5 flex justify-end">
              <div
                className="h-full bg-gradient-to-l from-red-600 via-sky-500 to-[#00f2ff] rounded-none transition-all duration-150 shadow-[0_0_10px_#00f2ff]"
                style={{ width: `${hudState.p2Health}%` }}
              />
            </div>

            {/* P2 Combo popup */}
            {hudState.p2Combo > 1 && (
              <div className="mt-2 text-2xl font-black font-heading italic text-[#00f2ff] arcade-cyan-glow animate-bounce">
                {hudState.p2Combo} HITS COMBO!
              </div>
            )}
          </div>
        </div>

        {/* CENTER BIG ARCADE ANNOUNCEMENTS */}
        {hudState.announcement && (
          <div className="my-auto text-center space-y-1">
            <h2 className="text-6xl sm:text-8xl font-black font-heading italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ff4e00] via-white to-[#f27d26] arcade-text-glow uppercase drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] animate-pulse">
              {hudState.announcement}
            </h2>
            {hudState.announcementSubtext && (
              <p className="text-xl sm:text-2xl font-tech font-bold text-[#ff4e00] uppercase tracking-widest">
                {hudState.announcementSubtext}
              </p>
            )}
          </div>
        )}

        {/* BOTTOM HUD: SUPER METERS & PAUSE BUTTON */}
        <div className="flex items-end justify-between">
          {/* P1 Super Meter */}
          <div className="w-48 bg-[#151619]/90 p-2.5 rounded-lg border border-[#2d2e32]">
            <div className="flex justify-between text-[10px] font-mono text-[#8e9299] mb-1 uppercase font-bold">
              <span>SUPER QP</span>
              <span className={hudState.p1Super >= 25 ? 'text-[#ff4e00] font-bold' : ''}>
                {hudState.p1Super >= 25 ? '★ LISTO (H)' : `${Math.floor(hudState.p1Super)}%`}
              </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-none overflow-hidden">
              <div
                className={`h-full transition-all ${
                  hudState.p1Super >= 25
                    ? 'bg-[#ff4e00] shadow-[0_0_10px_#ff4e00]'
                    : 'bg-white/30'
                }`}
                style={{ width: `${hudState.p1Super}%` }}
              />
            </div>
          </div>

          {/* Pause Button Trigger */}
          <button
            onClick={() => {
              soundSystem.playMenuSelect();
              setIsPaused(true);
            }}
            className="pointer-events-auto px-4 py-2 bg-[#151619] hover:bg-[#1f2026] border border-[#2d2e32] hover:border-[#ff4e00] rounded text-[#8e9299] hover:text-white transition font-tech text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Pause className="w-4 h-4 text-[#ff4e00]" />
            PAUSA (ESC)
          </button>

          {/* P2 Super Meter */}
          <div className="w-48 bg-[#151619]/90 p-2.5 rounded-lg border border-[#2d2e32]">
            <div className="flex justify-between text-[10px] font-mono text-[#8e9299] mb-1 uppercase font-bold">
              <span className={hudState.p2Super >= 25 ? 'text-[#00f2ff] font-bold' : ''}>
                {hudState.p2Super >= 25 ? '★ LISTO (P/Ñ)' : `${Math.floor(hudState.p2Super)}%`}
              </span>
              <span>SUPER QP</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-none overflow-hidden flex justify-end">
              <div
                className={`h-full transition-all ${
                  hudState.p2Super >= 25
                    ? 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]'
                    : 'bg-white/30'
                }`}
                style={{ width: `${hudState.p2Super}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PAUSE MENU MODAL */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#151619] border-2 border-[#ff4e00] rounded-2xl p-6 shadow-[0_0_50px_rgba(255,78,0,0.4)] text-center text-white space-y-4">
            <h2 className="text-4xl font-black font-heading uppercase italic tracking-widest text-[#ff4e00]">
              JUEGO EN PAUSA
            </h2>
            <p className="text-xs text-[#8e9299] font-tech uppercase tracking-widest">PAJAS FIGHTER • QUE PAJA RECORDS</p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  soundSystem.playMenuSelect();
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-[#ff4e00] hover:bg-[#ff6524] text-black font-heading text-xl font-black uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                CONTINUAR COMBATE
              </button>

              <button
                onClick={() => {
                  soundSystem.playMenuSelect();
                  handleRestart();
                }}
                className="w-full py-3 bg-[#1e2026] hover:bg-[#282a33] text-white border border-[#2d2e32] font-heading text-lg font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-[#ff4e00]" />
                REINICIAR PELEA
              </button>

              <button
                onClick={() => {
                  soundSystem.playMenuCancel();
                  onExitToMenu();
                }}
                className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 font-heading text-lg font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4 text-red-400" />
                SALIR AL MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
