import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleCheck, Clock, Search, Umbrella, Users, X } from 'lucide-react';
import api from '../api';
import StatusPicker from '../components/StatusPicker';
import MonthPicker from '../components/MonthPicker';
import Avatar from '../components/Avatar';
import StatCard, { Progress } from '../components/StatCard';
import Trend from '../components/Trend';
import { STATUSES, STATUS_CLASS, STATUS_SHORT, datesInMonth, todayKey } from '../utils';

// Turns attendance records into a lookup of "workerId|YYYY-MM-DD" -> status
function toStatusMap(records) {
  const map = {};
  records.forEach((a) => {
    if (a.workerId) map[`${a.workerId._id}|${a.date.slice(0, 10)}`] = a.status;
  });
  return map;
}

export default function Attendance({ search, onSearch }) {
  const today = todayKey();
  const thisMonth = today.slice(0, 7);
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get('month') || thisMonth; // defaults to the current month

  const [workers, setWorkers] = useState([]);
  const [statuses, setStatuses] = useState({}); // statuses for the month on screen
  const [todayStatuses, setTodayStatuses] = useState({}); // workerId -> status today (for the cards)
  // The cell whose picker is open: { workerId, date, top, left } (top/left = where to draw the picker)
  const [openCell, setOpenCell] = useState(null);
  const todayRef = useRef(null);

  const dates = datesInMonth(month);

  useEffect(() => {
    async function load() {
      const requests = [api.get('/workers'), api.get('/attendance', { params: { month } })];
      // The "today" cards always need the current month, even when viewing another month
      if (month !== thisMonth) requests.push(api.get('/attendance', { params: { month: thisMonth } }));
      const [workersRes, monthRes, currentRes = monthRes] = await Promise.all(requests);

      const todayMap = {};
      currentRes.data
        .filter((a) => a.workerId && a.date.startsWith(today))
        .forEach((a) => (todayMap[a.workerId._id] = a.status));

      setWorkers(workersRes.data);
      setStatuses(toStatusMap(monthRes.data));
      setTodayStatuses(todayMap);
    }
    load();
  }, [month, thisMonth, today]);

  // Scroll so that today's column is visible
  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [workers]);

  // Same call for today and for any past date — the server creates or updates the record
  async function setStatus(workerId, date, status) {
    await api.post('/attendance', { workerId, date, status });
    setStatuses((prev) => ({ ...prev, [`${workerId}|${date}`]: status }));
    if (date === today) setTodayStatuses((prev) => ({ ...prev, [workerId]: status }));
    setOpenCell(null);
  }

  function handleCellClick(e, workerId, date) {
    const rect = e.currentTarget.getBoundingClientRect();
    const isSame = openCell?.workerId === workerId && openCell?.date === date;
    setOpenCell(isSame ? null : { workerId, date, top: rect.bottom + 4, left: rect.left });
  }

  function changeMonth(value) {
    setOpenCell(null);
    setSearchParams({ month: value });
  }

  // ----- Today's numbers for the cards -----
  const total = workers.length;
  const count = (status) => Object.values(todayStatuses).filter((s) => s === status).length;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const monthStart = new Date(`${thisMonth}-01T00:00:00`);
  const workersLastMonth = workers.filter((w) => new Date(w.createdAt) < monthStart).length;

  const visibleWorkers = workers.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Attendance</h1>
          <p className="muted">Track daily attendance of your workforce.</p>
        </div>
        <div className="actions">
          <MonthPicker month={month} onChange={changeMonth} />
          <button className="btn large" onClick={() => changeMonth(thisMonth)}>Today</button>
        </div>
      </div>

      <div className="stats five">
        <StatCard icon={Users} tone="green" label="Total Workers" value={total}>
          <Trend current={total} previous={workersLastMonth} label="vs last month" />
        </StatCard>
        <StatCard icon={CircleCheck} tone="green" label="Present Today" value={count('Present')}>
          <span className="stat-note green">{pct(count('Present'))}% attendance</span>
          <Progress percent={pct(count('Present'))} />
        </StatCard>
        <StatCard icon={X} tone="red" label="Absent Today" value={count('Absent')}>
          <span className="stat-note red">{pct(count('Absent'))}% absent</span>
          <Progress percent={pct(count('Absent'))} />
        </StatCard>
        <StatCard icon={Clock} tone="yellow" label="Half Day Today" value={count('Half Day')}>
          <span className="stat-note yellow">{pct(count('Half Day'))}%</span>
          <Progress percent={pct(count('Half Day'))} />
        </StatCard>
        <StatCard icon={Umbrella} tone="purple" label="On Leave Today" value={count('Leave')}>
          <span className="stat-note purple">{pct(count('Leave'))}%</span>
          <Progress percent={pct(count('Leave'))} />
        </StatCard>
      </div>

      <section className="box">
        <div className="box-head">
          <div>
            <h2>Daily Attendance</h2>
            <p className="muted">Click on any cell to set or update attendance status.</p>
          </div>
          <label className="search small">
            <Search size={16} className="muted" />
            <input placeholder="Search workers..." value={search} onChange={(e) => onSearch(e.target.value)} />
          </label>
        </div>

        <div className="legend">
          {STATUSES.map((s) => (
            <span key={s}><span className={`mark ${STATUS_CLASS[s]}`}>{STATUS_SHORT[s]}</span> {s}</span>
          ))}
          <span><span className="mark unmarked">–</span> Not Marked</span>
        </div>

        {workers.length === 0 ? (
          <p className="empty">No workers yet. <Link to="/">Add workers</Link> first.</p>
        ) : (
          <div className="sheet-wrap">
            <table className="sheet">
              <thead>
                <tr>
                  <th className="name-col">Worker</th>
                  {dates.map((d) => (
                    <th key={d} ref={d === today ? todayRef : null} className={d === today ? 'today' : ''}>
                      {Number(d.slice(8))}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleWorkers.map((w, i) => (
                  <tr key={w._id} className={i === visibleWorkers.length - 1 ? 'last' : ''}>
                    <th className="name-col">
                      <Link to={`/wages/${w._id}`} title="View wages" className="name-cell">
                        <Avatar name={w.name} /> {w.name}
                      </Link>
                    </th>
                    {dates.map((d) => {
                      const status = statuses[`${w._id}|${d}`];
                      const isOpen = openCell?.workerId === w._id && openCell?.date === d;
                      return (
                        <td
                          key={d}
                          className={`cell ${d === today ? 'today' : ''} ${isOpen ? 'open' : ''}`}
                          onClick={(e) => handleCellClick(e, w._id, d)}
                        >
                          <span className={`mark ${status ? STATUS_CLASS[status] : 'unmarked'}`}>
                            {status ? STATUS_SHORT[status] : '–'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {openCell && (
        <StatusPicker
          position={openCell}
          current={statuses[`${openCell.workerId}|${openCell.date}`]}
          onPick={(s) => setStatus(openCell.workerId, openCell.date, s)}
          onClose={() => setOpenCell(null)}
        />
      )}
    </>
  );
}
