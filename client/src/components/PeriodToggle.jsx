import { useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const PERIODS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

// Day / Week / Month buttons plus a date button showing the selected range — shared by both wage pages.
// Clicking the date button opens the browser's date picker; any date inside the wanted period works.
export default function PeriodToggle({ period, date, rangeLabel, onPeriodChange, onDateChange }) {
  const inputRef = useRef(null);
  return (
    <div className="actions">
      <div className="toggle">
        {PERIODS.map((p) => (
          <button key={p.value} className={period === p.value ? 'active' : ''} onClick={() => onPeriodChange(p.value)}>
            {p.label}
          </button>
        ))}
      </div>
      <button className="btn large date-btn" onClick={() => inputRef.current.showPicker()}>
        <Calendar size={18} /> {rangeLabel} <ChevronDown size={18} />
        <input
          ref={inputRef}
          type="date"
          className="hidden-input"
          value={date}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
        />
      </button>
    </div>
  );
}
