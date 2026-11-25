import type { RentalSession } from '../types';
import { formatRupiah } from './currency';
import { formatDurationHuman } from './time';
import { rentalElapsedSeconds } from '../lib/billing';

const dateTimeStr = (ms: number) =>
  new Date(ms).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const timeStr = (ms: number) =>
  new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

/** Plain-text receipt, for sharing / copying (e.g. to WhatsApp). */
export function buildReceiptText(session: RentalSession, venueName?: string): string {
  const end = session.endTime ?? Date.now();
  const seconds = rentalElapsedSeconds(session.startTime, end);
  const lines = [
    venueName ? venueName.toUpperCase() : 'STRUK SEWA MEJA',
    'Struk Sewa Meja',
    '--------------------------------',
    `Meja     : ${session.tableName}`,
    session.note ? `Nama     : ${session.note}` : '',
    `Mulai    : ${timeStr(session.startTime)}`,
    `Selesai  : ${timeStr(end)}`,
    `Durasi   : ${formatDurationHuman(seconds)}`,
    `Tarif    : ${formatRupiah(session.ratePerHour)}/jam`,
    '--------------------------------',
    `TOTAL    : ${formatRupiah(session.totalCost ?? 0)}`,
    '--------------------------------',
    dateTimeStr(end),
    'Terima kasih 🎱',
  ];
  return lines.filter((l) => l !== '').join('\n');
}

/** Share the receipt via the native share sheet, falling back to clipboard.
 *  Returns 'shared' | 'copied' | 'failed'. */
export async function shareReceipt(
  session: RentalSession,
  venueName?: string
): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildReceiptText(session, venueName);
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'Struk Sewa Meja', text });
      return 'shared';
    }
  } catch {
    // user cancelled or share failed — fall through to clipboard
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/** Open a print-friendly receipt in a new window and trigger the print dialog.
 *  Returns false if a popup blocker prevented it. */
export function printReceipt(session: RentalSession, venueName?: string): boolean {
  const end = session.endTime ?? Date.now();
  const seconds = rentalElapsedSeconds(session.startTime, end);
  const win = window.open('', '_blank', 'width=360,height=640');
  if (!win) return false;

  const row = (label: string, value: string) =>
    `<div class="r"><span>${esc(label)}</span><span>${esc(value)}</span></div>`;

  win.document.write(`<!doctype html>
<html lang="id"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Struk Sewa Meja</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ui-monospace, "Courier New", monospace; color: #111; margin: 0; padding: 18px; }
  .wrap { max-width: 280px; margin: 0 auto; }
  h1 { font-size: 15px; text-align: center; margin: 0 0 2px; letter-spacing: .04em; }
  .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 12px; }
  .r { display: flex; justify-content: space-between; gap: 12px; font-size: 12.5px; padding: 3px 0; }
  .r span:last-child { text-align: right; }
  .sep { border-top: 1px dashed #999; margin: 10px 0; }
  .total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; }
  .foot { text-align: center; font-size: 11px; color: #555; margin-top: 14px; }
  @media print { body { padding: 0; } }
</style></head>
<body><div class="wrap">
  <h1>${esc(venueName || 'PoolScore')}</h1>
  <div class="sub">Struk Sewa Meja</div>
  ${row('Meja', session.tableName)}
  ${session.note ? row('Nama', session.note) : ''}
  ${row('Mulai', timeStr(session.startTime))}
  ${row('Selesai', timeStr(end))}
  ${row('Durasi', formatDurationHuman(seconds))}
  ${row('Tarif', `${formatRupiah(session.ratePerHour)}/jam`)}
  <div class="sep"></div>
  <div class="total"><span>TOTAL</span><span>${esc(formatRupiah(session.totalCost ?? 0))}</span></div>
  <div class="sep"></div>
  <div class="foot">${esc(dateTimeStr(end))}<br/>Terima kasih 🎱</div>
</div>
<script>window.onload = function () { window.focus(); window.print(); };<\/script>
</body></html>`);
  win.document.close();
  return true;
}
