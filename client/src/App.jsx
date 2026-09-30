import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import SkillMatrix from './pages/SkillMatrix';
import Leaves from './pages/Leaves';
import Profile from './pages/Profile';
import Performance from './pages/Performance';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-amber-700 font-medium text-sm">
        Initializing Manpower System...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-800">
      <Navbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen} 
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedLayout allowedRoles={['Admin', 'Manager']}>
                <Employees />
              </ProtectedLayout>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedLayout>
                <Attendance />
              </ProtectedLayout>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedLayout allowedRoles={['Admin', 'Manager']}>
                <SkillMatrix />
              </ProtectedLayout>
            }
          />
          <Route
            path="/leaves"
            element={
              <ProtectedLayout>
                <Leaves />
              </ProtectedLayout>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedLayout allowedRoles={['Admin', 'Manager']}>
                <Performance />
              </ProtectedLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
