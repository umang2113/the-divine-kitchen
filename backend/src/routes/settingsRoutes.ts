import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect as express.RequestHandler, admin as express.RequestHandler, updateSettings as express.RequestHandler);

export default router;
