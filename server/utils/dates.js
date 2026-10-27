// All dates are stored as midnight UTC so "2026-10-27" always means the same day,
// regardless of the server's timezone.

// "2026-10-27" (or any date string) -> Date at 00:00 UTC of that day
function toDateOnly(value) {
  const str = typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10);
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(date)) throw new Error('Invalid date: ' + value);
  return date;
}

// Date -> "YYYY-MM-DD"
function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, n) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}

// "2026-10" -> { start: Oct 1, end: Oct 31 }
function monthRange(year, monthIndex) {
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0)); // day 0 of next month = last day of this month
  return { start, end };
}

module.exports = { toDateOnly, toKey, addDays, monthRange };
