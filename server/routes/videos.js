import express from 'express';
import videoController from '../controllers/videoController.js';
import { authenticateJwt, isEducator, isApproved, videoValidation } from '../middleware/auth.js';

const router = express.Router();

// Get videos for a module (public)
router.get('/module/:moduleId', videoController.getVideosByModule);

// Create video (educator only)
router.post('/', authenticateJwt, isEducator, isApproved, videoValidation, videoController.createVideo);

// Update video (educator only)
router.patch('/:videoId', authenticateJwt, isEducator, isApproved, videoController.updateVideo);

// Delete video (educator only)
router.delete('/:videoId', authenticateJwt, isEducator, isApproved, videoController.deleteVideo);

export default router;