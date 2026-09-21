const express = require('express');
const router = express.Router();
const { 
  clockIn, 
  clockOut, 
  getTodayStatus, 
  getRealtimeAvailability, 
  getAttendanceHistory, 
  adminMarkAttendance,
  generateWorkforceReport
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today', getTodayStatus);
router.get('/availability', authorize('Admin', 'Manager'), getRealtimeAvailability);
router.get('/history', getAttendanceHistory);
router.get('/report', authorize('Admin', 'Manager'), generateWorkforceReport);
router.post('/admin-mark', authorize('Admin', 'Manager'), adminMarkAttendance);

module.exports = router;
