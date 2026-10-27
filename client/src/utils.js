// Today's date as "YYYY-MM-DD" in the user's local timezone
export function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "2026-10" -> ["2026-10-01", ..., "2026-10-31"]
export function datesInMonth(month) {
  const [year, m] = month.split('-').map(Number);
  const count = new Date(year, m, 0).getDate(); // day 0 of next month = last day of this month
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
}

// "2026-10" -> "October 2026"
export function monthLabel(month) {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// "2026-10" + 1 -> "2026-11"
export function shiftMonth(month, delta) {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// "2026-10-27" -> "Tue, 27 Oct 2026"
export function formatDate(key) {
  const [y, m, d] = key.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatMoney(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export const STATUSES = ['Present', 'Absent', 'Half Day', 'Leave'];

// Short labels shown inside spreadsheet cells
export const STATUS_SHORT = { Present: 'P', Absent: 'A', 'Half Day': 'H', Leave: 'L' };

// CSS class for each status, used for the light cell colours
export const STATUS_CLASS = { Present: 'present', Absent: 'absent', 'Half Day': 'half', Leave: 'leave' };

// "Asad Khan" -> "AK", "Angan" -> "AN"
export function initials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// A date inside the period just before the selected one (used for "vs previous week" trends)
export function previousPeriodDate(period, key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = period === 'month' ? new Date(y, m - 2, 1) : new Date(y, m - 1, d - (period === 'week' ? 7 : 1));
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// { start, end } -> "Mon, 26 Oct 2026 – Sun, 1 Nov 2026" (or a single date)
export function formatRange(range) {
  if (!range) return '';
  return range.start === range.end ? formatDate(range.start) : `${formatDate(range.start)} – ${formatDate(range.end)}`;
}
