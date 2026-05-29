import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { sendOrderConfirmation, sendOutForDeliveryEmail, sendOrderDeliveredEmail } from '../utils/emailUtils';
import { getIO } from '../utils/socket';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or Private)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalAmount, shippingDetails, paymentMethod, source, orderType, tableNumber } = req.body;

    const isOnlinePay = paymentMethod === 'Razorpay Online';
    const isPOS = source === 'pos';

    const orderData: any = {
      items,
      totalAmount,
      shippingDetails: shippingDetails || {},
      paymentMethod,
      source: isPOS ? 'pos' : 'online',
      orderType: orderType || 'delivery',
      tableNumber: tableNumber || null,
      status: isPOS ? 'completed' : (isOnlinePay ? 'pending_payment' : 'preparing'),
      paymentStatus: isPOS ? 'paid' : (isOnlinePay ? 'pending' : 'cod'),
      createdAt: new Date().toISOString()
    };

    // Attach user ID if logged in
    if ((req as any).user) {
      orderData.userId = (req as any).user.id;
    }

    const docRef = await db.collection('orders').add(orderData);
    const orderWithId = { id: docRef.id, ...orderData };

    // Send Premium Email Confirmation ONLY for COD (online payments send confirmation upon successful callback)
    // For POS orders, we skip email unless they specifically provided one (but we'll skip by default for now)
    if (!isOnlinePay && !isPOS && shippingDetails?.email) {
      await sendOrderConfirmation(orderWithId);
    }

    try {
      getIO().emit('newOrder', orderWithId);
    } catch (err) {
      console.error("Socket emission failed:", err);
    }

    res.status(201).json(orderWithId);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const orderRef = db.collection('orders').doc(req.params.id);
    
    await orderRef.update({ status });

    // If status is out_for_delivery, send the premium email
    if (status === 'out_for_delivery') {
      const orderData = (await orderRef.get()).data();
      if (orderData) {
        await sendOutForDeliveryEmail({ id: req.params.id, ...orderData });
      }
    }

    // If status is delivered, send the thank you email
    if (status === 'delivered') {
      const orderData = (await orderRef.get()).data();
      if (orderData) {
        await sendOrderDeliveredEmail({ id: req.params.id, ...orderData });
      }
    }

    try {
      getIO().emit('orderUpdated', { id: req.params.id, status });
    } catch (err) {
      console.error("Socket emission failed:", err);
    }

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(orders);
  } catch (error) {
    console.error("Fetch My Orders Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Single Order (for Customer/Admin)
// @route   GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = doc.data();
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Only allow the customer who placed it or an admin to see it
    if (order?.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ id: doc.id, ...order });
  } catch (error) {
    console.error("Fetch Order Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getShiftSummary = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const snapshot = await db.collection('orders')
      .where('createdAt', '>=', today.toISOString())
      .get();
      
    const orders = snapshot.docs.map(doc => doc.data());
    
    let cash = 0;
    let online = 0;
    let card = 0;
    let activeOrders = 0;

    orders.forEach((order: any) => {
      if (order.status !== 'completed' && order.status !== 'delivered') {
        activeOrders++;
      }
      
      if (order.paymentStatus === 'paid') {
        if (order.paymentMethod?.toLowerCase() === 'cash') cash += order.totalAmount;
        else if (order.paymentMethod?.toLowerCase() === 'card') card += order.totalAmount;
        else online += order.totalAmount;
      }
    });

    res.json({ cash, online, card, total: cash + online + card, activeOrders });
  } catch (error) {
    console.error("Fetch Shift Summary Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

