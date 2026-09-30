const express = require('express');
const router = express.Router();
const { getAllLeaves, submitLeave, updateLeaveStatus } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAllLeaves);
router.post('/', submitLeave);
router.put('/:id/status', authorize('Admin', 'Manager'), updateLeaveStatus);

module.exports = router;
