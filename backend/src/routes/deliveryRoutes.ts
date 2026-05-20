import express from 'express';
import { 
  getAvailableOrders, 
  getMyDeliveryOrders, 
  updateDeliveryStatus, 
  getDeliveryStats,
  updateLocation 
} from '../controllers/deliveryController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All delivery routes are protected
router.use(protect as express.RequestHandler);

router.get('/available', getAvailableOrders as express.RequestHandler);
router.get('/my-orders', getMyDeliveryOrders as express.RequestHandler);
router.put('/order/:id', updateDeliveryStatus as express.RequestHandler);
router.get('/stats', getDeliveryStats as express.RequestHandler);
router.post('/location', updateLocation as express.RequestHandler);

export default router;
