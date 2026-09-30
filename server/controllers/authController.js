const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
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

// Send OTP for First-Time Registration
exports.registerSendOtp = async (req, res) => {
  try {
    const { name, email, password, department, designation, shift, role, contactNumber } = req.body;

    if (!name || !email || !password || !department || !designation) {
      return res.status(400).json({ message: 'Name, email, password, department, and designation are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered. Please login.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store new OTP with registration data
    await Otp.create({
      email: cleanEmail,
      otp,
      registrationData: {
        name: name.trim(),
        email: cleanEmail,
        password,
        department: department.trim(),
        designation: designation.trim(),
        shift: shift || 'Morning Shift (08:00 - 16:00)',
        role: role || 'Employee',
        contactNumber: contactNumber || ''
      }
    });

    console.log(`[OTP Verification] Generated 6-digit OTP for ${cleanEmail}: ${otp}`);

    res.json({
      message: `OTP sent successfully to ${cleanEmail}. Please enter the 6-digit code to complete registration.`,
      email: cleanEmail,
      devOtp: otp
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Server error sending registration OTP: ' + err.message });
  }
};

// Verify OTP and Complete First-Time Registration
exports.registerVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const otpRecord = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP code. Please request a new one.' });
    }

    // Double check email isn't registered already
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({ message: 'Email is already registered. Please login.' });
    }

    const { name, password, department, designation, shift, role, contactNumber } = otpRecord.registrationData;

    // Generate employee ID
    const count = await User.countDocuments();
    const employeeId = `EMP-${1001 + count}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      employeeId,
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'Employee',
      department,
      designation,
      shift: shift || 'Morning Shift (08:00 - 16:00)',
      skills: [],
      contactNumber: contactNumber || '',
      status: 'Active'
    });

    await newUser.save();

    // Remove OTP record
    await Otp.deleteMany({ email: cleanEmail });

    // Generate JWT token for auto-login
    const token = generateToken(newUser._id);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Email verified and registration successful!',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error verifying OTP: ' + err.message });
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

