const express = require('express');
const { body, validationResult } = require('express-validator');
const Shift = require('../models/Shift');
const ShiftAssignment = require('../models/ShiftAssignment');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// GET /api/shifts
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const date = req.query.date;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const shifts = await Shift.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ date: 1, startTime: 1 });

    // Get assignment counts for each shift
    const shiftsWithAssignments = await Promise.all(
      shifts.map(async (shift) => {
        const assignmentCount = await ShiftAssignment.countDocuments({
          shiftId: shift._id,
          status: { $ne: 'cancelled' }
        });

        return {
          ...shift.toObject(),
          assignedEmployees: assignmentCount
        };
      })
    );

    const totalItems = await Shift.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: shiftsWithAssignments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shifts/:id
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findById(id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Get assigned employees
    const assignments = await ShiftAssignment.find({ shiftId: id })
      .populate('employeeId', 'name employeeId department')
      .sort({ assignedAt: 1 });

    const assignedEmployees = assignments.map(assignment => ({
      _id: assignment.employeeId._id,
      name: assignment.employeeId.name,
      employeeId: assignment.employeeId.employeeId,
      department: assignment.employeeId.department,
      assignmentStatus: assignment.status,
      assignmentId: assignment._id
    }));

    res.json({
      success: true,
      data: {
        ...shift.toObject(),
        assignedEmployees
      }
    });
  } catch (error) {
    console.error('Get shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/shifts
router.post('/', [
  body('shiftName').notEmpty().withMessage('Shift name is required'),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('location').optional(),
  body('description').optional(),
  body('maxEmployees').optional().isInt({ min: 1 }).withMessage('Max employees must be at least 1')
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

    const { shiftName, startTime, endTime, date, location, description, maxEmployees } = req.body;

    const shift = new Shift({
      shiftName,
      startTime,
      endTime,
      date: new Date(date),
      location,
      description,
      maxEmployees
    });

    await shift.save();

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: shift
    });
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/shifts/:id
router.put('/:id', [
  body('shiftName').optional(),
  body('startTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('location').optional(),
  body('description').optional(),
  body('maxEmployees').optional().isInt({ min: 1 }).withMessage('Max employees must be at least 1')
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
    const updateData = {};

    if (req.body.shiftName) updateData.shiftName = req.body.shiftName;
    if (req.body.startTime) updateData.startTime = req.body.startTime;
    if (req.body.endTime) updateData.endTime = req.body.endTime;
    if (req.body.date) updateData.date = new Date(req.body.date);
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.maxEmployees) updateData.maxEmployees = req.body.maxEmployees;

    const shift = await Shift.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    res.json({
      success: true,
      message: 'Shift updated successfully',
      data: shift
    });
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/shifts/:id
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if shift has assignments
    const assignments = await ShiftAssignment.find({ shiftId: id });
    if (assignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete shift with existing assignments'
      });
    }

    const shift = await Shift.findByIdAndDelete(id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    res.json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 