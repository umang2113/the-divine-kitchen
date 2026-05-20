import { Request, Response } from 'express';
import { reservationService } from '../services/reservationService';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { sendReservationConfirmationEmail } from '../utils/emailUtils';

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Public
export const createReservation = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, date, time, guests, specialRequests, tableId, amount, paymentStatus } = req.body;

  // Additional validation: Prevent past reservations
  const now = new Date();
  const resDateTime = new Date(`${date}T${time || '00:00'}`);
  if (resDateTime < now) {
    return res.status(400).json({ message: 'Cannot book a table in the past' });
  }

  const userId = (req as any).user?.id;
  
  const reservationData: any = {
    name, email, phone, date, time, guests, specialRequests, tableId, amount, paymentStatus
  };

  if (userId) {
    reservationData.userId = userId;
  }

  const reservation = await reservationService.create(reservationData);

  // Send Premium Confirmation Email
  await sendReservationConfirmationEmail({ name, email, date, time, tableId, guests });

  res.status(201).json(reservation);
});

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
export const getReservations = asyncHandler(async (req: Request, res: Response) => {
  const reservations = await reservationService.getAll();
  res.json(reservations);
});

// @desc    Get logged in user reservations
// @route   GET /api/reservations/my
// @access  Private
export const getMyReservations = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  console.log(`[History] Fetching reservations for User: ${userId}`);
  const reservations = await reservationService.getByUserId(userId);
  console.log(`[History] Found ${reservations.length} reservations`);
  res.json(reservations);
});

// @desc    Check table availability
// @route   GET /api/reservations/availability
// @access  Public
export const checkAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ message: 'Date and time are required' });
  }

  const availability = await reservationService.checkAvailability(date as string, time as string);
  res.json(availability);
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id
// @access  Private/Admin
export const updateReservationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const resId = req.params.id;

  try {
    const result = await reservationService.updateStatus(resId, status);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});
