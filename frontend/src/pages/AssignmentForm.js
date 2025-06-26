import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AssignmentForm = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftId, setShiftId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('assigned');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/shifts?limit=100', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setShifts(data.data);
    } catch (err) {
      setError('Failed to load shifts');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees?limit=100', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/shift-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ shiftId, employeeId, status })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Assignment created successfully!');
        setTimeout(() => navigate('/assignments'), 1200);
      } else {
        setError(data.message || 'Failed to create assignment');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" mb={2} fontWeight="bold">Create Shift Assignment</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="shift-label">Shift</InputLabel>
            <Select
              labelId="shift-label"
              value={shiftId}
              label="Shift"
              onChange={e => setShiftId(e.target.value)}
            >
              {shifts.map(shift => (
                <MenuItem key={shift._id} value={shift._id}>
                  {shift.shiftName} ({shift.date ? new Date(shift.date).toLocaleDateString() : ''})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="employee-label">Employee</InputLabel>
            <Select
              labelId="employee-label"
              value={employeeId}
              label="Employee"
              onChange={e => setEmployeeId(e.target.value)}
            >
              {employees.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Status"
              onChange={e => setStatus(e.target.value)}
            >
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !shiftId || !employeeId}
              startIcon={loading && <CircularProgress size={18} />}
            >
              Create Assignment
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AssignmentForm; 