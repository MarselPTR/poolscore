/** Format a Rupiah amount, e.g. 25000 -> "Rp 25.000". */
export function formatRupiah(amount: number): string {
  const n = Math.max(0, Math.round(amount || 0));
  return `Rp ${n.toLocaleString('id-ID')}`;
}

/** Compact Rupiah for tight spaces, e.g. 1500000 -> "Rp 1,5 jt", 25000 -> "Rp 25 rb". */
export function formatRupiahShort(amount: number): string {
  const n = Math.max(0, Math.round(amount || 0));
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000).toLocaleString('id-ID')} rb`;
  return `Rp ${n}`;
}
