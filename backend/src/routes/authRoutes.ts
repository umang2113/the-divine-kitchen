import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  verifySignupOTP,
  verifyLoginOTP,
  resendOTP,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', registerUser as express.RequestHandler);
router.post('/verify-signup', verifySignupOTP as express.RequestHandler);
router.post('/login', loginUser as express.RequestHandler);
router.post('/verify-login', verifyLoginOTP as express.RequestHandler);
router.post('/resend-otp', resendOTP as express.RequestHandler);
router.post('/forgot-password', forgotPassword as express.RequestHandler);
router.post('/reset-password', resetPassword as express.RequestHandler);

router.route('/profile')
  .get(protect as express.RequestHandler, getUserProfile as express.RequestHandler)
  .put(protect as express.RequestHandler, updateUserProfile as express.RequestHandler);

export default router;
