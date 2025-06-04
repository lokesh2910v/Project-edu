import express from 'express';
import cartController from '../controllers/cartController.js';
import { authenticateJwt, isStudent, isApproved } from '../middleware/auth.js';

const router = express.Router();

// Get student cart
router.get('/', authenticateJwt, isStudent, isApproved, cartController.getCart);

// Add course to cart
router.post('/', authenticateJwt, isStudent, isApproved, cartController.addToCart);

// Remove course from cart
router.delete('/:courseId', authenticateJwt, isStudent, isApproved, cartController.removeFromCart);

// Checkout cart
router.post('/checkout', authenticateJwt, isStudent, isApproved, cartController.checkout);

export default router;