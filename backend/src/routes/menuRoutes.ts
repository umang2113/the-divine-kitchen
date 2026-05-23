import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuAvailability } from '../controllers/menuController';
import { protect, admin, staffOrAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getMenuItems as express.RequestHandler)
  .post(protect as express.RequestHandler, admin as express.RequestHandler, createMenuItem as express.RequestHandler);

router.route('/:id')
  .put(protect as express.RequestHandler, admin as express.RequestHandler, updateMenuItem as express.RequestHandler)
  .delete(protect as express.RequestHandler, admin as express.RequestHandler, deleteMenuItem as express.RequestHandler);

router.patch('/:id/availability', protect as express.RequestHandler, staffOrAdmin as express.RequestHandler, toggleMenuAvailability as express.RequestHandler);

export default router;
