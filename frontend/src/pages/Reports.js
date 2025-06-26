import {
    Assessment as AssessmentIcon,
    Download as DownloadIcon,
    People as PeopleIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import React, { useState } from 'react';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const downloadReport = async (reportType) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/reports/${reportType}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess(`${reportType} report downloaded successfully!`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to download report');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      id: 'assignments',
      title: 'Shift Assignments Report',
      description: 'All shift assignments from the past 30 days including employee details, shift information, and status',
      icon: <ScheduleIcon />,
      color: 'primary'
    },
    {
      id: 'shifts',
      title: 'Shifts Report',
      description: 'All shifts from the past 30 days with assignment counts and details',
      icon: <AssessmentIcon />,
      color: 'secondary'
    },
    {
      id: 'employees',
      title: 'Employee Activity Report',
      description: 'Employee assignment activity and statistics from the past 30 days',
      icon: <PeopleIcon />,
      color: 'success'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Download comprehensive reports of shift assignments and employee activity from the past 30 days.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {reportTypes.map((report) => (
          <Grid item xs={12} md={4} key={report.id}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={report.icon}
                    label={report.title}
                    color={report.color}
                    variant="outlined"
                    sx={{ fontSize: '1rem', p: 1 }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 60 }}>
                  {report.description}
                </Typography>

                <Button
                  variant="contained"
                  color={report.color}
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={() => downloadReport(report.id)}
                  disabled={loading}
                  fullWidth
                  size="large"
                >
                  {loading ? 'Generating...' : 'Download Report'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Report Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Reports include data from the past 30 days<br/>
          • CSV format for easy analysis in Excel or other tools<br/>
          • All times are in your local timezone<br/>
          • Reports are generated in real-time with current data
        </Typography>
      </Paper>
    </Box>
  );
};

export default Reports; 