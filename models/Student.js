var mongoose = require('mongoose');

/**
 * Student model
 * @type {Schema}
 */
var Student = new mongoose.Schema({
  createdDate: {
    type: Date,
    default: Date.now,
  },
  id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: [
      'Male',
      'Female',
    ],
  },
});

// Allow us to export model to other files (e.x. routes)
module.exports = mongoose.model('Student', Student);
