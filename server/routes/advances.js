const express = require('express');
const Advance = require('../models/Advance');
const { toDateOnly } = require('../utils/dates');

const router = express.Router();

// GET /api/advances/:workerId
router.get('/:workerId', async (req, res) => {
  try {
    const advances = await Advance.find({ workerId: req.params.workerId }).sort({ date: -1 });
    res.json(advances);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/advances
router.post('/', async (req, res) => {
  try {
    const { workerId, amount, date, note } = req.body;
    if (!workerId || !amount || !date) {
      return res.status(400).json({ message: 'workerId, amount and date are required' });
    }
    const advance = await Advance.create({ workerId, amount, date: toDateOnly(date), note });
    res.status(201).json(advance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
