import express from 'express';
import userController from '../controllers/userController.js';
import { authenticateJwt, isAdmin, isApproved, registerValidation } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateJwt, isAdmin, userController.getAllUsers);

// Get educators (admin only)
router.get('/educators', authenticateJwt, isAdmin, userController.getEducators);

// Approve educator (admin only)
router.patch('/educators/:userId/approve', authenticateJwt, isAdmin, userController.approveEducator);

// Create educator (admin only)
router.post('/educators', authenticateJwt, isAdmin, registerValidation, userController.createEducator);

// Update profile
router.patch('/profile', authenticateJwt, isApproved, userController.updateProfile);

export default router;