import { ColorVariant, FighterState } from '../../types';

export class ProceduralSpriteRenderer {
  /**
   * Renders a custom 2D fighter sprite with dynamic color variants,
   * detailed anatomy, sunglasses, mushroom hair, shirt logo, and state animations.
   */
  public static renderFighter(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    frame: number,
    color: ColorVariant,
    facing: number, // 1 (facing right) or -1 (facing left)
    isHit: boolean = false,
    hitstop: boolean = false
  ) {
    ctx.save();
    ctx.scale(facing, 1);

    // Apply flash if in hit recoil
    if (isHit && Math.floor(frame * 10) % 2 === 0) {
      ctx.filter = 'brightness(2.2) contrast(1.5)';
    }

    const skin = color.skinColor;
    const hair = color.hairColor;
    const shirt = color.primaryColor;
    const logoColor = color.secondaryColor;
    const pants = color.pantColor;
    const accent = color.accentColor;

    // Breathing offset for idle
    const breathe = state === 'idle' ? Math.sin(frame * 8) * 3 : 0;
    const walkBob = state === 'walk' ? Math.abs(Math.sin(frame * 12)) * 4 : 0;

    // Base origin: (0, 0) is at the feet center
    let headY = -92 + breathe - walkBob;
    let torsoY = -62 + (breathe * 0.6) - walkBob;
    let crouchOffset = 0;

    if (state === 'crouch') {
      crouchOffset = 25;
      headY += crouchOffset;
      torsoY += crouchOffset;
    } else if (state === 'jump') {
      headY -= 10;
      torsoY -= 10;
    } else if (state === 'knockdown') {
      this.renderKnockdown(ctx, skin, hair, shirt, logoColor, pants, accent);
      ctx.restore();
      return;
    } else if (state === 'defeat') {
      this.renderDefeat(ctx, skin, hair, shirt, pants, accent);
      ctx.restore();
      return;
    }

    // 1. SHADOW UNDER FEET
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    const shadowWidth = state === 'crouch' ? 38 : (state === 'jump' || state === 'fall' ? 20 : 32);
    ctx.ellipse(0, 0, shadowWidth, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. LEGS & PANTS & SHOES
    this.renderLegs(ctx, state, frame, pants, accent, crouchOffset);

    // 3. TORSO / T-SHIRT WITH QP LOGO
    ctx.fillStyle = shirt;
    ctx.strokeStyle = '#0a0a0c';
    ctx.lineWidth = 2.5;

    // Torso shape (robust build)
    ctx.beginPath();
    ctx.roundRect(-16, torsoY - 14, 32, 38, 4);
    ctx.fill();
    ctx.stroke();

    // "QP" Logo on chest / shirt
    ctx.fillStyle = logoColor;
    ctx.font = 'bold 10px "Teko", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QP', 0, torsoY + 2);

    // 4. ARMS & ATTACK POSES
    this.renderArms(ctx, state, frame, skin, shirt, accent, torsoY);

    // 5. HEAD & FACE & SUNGLASSES & MUSHROOM HAIR
    this.renderHead(ctx, headY, skin, hair, state);

    // 6. SPECIAL AURA / EFFECTS IF IN SPECIAL STATE
    if (state === 'special') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(20, torsoY, 25 + Math.sin(frame * 20) * 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private static renderHead(
    ctx: CanvasRenderingContext2D,
    headY: number,
    skin: string,
    hair: string,
    state: FighterState
  ) {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;

    // Head base (Jaw & Neck)
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(-11, headY, 22, 24, 7);
    ctx.fill();
    ctx.stroke();

    // Stubble / Short beard
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(-10, headY + 12, 20, 11, 4);
    ctx.fill();

    // Dark Sunglasses (Lentes Oscuros)
    ctx.fillStyle = '#050505';
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;

    // Left lens & Right lens
    ctx.beginPath();
    ctx.roundRect(-9, headY + 7, 8, 6, 2);
    ctx.roundRect(1, headY + 7, 8, 6, 2);
    ctx.fill();
    ctx.stroke();

    // Sunglass reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(-7, headY + 8, 2, 2);
    ctx.fillRect(3, headY + 8, 2, 2);

    // Nose & Mouth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-1, headY + 13, 2, 2); // nose
    if (state === 'victory') {
      // Smile
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, headY + 17, 3, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.fillRect(-3, headY + 18, 6, 1.5); // grimace / stoic mouth
    }

    // Mushroom / Helmet Cut Hair (Cabello abundante corte champiñón)
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(0, headY + 2, 14, Math.PI, 0); // Upper dome
    ctx.lineTo(13, headY + 9);
    ctx.lineTo(10, headY + 10);
    ctx.lineTo(-10, headY + 10);
    ctx.lineTo(-13, headY + 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fringe texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(-8, headY - 8, 16, 4);
  }

  private static renderLegs(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    frame: number,
    pants: string,
    accent: string,
    crouchOffset: number
  ) {
    ctx.fillStyle = pants;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;

    if (state === 'crouch') {
      // Crouched folded legs
      ctx.beginPath();
      ctx.roundRect(-15, -28 + crouchOffset, 14, 18, 4);
      ctx.roundRect(1, -28 + crouchOffset, 16, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Shoes
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-18, -4 + crouchOffset, 15, 6);
      ctx.fillRect(2, -4 + crouchOffset, 17, 6);
      ctx.fillStyle = accent;
      ctx.fillRect(-16, -2 + crouchOffset, 11, 2);
      ctx.fillRect(4, -2 + crouchOffset, 13, 2);
    } else if (state === 'walk') {
      const walkPhase = Math.sin(frame * 12);
      const leg1Angle = walkPhase * 16;
      const leg2Angle = -walkPhase * 16;

      // Back leg
      ctx.beginPath();
      ctx.roundRect(-12 - leg2Angle * 0.4, -38, 10, 34, 3);
      ctx.fill();
      ctx.stroke();

      // Front leg
      ctx.beginPath();
      ctx.roundRect(2 + leg1Angle * 0.4, -38, 11, 34, 3);
      ctx.fill();
      ctx.stroke();

      // Shoes
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-14 - leg2Angle * 0.4, -6, 14, 7);
      ctx.fillRect(2 + leg1Angle * 0.4, -6, 16, 7);
      ctx.fillStyle = accent;
      ctx.fillRect(-12 - leg2Angle * 0.4, -2, 10, 2);
      ctx.fillRect(4 + leg1Angle * 0.4, -2, 12, 2);
    } else if (state === 'jump' || state === 'fall') {
      // Tucked aerial legs
      ctx.beginPath();
      ctx.roundRect(-12, -44, 11, 28, 4);
      ctx.roundRect(2, -40, 11, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#18181b';
      ctx.fillRect(-14, -18, 14, 8);
      ctx.fillRect(2, -18, 15, 8);
    } else {
      // Standing stance
      ctx.beginPath();
      ctx.roundRect(-14, -38, 12, 34, 3);
      ctx.roundRect(2, -38, 12, 34, 3);
      ctx.fill();
      ctx.stroke();

      // Shoes
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-16, -6, 15, 7);
      ctx.fillRect(2, -6, 16, 7);
      ctx.fillStyle = accent;
      ctx.fillRect(-14, -2, 11, 2);
      ctx.fillRect(4, -2, 12, 2);
    }
  }

  private static renderArms(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    frame: number,
    skin: string,
    shirt: string,
    accent: string,
    torsoY: number
  ) {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;

    if (state === 'punch') {
      // EXTENDED JAB / PUNCH
      // Back arm (guarding)
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-18, torsoY - 8, 10, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Front extended punching arm
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(10, torsoY - 10, 14, 12, 3); // sleeve
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(22, torsoY - 9, 36, 10, 4); // forearm + fist
      ctx.fill();
      ctx.stroke();

      // Fist wrap / knuckle glove
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(50, torsoY - 11, 14, 14, 4);
      ctx.fill();
      ctx.stroke();
    } else if (state === 'kick') {
      // KICK EXTENSION
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-14, torsoY - 10, 10, 20, 3);
      ctx.roundRect(4, torsoY - 14, 12, 18, 3);
      ctx.fill();
      ctx.stroke();

      // Extended leg kick overlay
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(14, torsoY - 2, 44, 14, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(52, torsoY - 6, 16, 18, 4);
      ctx.fill();
      ctx.stroke();
    } else if (state === 'block') {
      // Cross arm guard
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(6, torsoY - 18, 12, 30, 4);
      ctx.roundRect(14, torsoY - 14, 12, 28, 4);
      ctx.fill();
      ctx.stroke();

      // Guard spark
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(18, torsoY - 4, 10, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state === 'victory') {
      // Both arms raised up!
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-22, torsoY - 34, 10, 28, 4);
      ctx.roundRect(12, torsoY - 34, 10, 28, 4);
      ctx.fill();
      ctx.stroke();

      // Fists
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(-24, torsoY - 44, 14, 12, 3);
      ctx.roundRect(10, torsoY - 44, 14, 12, 3);
      ctx.fill();
      ctx.stroke();
    } else {
      // Standard boxing / street guard stance
      const guardBob = Math.sin(frame * 8) * 2;

      // Back arm
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-16, torsoY - 10 + guardBob, 10, 20, 3);
      ctx.fill();
      ctx.stroke();

      // Front arm with raised fist
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(10, torsoY - 10 + guardBob, 12, 12, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(14, torsoY - 22 + guardBob, 11, 20, 4);
      ctx.fill();
      ctx.stroke();

      // Glove / Knuckle wrap
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(13, torsoY - 28 + guardBob, 14, 12, 3);
      ctx.fill();
      ctx.stroke();
    }
  }

  private static renderKnockdown(
    ctx: CanvasRenderingContext2D,
    skin: string,
    hair: string,
    shirt: string,
    logoColor: string,
    pants: string,
    accent: string
  ) {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;

    // Body on floor (horizontal)
    ctx.fillStyle = pants;
    ctx.beginPath();
    ctx.roundRect(-40, -14, 40, 12, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-10, -18, 36, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(24, -20, 18, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(33, -20, 10, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }

  private static renderDefeat(
    ctx: CanvasRenderingContext2D,
    skin: string,
    hair: string,
    shirt: string,
    pants: string,
    accent: string
  ) {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;

    // Kneeling defeated pose
    ctx.fillStyle = pants;
    ctx.beginPath();
    ctx.roundRect(-16, -20, 24, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-12, -40, 26, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Head slumped down
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(-4, -58, 18, 20, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(5, -58, 11, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }
}
