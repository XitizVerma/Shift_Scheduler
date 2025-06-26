const express = require('express');
const { body, validationResult } = require('express-validator');
const ShiftAssignment = require('../models/ShiftAssignment');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// GET /api/shift-assignments
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { shiftId, employeeId, date } = req.query;
    const query = {};

    if (shiftId) query.shiftId = shiftId;
    if (employeeId) query.employeeId = employeeId;

    const assignments = await ShiftAssignment.find(query)
      .populate('shiftId', 'shiftName date startTime endTime')
      .populate('employeeId', 'name employeeId')
      .sort({ assignedAt: -1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shift-assignments/shift/:shiftId
router.get('/shift/:shiftId', isAuthenticated, async (req, res) => {
  try {
    const { shiftId } = req.params;
    const assignments = await ShiftAssignment.find({ shiftId })
      .populate('employeeId', 'name employeeId email department')
      .sort({ assignedAt: 1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get shift assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shift-assignments/employee/:employeeId
router.get('/employee/:employeeId', isAuthenticated, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const assignments = await ShiftAssignment.find({ employeeId })
      .populate('shiftId', 'shiftName date startTime endTime location')
      .sort({ 'shiftId.date': 1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get employee assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/shift-assignments
router.post('/', [
  body('shiftId').notEmpty().withMessage('Shift ID is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('status').optional().isIn(['assigned', 'completed', 'cancelled']).withMessage('Invalid status')
], isAuthenticated, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { shiftId, employeeId, status = 'assigned' } = req.body;

    // Check if shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await ShiftAssignment.findOne({ shiftId, employeeId });
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already assigned to this shift'
      });
    }

    // Check if shift is full
    if (shift.maxEmployees) {
      const currentAssignments = await ShiftAssignment.countDocuments({
        shiftId,
        status: { $ne: 'cancelled' }
      });
      if (currentAssignments >= shift.maxEmployees) {
        return res.status(400).json({
          success: false,
          message: 'Shift is already full'
        });
      }
    }

    const assignment = new ShiftAssignment({
      shiftId,
      employeeId,
      status
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Employee assigned to shift successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/shift-assignments/:id
router.put('/:id', [
  body('status').isIn(['assigned', 'completed', 'cancelled']).withMessage('Invalid status')
], isAuthenticated, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const assignment = await ShiftAssignment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/shift-assignments/:id
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await ShiftAssignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment removed successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/shift-assignments/bulk
router.post('/bulk', [
  body('shiftId').notEmpty().withMessage('Shift ID is required'),
  body('employeeIds').isArray({ min: 1 }).withMessage('Employee IDs array is required')
], isAuthenticated, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { shiftId, employeeIds } = req.body;

    // Check if shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Check if all employees exist
    const employees = await Employee.find({ _id: { $in: employeeIds } });
    if (employees.length !== employeeIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more employees not found'
      });
    }

    // Check if shift is full
    if (shift.maxEmployees) {
      const currentAssignments = await ShiftAssignment.countDocuments({
        shiftId,
        status: { $ne: 'cancelled' }
      });
      if (currentAssignments + employeeIds.length > shift.maxEmployees) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign all employees - shift would exceed maximum capacity'
        });
      }
    }

    // Check for existing assignments
    const existingAssignments = await ShiftAssignment.find({
      shiftId,
      employeeId: { $in: employeeIds }
    });

    if (existingAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some employees are already assigned to this shift'
      });
    }

    // Create assignments
    const assignments = employeeIds.map(employeeId => ({
      shiftId,
      employeeId,
      status: 'assigned'
    }));

    const createdAssignments = await ShiftAssignment.insertMany(assignments);

    res.status(201).json({
      success: true,
      message: 'Employees assigned to shift successfully',
      data: createdAssignments
    });
  } catch (error) {
    console.error('Bulk assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 