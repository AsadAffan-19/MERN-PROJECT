import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, IndianRupee, Wallet, WalletCards } from 'lucide-react';
import api from '../api';
import AdvanceForm from '../components/AdvanceForm';
import PeriodToggle from '../components/PeriodToggle';
import StatCard from '../components/StatCard';
import Trend from '../components/Trend';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatMoney, formatRange, previousPeriodDate, todayKey } from '../utils';

// One worker's wages for a day / week / month, with a day-by-day breakdown and advances
export default function Wages() {
  const { workerId } = useParams();
  const [period, setPeriod] = useState('week');
  const [date, setDate] = useState(todayKey());
  const [data, setData] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [advances, setAdvances] = useState([]);
  const [error, setError] = useState('');

  // Re-fetch the wage calculation (this period and the one before) whenever the period or date changes
  async function loadWages() {
    try {
      const [current, prev] = await Promise.all([
        api.get(`/wages/${workerId}`, { params: { period, date } }),
        api.get(`/wages/${workerId}`, { params: { period, date: previousPeriodDate(period, date) } }),
      ]);
      setData(current.data);
      setPrevious(prev.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load wages');
    }
  }

  async function loadAdvances() {
    const res = await api.get(`/advances/${workerId}`);
    setAdvances(res.data);
  }

  useEffect(() => {
    loadWages();
  }, [workerId, period, date]);

  useEffect(() => {
    loadAdvances();
  }, [workerId]);

  async function addAdvance(advance) {
    await api.post('/advances', { ...advance, workerId });
    loadWages();
    loadAdvances();
  }

  if (error) return <p className="empty">{error}. <Link to="/">Back to workers</Link></p>;
  if (!data) return <p className="muted">Loading…</p>;

  const vs = `vs previous ${period}`;

  return (
    <>
      <Link to="/wages" className="back-link"><ArrowLeft size={16} /> All Wages</Link>
      <div className="page-head">
        <div className="name-cell">
          <Avatar name={data.worker.name} large />
          <div>
            <h1>{data.worker.name}</h1>
            <p className="muted">{formatMoney(data.worker.dailyWage)} per day</p>
          </div>
        </div>
        <PeriodToggle
          period={period}
          date={date}
          rangeLabel={formatRange(data.range)}
          onPeriodChange={setPeriod}
          onDateChange={setDate}
        />
      </div>

      <div className="stats">
        <StatCard icon={CalendarDays} tone="blue" label="Days Worked" value={data.daysWorked}>
          <Trend current={data.daysWorked} previous={previous.daysWorked} label={vs} />
        </StatCard>
        <StatCard icon={IndianRupee} tone="green" label="Gross Pay" value={formatMoney(data.grossPay)}>
          <Trend current={data.grossPay} previous={previous.grossPay} label={vs} />
        </StatCard>
        <StatCard icon={WalletCards} tone="orange" label="Advances Deducted" value={formatMoney(data.totalAdvances)}>
          <Trend current={data.totalAdvances} previous={previous.totalAdvances} label={vs} />
        </StatCard>
        <StatCard icon={Wallet} tone="purple" label="Final Balance" value={formatMoney(data.balance)}>
          <span className={`stat-note ${data.balance < 0 ? 'red' : ''}`}>
            {data.balance < 0 ? 'Advances exceed pay' : 'Gross pay − advances'}
          </span>
        </StatCard>
      </div>

      <section className="box">
        <div className="box-head"><h2>Day-by-day</h2></div>
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Status</th><th className="num">Pay</th></tr>
          </thead>
          <tbody>
            {data.dailyBreakdown.map((day) => (
              <tr key={day.date}>
                <td>{formatDate(day.date)}</td>
                <td><StatusBadge status={day.status} /></td>
                <td className="num">{formatMoney(day.pay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="box">
        <div className="box-head"><h2>Add Advance</h2></div>
        <div className="pad"><AdvanceForm onAdd={addAdvance} /></div>
      </section>

      {advances.length > 0 && (
        <section className="box">
          <div className="box-head"><h2>All Advances</h2></div>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Note</th><th className="num">Amount</th></tr>
            </thead>
            <tbody>
              {advances.map((a) => (
                <tr key={a._id}>
                  <td>{formatDate(a.date)}</td>
                  <td>{a.note || <span className="muted">—</span>}</td>
                  <td className="num">{formatMoney(a.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
