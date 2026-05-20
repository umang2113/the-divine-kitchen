import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { sendOrderConfirmation, sendOutForDeliveryEmail, sendOrderDeliveredEmail } from '../utils/emailUtils';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or Private)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalAmount, shippingDetails, paymentMethod } = req.body;

    const isOnlinePay = paymentMethod === 'Paytm Online';

    const orderData: any = {
      items,
      totalAmount,
      shippingDetails,
      paymentMethod,
      status: isOnlinePay ? 'pending_payment' : 'preparing',
      paymentStatus: isOnlinePay ? 'pending' : 'cod',
      createdAt: new Date().toISOString()
    };

    // Attach user ID if logged in
    if ((req as any).user) {
      orderData.userId = (req as any).user.id;
    }

    const docRef = await db.collection('orders').add(orderData);
    const orderWithId = { id: docRef.id, ...orderData };

    // Send Premium Email Confirmation ONLY for COD (online payments send confirmation upon successful callback)
    if (!isOnlinePay) {
      await sendOrderConfirmation(orderWithId);
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

