const express = require('express');
const router = express.Router();
const { 
  getAllEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('Admin'), createEmployee);
router.put('/:id', authorize('Admin'), updateEmployee);
router.delete('/:id', authorize('Admin'), deleteEmployee);

module.exports = router;
