// Coloured summary card: icon on the left, label + big value on the right.
// tone = blue | green | red | yellow | orange | purple
export default function StatCard({ icon: Icon, tone, label, value, children }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {children}
      </div>
    </div>
  );
}

// Thin bar showing a percentage, e.g. attendance rate
export function Progress({ percent }) {
  return (
    <div className="progress">
      <div style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}
