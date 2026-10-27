import { STATUS_CLASS } from '../utils';

// Pill with a coloured dot: "● Present"
export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${status ? STATUS_CLASS[status] : 'unmarked'}`}>
      <span className="dot" />
      {status || 'Not marked'}
    </span>
  );
}
