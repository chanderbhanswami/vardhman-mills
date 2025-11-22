import express from 'express';
import * as addressController from '../controllers/address.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== AUTHENTICATION REQUIRED ====================
router.use(protect);

// ==================== ADDRESS CRUD ====================
router
  .route('/')
  .get(addressController.getAddresses)
  .post(addressController.createAddress);

// ==================== DEFAULT ADDRESS ====================
router.get('/default', addressController.getDefaultAddress);

// ==================== USAGE STATISTICS ====================
router.get('/most-used', addressController.getMostUsedAddresses);
router.get('/stats', addressController.getAddressStats);

// ==================== SEARCH & FILTER ====================
router.get('/search', addressController.searchAddresses);
router.get('/by-location', addressController.getAddressesByLocation);
router.get('/suggestions', addressController.getAddressSuggestions);
router.get('/group-by-city', addressController.getAddressesByCity);

// ==================== BULK OPERATIONS ====================
router.post('/bulk', addressController.bulkCreateAddresses);
router.delete('/bulk', addressController.bulkDeleteAddresses);

// ==================== ADDRESS VALIDATION ====================
router.post('/validate', addressController.validateAddress);

// ==================== ADMIN ROUTES ====================
router.use(restrictTo('admin'));
router.get('/admin/all', addressController.getAllAddresses);
router.get('/admin/analytics', addressController.getAddressAnalytics);
router.post('/admin/verify-bulk', addressController.bulkVerifyAddresses);

// ==================== SINGLE ADDRESS OPERATIONS ====================
// Must be after other routes to avoid conflicts
router.use(protect); // Re-apply protect for non-admin routes
router
  .route('/:id')
  .get(addressController.getAddress)
  .patch(addressController.updateAddress)
  .delete(addressController.deleteAddress);

router.patch('/:id/set-default', addressController.setDefaultAddress);
router.post('/:id/verify', addressController.verifyAddress);
router.post('/:id/mark-used', addressController.markAddressAsUsed);

export default router;
