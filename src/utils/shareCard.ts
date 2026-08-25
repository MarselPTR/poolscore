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

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0e0c');
  bgGrad.addColorStop(0.5, '#121815');
  bgGrad.addColorStop(1, '#080c0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer border & subtle glow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Green felt ambient highlight
  const feltGrad = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, 450);
  feltGrad.addColorStop(0, 'rgba(31, 138, 90, 0.18)');
  feltGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = feltGrad;
  ctx.fillRect(20, 20, width - 40, height - 40);

  // Triangle Rack Logo top left
  const startX = 60;
  const startY = 70;
  const dotR = 6;
  const gap = 16;
  const colors = ['#f04a3a', '#525f58', '#3f7bfa', '#525f58', '#1f8a5a', '#525f58'];
  let cIdx = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col <= row; col++) {
      const cx = startX + (col * gap) - (row * gap / 2);
      const cy = startY + (row * gap);
      ctx.beginPath();
      ctx.arc(cx + 20, cy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = colors[cIdx % colors.length];
      ctx.fill();
      cIdx++;
    }
  }

  // Wordmark Title
  ctx.fillStyle = '#f3f1ea';
  ctx.font = '700 34px "Oswald", sans-serif';
  ctx.fillText('POOLSCORE', 120, 85);

  ctx.fillStyle = '#8b968f';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText('OFFICIAL MATCH RESULT', 120, 110);

  // Game badge
  ctx.fillStyle = '#1f8a5a';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  const gameTag = isMultiSet
    ? `${match.gameType.toUpperCase()} — BEST OF ${match.targetSets * 2 - 1} SETS (RACE TO ${match.raceTo}/SET)`
    : `${match.gameType.toUpperCase()} — RACE TO ${match.raceTo}`;
  ctx.fillText(gameTag, 60, 180);

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 205);
  ctx.lineTo(width - 60, 205);
  ctx.stroke();

  // Winner Announcement Banner
  const winner = match.winner === 1 ? match.player1 : (match.winner === 2 ? match.player2 : null);
  if (winner) {
    ctx.fillStyle = match.winner === 1 ? '#f04a3a' : '#3f7bfa';
    ctx.font = '700 24px "Oswald", sans-serif';
    const winText = isMultiSet
      ? `🏆 WINNER: ${winner.name.toUpperCase()} (${match.winner === 1 ? match.player1Sets : match.player2Sets} SETS)`
      : `🏆 WINNER: ${winner.name.toUpperCase()}`;
    ctx.fillText(winText, 60, 250);
  }

  // Player 1 Card (Red)
  const isP1Winner = match.winner === 1;
  ctx.fillStyle = isP1Winner ? 'rgba(240, 74, 58, 0.15)' : 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = isP1Winner ? '#f04a3a' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.roundRect(60, 280, width - 120, 180, 16);
  ctx.fill();
  ctx.stroke();

  // P1 Dot & Name
  ctx.beginPath();
  ctx.arc(100, 370, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#f04a3a';
  ctx.fill();

  ctx.fillStyle = '#f3f1ea';
  ctx.font = '700 44px "Oswald", sans-serif';
  ctx.fillText(match.player1.name.toUpperCase(), 130, 385);

  // P1 Score (Sets if multi-set, otherwise rack score)
  const p1DisplayScore = isMultiSet ? `${match.player1Sets}` : `${match.player1.score}`;
  ctx.fillStyle = '#f04a3a';
  ctx.font = '800 90px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(p1DisplayScore, width - 100, 400);
  ctx.textAlign = 'left';

  // VS text
  ctx.fillStyle = '#525f58';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isMultiSet ? '— SETS SCORE —' : '— VS —', width / 2, 495);
  ctx.textAlign = 'left';

  // Player 2 Card (Blue)
  const isP2Winner = match.winner === 2;
  ctx.fillStyle = isP2Winner ? 'rgba(63, 123, 250, 0.15)' : 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = isP2Winner ? '#3f7bfa' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.roundRect(60, 520, width - 120, 180, 16);
  ctx.fill();
  ctx.stroke();

  // P2 Dot & Name
  ctx.beginPath();
  ctx.arc(100, 610, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#3f7bfa';
  ctx.fill();

  ctx.fillStyle = '#f3f1ea';
  ctx.font = '700 44px "Oswald", sans-serif';
  ctx.fillText(match.player2.name.toUpperCase(), 130, 625);

  // P2 Score
  const p2DisplayScore = isMultiSet ? `${match.player2Sets}` : `${match.player2.score}`;
  ctx.fillStyle = '#3f7bfa';
  ctx.font = '800 90px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(p2DisplayScore, width - 100, 640);
  ctx.textAlign = 'left';

  // Stats Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.roundRect(60, 730, width - 120, 100, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8b968f';
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillText('DURATION', 90, 770);
  ctx.fillText(isMultiSet ? 'TOTAL SETS' : 'TOTAL RACKS', width / 2 - 40, 770);
  ctx.fillText('MATCH CODE', width - 200, 770);

  ctx.fillStyle = '#f3f1ea';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText(formatDurationHuman(match.durationSeconds), 90, 805);
  ctx.fillText(isMultiSet ? `${match.player1Sets + match.player2Sets}` : `${match.player1.score + match.player2.score}`, width / 2 - 40, 805);
  ctx.fillText(match.id.substring(0, 12), width - 200, 805);

  // Footer Date & Brand
  ctx.fillStyle = '#525f58';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillText(formatTimestampDate(match.startedAt).toUpperCase(), 60, 890);

  ctx.textAlign = 'right';
  ctx.fillText('POOLSCORE.APP — BILLIARD SCOREBOARD', width - 60, 890);
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
