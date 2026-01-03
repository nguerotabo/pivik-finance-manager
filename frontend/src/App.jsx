import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Archive from './pages/Archive';
import Earnings from './pages/Earnings';
import FedUp from './pages/FedUp';
import Login from './pages/Login'; // 👈 Import Login

function App() {
  // Check if they were already logged in (saved in browser memory)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth') === 'true';
  });

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    if (status) {
        localStorage.setItem('auth', 'true'); // Remember me!
    } else {
        localStorage.removeItem('auth');
    }
  };

  const handleLogout = () => {
      handleLogin(false);
  };

  // 🛡️ The "Guard" Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      {/* Only show Navbar if logged in */}
      {isAuthenticated && <Navbar onLogout={handleLogout} />} 

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* 🔒 Protected Routes (Wrapped in the Guard) */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
        <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
        <Route path="/fed-up" element={<ProtectedRoute><FedUp /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;