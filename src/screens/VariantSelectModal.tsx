import React, { useEffect, useRef, useMemo } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { CharacterData, ColorVariant } from '../types';
import { SpriteController } from '../game/animation/SpriteController';
import { Check, Palette, ArrowRight } from 'lucide-react';

interface VariantSelectModalProps {
  playerNumber: 1 | 2;
  character: CharacterData;
  selectedColor: ColorVariant;
  onSelectColor: (color: ColorVariant) => void;
  onConfirm: () => void;
}

export const VariantSelectModal: React.FC<VariantSelectModalProps> = ({
  playerNumber,
  character,
  selectedColor,
  onSelectColor,
  onConfirm,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spriteCtrl = useMemo(() => new SpriteController(character), [character]);

  useEffect(() => {
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
      ctx.scale(1.8, 1.8);

      spriteCtrl.render(
        ctx,
        'idle',
        frame,
        selectedColor,
        playerNumber === 1 ? 1 : -1,
        false,
        false
      );
      ctx.restore();

      frame += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedColor, playerNumber, spriteCtrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-2xl bg-[#151619] border-2 border-[#ff4e00] rounded-2xl p-6 shadow-[0_0_50px_rgba(255,78,0,0.3)] text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2e32] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff4e00]/20 border border-[#ff4e00]/40 flex items-center justify-center">
              <Palette className="w-6 h-6 text-[#ff4e00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div
                  className={`skew-x-[-12deg] text-xs px-2.5 py-0.5 font-tech font-bold uppercase ${
                    playerNumber === 1 ? 'bg-[#ff4e00] text-black' : 'bg-[#00f2ff] text-black'
                  }`}
                >
                  <span className="skew-x-[12deg] block">JUGADOR {playerNumber}</span>
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-wider font-heading">
                  SELECCIONA VARIANTE DE COLOR
                </h2>
              </div>
              <p className="text-xs text-[#8e9299] font-tech uppercase tracking-wider mt-1">
                {character.name} — {character.nickname}
              </p>
            </div>
          </div>
        </div>

        {/* Center Preview & Palette List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
          {/* Animated Canvas Fighter Preview */}
          <div className="flex flex-col items-center justify-center bg-[#0a0a0b] border border-[#2d2e32] rounded-xl p-4 h-64">
            <canvas ref={canvasRef} width={220} height={200} className="pixelated" />
            <div className="skew-x-[-12deg] px-3 py-0.5 bg-[#ff4e00]/20 border border-[#ff4e00]/40 text-xs font-tech text-[#ff4e00] mt-2 tracking-wider">
              <span className="skew-x-[12deg] block uppercase font-bold">{selectedColor.name}</span>
            </div>
          </div>

          {/* Color Palettes Selection */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {character.colors.map((color) => {
              const isSelected = selectedColor.id === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => {
                    soundSystem.playMenuMove();
                    onSelectColor(color);
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#1e2026] border-[#ff4e00] shadow-[0_0_15px_rgba(255,78,0,0.3)] text-white'
                      : 'bg-[#0f1012] border-[#2d2e32] hover:border-zinc-500 text-[#8e9299] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Swatch dots */}
                    <div className="flex -space-x-1">
                      <div
                        className="w-5 h-5 rounded-full border border-black/50 shadow"
                        style={{ backgroundColor: color.primaryColor }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-black/50 shadow"
                        style={{ backgroundColor: color.secondaryColor }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-black/50 shadow"
                        style={{ backgroundColor: color.accentColor }}
                      />
                    </div>
                    <span className="text-xs font-tech font-bold tracking-wider uppercase">{color.name}</span>
                  </div>

                  {isSelected && <Check className="w-5 h-5 text-[#ff4e00]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => {
            soundSystem.playMenuSelect();
            onConfirm();
          }}
          className="w-full py-3.5 bg-[#ff4e00] hover:bg-[#ff6524] text-black font-black uppercase tracking-wider rounded-xl transition font-heading text-xl shadow-[0_0_25px_rgba(255,78,0,0.4)] flex items-center justify-center gap-2 border border-white/20"
        >
          CONFIRMAR COLOR
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
