import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0 // Free by default
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://images.pexels.com/photos/4144179/pexels-photo-4144179.jpeg' // Default course image
  },
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Automatically update the timestamps
});

// Add a text index for search functionality
CourseSchema.index({ title: 'text', description: 'text', category: 'text' });

const Course = mongoose.model('Course', CourseSchema);

export default Course;