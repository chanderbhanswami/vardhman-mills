import express from 'express';
import {
  getMyLoyalty,
  getTransactions,
  getRewards,
  redeemReward,
  getRedemptions,
  getReferrals,
  applyReferralCode,
  updatePreferences,
  getAllAccounts,
  getAccountByUserId,
  adjustPoints,
  awardBonus,
  getStats,
  getLeaderboard,
  awardPurchasePoints,
  awardReviewPoints
} from '../controllers/loyalty.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { body, query, param } from 'express-validator';

/**
 * Loyalty & Rewards Routes - Vardhman Mills Backend
 * 
 * Routes for loyalty program:
 * - User routes: View account, earn/redeem points, referrals
 * - Admin routes: Manage accounts, adjust points, statistics
 * - Internal routes: Award points for actions
 * 
 * @version 1.0.0
 * @created 2025-11-01
 */

const router = express.Router();

// ============================================================================
// VALIDATION RULES
// ============================================================================

const redeemRewardValidation = [
  param('rewardId')
    .notEmpty()
    .withMessage('Reward ID is required')
    .isString()
    .withMessage('Invalid reward ID')
];

const applyReferralValidation = [
  body('referralCode')
    .notEmpty()
    .withMessage('Referral code is required')
    .isString()
    .isLength({ min: 8, max: 8 })
    .withMessage('Invalid referral code format')
];

const updatePreferencesValidation = [
  body('pointsEarned')
    .optional()
    .isBoolean()
    .withMessage('pointsEarned must be a boolean'),
  body('tierUpgrade')
    .optional()
    .isBoolean()
    .withMessage('tierUpgrade must be a boolean'),
  body('pointsExpiring')
    .optional()
    .isBoolean()
    .withMessage('pointsExpiring must be a boolean'),
  body('rewardsAvailable')
    .optional()
    .isBoolean()
    .withMessage('rewardsAvailable must be a boolean')
];

const adjustPointsValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('points')
    .notEmpty()
    .withMessage('Points is required')
    .isInt()
    .withMessage('Points must be an integer'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isString()
    .isLength({ min: 10, max: 200 })
    .withMessage('Reason must be between 10 and 200 characters')
];

const awardBonusValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('points')
    .notEmpty()
    .withMessage('Points is required')
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isString()
    .isLength({ min: 10, max: 200 })
    .withMessage('Reason must be between 10 and 200 characters')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const awardPurchaseValidation = [
  body('userId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('orderId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('amount')
    .notEmpty()
    .isNumeric()
    .withMessage('Valid amount is required')
];

const awardReviewValidation = [
  body('userId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('reviewId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid review ID is required')
];

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// Public leaderboard
router.get('/leaderboard', getLeaderboard);

// ============================================================================
// PROTECTED ROUTES - USER
// ============================================================================

router.use(protect); // All routes below require authentication

// User loyalty operations
router.get('/', getMyLoyalty);

router.get('/transactions', getTransactions);

router.get('/rewards', getRewards);

router.post(
  '/rewards/:rewardId/redeem',
  redeemRewardValidation,
  redeemReward
);

router.get('/redemptions', getRedemptions);

router.get('/referrals', getReferrals);

router.post(
  '/referrals/apply',
  applyReferralValidation,
  applyReferralCode
);

router.patch(
  '/preferences',
  updatePreferencesValidation,
  updatePreferences
);

// ============================================================================
// INTERNAL ROUTES (Called by other controllers)
// ============================================================================

// Award points for purchases
router.post(
  '/award/purchase',
  awardPurchaseValidation,
  awardPurchasePoints
);

// Award points for reviews
router.post(
  '/award/review',
  awardReviewValidation,
  awardReviewPoints
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.use(restrictTo('admin', 'super-admin')); // All routes below require admin role

// Admin loyalty operations
router.get(
  '/admin/accounts',
  paginationValidation,
  getAllAccounts
);

router.get(
  '/admin/accounts/:userId',
  param('userId').isMongoId(),
  getAccountByUserId
);

router.post(
  '/admin/accounts/:userId/adjust',
  adjustPointsValidation,
  adjustPoints
);

router.post(
  '/admin/accounts/:userId/bonus',
  awardBonusValidation,
  awardBonus
);

router.get('/admin/stats', getStats);

export default router;
