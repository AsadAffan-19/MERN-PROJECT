import { STATUSES, STATUS_CLASS, formatDate } from '../utils';

// Small popup with the 4 status buttons, drawn just below the clicked cell
export default function StatusPicker({ position, current, onPick, onClose }) {
  return (
    <>
      {/* Invisible full-screen layer: clicking anywhere outside the picker closes it */}
      <div className="picker-backdrop" onClick={onClose} />
      <div className="picker" style={{ top: position.top, left: position.left }}>
        <div className="picker-date">{formatDate(position.date)}</div>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`picker-btn ${STATUS_CLASS[s]} ${s === current ? 'selected' : ''}`}
            onClick={() => onPick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
