const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Clock In (Self-Attendance)
exports.clockIn = async (req, res) => {
  try {
    const today = getTodayDateString();
    const { workType, notes } = req.body;

    let record = await Attendance.findOne({ employee: req.user._id, date: today });
    if (record) {
      if (record.clockIn) {
        return res.status(400).json({ message: 'You have already clocked in for today', attendance: record });
      }
      record.clockIn = new Date();
      record.status = 'Present';
      if (workType) record.workType = workType;
      if (notes) record.notes = notes;
    } else {
      record = new Attendance({
        employee: req.user._id,
        date: today,
        clockIn: new Date(),
        status: 'Present',
        workType: workType || 'On-Site',
        shift: req.user.shift || 'Morning Shift (08:00 - 16:00)',
        notes: notes || ''
      });
    }

    await record.save();
    res.json({ message: 'Clocked in successfully', attendance: record });
  } catch (err) {
    console.error('Clock-in error:', err);
    res.status(500).json({ message: 'Server error during clock in' });
  }
};

// Clock Out (Self-Attendance)
exports.clockOut = async (req, res) => {
  try {
    const today = getTodayDateString();
    const record = await Attendance.findOne({ employee: req.user._id, date: today });

    if (!record || !record.clockIn) {
      return res.status(400).json({ message: 'You must clock in before clocking out' });
    }

    if (record.clockOut) {
      return res.status(400).json({ message: 'You have already clocked out for today', attendance: record });
    }

    record.clockOut = new Date();
    await record.save();

    res.json({ message: 'Clocked out successfully', attendance: record });
  } catch (err) {
    res.status(500).json({ message: 'Server error during clock out' });
  }
};

// Get today's attendance for current user
exports.getTodayStatus = async (req, res) => {
  try {
    const today = getTodayDateString();
    const record = await Attendance.findOne({ employee: req.user._id, date: today });
    res.json({ date: today, attendance: record || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching today status' });
  }
};

// Real-time Workforce Availability (Admin & Manager view)
exports.getRealtimeAvailability = async (req, res) => {
  try {
    const { date, department, shift } = req.query;
    const targetDate = date || getTodayDateString();

    let userQuery = { status: 'Active' };
    if (department) userQuery.department = department;
    if (shift) userQuery.shift = shift;

    const allActiveEmployees = await User.find(userQuery).select('-password');
    const attendanceRecords = await Attendance.find({ date: targetDate });

    const attendanceMap = {};
    attendanceRecords.forEach(rec => {
      attendanceMap[rec.employee.toString()] = rec;
    });

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    const shiftCounts = {
      'Morning Shift (08:00 - 16:00)': { total: 0, present: 0 },
      'Evening Shift (16:00 - 00:00)': { total: 0, present: 0 },
      'Night Shift (00:00 - 08:00)': { total: 0, present: 0 }
    };

    const availabilityList = allActiveEmployees.map(emp => {
      const att = attendanceMap[emp._id.toString()];
      let currentStatus = att ? att.status : 'Absent';
      
      if (currentStatus === 'Present' || currentStatus === 'Late' || currentStatus === 'Half-Day') {
        presentCount++;
      } else if (currentStatus === 'On Leave') {
        leaveCount++;
      } else {
        absentCount++;
      }

      if (shiftCounts[emp.shift]) {
        shiftCounts[emp.shift].total++;
        if (currentStatus === 'Present' || currentStatus === 'Late') {
          shiftCounts[emp.shift].present++;
        }
      }

      return {
        employee: emp,
        attendance: att || null,
        status: currentStatus
      };
    });

    res.json({
      date: targetDate,
      summary: {
        totalActive: allActiveEmployees.length,
        present: presentCount,
        absent: absentCount,
        onLeave: leaveCount,
        availabilityPercentage: allActiveEmployees.length > 0 
          ? Math.round((presentCount / allActiveEmployees.length) * 100) 
          : 0
      },
      shiftSummary: shiftCounts,
      availabilityList
    });
  } catch (err) {
    console.error('Error fetching real-time availability:', err);
    res.status(500).json({ message: 'Server error fetching availability' });
  }
};

// Attendance History Logs
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate, department, employeeId, status, shift } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    if (status) query.status = status;
    if (shift) query.shift = shift;

    // Filter by employee or department
    let employeeIds = [];
    let empQuery = {};
    if (department) empQuery.department = department;
    if (employeeId) empQuery.employeeId = employeeId;

    if (Object.keys(empQuery).length > 0) {
      const emps = await User.find(empQuery).select('_id');
      employeeIds = emps.map(e => e._id);
      query.employee = { $in: employeeIds };
    }

    // If Employee role (non-admin/manager), only show own history
    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    }

    const history = await Attendance.find(query)
      .populate('employee', 'employeeId name department designation shift email')
      .sort({ date: -1, clockIn: -1 });

    res.json(history);
  } catch (err) {
    console.error('Error fetching attendance history:', err);
    res.status(500).json({ message: 'Server error fetching attendance history' });
  }
};

