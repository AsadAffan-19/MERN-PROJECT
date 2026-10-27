import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import api from './api';
import Topbar from './components/Topbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Attendance from './pages/Attendance.jsx';
import AllWages from './pages/AllWages.jsx';
import Wages from './pages/Wages.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  // The profile lives here so the top bar and sidebar update as soon as it is saved
  const [profile, setProfile] = useState(null);
  // One search box in the top bar filters the worker lists on every page
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data));
  }, []);

  return (
    <div className="layout">
      <Sidebar profile={profile} />
      <div className="main">
        <Topbar profile={profile} search={search} onSearch={setSearch} />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home search={search} />} />
            <Route path="/attendance" element={<Attendance search={search} onSearch={setSearch} />} />
            <Route path="/wages" element={<AllWages search={search} onSearch={setSearch} />} />
            <Route path="/wages/:workerId" element={<Wages />} />
            <Route
              path="/profile"
              element={profile ? <Profile profile={profile} onSaved={setProfile} /> : <p className="muted">Loading…</p>}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
