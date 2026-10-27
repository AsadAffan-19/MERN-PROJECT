import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { monthLabel, shiftMonth } from '../utils';

// [←] [📅 October 2026] [→] — clicking the label opens the browser's month picker
export default function MonthPicker({ month, onChange }) {
  const inputRef = useRef(null);
  return (
    <div className="segmented">
      <button onClick={() => onChange(shiftMonth(month, -1))} title="Previous month"><ArrowLeft size={18} /></button>
      <button className="segmented-label" onClick={() => inputRef.current.showPicker()}>
        <Calendar size={18} /> {monthLabel(month)}
        <input
          ref={inputRef}
          type="month"
          className="hidden-input"
          value={month}
          onChange={(e) => e.target.value && onChange(e.target.value)}
        />
      </button>
      <button onClick={() => onChange(shiftMonth(month, 1))} title="Next month"><ArrowRight size={18} /></button>
    </div>
  );
}
