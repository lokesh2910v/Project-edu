import express from 'express';
import courseController from '../controllers/courseController.js';
import { authenticateJwt, isEducator, isAdmin, isApproved, courseValidation } from '../middleware/auth.js';

const router = express.Router();

// Get all approved courses (public)
router.get('/', courseController.getAllCourses);

// Get course by ID (public)
router.get('/:courseId', courseController.getCourseById);

// Create course (educator only)
router.post('/', authenticateJwt, isEducator, isApproved, courseValidation, courseController.createCourse);

// Update course (educator only)
router.patch('/:courseId', authenticateJwt, isEducator, isApproved, courseController.updateCourse);

// Delete course (educator or admin)
router.delete('/:courseId', authenticateJwt, courseController.deleteCourse);

// Get educator's courses
router.get('/educator/my-courses', authenticateJwt, isEducator, isApproved, courseController.getEducatorCourses);

// Get pending courses (admin only)
router.get('/admin/pending', authenticateJwt, isAdmin, courseController.getPendingCourses);

// Approve course (admin only)
router.patch('/:courseId/approve', authenticateJwt, isAdmin, courseController.approveCourse);

export default router;