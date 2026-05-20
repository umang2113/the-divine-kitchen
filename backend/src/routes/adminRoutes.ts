import express from 'express';
import multer from 'multer';
import { getDashboardStats, getUsers } from '../controllers/adminController';
import { uploadImage } from '../controllers/uploadController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/stats').get(protect as express.RequestHandler, admin as express.RequestHandler, getDashboardStats as express.RequestHandler);
router.route('/users').get(protect as express.RequestHandler, admin as express.RequestHandler, getUsers as express.RequestHandler);
router.post('/upload', protect as express.RequestHandler, admin as express.RequestHandler, upload.single('image'), uploadImage as express.RequestHandler);

export default router;
