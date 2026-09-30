const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// Get leaves list
exports.getAllLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId department designation email')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching leaves' });
  }
};

// Submit Leave Request (Employee)
exports.submitLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Start date, end date, and reason are required' });
    }

    const leave = new Leave({
      employee: req.user._id,
      leaveType: leaveType || 'Casual Leave',
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });

    await leave.save();
    const populated = await Leave.findById(leave._id).populate('employee', 'name employeeId department');

    res.status(201).json({ message: 'Leave request submitted successfully', leave: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error submitting leave request' });
  }
};

// Approve / Reject Leave Request (Admin & Manager)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();

    // If approved, create or update attendance entries for the date range
    if (status === 'Approved') {
      let current = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date: dateStr },
          { 
            employee: leave.employee._id,
            date: dateStr,
            status: 'On Leave',
            shift: leave.employee.shift,
            notes: `Approved Leave: ${leave.leaveType}`
          },
          { upsert: true, new: true }
        );
        current.setDate(current.getDate() + 1);
      }
    }

    res.json({ message: `Leave request ${status.toLowerCase()}`, leave });
  } catch (err) {
    console.error('Error updating leave status:', err);
    res.status(500).json({ message: 'Server error updating leave request' });
  }
};
