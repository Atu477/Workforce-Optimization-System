const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// Login user
exports.login = async (req, res) => {
  try {
    const rawLoginId = req.body.loginId || req.body.email || req.body.username || req.body.employeeId || '';
    const password = req.body.password;

    if (!rawLoginId || !password) {
      return res.status(400).json({ message: 'Please provide email/employee ID and password' });
    }

    const loginIdStr = String(rawLoginId).trim();
    const query = loginIdStr.includes('@')
      ? { email: loginIdStr.toLowerCase() }
      : { employeeId: loginIdStr.toUpperCase() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

// Update profile / skills
exports.updateProfile = async (req, res) => {
  try {
    const { contactNumber, skills } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (contactNumber !== undefined) user.contactNumber = contactNumber;
    if (skills && Array.isArray(skills)) user.skills = skills;

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
