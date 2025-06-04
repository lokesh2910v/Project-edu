import express from 'express';
import moduleController from '../controllers/moduleController.js';
import { authenticateJwt, isEducator, isApproved, moduleValidation } from '../middleware/auth.js';

const router = express.Router();

// Get modules for a course (public)
router.get('/course/:courseId', moduleController.getModulesByCourse);

// Create module (educator only)
router.post('/', authenticateJwt, isEducator, isApproved, moduleValidation, moduleController.createModule);

// Update module (educator only)
router.patch('/:moduleId', authenticateJwt, isEducator, isApproved, moduleController.updateModule);

// Delete module (educator only)
router.delete('/:moduleId', authenticateJwt, isEducator, isApproved, moduleController.deleteModule);

export default router;