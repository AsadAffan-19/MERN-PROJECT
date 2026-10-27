import { NavLink } from 'react-router-dom';
import { BarChart3, Building2, CalendarDays, IndianRupee, Users } from 'lucide-react';

export default function Sidebar({ profile }) {
  const company = profile?.companyName || 'Your Company';
  const links = [
    { to: '/profile', label: company, icon: Building2 },
    { to: '/', label: 'Workers', icon: Users, end: true },
    { to: '/attendance', label: 'Attendance', icon: CalendarDays },
    { to: '/wages', label: 'Wages', icon: IndianRupee },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <BarChart3 size={30} strokeWidth={2.75} className="logo-icon" />
        <div>
          <strong>Wage Tracker</strong>
          <span className="muted">{company}</span>
        </div>
      </div>
      <nav>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
