const mongoose = require('mongoose');
const Performance = require('../models/Performance');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const STANDARD_SHIFT_HOURS = 8;

// Helper: get today date string YYYY-MM-DD in local time
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: calculate metrics from attendance records
const calculateMetrics = (attendanceRecords) => {
  let daysPresent = 0, daysAbsent = 0, daysLate = 0, daysOnLeave = 0;
  let totalWorkingHours = 0;

  attendanceRecords.forEach(rec => {
    if (rec.status === 'Present') daysPresent++;
    else if (rec.status === 'Late') { daysPresent++; daysLate++; }
    else if (rec.status === 'Half-Day') { daysPresent++; }
    else if (rec.status === 'On Leave') daysOnLeave++;
    else daysAbsent++;

    if (rec.clockIn && rec.clockOut) {
      const hours = (new Date(rec.clockOut) - new Date(rec.clockIn)) / (1000 * 60 * 60);
      totalWorkingHours += Math.max(0, hours);
    } else if (rec.clockIn && !rec.clockOut) {
      // Currently clocked in today
      const hours = (new Date() - new Date(rec.clockIn)) / (1000 * 60 * 60);
      totalWorkingHours += Math.max(0, hours);
    }
  });

  const totalWorkingDays = attendanceRecords.length;
  const avgDailyHours = daysPresent > 0 ? Math.round((totalWorkingHours / daysPresent) * 10) / 10 : 0;
  const overtimeHours = Math.max(0, Math.round((totalWorkingHours - (daysPresent * STANDARD_SHIFT_HOURS)) * 10) / 10);
  const attendancePercent = totalWorkingDays > 0 ? Math.round((daysPresent / totalWorkingDays) * 100) : 0;
  const punctualityScore = daysPresent > 0 ? Math.round(((daysPresent - daysLate) / daysPresent) * 100) : 0;

  return {
    totalWorkingDays,
    daysPresent,
    daysAbsent,
    daysLate,
    daysOnLeave,
    totalWorkingHours: Math.round(totalWorkingHours * 10) / 10,
    avgDailyHours,
    overtimeHours,
    attendancePercent,
    punctualityScore
  };
};

// GET /api/performance/daily?date=YYYY-MM-DD (Admin & Manager)
exports.getDailyPerformance = async (req, res) => {
  try {
    const targetDate = req.query.date || getTodayDateString();
    const employees = await User.find({ status: 'Active' }).select('-password').sort({ department: 1, name: 1 });
    const attendanceRecords = await Attendance.find({ date: targetDate });

    const attMap = {};
    attendanceRecords.forEach(a => {
      attMap[a.employee.toString()] = a;
    });

    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalOnLeave = 0;
    let factoryTotalHours = 0;
    let factoryTotalOvertime = 0;

    const dailyList = employees.map(emp => {
      const att = attMap[emp._id.toString()] || null;
      let status = att ? att.status : 'Absent';
      let hoursWorked = 0;

      if (att && att.clockIn) {
        const endTime = att.clockOut ? new Date(att.clockOut) : new Date();
        const diffMs = endTime - new Date(att.clockIn);
        hoursWorked = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
      }

      const overtime = Math.max(0, Math.round((hoursWorked - STANDARD_SHIFT_HOURS) * 10) / 10);

      if (status === 'Present') totalPresent++;
      else if (status === 'Late') { totalPresent++; totalLate++; }
      else if (status === 'Half-Day') totalPresent++;
      else if (status === 'On Leave') totalOnLeave++;
      else totalAbsent++;

      factoryTotalHours += hoursWorked;
      factoryTotalOvertime += overtime;

      return {
        employee: {
          _id: emp._id,
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department,
          designation: emp.designation,
          shift: emp.shift
        },
        attendance: att ? {
          _id: att._id,
          clockIn: att.clockIn,
          clockOut: att.clockOut,
          status: att.status,
          workType: att.workType,
          notes: att.notes
        } : null,
        status,
        hoursWorked,
        overtime
      };
    });

    res.json({
      date: targetDate,
      summary: {
        totalWorkforce: employees.length,
        present: totalPresent,
        late: totalLate,
        absent: totalAbsent,
        onLeave: totalOnLeave,
        factoryTotalHours: Math.round(factoryTotalHours * 10) / 10,
        factoryTotalOvertime: Math.round(factoryTotalOvertime * 10) / 10,
        attendanceRate: employees.length > 0 ? Math.round((totalPresent / employees.length) * 100) : 0
      },
      dailyList
    });
  } catch (err) {
    console.error('Error fetching daily performance:', err);
    res.status(500).json({ message: 'Server error fetching daily performance' });
  }
};

