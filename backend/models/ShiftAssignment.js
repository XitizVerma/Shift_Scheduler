const mongoose = require('mongoose');

const shiftAssignmentSchema = new mongoose.Schema({
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['assigned', 'completed', 'cancelled'],
    default: 'assigned'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate assignments
shiftAssignmentSchema.index({ shiftId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('ShiftAssignment', shiftAssignmentSchema); 