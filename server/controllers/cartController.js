import Cart from '../models/Cart.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// Get student cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ studentId: req.user.id })
      .populate({
        path: 'courseIds',
        select: 'title description price image category',
        match: { isApproved: true } // Only include approved courses
      });
    
    if (!cart) {
      cart = new Cart({ studentId: req.user.id, courseIds: [] });
      await cart.save();
    }

    // Filter out any null values (unapproved courses)
    cart.courseIds = cart.courseIds.filter(course => course);
    
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add course to cart
export const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if course exists and is approved
    const course = await Course.findOne({ _id: courseId, isApproved: true });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or not approved' });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ studentId: req.user.id });
    
    if (!cart) {
      cart = new Cart({ studentId: req.user.id, courseIds: [] });
    }

    // Check if course is already in cart
    if (cart.courseIds.includes(courseId)) {
      return res.status(400).json({ message: 'Course already in cart' });
    }

    // Add course to cart
    cart.courseIds.push(courseId);
    cart.updatedAt = Date.now();
    
    await cart.save();

    res.json({
      message: 'Course added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove course from cart
export const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ studentId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Check if course is in cart
    if (!cart.courseIds.includes(courseId)) {
      return res.status(400).json({ message: 'Course not in cart' });
    }

    // Remove course from cart
    cart.courseIds = cart.courseIds.filter(id => id.toString() !== courseId);
    cart.updatedAt = Date.now();
    
    await cart.save();

    res.json({
      message: 'Course removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Checkout cart
export const checkout = async (req, res) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ studentId: req.user.id })
      .populate('courseIds', 'isApproved');
    
    if (!cart || cart.courseIds.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Filter to only include approved courses
    const approvedCourseIds = cart.courseIds
      .filter(course => course.isApproved)
      .map(course => course._id);

    // Check if any courses are already enrolled
    for (const courseId of approvedCourseIds) {
      const existingEnrollment = await Enrollment.findOne({
        studentId: req.user.id,
        courseId
      });

      if (existingEnrollment) {
        return res.status(400).json({ 
          message: `Already enrolled in one of the courses`
        });
      }
    }

    // Create enrollments for each course
    const enrollments = [];
    
    for (const courseId of approvedCourseIds) {
      const enrollment = new Enrollment({
        studentId: req.user.id,
        courseId,
        enrolledAt: Date.now()
      });
      
      await enrollment.save();
      enrollments.push(enrollment);

      // Update course enrolled count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrolledCount: 1 }
      });
    }

    // Clear cart
    cart.courseIds = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
      message: 'Checkout successful',
      enrollments
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  checkout
};