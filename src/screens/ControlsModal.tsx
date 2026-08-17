import React from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { Zap, Shield, Flame, Swords, ArrowRight, X } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-3xl bg-[#151619] border-2 border-[#ff4e00] rounded-2xl p-6 shadow-[0_0_50px_rgba(255,78,0,0.35)] text-white">
        <button
          onClick={() => {
            soundSystem.playMenuCancel();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#8e9299] hover:text-white p-2 rounded-lg bg-[#1e2026] hover:bg-[#282a33] border border-[#2d2e32] transition"
        >
          <X className="w-5 h-5 text-[#ff4e00]" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#2d2e32] pb-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#ff4e00]/20 border border-[#ff4e00]/40 flex items-center justify-center">
            <Swords className="w-6 h-6 text-[#ff4e00]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-wider font-heading leading-none">
              GUÍA DE CONTROLES Y MECÁNICAS
            </h2>
            <p className="text-xs text-[#ff4e00] font-tech uppercase tracking-wider mt-1">2 Jugadores en el mismo teclado • Que Paja Fighter</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* PLAYER 1 CONTROLS */}
          <div className="bg-[#0f1012] border border-[#2d2e32] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#2d2e32] pb-2">
              <span className="font-heading font-black italic text-[#ff4e00] text-lg uppercase">JUGADOR 1 (P1)</span>
              <div className="skew-x-[-12deg] px-2 py-0.5 bg-[#ff4e00]/20 text-[#ff4e00] font-tech text-xs font-bold">
                <span className="skew-x-[12deg] block uppercase">LADO IZQUIERDO</span>
              </div>
            </div>
            <div className="space-y-2 text-xs font-tech">
              <div className="flex justify-between items-center py-1 border-b border-[#2d2e32]/60">
                <span className="text-[#8e9299] uppercase">Moverse / Agacharse / Saltar</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">W</kbd>
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">A</kbd>
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">S</kbd>
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">D</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2d2e32]/60">
                <span className="text-[#8e9299] uppercase">Golpe (Punch)</span>
                <kbd className="px-2.5 py-1 bg-[#ff4e00]/20 border border-[#ff4e00]/40 text-[#ff4e00] rounded font-mono font-bold text-xs">F</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2d2e32]/60">
                <span className="text-[#8e9299] uppercase">Patada (Kick)</span>
                <kbd className="px-2.5 py-1 bg-[#f27d26]/20 border border-[#f27d26]/40 text-[#f27d26] rounded font-mono font-bold text-xs">G</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#8e9299] uppercase">Ataque Especial (Super QP)</span>
                <kbd className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 rounded font-mono font-bold text-xs">H</kbd>
              </div>
            </div>
          </div>

          {/* PLAYER 2 CONTROLS */}
          <div className="bg-[#0f1012] border border-[#2d2e32] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#2d2e32] pb-2">
              <span className="font-heading font-black italic text-[#00f2ff] text-lg uppercase">JUGADOR 2 (P2)</span>
              <div className="skew-x-[-12deg] px-2 py-0.5 bg-[#00f2ff]/20 text-[#00f2ff] font-tech text-xs font-bold">
                <span className="skew-x-[12deg] block uppercase">LADO DERECHO</span>
              </div>
            </div>
            <div className="space-y-2 text-xs font-tech">
              <div className="flex justify-between items-center py-1 border-b border-[#2d2e32]/60">
                <span className="text-[#8e9299] uppercase">Moverse / Agacharse / Saltar</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">↑</kbd>
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">←</kbd>
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">↓</kbd>
                  <kbd className="px-2 py-1 bg-[#1e2026] border border-[#2d2e32] rounded font-mono font-bold text-xs text-white">→</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2d2e32]/60">
                <span className="text-[#8e9299] uppercase">Golpe (Punch)</span>
                <kbd className="px-2.5 py-1 bg-[#00f2ff]/20 border border-[#00f2ff]/40 text-[#00f2ff] rounded font-mono font-bold text-xs">K</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2d2e32]/60">
                <span className="text-[#8e9299] uppercase">Patada (Kick)</span>
                <kbd className="px-2.5 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-300 rounded font-mono font-bold text-xs">L</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#8e9299] uppercase">Ataque Especial (Super QP)</span>
                <kbd className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded font-mono font-bold text-xs">P / Ñ</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* COMBAT MECHANICS */}
        <div className="bg-[#0f1012] border border-[#2d2e32] rounded-xl p-4 mb-5">
          <h3 className="text-xs font-bold text-[#8e9299] uppercase tracking-widest mb-3 flex items-center gap-2 font-tech">
            <Zap className="w-4 h-4 text-[#ff4e00]" />
            MECÁNICAS DE COMBATE ARCADE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-tech text-[#8e9299]">
            <div className="flex items-start gap-2 bg-[#151619] p-3 rounded-lg border border-[#2d2e32]">
              <Shield className="w-4 h-4 text-[#00f2ff] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block uppercase mb-0.5">Bloqueo (Guardia):</strong>
                Mantén la dirección contraria al rival para reducir el daño drásticamente a chip damage.
              </div>
            </div>
            <div className="flex items-start gap-2 bg-[#151619] p-3 rounded-lg border border-[#2d2e32]">
              <Flame className="w-4 h-4 text-[#ff4e00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block uppercase mb-0.5">Barra de Super QP:</strong>
                Se llena al golpear o recibir daño. Con 25% o más, lanza ondas de choque de vinilo sónicas.
              </div>
            </div>
            <div className="flex items-start gap-2 bg-[#151619] p-3 rounded-lg border border-[#2d2e32]">
              <Zap className="w-4 h-4 text-[#f27d26] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block uppercase mb-0.5">Cadenas de Combo:</strong>
                Encadena ataques antes de que el adversario se recupere para disparar el multiplicador.
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundSystem.playMenuSelect();
            onClose();
          }}
          className="w-full py-3.5 bg-[#ff4e00] hover:bg-[#ff6524] text-black font-black uppercase tracking-wider rounded-xl transition font-heading text-lg shadow-[0_0_25px_rgba(255,78,0,0.4)] flex items-center justify-center gap-2 border border-white/20"
        >
          ¡ENTENDIDO, A PELEAR!
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
