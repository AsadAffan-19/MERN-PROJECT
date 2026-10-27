import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import { formatMoney } from '../utils';

// Each row: { worker, todayStatus, earned }
export default function WorkerTable({ rows, onEdit, onDelete }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Daily Wage</th>
          <th>Today's Status</th>
          <th>Total Earned (This Month)</th>
          <th className="num">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ worker, todayStatus, earned }) => (
          <tr key={worker._id}>
            <td>
              <span className="name-cell"><Avatar name={worker.name} /> <strong>{worker.name}</strong></span>
            </td>
            <td>{worker.phone || <span className="muted">—</span>}</td>
            <td>{formatMoney(worker.dailyWage)}</td>
            <td><StatusBadge status={todayStatus} /></td>
            <td>{formatMoney(earned)}</td>
            <td className="num">
              <div className="actions end">
                <Link to={`/wages/${worker._id}`} className="btn small">Wages</Link>
                <button className="btn small" onClick={() => onEdit(worker)}>Edit</button>
                <button className="btn small danger" onClick={() => onDelete(worker)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
