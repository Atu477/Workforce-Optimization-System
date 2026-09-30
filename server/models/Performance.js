const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },

  // Auto-calculated from attendance data
  autoMetrics: {
    totalWorkingDays: { type: Number, default: 0 },
    daysPresent: { type: Number, default: 0 },
    daysAbsent: { type: Number, default: 0 },
    daysLate: { type: Number, default: 0 },
    daysOnLeave: { type: Number, default: 0 },
    totalWorkingHours: { type: Number, default: 0 },
    avgDailyHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    attendancePercent: { type: Number, default: 0 },
    punctualityScore: { type: Number, default: 0 }
  },

  // Manager ratings (1-5 scale)
  ratings: {
    productivity: { type: Number, min: 1, max: 5, default: null },
    quality: { type: Number, min: 1, max: 5, default: null },
    punctuality: { type: Number, min: 1, max: 5, default: null },
    teamwork: { type: Number, min: 1, max: 5, default: null },
    initiative: { type: Number, min: 1, max: 5, default: null }
  },

  overallScore: { type: Number, default: null },
  managerComments: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['Pending Review', 'Reviewed'], default: 'Pending Review' }
}, { timestamps: true });

performanceSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Performance', performanceSchema);
