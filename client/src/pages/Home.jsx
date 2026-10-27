import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpDown, CalendarCheck, Filter, IndianRupee, Plus, Users, Wallet } from 'lucide-react';
import api from '../api';
import WorkerTable from '../components/WorkerTable';
import WorkerForm from '../components/WorkerForm';
import MenuButton from '../components/MenuButton';
import StatCard, { Progress } from '../components/StatCard';
import Trend from '../components/Trend';
import { STATUSES, formatMoney, todayKey } from '../utils';
import hero from '../assets/hero.png';

const FILTERS = [{ value: '', label: 'All workers' }, ...STATUSES.map((s) => ({ value: s, label: s })), { value: 'none', label: 'Not marked' }];
const SORTS = [
  { value: '', label: 'Name (A–Z)' },
  { value: 'wage', label: 'Daily wage (high–low)' },
  { value: 'earned', label: 'Earned this month (high–low)' },
];

export default function Home({ search }) {
  const today = todayKey();
  const [workers, setWorkers] = useState([]);
  const [todayStatus, setTodayStatus] = useState({}); // workerId -> today's status
  const [monthWages, setMonthWages] = useState(null); // result of GET /wages?period=month
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  // null = form hidden, {} = adding a new worker, worker object = editing that worker
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  async function loadData() {
    const [workersRes, attendanceRes, wagesRes] = await Promise.all([
      api.get('/workers'),
      api.get('/attendance', { params: { month: today.slice(0, 7) } }),
      api.get('/wages', { params: { period: 'month', date: today } }),
    ]);
    const statusMap = {};
    attendanceRes.data
      .filter((a) => a.workerId && a.date.startsWith(today))
      .forEach((a) => (statusMap[a.workerId._id] = a.status));
    setWorkers(workersRes.data);
    setTodayStatus(statusMap);
    setMonthWages(wagesRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(data) {
    if (editing._id) {
      await api.put(`/workers/${editing._id}`, data);
    } else {
      await api.post('/workers', data);
    }
    setEditing(null);
    loadData();
  }

  async function handleDelete(worker) {
    if (!confirm(`Delete ${worker.name}? Their attendance and advances will also be removed.`)) return;
    await api.delete(`/workers/${worker._id}`);
    loadData();
  }

  // ----- Numbers for the stat cards -----
  const statuses = Object.values(todayStatus);
  const presentCount = statuses.filter((s) => s === 'Present').length;
  const attendancePct = workers.length ? Math.round((presentCount / workers.length) * 100) : 0;
  const totalDailyWages = workers.reduce((sum, w) => sum + w.dailyWage, 0);
  const todaysCost = workers.reduce(
    (sum, w) => sum + w.dailyWage * ({ Present: 1, 'Half Day': 0.5 }[todayStatus[w._id]] || 0), 0
  );
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00`);
  const workersLastMonth = workers.filter((w) => new Date(w.createdAt) < monthStart).length;

  // ----- Table rows: join each worker with today's status and this month's earnings -----
  const earnedById = {};
  monthWages?.workers.forEach((r) => (earnedById[r.worker._id] = r.grossPay));
  const rows = workers
    .map((w) => ({ worker: w, todayStatus: todayStatus[w._id] || null, earned: earnedById[w._id] || 0 }))
    .filter((r) => r.worker.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => !filter || (filter === 'none' ? !r.todayStatus : r.todayStatus === filter))
    .sort((a, b) => {
      if (sort === 'wage') return b.worker.dailyWage - a.worker.dailyWage;
      if (sort === 'earned') return b.earned - a.earned;
      return a.worker.name.localeCompare(b.worker.name);
    });

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="hero-text">
          <span className="eyebrow">Attendance</span>
          <h2>Mark Today's Attendance</h2>
          <p>Keep track of who's on site and ensure accurate wage calculation for the day.</p>
          <button className="btn primary large" onClick={() => navigate('/attendance')}>
            Mark Attendance <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <div className="stats">
        <StatCard icon={Users} tone="blue" label="Total Workers" value={workers.length}>
          <Trend current={workers.length} previous={workersLastMonth} label="vs last month" />
        </StatCard>
        <StatCard icon={CalendarCheck} tone="green" label="Present Today" value={presentCount}>
          <span className="stat-note green">{attendancePct}% attendance</span>
          <Progress percent={attendancePct} />
        </StatCard>
        <StatCard icon={IndianRupee} tone="orange" label="Total Daily Wages" value={formatMoney(totalDailyWages)}>
          <span className="stat-note">Today's cost: {formatMoney(todaysCost)}</span>
        </StatCard>
        <StatCard icon={Wallet} tone="purple" label="Earned (This Month)" value={formatMoney(monthWages?.totals.grossPay || 0)}>
          <span className="stat-note">Payable after advances: {formatMoney(monthWages?.totals.balance || 0)}</span>
        </StatCard>
      </div>

      <section className="box">
        <div className="box-head">
          <h2>Workers ({workers.length})</h2>
          <div className="actions">
            <MenuButton icon={Filter} label="Filter" options={FILTERS} value={filter} onChange={setFilter} />
            <MenuButton icon={ArrowUpDown} label="Sort" options={SORTS} value={sort} onChange={setSort} />
            <button className="btn primary" onClick={() => setEditing({})}><Plus size={18} /> Add Worker</button>
          </div>
        </div>

        {loading ? (
          <p className="muted pad">Loading…</p>
        ) : workers.length === 0 ? (
          <p className="empty">No workers yet. Click "Add Worker" to get started.</p>
        ) : rows.length === 0 ? (
          <p className="empty">No workers match your search or filter.</p>
        ) : (
          <WorkerTable rows={rows} onEdit={setEditing} onDelete={handleDelete} />
        )}
      </section>

      {editing && (
        <WorkerForm
          initial={editing._id ? editing : null}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}
