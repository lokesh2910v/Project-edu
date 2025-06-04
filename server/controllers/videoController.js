import Video from '../models/Video.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import { validationResult } from 'express-validator';

// Get videos for a module
export const getVideosByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const videos = await Video.find({ moduleId })
      .sort({ order: 1 });
    
    res.json(videos);
  } catch (error) {
    console.error('Get videos by module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new video (educator only)
export const createVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId, title, youtubeUrl } = req.body;

    // Find the module
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

    // Get the highest order number to add at the end
    const highestOrderVideo = await Video.findOne({ moduleId })
      .sort({ order: -1 });
    
    const order = highestOrderVideo ? highestOrderVideo.order + 1 : 1;

    // Create new video
    const video = new Video({
      moduleId,
      title,
      youtubeUrl,
      order
    });

    await video.save();

    res.status(201).json({
      message: 'Video created successfully',
      video
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update video (educator only)
export const updateVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { videoId } = req.params;
    const { title, youtubeUrl, order } = req.body;

    // Find video
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Find the module
    const module = await Module.findById(video.moduleId);

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
    if (title) video.title = title;
    if (youtubeUrl) video.youtubeUrl = youtubeUrl;
    
    // Handle order change if provided
    if (order !== undefined && order !== video.order) {
      const videos = await Video.find({ moduleId: video.moduleId })
        .sort({ order: 1 });
      
      // Remove video from current position
      const filteredVideos = videos.filter(v => v._id.toString() !== videoId);
      
      // Insert at new position
      filteredVideos.splice(order - 1, 0, video);
      
      // Update all orders
      for (let i = 0; i < filteredVideos.length; i++) {
        filteredVideos[i].order = i + 1;
        await filteredVideos[i].save();
      }
    } else {
      await video.save();
    }

    res.json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete video (educator only)
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Find video
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Find the module
    const module = await Module.findById(video.moduleId);

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

    // Delete video
    await Video.findByIdAndDelete(videoId);

    // Reorder remaining videos
    const remainingVideos = await Video.find({ moduleId: video.moduleId })
      .sort({ order: 1 });
    
    for (let i = 0; i < remainingVideos.length; i++) {
      remainingVideos[i].order = i + 1;
      await remainingVideos[i].save();
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getVideosByModule,
  createVideo,
  updateVideo,
  deleteVideo
};