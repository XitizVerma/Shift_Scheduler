import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Color palette for shift chips
const shiftColors = [
  'primary', 'secondary', 'success', 'warning', 'info', 'error', 'default'
];

const CalendarView = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line
  }, [currentMonth, currentYear]);

  const fetchShifts = async () => {
    setLoading(true);
    setError('');
    try {
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      const response = await fetch(`/api/shifts?date_gte=${startStr}&date_lte=${endStr}&limit=100`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setShifts(data.data);
      } else {
        setError('Failed to fetch shifts');
      }
    } catch (err) {
      setError('Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  // Map shifts by date string (YYYY-MM-DD)
  const shiftsByDate = {};
  shifts.forEach(shift => {
    const dateStr = new Date(shift.date).toISOString().split('T')[0];
    if (!shiftsByDate[dateStr]) shiftsByDate[dateStr] = [];
    shiftsByDate[dateStr].push(shift);
  });

  // Build calendar grid
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null); // Empty cells before the 1st
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null); // Fill to complete last week
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  // Helper to check if a day is today
  const isToday = (day) => {
    return (
      day &&
      currentYear === today.getFullYear() &&
      currentMonth === today.getMonth() &&
      day === today.getDate()
    );
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="center" mb={3} gap={2}>
        <Button onClick={handlePrevMonth} variant="outlined" size="large"><ArrowBack /></Button>
        <Typography variant="h3" fontWeight="bold">{monthName} {currentYear}</Typography>
        <Button onClick={handleNextMonth} variant="outlined" size="large"><ArrowForward /></Button>
        <Button onClick={handleToday} variant="contained" color="info" sx={{ ml: 2 }}>
          Today
        </Button>
      </Box>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={6} sx={{ p: 2, overflowX: 'auto', width: '100%', maxWidth: '1600px', mx: 'auto', background: '#f8fafc' }}>
          <Grid container spacing={2} columns={7}>
            {weekDays.map((wd) => (
              <Grid item xs={1} key={wd}>
                <Typography align="center" fontWeight="bold" variant="h6" color="primary.main">{wd}</Typography>
              </Grid>
            ))}
            {calendarCells.map((day, idx) => {
              const dateStr = day
                ? new Date(currentYear, currentMonth, day).toISOString().split('T')[0]
                : null;
              return (
                <Grid item xs={1} key={idx} sx={{ minHeight: 180 }}>
                  <Card
                    variant={isToday(day) ? 'elevation' : 'outlined'}
                    sx={{
                      height: '100%',
                      background: isToday(day) ? 'linear-gradient(135deg, #e3f2fd 60%, #bbdefb 100%)' : '#fff',
                      border: isToday(day) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      boxShadow: isToday(day) ? 8 : 1,
                      transition: 'box-shadow 0.2s',
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <Typography align="right" variant="h6" color={isToday(day) ? 'primary' : 'text.secondary'} fontWeight={isToday(day) ? 'bold' : 'normal'}>
                      {day || ''}
                    </Typography>
                    <Box flex={1} mt={1}>
                      {day && shiftsByDate[dateStr] && shiftsByDate[dateStr].map((shift, i) => (
                        <Tooltip
                          key={shift._id}
                          title={
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">{shift.shiftName}</Typography>
                              <Typography variant="body2">{shift.startTime} - {shift.endTime}</Typography>
                              {shift.location && <Typography variant="body2">{shift.location}</Typography>}
                              {typeof shift.assignedEmployees === 'number' && (
                                <Typography variant="body2">Assigned: {shift.assignedEmployees}</Typography>
                              )}
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <Chip
                            label={`${shift.shiftName} (${shift.startTime}-${shift.endTime})`}
                            size="medium"
                            color={shiftColors[i % shiftColors.length]}
                            sx={{
                              mt: 0.5,
                              width: '100%',
                              fontWeight: 500,
                              fontSize: 14,
                              boxShadow: 1,
                              background: '#e3f2fd',
                              color: '#1976d2',
                              mb: 0.5
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default CalendarView; 