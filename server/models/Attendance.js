const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  // Stored as midnight UTC so each record represents a whole day
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Leave'],
    required: true,
  },
});

// Only one attendance record per worker per day
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
