import React from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { GameSettings } from '../types';
import { Volume2, Sliders, Monitor, ShieldAlert, Check, ArrowLeft, RefreshCw } from 'lucide-react';

interface OptionsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const OptionsScreen: React.FC<OptionsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);

    if (key === 'sfxVolume' || key === 'musicVolume') {
      soundSystem.setVolumes(
        key === 'sfxVolume' ? (value as number) : settings.sfxVolume,
        key === 'musicVolume' ? (value as number) : settings.musicVolume
      );
      soundSystem.playMenuMove();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#0a0a0b] bg-radial-immersive text-white select-none overflow-hidden">
      <div className="absolute inset-0 retro-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff4e00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00f2ff]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl bg-[#151619] border-2 border-[#ff4e00] rounded-2xl p-8 shadow-[0_0_50px_rgba(255,78,0,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2e32] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff4e00]/20 border border-[#ff4e00]/40 flex items-center justify-center">
              <Sliders className="w-6 h-6 text-[#ff4e00]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-wider font-heading leading-none">
                CONFIGURACIÓN ARCADE
              </h1>
              <p className="text-xs text-[#ff4e00] font-tech uppercase tracking-wider mt-1">Ajustes de audio, reglas de combate y pantalla</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundSystem.playMenuCancel();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e2026] hover:bg-[#282a33] text-[#8e9299] hover:text-white border border-[#2d2e32] hover:border-[#ff4e00] rounded-lg transition font-tech text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff4e00]" />
            VOLVER
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-5">
          {/* AUDIO SECTION */}
          <div className="bg-[#0f1012] p-5 rounded-xl border border-[#2d2e32]">
            <h2 className="text-xs font-bold text-[#ff4e00] uppercase tracking-widest mb-4 flex items-center gap-2 font-tech">
              <Volume2 className="w-4 h-4 text-[#ff4e00]" />
              AJUSTES DE SONIDO Y VOLUMEN
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[#8e9299] mb-1 font-tech uppercase tracking-wider">
                  <span>Efectos de Sonido (SFX / Golpes)</span>
                  <span className="font-mono text-white font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#2d2e32] rounded-lg appearance-none cursor-pointer accent-[#ff4e00]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#8e9299] mb-1 font-tech uppercase tracking-wider">
                  <span>Música de Fondo (Sintetizadores Arcade)</span>
                  <span className="font-mono text-white font-bold">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#2d2e32] rounded-lg appearance-none cursor-pointer accent-[#ff4e00]"
                />
              </div>
            </div>
          </div>

          {/* COMBAT RULES SECTION */}
          <div className="bg-[#0f1012] p-5 rounded-xl border border-[#2d2e32]">
            <h2 className="text-xs font-bold text-[#00f2ff] uppercase tracking-widest mb-4 flex items-center gap-2 font-tech">
              <ShieldAlert className="w-4 h-4 text-[#00f2ff]" />
              REGLAS DE ENCUENTRO
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8e9299] mb-2 font-tech uppercase tracking-wider">Formato de Rounds</label>
                <div className="flex gap-2">
                  {[1, 3].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        soundSystem.playMenuMove();
                        handleChange('roundCount', count as 1 | 3);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-tech uppercase tracking-wider transition ${
                        settings.roundCount === count
                          ? 'bg-[#ff4e00] text-black shadow-[0_0_12px_rgba(255,78,0,0.5)]'
                          : 'bg-[#151619] border border-[#2d2e32] text-[#8e9299] hover:text-white'
                      }`}
                    >
                      {count === 1 ? '1 ROUND' : 'MEJOR DE 3'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8e9299] mb-2 font-tech uppercase tracking-wider">Dificultad CPU</label>
                <div className="flex gap-2">
                  {(['EASY', 'NORMAL', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        soundSystem.playMenuMove();
                        handleChange('aiDifficulty', diff);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-tech uppercase tracking-wider transition ${
                        settings.aiDifficulty === diff
                          ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.5)]'
                          : 'bg-[#151619] border border-[#2d2e32] text-[#8e9299] hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL & FX SECTION */}
          <div className="bg-[#0f1012] p-5 rounded-xl border border-[#2d2e32]">
            <h2 className="text-xs font-bold text-[#f27d26] uppercase tracking-widest mb-4 flex items-center gap-2 font-tech">
              <Monitor className="w-4 h-4 text-[#f27d26]" />
              EFECTOS VISUALES ARCADE
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#151619]">
                <span className="text-xs text-[#8e9299] font-tech uppercase tracking-wider">Vibración de Pantalla (Screen Shake)</span>
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={(e) => {
                    soundSystem.playMenuMove();
                    handleChange('screenShake', e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#ff4e00] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#151619]">
                <span className="text-xs text-[#8e9299] font-tech uppercase tracking-wider">Filtro Retro CRT & Scanlines</span>
                <input
                  type="checkbox"
                  checked={settings.crtScanlines}
                  onChange={(e) => {
                    soundSystem.playMenuMove();
                    handleChange('crtScanlines', e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#ff4e00] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#151619]">
                <span className="text-xs text-[#8e9299] font-tech uppercase tracking-wider">Visualizador de Hitboxes / Hurtboxes (Debug)</span>
                <input
                  type="checkbox"
                  checked={settings.showHitboxes}
                  onChange={(e) => {
                    soundSystem.playMenuMove();
                    handleChange('showHitboxes', e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#ff4e00] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              soundSystem.playMenuSelect();
              onBack();
            }}
            className="w-full py-3.5 bg-[#ff4e00] hover:bg-[#ff6524] text-black font-black font-heading text-xl uppercase tracking-wider rounded-xl transition shadow-[0_0_25px_rgba(255,78,0,0.4)] flex items-center justify-center gap-2 border border-white/20"
          >
            <Check className="w-5 h-5" />
            GUARDAR Y REGRESAR
          </button>
        </div>
      </div>
    </div>
  );
};
