const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all employees with filtering
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, role, shift, status, skill } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex }
      ];
    }

    if (department) query.department = department;
    if (role) query.role = role;
    if (shift) query.shift = shift;
    if (status) query.status = status;

    if (skill) {
      query['skills.skillName'] = new RegExp(skill, 'i');
    }

    const employees = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching employee' });
  }
};

// Create new employee (Admin only)
exports.createEmployee = async (req, res) => {
  try {
    const { 
      employeeId, name, email, password, role, 
      department, designation, shift, skills, contactNumber, status 
    } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({ message: 'Name, email, department, and designation are required' });
    }

    // Check existing email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An employee with this email already exists' });
    }

    // Auto-generate employeeId if not provided
    let finalEmpId = employeeId;
    if (!finalEmpId) {
      const count = await User.countDocuments();
      finalEmpId = `EMP-${1001 + count}`;
    } else {
      const existingEmpId = await User.findOne({ employeeId: finalEmpId.toUpperCase().trim() });
      if (existingEmpId) {
        return res.status(400).json({ message: 'Employee ID already in use' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const newEmployee = new User({
      employeeId: finalEmpId.toUpperCase().trim(),
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'Employee',
      department,
      designation,
      shift: shift || 'Morning Shift (08:00 - 16:00)',
      skills: skills || [],
      contactNumber: contactNumber || '',
      status: status || 'Active'
    });

    await newEmployee.save();

    const created = newEmployee.toObject();
    delete created.password;

    res.status(201).json({ message: 'Employee created successfully', employee: created });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ message: 'Server error creating employee: ' + err.message });
  }
};

// Update employee (Admin only)
exports.updateEmployee = async (req, res) => {
  try {
    const { 
      name, email, role, department, designation, 
      shift, skills, contactNumber, status, password 
    } = req.body;

    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (name) employee.name = name;
    if (email) employee.email = email.toLowerCase().trim();
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (shift) employee.shift = shift;
    if (skills) employee.skills = skills;
    if (contactNumber !== undefined) employee.contactNumber = contactNumber;
    if (status) employee.status = status;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(password, salt);
    }

    await employee.save();

    const updated = employee.toObject();
    delete updated.password;

    res.json({ message: 'Employee updated successfully', employee: updated });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Server error updating employee' });
  }
};

// Deactivate / Delete employee (Admin only)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Toggle status to Inactive or delete
    if (req.query.permanent === 'true') {
      await User.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Employee permanently deleted' });
    }

    employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
    await employee.save();

    res.json({ message: `Employee status changed to ${employee.status}`, status: employee.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error deactivating employee' });
  }
};
