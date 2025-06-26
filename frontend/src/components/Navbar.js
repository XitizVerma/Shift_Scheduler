import {
    Assessment as AssessmentIcon,
    Assignment as AssignmentIcon,
    CalendarMonth as CalendarMonthIcon,
    Dashboard as DashboardIcon,
    ExitToApp as LogoutIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
    AppBar,
    Box,
    Button,
    IconButton,
    Toolbar,
    Typography
} from '@mui/material';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/employees', label: 'Employees', icon: <PeopleIcon /> },
    { path: '/shifts', label: 'Shifts', icon: <ScheduleIcon /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarMonthIcon /> },
    { path: '/assignments', label: 'Assignments', icon: <AssignmentIcon /> },
    { path: '/reports', label: 'Reports', icon: <AssessmentIcon /> },
    { path: '/users', label: 'Users', icon: <PersonIcon /> },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/dashboard"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          Shift Management
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              startIcon={item.icon}
              sx={{
                color: 'white',
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Welcome, {user?.username}
            </Typography>
            <IconButton
              onClick={handleLogout}
              sx={{ color: 'white' }}
              title="Logout"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 