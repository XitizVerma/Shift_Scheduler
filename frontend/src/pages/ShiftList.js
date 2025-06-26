import {
    Add as AddIcon,
    CalendarToday as CalendarIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    People as PeopleIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShifts();
  }, [currentPage, selectedDate]);

  const fetchShifts = async () => {
    try {
      const url = `/api/shifts?page=${currentPage}${selectedDate ? `&date=${selectedDate}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setShifts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError('Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        const response = await fetch(`/api/shifts/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          fetchShifts();
        }
      } catch (error) {
        console.error('Error deleting shift:', error);
        setError('Failed to delete shift');
      }
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Shifts
        </Typography>
        <Button
          component={Link}
          to="/shifts/new"
          variant="contained"
          startIcon={<AddIcon />}
          color="success"
        >
          Create New Shift
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ mb: 3, p: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CalendarIcon color="action" />
          <TextField
            label="Filter by Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Shift Name</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Assigned</strong></TableCell>
              <TableCell><strong>Max Employees</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift._id} hover>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {shift.shiftName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={formatDate(shift.date)} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {shift.startTime} - {shift.endTime}
                  </Typography>
                </TableCell>
                <TableCell>{shift.location || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${shift.assignedEmployees || 0} assigned`}
                    color={shift.assignedEmployees > 0 ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{shift.maxEmployees || 'No limit'}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/shifts/${shift._id}/edit`}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/shifts/${shift._id}/assign`}
                    color="secondary"
                    size="small"
                    title="Assign Employees"
                  >
                    <PeopleIcon />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/shifts/${shift._id}`}
                    color="info"
                    size="small"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(shift._id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {shifts.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No shifts found.
          </Typography>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ShiftList; 