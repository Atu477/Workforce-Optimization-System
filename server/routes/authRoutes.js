const express = require('express');
const router = express.Router();
const { login, registerSendOtp, registerVerifyOtp, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register-send-otp', registerSendOtp);
router.post('/register-verify-otp', registerVerifyOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

