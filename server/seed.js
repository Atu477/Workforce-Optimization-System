const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Skill = require('./models/Skill');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});

    console.log('[Seed] Inserting Skills Catalog...');
    const skillsList = [
      { name: 'React.js', category: 'Software & IT', description: 'Frontend JavaScript framework development' },
      { name: 'Node.js', category: 'Software & IT', description: 'Backend JavaScript runtime development' },
      { name: 'Electrical Safety', category: 'Safety & Compliance', description: 'Certified high-voltage electrical safety standards' },
      { name: 'CNC Machine Operation', category: 'Machinery & Tools', description: 'Precision multi-axis CNC lathe & milling operation' },
      { name: 'Quality Inspection (ISO 9001)', category: 'Quality Control', description: 'Audit and ISO standard compliance inspection' },
      { name: 'PLC Automation', category: 'Engineering', description: 'Programmable Logic Controllers programming (Siemens/Allen Bradley)' },
      { name: 'Forklift Operation', category: 'Logistics', description: 'Licensed heavy machinery forklift handling' },
      { name: 'CAD 3D Modeling', category: 'Engineering', description: 'SolidWorks & AutoCAD parametric mechanical design' },
      { name: 'Workplace Ergonomics', category: 'Safety & Compliance', description: 'Occupational health & hazard prevention' },
      { name: 'Supply Chain Management', category: 'Logistics', description: 'Inventory management and warehouse dispatching' }
    ];

    const insertedSkills = await Skill.insertMany(skillsList);

    console.log('[Seed] Hashing passwords and creating Users...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        employeeId: 'EMP-1001',
        name: 'Sarah Connor',
        email: 'admin@manpower.com',
        password: defaultPasswordHash,
        role: 'Admin',
        department: 'HR',
        designation: 'VP of Human Resources',
        shift: 'Morning Shift (08:00 - 16:00)',
        skills: [
          { skillName: 'Workplace Ergonomics', category: 'Safety & Compliance', proficiency: 'Expert' }
        ],
        contactNumber: '+1 555-0191',
        status: 'Active'
      },
      {
        employeeId: 'EMP-1002',
        name: 'Marcus Vance',
        email: 'manager@manpower.com',
        password: defaultPasswordHash,
        role: 'Manager',
        department: 'Operations',
        designation: 'Operations Director',
        shift: 'Morning Shift (08:00 - 16:00)',
        skills: [
          { skillName: 'Supply Chain Management', category: 'Logistics', proficiency: 'Expert' },
          { skillName: 'Quality Inspection (ISO 9001)', category: 'Quality Control', proficiency: 'Intermediate' }
        ],
        contactNumber: '+1 555-0192',
        status: 'Active'
      },
      {
        employeeId: 'EMP-1003',
        name: 'Alex Rivera',
        email: 'employee@manpower.com',
        password: defaultPasswordHash,
        role: 'Employee',
        department: 'Engineering',
        designation: 'Senior Automation Engineer',
        shift: 'Morning Shift (08:00 - 16:00)',
        skills: [
          { skillName: 'React.js', category: 'Software & IT', proficiency: 'Expert' },
          { skillName: 'Node.js', category: 'Software & IT', proficiency: 'Expert' },
          { skillName: 'PLC Automation', category: 'Engineering', proficiency: 'Intermediate' }
        ],
        contactNumber: '+1 555-0193',
        status: 'Active'
      },
      {
        employeeId: 'EMP-1004',
        name: 'David Chen',
        email: 'david.chen@manpower.com',
        password: defaultPasswordHash,
        role: 'Employee',
        department: 'Engineering',
        designation: 'CAD Systems Specialist',
        shift: 'Evening Shift (16:00 - 00:00)',
        skills: [
          { skillName: 'CAD 3D Modeling', category: 'Engineering', proficiency: 'Expert' },
          { skillName: 'PLC Automation', category: 'Engineering', proficiency: 'Beginner' }
        ],
        contactNumber: '+1 555-0194',
        status: 'Active'
      },
      {
        employeeId: 'EMP-1005',
        name: 'Elena Rostova',
        email: 'elena.r@manpower.com',
        password: defaultPasswordHash,
        role: 'Employee',
        department: 'Operations',
        designation: 'Lead Technician',
        shift: 'Night Shift (00:00 - 08:00)',
        skills: [
          { skillName: 'CNC Machine Operation', category: 'Machinery & Tools', proficiency: 'Expert' },
          { skillName: 'Electrical Safety', category: 'Safety & Compliance', proficiency: 'Expert' }
        ],
        contactNumber: '+1 555-0195',
        status: 'Active'
      },
      {
        employeeId: 'EMP-1006',
        name: 'James Wilson',
        email: 'james.w@manpower.com',
        password: defaultPasswordHash,
        role: 'Employee',
        department: 'Quality',
        designation: 'QA Lead Auditor',
        shift: 'Morning Shift (08:00 - 16:00)',
        skills: [
          { skillName: 'Quality Inspection (ISO 9001)', category: 'Quality Control', proficiency: 'Expert' }
        ],
        contactNumber: '+1 555-0196',
        status: 'Active'
      },
      {
        employeeId: 'EMP-1007',
        name: 'Priya Sharma',
        email: 'priya.s@manpower.com',
        password: defaultPasswordHash,
        role: 'Employee',
        department: 'Logistics',
        designation: 'Logistics Supervisor',
        shift: 'Evening Shift (16:00 - 00:00)',
        skills: [
          { skillName: 'Forklift Operation', category: 'Logistics', proficiency: 'Expert' },
          { skillName: 'Supply Chain Management', category: 'Logistics', proficiency: 'Intermediate' }
        ],
        contactNumber: '+1 555-0197',
        status: 'Active'
      },
      {
        employeeId: 'EMP-1008',
        name: 'Robert Miller',
        email: 'robert.m@manpower.com',
        password: defaultPasswordHash,
        role: 'Employee',
        department: 'Maintenance',
        designation: 'HVAC & Maintenance Tech',
        shift: 'Morning Shift (08:00 - 16:00)',
        skills: [
          { skillName: 'Electrical Safety', category: 'Safety & Compliance', proficiency: 'Expert' },
          { skillName: 'Workplace Ergonomics', category: 'Safety & Compliance', proficiency: 'Intermediate' }
        ],
        contactNumber: '+1 555-0198',
        status: 'Active'
      }
    ];

    const insertedUsers = await User.insertMany(usersData);
    console.log(`[Seed] Successfully inserted ${insertedUsers.length} users.`);

    console.log('[Seed] Generating Attendance History (Past 5 Days)...');
    const today = new Date();
    const attendanceRecords = [];

    const statuses = ['Present', 'Present', 'Present', 'Late', 'Present'];

    for (let i = 0; i <= 4; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const dateStr = pastDate.toISOString().split('T')[0];

      insertedUsers.forEach((user, idx) => {
        if (i === 0 && user.email === 'david.chen@manpower.com') {
          // Absent today example
          attendanceRecords.push({
            employee: user._id,
            date: dateStr,
            clockIn: null,
            clockOut: null,
            status: 'Absent',
            workType: 'On-Site',
            shift: user.shift,
            notes: 'Unexcused Absence'
          });
        } else if (i === 0 && user.email === 'priya.s@manpower.com') {
          // On Leave today example
          attendanceRecords.push({
            employee: user._id,
            date: dateStr,
            clockIn: null,
            clockOut: null,
            status: 'On Leave',
            workType: 'On-Site',
            shift: user.shift,
            notes: 'Medical Leave'
          });
        } else {
          const status = statuses[(idx + i) % statuses.length];
          const clockInTime = new Date(pastDate);
          clockInTime.setHours(8, Math.floor(Math.random() * 15), 0);

          const clockOutTime = new Date(pastDate);
          clockOutTime.setHours(16, Math.floor(Math.random() * 30), 0);

          attendanceRecords.push({
            employee: user._id,
            date: dateStr,
            clockIn: clockInTime,
            clockOut: clockOutTime,
            status,
            workType: idx % 3 === 0 ? 'Remote' : 'On-Site',
            shift: user.shift,
            notes: status === 'Late' ? 'Traffic delay reported' : 'Normal Shift'
          });
        }
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`[Seed] Inserted ${attendanceRecords.length} attendance records.`);

    console.log('[Seed] Inserting Leave Requests...');
    const adminUser = insertedUsers.find(u => u.role === 'Admin');
    const priyaUser = insertedUsers.find(u => u.email === 'priya.s@manpower.com');
    const alexUser = insertedUsers.find(u => u.email === 'employee@manpower.com');

    await Leave.insertMany([
      {
        employee: priyaUser._id,
        leaveType: 'Sick Leave',
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        reason: 'Severe fever and influenza',
        status: 'Approved',
        approvedBy: adminUser._id
      },
      {
        employee: alexUser._id,
        leaveType: 'Annual Leave',
        startDate: new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 86400000 * 6).toISOString().split('T')[0],
        reason: 'Family vacation and personal downtime',
        status: 'Pending'
      }
    ]);

    console.log('[Seed] Database seeding completed successfully!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
