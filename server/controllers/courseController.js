import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Video from '../models/Video.js';
import { validationResult } from 'express-validator';

// Get all approved courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: true })
      .populate('educatorId', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate('educatorId', 'name profileImage');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Increment views
    course.views += 1;
    await course.save();
    
    res.json(course);
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new course (educator only)
export const createCourse = async (req, res) => {
  try {
    // Only educators can create courses
    if (req.user.role !== 'educator') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, category, image } = req.body;

    // Create new course
    const course = new Course({
      title,
      description,
      price,
      category,
      image: image || undefined, // Use default if not provided
      educatorId: req.user.id,
      isApproved: false // Needs admin approval
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully, pending approval',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update course (educator only)
export const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;
    const { title, description, price, category, image } = req.body;

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course creator
    if (course.educatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (category) course.category = category;
    if (image) course.image = image;

    course.updatedAt = Date.now();
    
    // If course was already approved and significant changes were made, set back to pending
    if (course.isApproved && (title || description || category)) {
      course.isApproved = false;
    }

    await course.save();

    res.json({
      message: course.isApproved 
        ? 'Course updated successfully' 
        : 'Course updated successfully, pending approval',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete course (educator or admin only)
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course creator or admin
    if (course.educatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all related modules and videos
    const modules = await Module.find({ courseId });
    
    for (const module of modules) {
      // Delete all videos in the module
      await Video.deleteMany({ moduleId: module._id });
    }
    
    // Delete modules
    await Module.deleteMany({ courseId });
    
    // Delete course
    await Course.findByIdAndDelete(courseId);

    res.json({ message: 'Course and all related content deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get educator's courses
export const getEducatorCourses = async (req, res) => {
  try {
    // Only educators can access their courses
    if (req.user.role !== 'educator') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const courses = await Course.find({ educatorId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Get educator courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve course (admin only)
export const approveCourse = async (req, res) => {
  try {
    // Only admins can approve courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { courseId } = req.params;
    
    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.isApproved = true;
    await course.save();

    res.json({ message: 'Course approved successfully', course });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending courses (admin only)
export const getPendingCourses = async (req, res) => {
  try {
    // Only admins can get pending courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const courses = await Course.find({ isApproved: false })
      .populate('educatorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getEducatorCourses,
  approveCourse,
  getPendingCourses
};