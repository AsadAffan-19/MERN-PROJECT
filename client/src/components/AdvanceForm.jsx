import { useState } from 'react';
import { todayKey } from '../utils';

export default function AdvanceForm({ onAdd }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({ amount: Number(amount), date, note });
    setAmount('');
    setNote('');
  }

  return (
    <form className="form-row" onSubmit={handleSubmit}>
      <label>
        Amount (₹)
        <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </label>
      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label className="grow">
        Note (optional)
        <input value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="actions">
        <button type="submit" className="btn primary">Add Advance</button>
      </div>
    </form>
  );
}
