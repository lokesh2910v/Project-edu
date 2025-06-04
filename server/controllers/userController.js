import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Only admins can get all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get educators (for admin approval)
export const getEducators = async (req, res) => {
  try {
    // Only admins can get educators
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const educators = await User.find({ role: 'educator' }).select('-password');
    res.json(educators);
  } catch (error) {
    console.error('Get educators error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve educator (admin only)
export const approveEducator = async (req, res) => {
  try {
    // Only admins can approve educators
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'educator') {
      return res.status(400).json({ message: 'User is not an educator' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Educator approved successfully', user });
  } catch (error) {
    console.error('Approve educator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new educator (admin only)
export const createEducator = async (req, res) => {
  try {
    // Only admins can create educators
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new educator
    user = new User({
      name,
      email,
      password,
      role: 'educator',
      isApproved: true // Auto-approve when created by admin
    });

    await user.save();

    res.status(201).json({
      message: 'Educator created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create educator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getAllUsers,
  getEducators,
  approveEducator,
  createEducator,
  updateProfile
};