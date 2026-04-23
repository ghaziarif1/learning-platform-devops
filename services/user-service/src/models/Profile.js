const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio:        { type: String, maxlength: 500 },
  avatar:     { type: String },
  website:    { type: String },
  skills:     [{ type: String }],
  enrolledCourses: [{
    courseId:    { type: Number },
    enrolledAt:  { type: Date, default: Date.now },
    progress:    { type: Number, default: 0 }
  }],
  completedCourses: [{ type: Number }]
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);