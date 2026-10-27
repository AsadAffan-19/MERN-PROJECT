import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

// Small chip comparing a value with the previous period, e.g. "↑ 12%  vs last week"
export default function Trend({ current, previous, label }) {
  let text = '—';
  let direction = 'flat';
  if (previous > 0 && current !== previous) {
    text = `${Math.abs(Math.round(((current - previous) / previous) * 100))}%`;
    direction = current > previous ? 'up' : 'down';
  } else if (previous === 0 && current > 0) {
    text = 'New';
    direction = 'up';
  }

  return (
    <div className="trend">
      <span className={`trend-chip ${direction}`}>
        {direction === 'up' && <ArrowUpRight size={14} />}
        {direction === 'down' && <ArrowDownRight size={14} />}
        {text}
      </span>
      <span className="muted">{label}</span>
    </div>
  );
}
