import express from 'express';
import {
  getAllGiftCards,
  getGiftCard,
  getUserGiftCards,
  purchaseGiftCard,
  verifyPayment,
  checkBalance,
  validateGiftCard,
  redeemGiftCard,
  getDesigns,
  getTemplates,
  getAnalytics,
  getTransactions,
  cancelGiftCard,
  refundGiftCard
} from '../controllers/giftcard.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/designs', getDesigns);
router.get('/templates', getTemplates);
router.get('/balance/:code', checkBalance);
router.post('/validate', validateGiftCard);

// Protected routes (requires authentication)
router.use(protect);

// User routes
router.get('/user/:userId', getUserGiftCards);
router.post('/purchase', purchaseGiftCard);
router.post('/verify-payment', verifyPayment);
router.post('/redeem', redeemGiftCard);
router.get('/:cardId/transactions', getTransactions);

// Admin routes
router.use(restrictTo('admin'));

router.get('/', getAllGiftCards);
router.get('/analytics', getAnalytics);
router.get('/:id', getGiftCard);
router.delete('/:id/cancel', cancelGiftCard);
router.post('/:id/refund', refundGiftCard);

export default router;
