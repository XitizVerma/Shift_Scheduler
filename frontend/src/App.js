import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AssignmentForm from './pages/AssignmentForm';
import AssignmentList from './pages/AssignmentList';
import CalendarView from './pages/CalendarView';
import Dashboard from './pages/Dashboard';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeList from './pages/EmployeeList';
import Login from './pages/Login';
import Reports from './pages/Reports';
import ShiftAssignment from './pages/ShiftAssignment';
import ShiftForm from './pages/ShiftForm';
import ShiftList from './pages/ShiftList';
import UserList from './pages/UserList';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar />}
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <EmployeeList />
              </ProtectedRoute>
            } />
            <Route path="/employees/new" element={
              <ProtectedRoute>
                <EmployeeForm />
              </ProtectedRoute>
            } />
            <Route path="/employees/:id/edit" element={
              <ProtectedRoute>
                <EmployeeForm />
              </ProtectedRoute>
            } />
            <Route path="/shifts" element={
              <ProtectedRoute>
                <ShiftList />
              </ProtectedRoute>
            } />
            <Route path="/shifts/new" element={
              <ProtectedRoute>
                <ShiftForm />
              </ProtectedRoute>
            } />
            <Route path="/shifts/:id/edit" element={
              <ProtectedRoute>
                <ShiftForm />
              </ProtectedRoute>
            } />
            <Route path="/shifts/:shiftId/assign" element={
              <ProtectedRoute>
                <ShiftAssignment />
              </ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute>
                <AssignmentList />
              </ProtectedRoute>
            } />
            <Route path="/assignments/new" element={
              <ProtectedRoute>
                <AssignmentForm />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Root App Component with Auth Provider and Material-UI Theme
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 