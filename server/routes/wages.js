const express = require('express');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Advance = require('../models/Advance');
const { toDateOnly, toKey, addDays, monthRange } = require('../utils/dates');

const router = express.Router();

// How much of a day each status counts for
const DAY_VALUE = { Present: 1, 'Half Day': 0.5, Absent: 0, Leave: 0 };

// Step 1: work out the start and end date for the chosen period
function getRange(period, date) {
  if (period === 'day') {
    return { start: date, end: date };
  }
  if (period === 'week') {
    // getUTCDay(): Sunday = 0, Monday = 1 ... Saturday = 6.
    // We want weeks to run Monday–Sunday, so count how many days we are past Monday.
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    const start = addDays(date, -daysSinceMonday);
    return { start, end: addDays(start, 6) };
  }
  if (period === 'month') {
    return monthRange(date.getUTCFullYear(), date.getUTCMonth());
  }
  throw new Error('period must be day, week or month');
}

// Steps 2–5: calculate one worker's pay for the given date range
async function calculateWages(worker, start, end) {
  const inRange = { $gte: start, $lte: end };
  const attendance = await Attendance.find({ workerId: worker._id, date: inRange });
  const advances = await Advance.find({ workerId: worker._id, date: inRange });

  // Look up attendance by "YYYY-MM-DD" so we can walk the range day by day
  const statusByDay = {};
  attendance.forEach((a) => (statusByDay[toKey(a.date)] = a.status));

  // Step 2: go through every day in the range and add up days worked.
  // Days with no record are treated as "not marked" and count as 0.
  const dailyBreakdown = [];
  let daysWorked = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const status = statusByDay[toKey(d)] || null;
    const dayValue = status ? DAY_VALUE[status] : 0;
    daysWorked += dayValue;
    dailyBreakdown.push({
      date: toKey(d),
      status,
      pay: dayValue * worker.dailyWage,
    });
  }

  // Step 3: gross pay = days worked × daily wage
  const grossPay = daysWorked * worker.dailyWage;

  // Step 4: total of all advances given inside this date range
  const totalAdvances = advances.reduce((sum, a) => sum + a.amount, 0);

  // Step 5: what the contractor still owes (negative = worker was overpaid)
  const balance = grossPay - totalAdvances;

  return {
    worker: { _id: worker._id, name: worker.name, dailyWage: worker.dailyWage },
    daysWorked,
    grossPay,
    totalAdvances,
    balance,
    dailyBreakdown,
  };
}

// Reads ?period and ?date from the query string and returns the date range
function rangeFromQuery(query) {
  const period = query.period || 'day';
  const date = toDateOnly(query.date || new Date());
  return { period, ...getRange(period, date) };
}

// GET /api/wages?period=day|week|month&date=YYYY-MM-DD
// Cumulative view: every worker's pay for the range, plus grand totals
router.get('/', async (req, res) => {
  try {
    const { period, start, end } = rangeFromQuery(req.query);
    const workers = await Worker.find().sort({ name: 1 });

    const rows = [];
    for (const worker of workers) {
      const { dailyBreakdown, ...summary } = await calculateWages(worker, start, end);
      rows.push(summary);
    }

    // Add up each column across all workers
    const totals = { daysWorked: 0, grossPay: 0, totalAdvances: 0, balance: 0 };
    rows.forEach((r) => Object.keys(totals).forEach((k) => (totals[k] += r[k])));

    res.json({ period, range: { start: toKey(start), end: toKey(end) }, workers: rows, totals });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/wages/:workerId?period=day|week|month&date=YYYY-MM-DD
router.get('/:workerId', async (req, res) => {
  try {
    const { period, start, end } = rangeFromQuery(req.query);
    const worker = await Worker.findById(req.params.workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const result = await calculateWages(worker, start, end);
    res.json({ period, range: { start: toKey(start), end: toKey(end) }, ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
