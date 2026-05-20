import express from 'express';
import { initiateTransaction, paymentCallback } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/initiate', protect as express.RequestHandler, initiateTransaction as express.RequestHandler);
router.post('/callback', paymentCallback as express.RequestHandler);

export default router;
