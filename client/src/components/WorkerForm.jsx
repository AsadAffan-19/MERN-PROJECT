import { useState } from 'react';
import { X } from 'lucide-react';

// Pop-up form used for both adding a new worker and editing an existing one
export default function WorkerForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [dailyWage, setDailyWage] = useState(initial?.dailyWage ?? '');
  const [phone, setPhone] = useState(initial?.phone || '');

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ name, dailyWage: Number(dailyWage), phone });
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{initial ? 'Edit Worker' : 'Add Worker'}</h3>
          <button type="button" className="icon-btn" onClick={onCancel}><X size={18} /></button>
        </div>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label>
          Daily Wage (₹)
          <input type="number" min="0" value={dailyWage} onChange={(e) => setDailyWage(e.target.value)} required />
        </label>
        <label>
          Phone (optional)
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <div className="actions end">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn primary">Save</button>
        </div>
      </form>
    </div>
  );
}
