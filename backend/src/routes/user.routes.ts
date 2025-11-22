import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  getMe,
  updateMe,
  deleteMe,
  addAddress,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  updateUser,
  deleteUser,
  getUserActivity,
  getUserPreferences,
  updateUserPreferences,
  uploadAvatar,
  deleteMyAccount,
  addPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod
} from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../config/cloudinary.js';
import { body } from 'express-validator';

const router = Router();

// Protected routes
router.use(protect);

// User routes
router.get('/me', getMe, getUser);
router.patch('/update-me', uploadSingle('avatar'), updateMe);
router.delete('/delete-me', deleteMe);

// Activity & Preferences
router.get('/me/activity', getUserActivity);
router.get('/me/preferences', getUserPreferences);
router.patch('/me/preferences', [
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
  body('privacy').optional().isObject().withMessage('Privacy must be an object'),
  body('display').optional().isObject().withMessage('Display must be an object'),
  body('shopping').optional().isObject().withMessage('Shopping must be an object')
], updateUserPreferences);

// Avatar Upload
router.patch('/me/avatar', uploadSingle('avatar'), uploadAvatar);

// Account Deletion
router.delete('/me', [
  body('password').notEmpty().withMessage('Password is required'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], deleteMyAccount);

// Payment Methods
router.route('/me/payment-methods')
  .get(getPaymentMethods)
  .post([
    body('type').isIn(['card', 'upi']).withMessage('Type must be card or upi'),
    body('cardNumber').if(body('type').equals('card')).notEmpty().withMessage('Card number is required'),
    body('cardHolder').if(body('type').equals('card')).notEmpty().withMessage('Card holder name is required'),
    body('expiryMonth').if(body('type').equals('card')).isInt({ min: 1, max: 12 }).withMessage('Invalid expiry month'),
    body('expiryYear').if(body('type').equals('card')).isInt({ min: 2024 }).withMessage('Invalid expiry year'),
    body('upiId').if(body('type').equals('upi')).notEmpty().withMessage('UPI ID is required')
  ], addPaymentMethod);

router.delete('/me/payment-methods/:id', deletePaymentMethod);

// Address management
router.post('/addresses', addAddress);
router.patch('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Wishlist management
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Admin routes
router.use(restrictTo('admin'));

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;