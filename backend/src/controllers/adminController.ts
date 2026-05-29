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
    
    // Calculate total revenue and Best Sellers
    let totalRevenue = 0;
    const itemCounts: Record<string, { name: string, count: number }> = {};

    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      totalRevenue += (order.totalAmount || 0);

      // Aggregate Best Sellers
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (itemCounts[item.id]) {
            itemCounts[item.id].count += (item.quantity || 1);
          } else {
            itemCounts[item.id] = { name: item.name, count: (item.quantity || 1) };
          }
        });
      }
    });

    const bestSellers = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    const recentOrdersSnapshot = await db.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
    const recentOrders = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const upcomingReservationsSnapshot = await db.collection('reservations').where('status', '==', 'pending').limit(5).get();
    const upcomingReservations = upcomingReservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      stats: {
        totalRevenue: `₹${totalRevenue.toFixed(2)}`,
        totalOrders,
        totalReservations,
        totalCustomers,
      },
      bestSellers,
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
