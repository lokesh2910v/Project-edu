import express from 'express';
import enrollmentController from '../controllers/enrollmentController.js';
import { authenticateJwt, isStudent, isApproved } from '../middleware/auth.js';

const router = express.Router();

// Get student enrollments
router.get('/', authenticateJwt, isStudent, isApproved, enrollmentController.getStudentEnrollments);

// Enroll in a course
router.post('/', authenticateJwt, isStudent, isApproved, enrollmentController.enrollInCourse);

// Update progress
router.patch('/:enrollmentId/progress', authenticateJwt, isStudent, isApproved, enrollmentController.updateProgress);

export default router;