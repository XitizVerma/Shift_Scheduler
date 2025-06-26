import {
    ArrowBack as ArrowBackIcon,
    Cancel as CancelIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ShiftForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    shiftName: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    description: '',
    maxEmployees: ''
  });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchShift();
    }
  }, [id]);

  const fetchShift = async () => {
    try {
      const response = await fetch(`/api/shifts/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        const shift = data.data;
        setFormData({
          shiftName: shift.shiftName || '',
          startTime: shift.startTime || '',
          endTime: shift.endTime || '',
          date: shift.date ? new Date(shift.date).toISOString().split('T')[0] : '',
          location: shift.location || '',
          description: shift.description || '',
          maxEmployees: shift.maxEmployees || ''
        });
      }
    } catch (error) {
      console.error('Error fetching shift:', error);
      setError('Failed to load shift data');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = isEditing ? `/api/shifts/${id}` : '/api/shifts';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          navigate('/shifts');
        }, 1500);
      } else {
        setError(data.message || 'Failed to save shift');
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isEditing ? 'Edit Shift' : 'Create New Shift'}
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

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shift Name"
                name="shiftName"
                value={formData.shiftName}
                onChange={handleChange}
                required
                helperText="Name of the shift (e.g., Morning Shift, Night Shift)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Date when the shift will occur"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Shift start time (HH:MM format)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Shift end time (HH:MM format)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                helperText="Work location (optional)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Employees"
                name="maxEmployees"
                type="number"
                value={formData.maxEmployees}
                onChange={handleChange}
                helperText="Maximum number of employees for this shift (optional)"
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                helperText="Additional details about the shift (optional)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              onClick={() => navigate('/shifts')}
              variant="outlined"
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Shift' : 'Create Shift')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ShiftForm; 