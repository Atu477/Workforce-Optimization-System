const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  clockIn: { type: Date, default: Date.now },
  clockOut: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'On Leave', 'Late', 'Half-Day'], 
    default: 'Present' 
  },
  workType: { 
    type: String, 
    enum: ['On-Site', 'Remote', 'Field'], 
    default: 'On-Site' 
  },
  shift: { type: String, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Ensure one primary attendance record per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
