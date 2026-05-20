import { Request, Response } from 'express';
import { db } from '../config/firebase';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    const reservationsSnapshot = await db.collection('reservations').get();
    const customersSnapshot = await db.collection('users').where('role', '==', 'customer').get();
    
    const totalOrders = ordersSnapshot.size;
    const totalReservations = reservationsSnapshot.size;
    const totalCustomers = customersSnapshot.size;
    
    // Calculate total revenue
    let totalRevenue = 0;
    ordersSnapshot.forEach(doc => {
      totalRevenue += (doc.data().totalAmount || 0);
    });

    const recentOrdersSnapshot = await db.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
    const recentOrders = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const upcomingReservationsSnapshot = await db.collection('reservations').where('status', '==', 'pending').limit(5).get();
    const upcomingReservations = upcomingReservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      stats: {
        totalRevenue: `$${totalRevenue.toFixed(2)}`,
        totalOrders,
        totalReservations,
        totalCustomers,
      },
      recentOrders,
      upcomingReservations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
