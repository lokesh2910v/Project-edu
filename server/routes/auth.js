import express from 'express';
import passport from 'passport';
import authController from '../controllers/authController.js';
import { authenticateJwt, registerValidation, loginValidation } from '../middleware/auth.js';

const router = express.Router();

// Register user
router.post('/register', registerValidation, authController.register);

// Login user
router.post('/login', loginValidation, authController.login);

// Get current user
router.get('/me', authenticateJwt, authController.getCurrentUser);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  // passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

export default router;