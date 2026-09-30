const express = require('express');
const router = express.Router();
const {
  getEmployeeMetrics,
  getTeamOverview,
  getDailyPerformance,
  submitReview,
  updateReview,
  getPerformanceHistory
} = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Daily performance tracking (per-day factory overview)
router.get('/daily', authorize('Admin', 'Manager'), getDailyPerformance);

// Auto-calculated metrics for an employee (any logged-in user for self, Admin/Manager for others)
router.get('/metrics/:employeeId', getEmployeeMetrics);

// Team performance overview — Admin & Manager only
router.get('/team', authorize('Admin', 'Manager'), getTeamOverview);

// Performance review history
router.get('/history', getPerformanceHistory);

// Submit or update performance review — Admin & Manager only
router.post('/review', authorize('Admin', 'Manager'), submitReview);
router.put('/review/:id', authorize('Admin', 'Manager'), updateReview);

module.exports = router;
