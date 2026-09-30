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
