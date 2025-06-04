import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import Module from '../models/Module.js';

// Get student enrollments
export const getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id })
      .populate({
        path: 'courseId',
        select: 'title description image category educatorId',
        populate: {
          path: 'educatorId',
          select: 'name'
        }
      })
      .sort({ enrolledAt: -1 });
    
    res.json(enrollments);
  } catch (error) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Check if course exists and is approved
    const course = await Course.findOne({ _id: courseId, isApproved: true });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or not approved' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      studentId: req.user.id,
      courseId,
      enrolledAt: Date.now()
    });

    await enrollment.save();

    // Increment enrolled count in course
    course.enrolledCount += 1;
    await course.save();

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update progress
export const updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { videoId, completed } = req.body;

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user is the enrolled student
    if (enrollment.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If videoId is provided, add to watched videos if not already there
    if (videoId) {
      if (!enrollment.watchedVideos.includes(videoId)) {
        enrollment.watchedVideos.push(videoId);
      }
    }

    // Update completed status if provided
    if (completed !== undefined) {
      enrollment.completed = completed;
    }

    // Update lastAccessed
    enrollment.lastAccessed = Date.now();

    // Calculate progress percentage
    const course = await Course.findById(enrollment.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get all modules for the course
    const modules = await Module.find({ courseId: course._id });
    
    // Get all video IDs for the course
    let allVideos = [];
    for (const module of modules) {
      const moduleVideos = await Video.find({ moduleId: module._id });
      allVideos = [...allVideos, ...moduleVideos.map(v => v._id.toString())];
    }

    // Calculate progress
    const watchedCount = enrollment.watchedVideos.length;
    const totalVideos = allVideos.length;
    
    if (totalVideos > 0) {
      enrollment.progress = Math.round((watchedCount / totalVideos) * 100);
    } else {
      enrollment.progress = 0;
    }

    // If all videos are watched, mark as completed
    if (totalVideos > 0 && watchedCount === totalVideos) {
      enrollment.completed = true;
    }

    await enrollment.save();

    res.json({
      message: 'Progress updated successfully',
      enrollment
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getStudentEnrollments,
  enrollInCourse,
  updateProgress
};