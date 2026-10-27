import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Search, UserPen } from 'lucide-react';
import api from '../api';
import Avatar from './Avatar';
import { todayKey } from '../utils';

// Pages whose lists the search box filters
const SEARCHABLE = ['/', '/attendance', '/wages'];

export default function Topbar({ profile, search, onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [unmarked, setUnmarked] = useState([]); // workers with no attendance marked today
  const [openMenu, setOpenMenu] = useState(null); // 'bell' | 'profile' | null

  // ⌘K / Ctrl+K jumps to the search box
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Re-check today's attendance whenever the page changes, for the notification bell
  useEffect(() => {
    const today = todayKey();
    Promise.all([api.get('/workers'), api.get('/attendance', { params: { month: today.slice(0, 7) } })])
      .then(([workersRes, attendanceRes]) => {
        const marked = new Set(
          attendanceRes.data.filter((a) => a.date.startsWith(today) && a.workerId).map((a) => a.workerId._id)
        );
        setUnmarked(workersRes.data.filter((w) => !marked.has(w._id)));
      });
    setOpenMenu(null);
  }, [location.pathname]);

  function handleSearch(value) {
    onSearch(value);
    // Searching from a page without a list takes you to the workers list
    if (!SEARCHABLE.includes(location.pathname)) navigate('/');
  }

  return (
    <header className="topbar">
      <div className="topbar-title">
        {location.pathname === '/' && (
          <>
            <h1>{profile?.companyName || 'Workers'}</h1>
            <p className="muted">Manage your workforce and track daily wages</p>
          </>
        )}
      </div>

      <label className="search">
        <Search size={18} className="muted" />
        <input
          ref={searchRef}
          placeholder="Search workers..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <kbd>⌘ K</kbd>
      </label>

      <div className="menu-wrap">
        <button className="icon-btn" onClick={() => setOpenMenu(openMenu === 'bell' ? null : 'bell')} title="Notifications">
          <Bell size={20} />
          {unmarked.length > 0 && <span className="bell-dot" />}
        </button>
        {openMenu === 'bell' && (
          <div className="menu right notifications">
            {unmarked.length === 0 ? (
              <p>All attendance for today is marked.</p>
            ) : (
              <>
                <p><strong>{unmarked.length} worker{unmarked.length > 1 ? 's' : ''}</strong> not marked today:</p>
                <p className="muted">{unmarked.map((w) => w.name).join(', ')}</p>
                <Link to="/attendance" className="btn primary small">Mark attendance</Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="menu-wrap">
        <button className="profile-btn" onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}>
          <Avatar name={profile?.name} large />
          <span className="profile-text">
            <strong>{profile?.name ? profile.name.toUpperCase() : 'SET UP PROFILE'}</strong>
            <span className="muted">Admin</span>
          </span>
          <ChevronDown size={18} />
        </button>
        {openMenu === 'profile' && (
          <div className="menu right">
            <Link to="/profile"><UserPen size={16} /> Edit Profile</Link>
          </div>
        )}
      </div>

      {openMenu && <div className="backdrop" onClick={() => setOpenMenu(null)} />}
    </header>
  );
}
