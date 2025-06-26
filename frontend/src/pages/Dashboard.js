import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    employees: 0,
    shifts: 0,
    assignments: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employeesRes, shiftsRes, assignmentsRes, usersRes] = await Promise.all([
        fetch('/api/employees?limit=1', { credentials: 'include' }),
        fetch('/api/shifts?limit=1', { credentials: 'include' }),
        fetch('/api/shift-assignments?limit=1', { credentials: 'include' }),
        fetch('/api/users', { credentials: 'include' })
      ]);

      const employeesData = await employeesRes.json();
      const shiftsData = await shiftsRes.json();
      const assignmentsData = await assignmentsRes.json();
      const usersData = await usersRes.json();

      setStats({
        employees: employeesData.pagination?.totalItems || 0,
        shifts: shiftsData.pagination?.totalItems || 0,
        assignments: assignmentsData.data?.length || 0,
        users: usersData.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.employees,
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: { label: 'Manage Employees', path: '/employees', icon: <ViewIcon /> }
    },
    {
      title: 'Total Shifts',
      value: stats.shifts,
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      action: { label: 'Manage Shifts', path: '/shifts', icon: <ViewIcon /> }
    },
    {
      title: 'Active Assignments',
      value: stats.assignments,
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      action: { label: 'View Assignments', path: '/assignments', icon: <ViewIcon /> }
    },
    {
      title: 'System Users',
      value: stats.users,
      icon: <PersonIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      action: { label: 'Manage Users', path: '/users', icon: <ViewIcon /> }
    }
  ];

  const quickActions = [
    { label: 'Add New Employee', path: '/employees/new', icon: <AddIcon />, color: 'success' },
    { label: 'Create New Shift', path: '/shifts/new', icon: <AddIcon />, color: 'primary' },
    { label: 'Manage Assignments', path: '/assignments', icon: <AssignmentIcon />, color: 'info' },
    { label: 'User Management', path: '/users', icon: <PersonIcon />, color: 'secondary' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {card.title}
                </Typography>
                <Button
                  component={Link}
                  to={card.action.path}
                  variant="outlined"
                  startIcon={card.action.icon}
                  size="small"
                >
                  {card.action.label}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                component={Link}
                to={action.path}
                variant="contained"
                color={action.color}
                startIcon={action.icon}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard; 