import { Router } from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updatePassword,
  googleAuth,
  facebookAuth
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validation.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Social auth routes
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.patch('/update-password', updatePassword);

export default router;