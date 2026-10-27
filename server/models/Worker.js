const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dailyWage: { type: Number, required: true, min: 0 },
  phone: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Worker', workerSchema);
