const express = require('express');
const Attendance = require('../models/Attendance');
const { toDateOnly, monthRange } = require('../utils/dates');

const router = express.Router();

// GET /api/attendance?month=YYYY-MM
router.get('/', async (req, res) => {
  const { month } = req.query;
  if (!/^\d{4}-\d{2}$/.test(month || '')) {
    return res.status(400).json({ message: 'month must be in YYYY-MM format' });
  }
  const [year, m] = month.split('-').map(Number);
  const { start, end } = monthRange(year, m - 1);

  const records = await Attendance.find({ date: { $gte: start, $lte: end } })
    .populate('workerId', 'name')
    .sort({ date: 1 });
  res.json(records);
});

// POST /api/attendance — create or update one worker's status for one date
router.post('/', async (req, res) => {
  try {
    const { workerId, date, status } = req.body;
    if (!workerId || !date || !status) {
      return res.status(400).json({ message: 'workerId, date and status are required' });
    }
    const day = toDateOnly(date);
    const record = await Attendance.findOneAndUpdate(
      { workerId, date: day },
      { status },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
