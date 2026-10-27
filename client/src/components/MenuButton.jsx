import { useState } from 'react';
import { Check } from 'lucide-react';

// A button that opens a small list of options (used for Filter and Sort)
export default function MenuButton({ icon: Icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const active = options.find((o) => o.value === value);

  function pick(v) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div className="menu-wrap">
      <button className={`btn ${active?.value ? 'on' : ''}`} onClick={() => setOpen(!open)}>
        <Icon size={16} /> {label}
      </button>
      {open && (
        <>
          <div className="backdrop" onClick={() => setOpen(false)} />
          <div className="menu">
            {options.map((o) => (
              <button key={o.value} onClick={() => pick(o.value)}>
                {o.label}
                {o.value === value && <Check size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
