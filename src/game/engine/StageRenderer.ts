import { StageData } from '../../types';

export class StageRenderer {
  public static renderStage(
    ctx: CanvasRenderingContext2D,
    stage: StageData,
    cameraX: number,
    animTime: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const groundY = canvasHeight - stage.groundY;

    // 1. SKY / BASE GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, stage.theme.skyColor);
    skyGrad.addColorStop(1, '#1e112a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, stage.width, groundY);

    // 2. PARALLAX CITY SKYLINE / STUDIO WALL
    const cityOffset = cameraX * 0.3;
    ctx.fillStyle = '#0f0c1b';
    for (let i = 0; i < 20; i++) {
      const bWidth = 70 + (i * 37) % 50;
      const bHeight = 180 + (i * 47) % 180;
      const bX = i * 90 - (cityOffset % 90);

      ctx.fillRect(bX, groundY - bHeight, bWidth, bHeight);

      // Building windows / sound panels
      ctx.fillStyle = (i % 2 === 0) ? stage.theme.ambientColor : '#2dd4bf';
      ctx.globalAlpha = 0.15;
      for (let wy = groundY - bHeight + 15; wy < groundY - 20; wy += 22) {
        for (let wx = bX + 10; wx < bX + bWidth - 10; wx += 16) {
          if ((wx + wy) % 3 !== 0) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#0f0c1b';
    }

    // 3. RETRO NEON "QUE PAJA RECORDS" SIGN IN BACKGROUND
    const signX = stage.width / 2 - 160 - cameraX * 0.15;
    const signY = 120;
    const pulse = 0.8 + Math.sin(animTime * 6) * 0.2;

    ctx.save();
    ctx.shadowColor = stage.theme.accentColor;
    ctx.shadowBlur = 20 * pulse;
    ctx.strokeStyle = stage.theme.accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(signX, signY, 320, 70);

    ctx.fillStyle = stage.theme.accentColor;
    ctx.font = '900 36px "Teko", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUE PAJA RECORDS', signX + 160, signY + 35);
    ctx.restore();

    // 4. SPEAKER STACKS (Pulsing subwoofers at stage corners)
    const beatPulse = 1 + Math.abs(Math.sin(animTime * 10)) * 0.15;

    // Left Speaker Tower
    this.renderSpeakerTower(ctx, 40, groundY, stage.theme.accentColor, beatPulse);
    // Right Speaker Tower
    this.renderSpeakerTower(ctx, stage.width - 120, groundY, stage.theme.accentColor, beatPulse);

    // 5. STAGE GROUND & FLOOR
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, canvasHeight);
    groundGrad.addColorStop(0, stage.theme.groundColor);
    groundGrad.addColorStop(0.1, '#110e1a');
    groundGrad.addColorStop(1, '#08060d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, stage.width, stage.groundY);

    // Ground Edge Glow Line
    ctx.strokeStyle = stage.theme.ambientColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(stage.width, groundY);
    ctx.stroke();

    // Grid Perspective floor lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < stage.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 40, canvasHeight);
      ctx.stroke();
    }
  }

  private static renderSpeakerTower(
    ctx: CanvasRenderingContext2D,
    x: number,
    groundY: number,
    accentColor: string,
    beatPulse: number
  ) {
    const width = 80;
    const height = 240;
    const y = groundY - height;

    // Cabinet box
    ctx.fillStyle = '#181524';
    ctx.strokeStyle = '#2d2542';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // 3 Subwoofer cones
    for (let i = 0; i < 3; i++) {
      const coneY = y + 40 + i * 75;
      const coneRadius = (26 * (i === 1 ? beatPulse : 1));

      ctx.fillStyle = '#0a0812';
      ctx.beginPath();
      ctx.arc(x + width / 2, coneY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing inner cone
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + width / 2, coneY, coneRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Center dust cap
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(x + width / 2, coneY, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
