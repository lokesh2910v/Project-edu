import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique ordering within a course
ModuleSchema.index({ courseId: 1, order: 1 }, { unique: true });

const Module = mongoose.model('Module', ModuleSchema);

export default Module;