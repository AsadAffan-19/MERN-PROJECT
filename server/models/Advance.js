const mongoose = require('mongoose');

const advanceSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  note: { type: String, trim: true },
});

module.exports = mongoose.model('Advance', advanceSchema);
