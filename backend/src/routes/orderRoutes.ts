import express from 'express';
import { createOrder, getOrders, updateOrderStatus, getMyOrders, getOrderById } from '../controllers/orderController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect as express.RequestHandler, createOrder as express.RequestHandler)
  .get(protect as express.RequestHandler, admin as express.RequestHandler, getOrders as express.RequestHandler);

router.get('/my', protect as express.RequestHandler, getMyOrders as express.RequestHandler);

router.route('/:id')
  .get(protect as express.RequestHandler, getOrderById as express.RequestHandler)
  .put(protect as express.RequestHandler, admin as express.RequestHandler, updateOrderStatus as express.RequestHandler);

export default router;
