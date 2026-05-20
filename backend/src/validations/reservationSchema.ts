import { z } from 'zod';

export const reservationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  guests: z.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests allowed'),
  specialRequests: z.string().optional().or(z.literal('')),
  tableId: z.string().min(1, 'Table ID is required'),
  amount: z.number().optional().default(100),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional().default('pending'),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
