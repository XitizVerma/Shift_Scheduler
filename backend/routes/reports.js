const express = require('express');
const ShiftAssignment = require('../models/ShiftAssignment');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// Helper function to convert data to CSV
const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
};

// GET /api/reports/assignments
router.get('/assignments', isAuthenticated, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const assignments = await ShiftAssignment.find({
      assignedAt: { $gte: thirtyDaysAgo }
    })
    .populate('shiftId', 'shiftName date startTime endTime location')
    .populate('employeeId', 'name employeeId email department position')
    .sort({ assignedAt: -1 });

    const csvData = assignments.map(assignment => ({
      'Assignment ID': assignment._id,
      'Employee Name': assignment.employeeId?.name || 'N/A',
      'Employee ID': assignment.employeeId?.employeeId || 'N/A',
      'Employee Email': assignment.employeeId?.email || 'N/A',
      'Employee Department': assignment.employeeId?.department || 'N/A',
      'Employee Position': assignment.employeeId?.position || 'N/A',
      'Shift Name': assignment.shiftId?.shiftName || 'N/A',
      'Shift Date': assignment.shiftId?.date ? new Date(assignment.shiftId.date).toLocaleDateString() : 'N/A',
      'Start Time': assignment.shiftId?.startTime || 'N/A',
      'End Time': assignment.shiftId?.endTime || 'N/A',
      'Location': assignment.shiftId?.location || 'N/A',
      'Assignment Status': assignment.status,
      'Assigned At': new Date(assignment.assignedAt).toLocaleString(),
      'Updated At': new Date(assignment.updatedAt).toLocaleString()
    }));

    const headers = [
      'Assignment ID', 'Employee Name', 'Employee ID', 'Employee Email', 
      'Employee Department', 'Employee Position', 'Shift Name', 'Shift Date',
      'Start Time', 'End Time', 'Location', 'Assignment Status', 
      'Assigned At', 'Updated At'
    ];

    const csv = convertToCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=assignments_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Assignments report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate assignments report'
    });
  }
});

// GET /api/reports/shifts
router.get('/shifts', isAuthenticated, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const shifts = await Shift.find({
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    const shiftsWithAssignments = await Promise.all(
      shifts.map(async (shift) => {
        const assignments = await ShiftAssignment.find({ shiftId: shift._id });
        const assignedCount = assignments.filter(a => a.status === 'assigned').length;
        const completedCount = assignments.filter(a => a.status === 'completed').length;
        const cancelledCount = assignments.filter(a => a.status === 'cancelled').length;

        return {
          'Shift ID': shift._id,
          'Shift Name': shift.shiftName,
          'Date': new Date(shift.date).toLocaleDateString(),
          'Start Time': shift.startTime,
          'End Time': shift.endTime,
          'Location': shift.location || 'N/A',
          'Description': shift.description || 'N/A',
          'Max Employees': shift.maxEmployees || 'No limit',
          'Total Assignments': assignments.length,
          'Assigned Count': assignedCount,
          'Completed Count': completedCount,
          'Cancelled Count': cancelledCount,
          'Created At': new Date(shift.createdAt).toLocaleString(),
          'Updated At': new Date(shift.updatedAt).toLocaleString()
        };
      })
    );

    const headers = [
      'Shift ID', 'Shift Name', 'Date', 'Start Time', 'End Time', 'Location',
      'Description', 'Max Employees', 'Total Assignments', 'Assigned Count',
      'Completed Count', 'Cancelled Count', 'Created At', 'Updated At'
    ];

    const csv = convertToCSV(shiftsWithAssignments, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=shifts_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Shifts report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate shifts report'
    });
  }
});

// GET /api/reports/employees
router.get('/employees', isAuthenticated, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const employees = await Employee.find().sort({ name: 1 });

    const employeesWithActivity = await Promise.all(
      employees.map(async (employee) => {
        const assignments = await ShiftAssignment.find({
          employeeId: employee._id,
          assignedAt: { $gte: thirtyDaysAgo }
        }).populate('shiftId', 'shiftName date startTime endTime');

        const assignedCount = assignments.filter(a => a.status === 'assigned').length;
        const completedCount = assignments.filter(a => a.status === 'completed').length;
        const cancelledCount = assignments.filter(a => a.status === 'cancelled').length;

        const recentShifts = assignments.slice(0, 3).map(a => 
          `${a.shiftId?.shiftName} (${a.shiftId?.date ? new Date(a.shiftId.date).toLocaleDateString() : 'N/A'})`
        ).join('; ');

        return {
          'Employee ID': employee.employeeId,
          'Employee Name': employee.name,
          'Email': employee.email || 'N/A',
          'Phone': employee.phone || 'N/A',
          'Department': employee.department || 'N/A',
          'Position': employee.position || 'N/A',
          'Hire Date': employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A',
          'Total Assignments (30 days)': assignments.length,
          'Assigned Count': assignedCount,
          'Completed Count': completedCount,
          'Cancelled Count': cancelledCount,
          'Recent Shifts': recentShifts || 'None',
          'Created At': new Date(employee.createdAt).toLocaleString(),
          'Updated At': new Date(employee.updatedAt).toLocaleString()
        };
      })
    );

    const headers = [
      'Employee ID', 'Employee Name', 'Email', 'Phone', 'Department', 'Position',
      'Hire Date', 'Total Assignments (30 days)', 'Assigned Count', 'Completed Count',
      'Cancelled Count', 'Recent Shifts', 'Created At', 'Updated At'
    ];

    const csv = convertToCSV(employeesWithActivity, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employees_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Employees report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate employees report'
    });
  }
});

module.exports = router; 