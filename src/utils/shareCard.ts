import type { Match } from '../types';
import { formatDurationHuman, formatTimestampDate } from './time';

const DISPLAY = '"Barlow Condensed", "Barlow", sans-serif';
const TEXT = '"Barlow", system-ui, sans-serif';

const COLOR = {
  bg: '#0b0c0e',
  ink: '#f2f3f5',
  ink2: '#a3a9b3',
  ink3: '#6e7580',
  rule: '#262a30',
  p1: '#d81e3a',
  p2: '#1f5fd6',
};

// Canvas text does not wait for web fonts, so make sure they are ready first.
async function ensureFonts(): Promise<void> {
  try {
    if (document.fonts?.load) {
      await Promise.all([
        document.fonts.load(`700 100px ${DISPLAY}`),
        document.fonts.load(`600 40px ${DISPLAY}`),
        document.fonts.load(`500 20px ${TEXT}`),
      ]);
    }
  } catch {
    // fall back to system fonts
  }
}

// Shrinks the font until the text fits the available width.
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight: number
): void {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${DISPLAY}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${DISPLAY}`;
  }
}

export async function generateShareCardCanvas(match: Match): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 960;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  await ensureFonts();

  const isMultiSet = match.targetSets && match.targetSets > 1;
  const pad = 56;

  ctx.fillStyle = COLOR.bg;
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = 'alphabetic';

  // Header: wordmark left, match format right
  ctx.fillStyle = COLOR.ink;
  ctx.font = `700 40px ${DISPLAY}`;
  ctx.textAlign = 'left';
  ctx.fillText('POOLSCORE', pad, 92);

  const gameTag = isMultiSet
    ? `${match.gameType.toUpperCase()}  ·  BEST OF ${match.targetSets * 2 - 1} SET`
    : `${match.gameType.toUpperCase()}  ·  RACE TO ${match.raceTo}`;
  ctx.fillStyle = COLOR.ink2;
  ctx.font = `600 26px ${DISPLAY}`;
  ctx.textAlign = 'right';
  ctx.fillText(gameTag, width - pad, 92);

  // Two full-width player blocks
  const blockTop = 136;
  const blockH = 300;

  const drawBlock = (
    y: number,
    color: string,
    name: string,
    score: string,
    isWinner: boolean,
    hasWinner: boolean
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, y, width, blockH);

    if (hasWinner && !isWinner) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, y, width, blockH);
    }

    ctx.fillStyle = '#ffffff';

    // Score, right aligned
    ctx.textAlign = 'right';
    ctx.font = `700 230px ${DISPLAY}`;
    const scoreWidth = ctx.measureText(score).width;
    ctx.fillText(score, width - pad, y + blockH / 2 + 80);

    // Name, left aligned, shrunk to fit beside the score
    ctx.textAlign = 'left';
    const nameMax = width - pad * 2 - scoreWidth - 32;
    fitText(ctx, name.toUpperCase(), nameMax, 76, 36, 600);
    ctx.fillText(name.toUpperCase(), pad, y + blockH / 2 + 34);

    if (isWinner) {
      ctx.font = `600 24px ${DISPLAY}`;
      ctx.fillText('P E M E N A N G', pad, y + blockH / 2 - 44);
    }
  };

  const hasWinner = match.winner === 1 || match.winner === 2;
  drawBlock(
    blockTop,
    COLOR.p1,
    match.player1.name,
    `${isMultiSet ? match.player1Sets : match.player1.score}`,
    match.winner === 1,
    hasWinner
  );
  drawBlock(
    blockTop + blockH,
    COLOR.p2,
    match.player2.name,
    `${isMultiSet ? match.player2Sets : match.player2.score}`,
    match.winner === 2,
    hasWinner
  );

  // Facts row
  const factsTop = blockTop + blockH * 2 + 56;
  const facts: { label: string; value: string }[] = [
    { label: 'DURASI', value: formatDurationHuman(match.durationSeconds).trim() },
    {
      label: isMultiSet ? 'TOTAL SET' : 'TOTAL RACK',
      value: isMultiSet
        ? `${match.player1Sets + match.player2Sets}`
        : `${match.player1.score + match.player2.score}`,
    },
    { label: 'KODE', value: match.id.substring(0, 12) },
  ];
  const colW = (width - pad * 2) / facts.length;

  facts.forEach((f, i) => {
    const x = pad + colW * i;
    ctx.textAlign = 'left';
    ctx.fillStyle = COLOR.ink3;
    ctx.font = `600 20px ${DISPLAY}`;
    ctx.fillText(f.label, x, factsTop);
    ctx.fillStyle = COLOR.ink;
    ctx.font = `700 40px ${DISPLAY}`;
    ctx.fillText(f.value.toUpperCase(), x, factsTop + 44);
  });

  // Footer
  ctx.strokeStyle = COLOR.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, height - 84);
  ctx.lineTo(width - pad, height - 84);
  ctx.stroke();

  ctx.fillStyle = COLOR.ink3;
  ctx.font = `500 20px ${TEXT}`;
  ctx.textAlign = 'left';
  ctx.fillText(formatTimestampDate(match.startedAt), pad, height - 48);
  ctx.textAlign = 'right';
  ctx.fillText('Dicatat dengan PoolScore', width - pad, height - 48);
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
        ? `Set: ${match.player1.name} (${match.player1Sets}) vs ${match.player2.name} (${match.player2Sets})`
        : `${match.player1.name} (${match.player1.score}) vs ${match.player2.name} (${match.player2.score})`;

      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'match.png', { type: 'image/png' })] })) {
        const file = new File([blob], `PoolScore_${match.player1.name}_vs_${match.player2.name}.png`, { type: 'image/png' });
        await navigator.share({
          title: `PoolScore: ${match.player1.name} vs ${match.player2.name}`,
          text: `Hasil pertandingan ${match.gameType}: ${scoreTxt}`,
          files: [file]
        });
        return true;
      } else {
        await navigator.share({
          title: `PoolScore: ${match.player1.name} vs ${match.player2.name}`,
          text: `Hasil pertandingan ${match.gameType}: ${scoreTxt}`
        });
        return true;
      }
    } catch {
      // fallback
    }
  }
  return false;
}
