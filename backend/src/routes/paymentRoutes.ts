import express from 'express';
import { initiateTransaction, paymentCallback, generatePaymentLink, razorpayWebhook } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/initiate', protect as express.RequestHandler, initiateTransaction as express.RequestHandler);
router.post('/callback', paymentCallback as express.RequestHandler);
router.post('/generate-link', protect as express.RequestHandler, generatePaymentLink as express.RequestHandler);
router.post('/webhook', razorpayWebhook as express.RequestHandler);

export default router;
