// Table-rental billing math (sewa meja). Pure functions so the pricing stays
// easy to verify and reuse across the UI.

/** Fallback tariff (Rupiah/hour) when a table has no rate set yet. */
export const DEFAULT_TABLE_RATE = 25000;

/** Bills are rounded to the nearest this many Rupiah, so totals stay tidy. */
export const ROUNDING_STEP = 500;

/** Whole seconds a rental has run between two timestamps (never negative). */
export function rentalElapsedSeconds(startTime: number, endTime: number): number {
  return Math.max(0, Math.floor((endTime - startTime) / 1000));
}

/** Raw, un-rounded cost: tariff prorated to the second. */
export function rentalCostRaw(startTime: number, endTime: number, ratePerHour: number): number {
  const seconds = rentalElapsedSeconds(startTime, endTime);
  return ratePerHour * (seconds / 3600);
}

/** Final billed amount, rounded to the nearest {@link ROUNDING_STEP} Rupiah. */
export function rentalCost(startTime: number, endTime: number, ratePerHour: number): number {
  const raw = rentalCostRaw(startTime, endTime, ratePerHour);
  return Math.round(raw / ROUNDING_STEP) * ROUNDING_STEP;
}
