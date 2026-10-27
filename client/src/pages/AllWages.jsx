import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Download, Filter, IndianRupee, Search, Wallet, WalletCards } from 'lucide-react';
import api from '../api';
import PeriodToggle from '../components/PeriodToggle';
import MenuButton from '../components/MenuButton';
import StatCard from '../components/StatCard';
import Trend from '../components/Trend';
import Avatar from '../components/Avatar';
import { formatMoney, formatRange, previousPeriodDate, todayKey } from '../utils';

const FILTERS = [
  { value: '', label: 'All workers' },
  { value: 'worked', label: 'Worked in this period' },
  { value: 'pending', label: 'Balance to pay' },
  { value: 'advances', label: 'Has advances' },
];

// Builds a CSV file of the table and makes the browser download it
function exportCsv(data, rows) {
  const header = ['Worker', 'Daily Wage', 'Days Worked', 'Gross Pay', 'Advances', 'Balance'];
  const lines = rows.map((r) => [r.worker.name, r.worker.dailyWage, r.daysWorked, r.grossPay, r.totalAdvances, r.balance]);
  const csv = [header, ...lines].map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = `wages-${data.period}-${data.range.start}.csv`;
  link.click();
}

// Cumulative wages: every worker's pay for the selected day / week / month, with totals
export default function AllWages({ search, onSearch }) {
  const [period, setPeriod] = useState('week');
  const [date, setDate] = useState(todayKey());
  const [data, setData] = useState(null);
  const [previous, setPrevious] = useState(null); // same numbers for the period before, for the trends
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/wages', { params: { period, date } }),
      api.get('/wages', { params: { period, date: previousPeriodDate(period, date) } }),
    ]).then(([current, prev]) => {
      setData(current.data);
      setPrevious(prev.data);
    });
  }, [period, date]);

  const vs = `vs previous ${period}`;
  const rows = (data?.workers || [])
    .filter((r) => r.worker.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => {
      if (filter === 'worked') return r.daysWorked > 0;
      if (filter === 'pending') return r.balance > 0;
      if (filter === 'advances') return r.totalAdvances > 0;
      return true;
    });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Wages</h1>
          <p className="muted">Review earnings, advances, and payable balances.</p>
        </div>
        <PeriodToggle
          period={period}
          date={date}
          rangeLabel={formatRange(data?.range)}
          onPeriodChange={setPeriod}
          onDateChange={setDate}
        />
      </div>

      {!data ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="stats">
            <StatCard icon={CalendarDays} tone="blue" label="Total Days Worked" value={data.totals.daysWorked}>
              <Trend current={data.totals.daysWorked} previous={previous.totals.daysWorked} label={vs} />
            </StatCard>
            <StatCard icon={IndianRupee} tone="green" label="Total Gross Pay" value={formatMoney(data.totals.grossPay)}>
              <Trend current={data.totals.grossPay} previous={previous.totals.grossPay} label={vs} />
            </StatCard>
            <StatCard icon={WalletCards} tone="orange" label="Total Advances" value={formatMoney(data.totals.totalAdvances)}>
              <Trend current={data.totals.totalAdvances} previous={previous.totals.totalAdvances} label={vs} />
            </StatCard>
            <StatCard icon={Wallet} tone="purple" label="Total Payable" value={formatMoney(data.totals.balance)}>
              <Trend current={data.totals.balance} previous={previous.totals.balance} label={vs} />
            </StatCard>
          </div>

          <section className="box">
            <div className="box-head">
              <div>
                <h2>Worker Breakdown ({data.workers.length})</h2>
                <p className="muted">Detailed wage summary for the selected period.</p>
              </div>
              <div className="actions">
                <label className="search small">
                  <Search size={16} className="muted" />
                  <input placeholder="Search workers..." value={search} onChange={(e) => onSearch(e.target.value)} />
                </label>
                <MenuButton icon={Filter} label="Filter" options={FILTERS} value={filter} onChange={setFilter} />
                <button className="btn" onClick={() => exportCsv(data, rows)} disabled={rows.length === 0}>
                  <Download size={16} /> Export Report
                </button>
              </div>
            </div>

            {data.workers.length === 0 ? (
              <p className="empty">No workers yet. <Link to="/">Add workers</Link> first.</p>
            ) : rows.length === 0 ? (
              <p className="empty">No workers match your search or filter.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Daily Wage</th>
                    <th className="center">Days Worked</th>
                    <th className="num">Gross Pay</th>
                    <th className="num">Advances</th>
                    <th className="num">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.worker._id}>
                      <td>
                        <Link to={`/wages/${row.worker._id}`} className="name-cell plain">
                          <Avatar name={row.worker.name} /> <strong>{row.worker.name}</strong>
                        </Link>
                      </td>
                      <td>{formatMoney(row.worker.dailyWage)}</td>
                      <td className="center">{row.daysWorked}</td>
                      <td className="num">{formatMoney(row.grossPay)}</td>
                      <td className="num">{formatMoney(row.totalAdvances)}</td>
                      <td className={`num ${row.balance < 0 ? 'negative' : ''}`}><strong>{formatMoney(row.balance)}</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2">Total</td>
                    <td className="center">{data.totals.daysWorked}</td>
                    <td className="num">{formatMoney(data.totals.grossPay)}</td>
                    <td className="num">{formatMoney(data.totals.totalAdvances)}</td>
                    <td className="num">{formatMoney(data.totals.balance)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </section>
        </>
      )}
    </>
  );
}
