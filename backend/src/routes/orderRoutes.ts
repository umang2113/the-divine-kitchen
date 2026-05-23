import express from 'express';
import { createOrder, getOrders, updateOrderStatus, getMyOrders, getOrderById, getShiftSummary } from '../controllers/orderController';
import { protect, admin, staffOrAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/shift-summary', protect as express.RequestHandler, staffOrAdmin as express.RequestHandler, getShiftSummary as express.RequestHandler);

router.route('/')
  .post(protect as express.RequestHandler, createOrder as express.RequestHandler)
  .get(protect as express.RequestHandler, staffOrAdmin as express.RequestHandler, getOrders as express.RequestHandler);

router.get('/my', protect as express.RequestHandler, getMyOrders as express.RequestHandler);

router.route('/:id')
  .get(protect as express.RequestHandler, getOrderById as express.RequestHandler)
  .put(protect as express.RequestHandler, staffOrAdmin as express.RequestHandler, updateOrderStatus as express.RequestHandler);

export default router;
