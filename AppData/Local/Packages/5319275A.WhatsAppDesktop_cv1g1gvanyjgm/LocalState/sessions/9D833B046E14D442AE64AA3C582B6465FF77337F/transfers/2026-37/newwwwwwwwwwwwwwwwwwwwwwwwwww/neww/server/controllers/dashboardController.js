const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Skill = require('../models/Skill');
const Leave = require('../models/Leave');

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDateString();

    const totalActiveEmployees = await User.countDocuments({ status: 'Active' });
    const totalEmployees = await User.countDocuments();
    const todayAttendance = await Attendance.find({ date: today }).populate('employee', 'name department shift');

    let present = 0;
    let late = 0;
    let onLeave = 0;
    let absent = 0;

    const presentEmployeeIds = new Set();

    todayAttendance.forEach(record => {
      if (record.status === 'Present') {
        present++;
        presentEmployeeIds.add(record.employee._id.toString());
      } else if (record.status === 'Late') {
        late++;
        presentEmployeeIds.add(record.employee._id.toString());
      } else if (record.status === 'On Leave') {
        onLeave++;
      } else if (record.status === 'Absent') {
        absent++;
      }
    });

    const unrecordedAbsent = totalActiveEmployees - (present + late + onLeave + absent);
    const totalAbsent = absent + (unrecordedAbsent > 0 ? unrecordedAbsent : 0);

    // Shift breakdown
    const shifts = [
      'Morning Shift (08:00 - 16:00)',
      'Evening Shift (16:00 - 00:00)',
      'Night Shift (00:00 - 08:00)'
    ];

    const shiftData = await Promise.all(shifts.map(async (shiftName) => {
      const totalShift = await User.countDocuments({ status: 'Active', shift: shiftName });
      const presentShift = todayAttendance.filter(a => a.shift === shiftName && (a.status === 'Present' || a.status === 'Late')).length;
      return {
        shift: shiftName,
        shortName: shiftName.split(' ')[0],
        total: totalShift,
        present: presentShift,
        absent: totalShift - presentShift
      };
    }));

    // Department breakdown
    const departments = ['Engineering', 'Operations', 'Quality', 'Maintenance', 'Logistics', 'HR'];
    const departmentData = await Promise.all(departments.map(async (dept) => {
      const totalDept = await User.countDocuments({ status: 'Active', department: dept });
      const deptEmployees = await User.find({ status: 'Active', department: dept }).select('_id');
      const deptEmpIds = deptEmployees.map(e => e._id.toString());

      const presentDept = todayAttendance.filter(a => 
        deptEmpIds.includes(a.employee._id.toString()) && (a.status === 'Present' || a.status === 'Late')
      ).length;

      return {
        department: dept,
        total: totalDept,
        present: presentDept,
        availability: totalDept > 0 ? Math.round((presentDept / totalDept) * 100) : 0
      };
    }));

    // Top skills count
    const skillsCatalog = await Skill.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    res.json({
      today,
      metrics: {
        totalEmployees,
        activeEmployees: totalActiveEmployees,
        presentToday: present + late,
        absentToday: totalAbsent,
        onLeaveToday: onLeave,
        pendingLeaves,
        skillsInCatalog: skillsCatalog,
        availabilityPercentage: totalActiveEmployees > 0 
          ? Math.round(((present + late) / totalActiveEmployees) * 100) 
          : 0
      },
      shiftData,
      departmentData
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Server error fetching dashboard metrics' });
  }
};
