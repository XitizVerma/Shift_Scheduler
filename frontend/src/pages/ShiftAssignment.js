import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ShiftAssignment = () => {
  const { shiftId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [shift, setShift] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  useEffect(() => {
    fetchShiftDetails();
    fetchAllEmployees();
  }, [shiftId]);

  const fetchShiftDetails = async () => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setShift(data.data);
        setAssignedEmployees(data.data.assignedEmployees || []);
      }
    } catch (error) {
      console.error('Error fetching shift details:', error);
      setError('Failed to load shift details');
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=1000', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data);
        // Filter out already assigned employees
        const assignedIds = assignedEmployees.map(emp => emp._id);
        const available = data.data.filter(emp => !assignedIds.includes(emp._id));
        setAvailableEmployees(available);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployees = async () => {
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shift-assignments/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          shiftId: shiftId,
          employeeIds: selectedEmployees
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Employees assigned successfully!');
        setSelectedEmployees([]);
        setAssignDialogOpen(false);
        // Refresh data
        fetchShiftDetails();
        fetchAllEmployees();
      } else {
        setError(data.message || 'Failed to assign employees');
      }
    } catch (error) {
      console.error('Error assigning employees:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (employeeId) => {
    try {
      // Find the assignment ID
      const assignment = assignedEmployees.find(emp => emp._id === employeeId);
      if (!assignment) return;

      const response = await fetch(`/api/shift-assignments/${assignment.assignmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Employee removed from shift');
        fetchShiftDetails();
        fetchAllEmployees();
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      setError('Failed to remove employee from shift');
    }
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      const assignment = assignedEmployees.find(emp => emp._id === employeeId);
      if (!assignment) return;

      const response = await fetch(`/api/shift-assignments/${assignment.assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setSuccess('Assignment status updated');
        fetchShiftDetails();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update assignment status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!shift) {
    return (
      <Alert severity="error">
        Shift not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Assign Employees to Shift
        </Typography>
        <Button
          onClick={() => navigate('/shifts')}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Shifts
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Shift Details */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Shift Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Name:</strong> {shift.shiftName}
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {formatDate(shift.date)}
            </Typography>
            <Typography variant="body1">
              <strong>Time:</strong> {shift.startTime} - {shift.endTime}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Location:</strong> {shift.location || 'Not specified'}
            </Typography>
            <Typography variant="body1">
              <strong>Max Employees:</strong> {shift.maxEmployees || 'No limit'}
            </Typography>
            <Typography variant="body1">
              <strong>Currently Assigned:</strong> {assignedEmployees.length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Assignment Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Assigned Employees ({assignedEmployees.length})
          </Typography>
          <Button
            onClick={() => setAssignDialogOpen(true)}
            variant="contained"
            startIcon={<PersonAddIcon />}
            color="primary"
            disabled={availableEmployees.length === 0}
          >
            Assign More Employees
          </Button>
        </Box>

        {assignedEmployees.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No employees assigned to this shift yet.
          </Typography>
        ) : (
          <List>
            {assignedEmployees.map((employee) => (
              <ListItem key={employee._id} divider>
                <ListItemText
                  primary={employee.name}
                  secondary={`${employee.employeeId} • ${employee.department || 'No department'}`}
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={employee.assignmentStatus || 'assigned'}
                        onChange={(e) => handleStatusChange(employee._id, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="assigned">Assigned</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      onClick={() => handleRemoveAssignment(employee._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Assign Employees Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assign Employees to Shift
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select employees to assign to this shift:
          </Typography>
          
          {availableEmployees.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              All employees are already assigned to this shift.
            </Typography>
          ) : (
            <List>
              {availableEmployees.map((employee) => (
                <ListItem key={employee._id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([...selectedEmployees, employee._id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee._id));
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {employee.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.employeeId} • {employee.department || 'No department'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignEmployees}
            variant="contained"
            disabled={selectedEmployees.length === 0 || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Assign Selected'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftAssignment; 