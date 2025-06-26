const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  shiftName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  maxEmployees: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true
});

shiftSchema.index({ date: 1, startTime: 1 });

// Virtual for checking if shift is full
shiftSchema.virtual('isFull').get(function() {
  // This will be calculated when needed by checking assignments
  return false;
});

shiftSchema.set('toJSON', { virtuals: true });
shiftSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Shift', shiftSchema); 