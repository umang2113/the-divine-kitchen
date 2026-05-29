import express from 'express';
import { addReview, getReviews } from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect as express.RequestHandler, addReview as express.RequestHandler);

router.route('/:menuItemId')
  .get(getReviews as express.RequestHandler);

export default router;
