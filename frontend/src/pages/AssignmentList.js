import { Box, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/shift-assignments', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setAssignments(data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/shift-assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        const response = await fetch(`/api/shift-assignments/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          fetchAssignments();
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <div className="main-content">
      <h1>Shift Assignments</h1>

      <Box mb={2} display="flex" justifyContent="flex-end">
        <Button
          component={Link}
          to="/assignments/new"
          variant="contained"
          color="primary"
        >
          Create Assignment
        </Button>
      </Box>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Shift</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Assigned At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment._id}>
                <td>
                  {assignment.employeeId?.name} ({assignment.employeeId?.employeeId})
                </td>
                <td>{assignment.shiftId?.shiftName}</td>
                <td>{formatDate(assignment.shiftId?.date)}</td>
                <td>
                  {assignment.shiftId?.startTime} - {assignment.shiftId?.endTime}
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 
                      assignment.status === 'completed' ? '#28a745' :
                      assignment.status === 'cancelled' ? '#dc3545' : '#007bff',
                    color: 'white'
                  }}>
                    {assignment.status}
                  </span>
                </td>
                <td>{formatDate(assignment.assignedAt)}</td>
                <td>
                  <select
                    value={assignment.status}
                    onChange={(e) => handleStatusUpdate(assignment._id, e.target.value)}
                    style={{ marginRight: '5px', padding: '2px' }}
                  >
                    <option value="assigned">Assigned</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleDelete(assignment._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {assignments.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666' }}>No assignments found.</p>
        )}
      </div>
    </div>
  );
};

export default AssignmentList; 