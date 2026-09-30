const mongoose = require('mongoose');

const skillItemSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { type: String, default: 'General' },
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
  department: { type: String, required: true, trim: true },
  designation: { type: String, required: true, trim: true },
  shift: { 
    type: String, 
    required: true, 
    enum: [
      'Morning Shift (08:00 - 16:00)',
      'Evening Shift (16:00 - 00:00)',
      'Night Shift (00:00 - 08:00)'
    ],
    default: 'Morning Shift (08:00 - 16:00)'
  },
  skills: [skillItemSchema],
  contactNumber: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
