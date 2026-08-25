import type { Match } from '../types';
import { formatDurationHuman, formatTimestampDate } from './time';

export async function generateShareCardCanvas(match: Match): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 960;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  const isMultiSet = match.targetSets && match.targetSets > 1;

  // Background gradient: Sophisticated Deep Charcoal Slate
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0e1218');
  bgGrad.addColorStop(0.5, '#151b24');
  bgGrad.addColorStop(1, '#0b0e14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer border & subtle glow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Crimson ambient highlight at top left
  const redGlow = ctx.createRadialGradient(80, 80, 10, 80, 80, 450);
  redGlow.addColorStop(0, 'rgba(201, 42, 57, 0.15)');
  redGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = redGlow;
  ctx.fillRect(20, 20, width - 40, height - 40);

  // Try to load and draw the official squircle logo
  try {
    const logoImg = new Image();
    logoImg.src = '/logo.png';
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
    });
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(60, 60, 64, 64, 16);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, 60, 60, 64, 64);
      ctx.restore();

      // Outer ring for squircle logo
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(60, 60, 64, 64, 16);
      ctx.stroke();
    }
  } catch {
    // ignore
  }

  // Wordmark Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 36px "Oswald", sans-serif';
  ctx.fillText('POOLSCORE', 140, 95);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText('OFFICIAL MATCH RESULT', 140, 120);

  // Game badge
  ctx.fillStyle = '#c92a39';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  const gameTag = isMultiSet
    ? `${match.gameType.toUpperCase()} — BEST OF ${match.targetSets * 2 - 1} SETS (RACE TO ${match.raceTo}/SET)`
    : `${match.gameType.toUpperCase()} — RACE TO ${match.raceTo}`;
  ctx.fillText(gameTag, 60, 185);

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 205);
  ctx.lineTo(width - 60, 205);
  ctx.stroke();

  // Winner Announcement Banner
  const winner = match.winner === 1 ? match.player1 : (match.winner === 2 ? match.player2 : null);
  if (winner) {
    ctx.fillStyle = match.winner === 1 ? '#c92a39' : '#3b82f6';
    ctx.font = '700 24px "Oswald", sans-serif';
    const winText = isMultiSet
      ? `🏆 WINNER: ${winner.name.toUpperCase()} (${match.winner === 1 ? match.player1Sets : match.player2Sets} SETS)`
      : `🏆 WINNER: ${winner.name.toUpperCase()}`;
    ctx.fillText(winText, 60, 250);
  }

  // Player 1 Card (Red)
  const isP1Winner = match.winner === 1;
  ctx.fillStyle = isP1Winner ? 'rgba(201, 42, 57, 0.12)' : 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = isP1Winner ? '#c92a39' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.roundRect(60, 280, width - 120, 180, 20);
  ctx.fill();
  ctx.stroke();

  // P1 Dot & Name
  ctx.beginPath();
  ctx.arc(100, 370, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#c92a39';
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 42px "Oswald", sans-serif';
  ctx.fillText(match.player1.name.toUpperCase(), 130, 385);

  // P1 Score
  const p1DisplayScore = isMultiSet ? `${match.player1Sets}` : `${match.player1.score}`;
  ctx.fillStyle = '#c92a39';
  ctx.font = '800 90px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(p1DisplayScore, width - 100, 400);
  ctx.textAlign = 'left';

  // VS text
  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isMultiSet ? '— SETS SCORE —' : '— VS —', width / 2, 495);
  ctx.textAlign = 'left';

  // Player 2 Card (Blue)
  const isP2Winner = match.winner === 2;
  ctx.fillStyle = isP2Winner ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = isP2Winner ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.roundRect(60, 520, width - 120, 180, 20);
  ctx.fill();
  ctx.stroke();

  // P2 Dot & Name
  ctx.beginPath();
  ctx.arc(100, 610, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#3b82f6';
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 42px "Oswald", sans-serif';
  ctx.fillText(match.player2.name.toUpperCase(), 130, 625);

  // P2 Score
  const p2DisplayScore = isMultiSet ? `${match.player2Sets}` : `${match.player2.score}`;
  ctx.fillStyle = '#3b82f6';
  ctx.font = '800 90px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(p2DisplayScore, width - 100, 640);
  ctx.textAlign = 'left';

  // Stats Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.roundRect(60, 730, width - 120, 100, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillText('DURATION', 90, 770);
  ctx.fillText(isMultiSet ? 'TOTAL SETS' : 'TOTAL RACKS', width / 2 - 40, 770);
  ctx.fillText('MATCH CODE', width - 200, 770);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText(formatDurationHuman(match.durationSeconds), 90, 805);
  ctx.fillText(isMultiSet ? `${match.player1Sets + match.player2Sets}` : `${match.player1.score + match.player2.score}`, width / 2 - 40, 805);
  ctx.fillText(match.id.substring(0, 12), width - 200, 805);

  // Footer Date & Brand
  ctx.fillStyle = '#64748b';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillText(formatTimestampDate(match.startedAt).toUpperCase(), 60, 890);

  ctx.textAlign = 'right';
  ctx.fillText('POOLSCORE.APP — OFFICIAL BILLIARD SCOREBOARD', width - 60, 890);
  ctx.textAlign = 'left';

  return canvas;
}

export async function downloadShareCard(match: Match): Promise<void> {
  const canvas = await generateShareCardCanvas(match);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `PoolScore_${match.player1.name}_vs_${match.player2.name}_${match.id}.png`;
  link.href = dataUrl;
  link.click();
}

export async function shareMatchCardNative(match: Match): Promise<boolean> {
  if (navigator.share) {
    try {
      const canvas = await generateShareCardCanvas(match);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      const isMultiSet = match.targetSets && match.targetSets > 1;
      const scoreTxt = isMultiSet
        ? `Sets: ${match.player1.name} (${match.player1Sets}) vs ${match.player2.name} (${match.player2Sets})`
        : `${match.player1.name} (${match.player1.score}) vs ${match.player2.name} (${match.player2.score})`;

      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'match.png', { type: 'image/png' })] })) {
        const file = new File([blob], `PoolScore_${match.player1.name}_vs_${match.player2.name}.png`, { type: 'image/png' });
        await navigator.share({
          title: `PoolScore Result: ${match.player1.name} vs ${match.player2.name}`,
          text: `Hasil Pertandingan ${match.gameType}: ${scoreTxt}!`,
          files: [file]
        });
        return true;
      } else {
        await navigator.share({
          title: `PoolScore Result: ${match.player1.name} vs ${match.player2.name}`,
          text: `Hasil Pertandingan ${match.gameType}: ${scoreTxt}! Skor dicatat di PoolScore PWA.`
        });
        return true;
      }
    } catch {
      // fallback
    }
  }
  return false;
}
