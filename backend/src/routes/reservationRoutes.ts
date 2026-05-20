import express from 'express';
import { createReservation, getReservations, updateReservationStatus, checkAvailability, getMyReservations } from '../controllers/reservationController';
import { protect, admin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { reservationSchema } from '../validations/reservationSchema';

const router = express.Router();

router.get('/availability', checkAvailability as express.RequestHandler);
router.get('/my', protect as express.RequestHandler, getMyReservations as express.RequestHandler);

router.route('/')
  .post(protect as express.RequestHandler, validate(reservationSchema) as express.RequestHandler, createReservation as express.RequestHandler)
  .get(protect as express.RequestHandler, admin as express.RequestHandler, getReservations as express.RequestHandler);

router.route('/:id')
  .put(protect as express.RequestHandler, admin as express.RequestHandler, updateReservationStatus as express.RequestHandler);

export default router;
