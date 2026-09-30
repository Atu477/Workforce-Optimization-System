const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const seedData = require('./seed');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Manpower & Skill Management API is active' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database has 0 users
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Server] Empty database detected. Auto-seeding initial data...');
    await seedData();
  }

  app.listen(PORT, () => {
    console.log(`[Server] Backend running on port ${PORT} (http://localhost:${PORT})`);
  });
};

startServer();
