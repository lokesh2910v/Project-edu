import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import { validationResult } from 'express-validator';

// Get modules for a course
export const getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const modules = await Module.find({ courseId })
      .sort({ order: 1 });
    
    res.json(modules);
  } catch (error) {
    console.error('Get modules by course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new module (educator only)
export const createModule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, title, description } = req.body;

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course creator
    if (course.educatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get the highest order number to add at the end
    const highestOrderModule = await Module.findOne({ courseId })
      .sort({ order: -1 });
    
    const order = highestOrderModule ? highestOrderModule.order + 1 : 1;

    // Create new module
    const module = new Module({
      courseId,
      title,
      description,
      order
    });

    await module.save();

    res.status(201).json({
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update module (educator only)
export const updateModule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId } = req.params;
    const { title, description, order } = req.body;

    // Find module
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Find the course to check ownership
    const course = await Course.findById(module.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course creator
    if (course.educatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title) module.title = title;
    if (description) module.description = description;
    
    // Handle order change if provided
    if (order !== undefined && order !== module.order) {
      const modules = await Module.find({ courseId: module.courseId })
        .sort({ order: 1 });
      
      // Remove module from current position
      const filteredModules = modules.filter(m => m._id.toString() !== moduleId);
      
      // Insert at new position
      filteredModules.splice(order - 1, 0, module);
      
      // Update all orders
      for (let i = 0; i < filteredModules.length; i++) {
        filteredModules[i].order = i + 1;
        await filteredModules[i].save();
      }
    } else {
      await module.save();
    }

    res.json({
      message: 'Module updated successfully',
      module
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete module (educator only)
export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Find module
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Find the course to check ownership
    const course = await Course.findById(module.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course creator
    if (course.educatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all videos in the module
    await Video.deleteMany({ moduleId });
    
    // Delete module
    await Module.findByIdAndDelete(moduleId);

    // Reorder remaining modules
    const remainingModules = await Module.find({ courseId: module.courseId })
      .sort({ order: 1 });
    
    for (let i = 0; i < remainingModules.length; i++) {
      remainingModules[i].order = i + 1;
      await remainingModules[i].save();
    }

    res.json({ message: 'Module and all related videos deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getModulesByCourse,
  createModule,
  updateModule,
  deleteModule
};