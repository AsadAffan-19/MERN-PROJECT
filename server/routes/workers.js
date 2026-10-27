const express = require('express');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Advance = require('../models/Advance');

const router = express.Router();

// GET /api/workers
router.get('/', async (req, res) => {
  const workers = await Worker.find().sort({ name: 1 });
  res.json(workers);
});

// POST /api/workers
router.post('/', async (req, res) => {
  try {
    const { name, dailyWage, phone } = req.body;
    const worker = await Worker.create({ name, dailyWage, phone });
    res.status(201).json(worker);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/workers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, dailyWage, phone } = req.body;
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { name, dailyWage, phone },
      { returnDocument: 'after', runValidators: true }
    );
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/workers/:id — also removes that worker's attendance and advances
router.delete('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    await Attendance.deleteMany({ workerId: worker._id });
    await Advance.deleteMany({ workerId: worker._id });
    res.json({ message: 'Worker deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