// GET /api/performance/team?startDate=&endDate=&month=&year= (Admin & Manager)
exports.getTeamOverview = async (req, res) => {
  try {
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    const now = new Date();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    const year = parseInt(req.query.year) || now.getFullYear();

    if (!startDate || !endDate) {
      startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    const employees = await User.find({ status: 'Active' }).select('-password');
    const allAttendance = await Attendance.find({ date: { $gte: startDate, $lte: endDate } });
    const allReviews = await Performance.find({ month, year }).populate('reviewedBy', 'name');

    const reviewMap = {};
    allReviews.forEach(r => { reviewMap[r.employee.toString()] = r; });

    let factoryTotalHours = 0;
    let factoryTotalOvertime = 0;

    const team = employees.map(emp => {
      const empAttendance = allAttendance.filter(a => a.employee.toString() === emp._id.toString());
      const metrics = calculateMetrics(empAttendance);
      const review = reviewMap[emp._id.toString()] || null;

      factoryTotalHours += metrics.totalWorkingHours;
      factoryTotalOvertime += metrics.overtimeHours;

      return {
        employee: {
          _id: emp._id,
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department,
          designation: emp.designation,
          shift: emp.shift,
          skills: emp.skills
        },
        autoMetrics: metrics,
        review: review ? {
          _id: review._id,
          ratings: review.ratings,
          overallScore: review.overallScore,
          managerComments: review.managerComments,
          status: review.status,
          reviewedBy: review.reviewedBy
        } : null
      };
    });

    team.sort((a, b) => b.autoMetrics.attendancePercent - a.autoMetrics.attendancePercent);

    res.json({
      startDate,
      endDate,
      month,
      year,
      summary: {
        totalWorkforce: employees.length,
        factoryTotalHours: Math.round(factoryTotalHours * 10) / 10,
        factoryTotalOvertime: Math.round(factoryTotalOvertime * 10) / 10,
        avgAttendance: team.length > 0 
          ? Math.round(team.reduce((acc, t) => acc + t.autoMetrics.attendancePercent, 0) / team.length) 
          : 0
      },
      team
    });
  } catch (err) {
    console.error('Error fetching team overview:', err);
    res.status(500).json({ message: 'Server error fetching team overview' });
  }
};

// GET /api/performance/metrics/:employeeId?startDate=&endDate=&month=&year=
exports.getEmployeeMetrics = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    const now = new Date();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    const year = parseInt(req.query.year) || now.getFullYear();

    if (!startDate || !endDate) {
      startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    const emp = await User.findById(employeeId).select('-password');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    if (req.user.role === 'Employee' && req.user._id.toString() !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    const autoMetrics = calculateMetrics(attendance);

    const review = await Performance.findOne({ employee: employeeId, month, year })
      .populate('reviewedBy', 'name role');

    res.json({
      employee: emp,
      startDate,
      endDate,
      month,
      year,
      autoMetrics,
      review: review || null
    });
  } catch (err) {
    console.error('Error fetching employee metrics:', err);
    res.status(500).json({ message: 'Server error fetching metrics' });
  }
};

// POST /api/performance/review (Admin & Manager)
exports.submitReview = async (req, res) => {
  try {
    const { employeeId, month, year, ratings, managerComments } = req.body;

    if (!employeeId || !month || !year || !ratings) {
      return res.status(400).json({ message: 'Employee, month, year and ratings are required' });
    }

    const emp = await User.findById(employeeId);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const ratingValues = Object.values(ratings).filter(v => v !== null && v !== undefined);
    const overallScore = ratingValues.length > 0
      ? Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 10) / 10
      : null;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });
    const autoMetrics = calculateMetrics(attendance);

    const review = await Performance.findOneAndUpdate(
      { employee: employeeId, month, year },
      {
        employee: employeeId,
        month,
        year,
        autoMetrics,
        ratings,
        overallScore,
        managerComments: managerComments || '',
        reviewedBy: req.user._id,
        status: 'Reviewed'
      },
      { upsert: true, new: true }
    ).populate('employee', 'name employeeId department').populate('reviewedBy', 'name role');

    res.json({ message: 'Performance review saved', review });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ message: 'Server error submitting review' });
  }
};

// PUT /api/performance/review/:id (Admin & Manager)
exports.updateReview = async (req, res) => {
  try {
    const { ratings, managerComments } = req.body;
    const review = await Performance.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (ratings) {
      review.ratings = { ...review.ratings.toObject(), ...ratings };
      const vals = Object.values(review.ratings.toObject()).filter(v => v !== null);
      review.overallScore = vals.length > 0
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : null;
    }
    if (managerComments !== undefined) review.managerComments = managerComments;
    review.reviewedBy = req.user._id;
    review.status = 'Reviewed';
    await review.save();

    const populated = await Performance.findById(review._id)
      .populate('employee', 'name employeeId department')
      .populate('reviewedBy', 'name role');

    res.json({ message: 'Review updated', review: populated });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: 'Server error updating review' });
  }
};

// GET /api/performance/history?employeeId=&months=6
exports.getPerformanceHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    } else if (req.query.employeeId) {
      query.employee = req.query.employeeId;
    }

    const reviews = await Performance.find(query)
      .populate('employee', 'name employeeId department designation')
      .populate('reviewedBy', 'name role')
      .sort({ year: -1, month: -1 })
      .limit(parseInt(req.query.months) || 12);

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching performance history:', err);
    res.status(500).json({ message: 'Server error fetching history' });
  }
};