// Admin / Manager Manual Attendance Override
exports.adminMarkAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, workType, shift, notes } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: 'Employee ID, date, and status are required' });
    }

    const emp = await User.findById(employeeId);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    let record = await Attendance.findOne({ employee: emp._id, date });
    if (record) {
      record.status = status;
      if (workType) record.workType = workType;
      if (shift) record.shift = shift;
      if (notes !== undefined) record.notes = notes;
    } else {
      record = new Attendance({
        employee: emp._id,
        date,
        clockIn: status === 'Present' ? new Date() : null,
        status,
        workType: workType || 'On-Site',
        shift: shift || emp.shift,
        notes: notes || 'Admin updated'
      });
    }

    await record.save();
    const populated = await Attendance.findById(record._id).populate('employee', 'name employeeId department');

    res.json({ message: 'Attendance record updated successfully', attendance: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating attendance record' });
  }
};

// Generate Workforce Planning Audit Report (1-day, 1-week, 1-month, 1-year, random person, or custom)
exports.generateWorkforceReport = async (req, res) => {
  try {
    const { timeframe, startDate: customStart, endDate: customEnd, employeeId, department, shift } = req.query;

    const now = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let start = '';
    let end = formatDate(now);
    let timeframeLabel = '';

    if (timeframe === 'today' || timeframe === '1day') {
      start = formatDate(now);
      end = formatDate(now);
      timeframeLabel = `1 Day (Today - ${start})`;
    } else if (timeframe === 'week' || timeframe === '1week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      start = formatDate(d);
      timeframeLabel = `1 Week (${start} to ${end})`;
    } else if (timeframe === 'month' || timeframe === '1month') {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      start = formatDate(d);
      timeframeLabel = `1 Month (${start} to ${end})`;
    } else if (timeframe === 'year' || timeframe === '1year') {
      const d = new Date(now);
      d.setDate(d.getDate() - 364);
      start = formatDate(d);
      timeframeLabel = `1 Year (${start} to ${end})`;
    } else if (customStart && customEnd) {
      start = customStart;
      end = customEnd;
      timeframeLabel = `Custom Period (${start} to ${end})`;
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      start = formatDate(d);
      timeframeLabel = `1 Month (${start} to ${end})`;
    }

    let userQuery = { status: 'Active' };
    if (employeeId && employeeId !== 'all') {
      userQuery._id = employeeId;
    }
    if (department) userQuery.department = department;
    if (shift) userQuery.shift = shift;

    const employees = await User.find(userQuery).select('-password').sort({ department: 1, name: 1 });
    const empIds = employees.map(e => e._id);

    const attendanceRecords = await Attendance.find({
      employee: { $in: empIds },
      date: { $gte: start, $lte: end }
    }).populate('employee', 'name employeeId department designation shift');

    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalOnLeave = 0;
    let totalWorkingHours = 0;
    let totalOvertimeHours = 0;

    const STANDARD_SHIFT = 8;

    const empMap = {};
    employees.forEach(emp => {
      empMap[emp._id.toString()] = {
        employee: emp,
        recordsCount: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        leaveCount: 0,
        totalHours: 0,
        overtimeHours: 0,
        attendancePercent: 0,
        punctualityScore: 0
      };
    });

    attendanceRecords.forEach(rec => {
      const empIdStr = rec.employee?._id ? rec.employee._id.toString() : rec.employee.toString();
      const stats = empMap[empIdStr];
      if (!stats) return;

      stats.recordsCount++;
      if (rec.status === 'Present') {
        stats.presentCount++;
        totalPresent++;
      } else if (rec.status === 'Late') {
        stats.presentCount++;
        stats.lateCount++;
        totalPresent++;
        totalLate++;
      } else if (rec.status === 'Half-Day') {
        stats.presentCount++;
        totalPresent++;
      } else if (rec.status === 'On Leave') {
        stats.leaveCount++;
        totalOnLeave++;
      } else {
        stats.absentCount++;
        totalAbsent++;
      }

      let hours = 0;
      if (rec.clockIn && rec.clockOut) {
        hours = Math.max(0, (new Date(rec.clockOut) - new Date(rec.clockIn)) / (1000 * 60 * 60));
      } else if (rec.clockIn && !rec.clockOut) {
        hours = Math.max(0, (new Date() - new Date(rec.clockIn)) / (1000 * 60 * 60));
      }

      stats.totalHours += hours;
      totalWorkingHours += hours;

      const ot = Math.max(0, hours - STANDARD_SHIFT);
      stats.overtimeHours += ot;
      totalOvertimeHours += ot;
    });

    const workerList = Object.values(empMap).map(item => {
      const attPct = item.recordsCount > 0 ? Math.round((item.presentCount / item.recordsCount) * 100) : 0;
      const punctScore = item.presentCount > 0 ? Math.round(((item.presentCount - item.lateCount) / item.presentCount) * 100) : 0;

      item.attendancePercent = attPct;
      item.punctualityScore = punctScore;
      item.totalHours = Math.round(item.totalHours * 10) / 10;
      item.overtimeHours = Math.round(item.overtimeHours * 10) / 10;
      return item;
    });

    const totalDaysRecorded = attendanceRecords.length;
    const overallAttendance = totalDaysRecorded > 0 ? Math.round((totalPresent / totalDaysRecorded) * 100) : 0;
    const overallPunctuality = totalPresent > 0 ? Math.round(((totalPresent - totalLate) / totalPresent) * 100) : 0;

    const shiftBreakdown = {
      'Morning Shift (08:00 - 16:00)': employees.filter(e => e.shift?.includes('Morning')).length,
      'Evening Shift (16:00 - 00:00)': employees.filter(e => e.shift?.includes('Evening')).length,
      'Night Shift (00:00 - 08:00)': employees.filter(e => e.shift?.includes('Night')).length
    };

    const departmentBreakdown = {};
    employees.forEach(e => {
      departmentBreakdown[e.department] = (departmentBreakdown[e.department] || 0) + 1;
    });

    const recommendations = [];
    if (totalOvertimeHours > (totalWorkingHours * 0.15)) {
      recommendations.push(`High Overtime Load: Overtime reached ${Math.round(totalOvertimeHours)} hours (${Math.round((totalOvertimeHours/Math.max(1,totalWorkingHours))*100)}% of total output). Future Planning: Consider adding 2-3 machine operators to avoid worker fatigue.`);
    } else {
      recommendations.push(`Healthy Overtime Levels: Overtime hours (${Math.round(totalOvertimeHours)}h) remain safely within normal industrial thresholds.`);
    }

    if (overallAttendance < 85) {
      recommendations.push(`Workforce Absenteeism Notice: Overall attendance is ${overallAttendance}%. Future Planning: Introduce punctuality bonuses and inspect unscheduled absences in heavy machinery operations.`);
    } else {
      recommendations.push(`Strong Workforce Regularity: Active factory presence is strong at ${overallAttendance}%.`);
    }

    if (shiftBreakdown['Night Shift (00:00 - 08:00)'] < (employees.length * 0.2)) {
      recommendations.push(`Shift Capacity Recommendation: Night shift headcount is below 20% of workforce. Plan shift redistribution for continuous batch manufacturing.`);
    }

    res.json({
      meta: {
        company: 'Ludhiana Mechanical Engineering Works',
        reportType: 'Workforce Roster & Manpower Planning Audit',
        generatedAt: new Date(),
        generatedBy: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
        timeframe,
        timeframeLabel,
        startDate: start,
        endDate: end,
        scope: employeeId && employeeId !== 'all' ? 'Individual Worker Audit' : 'Complete Factory Workforce'
      },
      summary: {
        totalWorkforce: employees.length,
        totalRecords: totalDaysRecorded,
        totalPresent,
        totalLate,
        totalAbsent,
        totalOnLeave,
        totalWorkingHours: Math.round(totalWorkingHours * 10) / 10,
        totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
        overallAttendance,
        overallPunctuality
      },
      shiftBreakdown,
      departmentBreakdown,
      recommendations,
      workerList
    });
  } catch (err) {
    console.error('Error generating workforce report:', err);
    res.status(500).json({ message: 'Server error generating workforce report: ' + err.message });
  }
};
