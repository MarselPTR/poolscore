/**
 * Elo Rating Calculation for Billiard Matches
 * Standard K-factor = 32
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  scoreA: number,
  scoreB: number,
  kFactor: number = 32
): { newRatingA: number; newRatingB: number; changeA: number; changeB: number } {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));

  // Actual result: 1 for win, 0 for loss
  const actualA = scoreA > scoreB ? 1 : 0;

  // Margin of victory multiplier (slight bonus for dominant wins e.g. 7-0 vs 7-6)
  const marginMultiplier = Math.log(Math.abs(scoreA - scoreB) + 1) * (2.2 / ((ratingA > ratingB ? (ratingA - ratingB) : (ratingB - ratingA)) * 0.001 + 2.2));
  const dynamicK = Math.round(kFactor * Math.max(0.8, Math.min(1.5, marginMultiplier || 1)));

  const changeA = Math.round(dynamicK * (actualA - expectedA));
  const changeB = -changeA;

  return {
    newRatingA: Math.max(100, ratingA + changeA),
    newRatingB: Math.max(100, ratingB + changeB),
    changeA,
    changeB
  };
}
