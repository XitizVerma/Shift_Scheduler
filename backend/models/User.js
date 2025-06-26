const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password (optional for plain text as per requirements)
userSchema.pre('save', function(next) {
  // For this implementation, we'll keep passwords as plain text as per PRD
  next();
});

module.exports = mongoose.model('User', userSchema); 