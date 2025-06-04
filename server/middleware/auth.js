import passport from 'passport';
import { check } from 'express-validator';

// Authenticate JWT
export const authenticateJwt = passport.authenticate('jwt', { session: false });

// Check if user is student
export const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  next();
};

// Check if user is educator
export const isEducator = (req, res, next) => {
  if (req.user.role !== 'educator') {
    return res.status(403).json({ message: 'Access denied. Educator role required.' });
  }
  next();
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Check if user is approved
export const isApproved = (req, res, next) => {
  if (!req.user.isApproved) {
    return res.status(403).json({ message: 'Your account is pending approval.' });
  }
  next();
};

// Registration validation
export const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role', 'Role must be student, educator, or admin').optional().isIn(['student', 'educator', 'admin'])
];

// Login validation
export const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Course validation
export const courseValidation = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('price', 'Price must be a number').isNumeric(),
  check('category', 'Category is required').not().isEmpty()
];

// Module validation
export const moduleValidation = [
  check('courseId', 'Course ID is required').not().isEmpty(),
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
];

// Video validation
export const videoValidation = [
  check('moduleId', 'Module ID is required').not().isEmpty(),
  check('title', 'Title is required').not().isEmpty(),
  check('youtubeUrl', 'Valid YouTube URL is required').matches(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/)
];

export default {
  authenticateJwt,
  isStudent,
  isEducator,
  isAdmin,
  isApproved,
  registerValidation,
  loginValidation,
  courseValidation,
  moduleValidation,
  videoValidation
};