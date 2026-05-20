import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { sendOutForDeliveryEmail, sendOrderDeliveredEmail } from '../utils/emailUtils';
import { generateOTP, sendOTP } from '../utils/otpUtils';

// @desc    Get orders available for pickup
// @route   GET /api/delivery/available
// @access  Private (Delivery Boy)
export const getAvailableOrders = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('orders')
      .where('status', '==', 'preparing')
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get active orders for delivery boy
// @route   GET /api/delivery/my-orders
// @access  Private (Delivery Boy)
export const getMyDeliveryOrders = async (req: Request, res: Response) => {
  try {
    const deliveryBoyId = (req as any).user.id;
    const snapshot = await db.collection('orders')
      .where('deliveryBoyId', '==', deliveryBoyId)
      .where('status', 'in', ['picked_up', 'out_for_delivery'])
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status by delivery boy
// @route   PUT /api/delivery/order/:id
// @access  Private (Delivery Boy)
export const updateDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, otp } = req.body; // 'picked_up', 'out_for_delivery', 'delivered'
    const deliveryBoyId = (req as any).user.id;

    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderData = orderDoc.data();
    const isPrepaid = orderData?.paymentStatus === 'paid';

    // Verify OTP if marking prepaid order as delivered
    if (status === 'delivered' && isPrepaid) {
      if (!otp) {
        return res.status(400).json({ message: 'Delivery OTP is required for prepaid orders.' });
      }
      if (otp !== orderData?.deliveryOtp) {
        return res.status(400).json({ message: 'Invalid delivery verification OTP. Please try again.' });
      }
    }

    const updateData: any = { status, updatedAt: new Date().toISOString() };
    
    // If picking up for the first time
    if (status === 'picked_up') {
      updateData.deliveryBoyId = deliveryBoyId;
    }

    // Generate and send OTP when starting delivery for prepaid order
    if (status === 'out_for_delivery' && isPrepaid) {
      const generatedOtp = generateOTP();
      updateData.deliveryOtp = generatedOtp;
      
      // Send OTP to customer
      if (orderData?.shippingDetails?.email) {
        await sendOTP(
          orderData.shippingDetails.email, 
          orderData.shippingDetails.phone || '', 
          generatedOtp
        );
      }
    }

    await orderRef.update(updateData);

    // If status is out_for_delivery, send the premium email
    if (status === 'out_for_delivery') {
      const currentOrderData = (await orderRef.get()).data();
      if (currentOrderData) {
        await sendOutForDeliveryEmail({ id, ...currentOrderData });
      }
    }

    // If status is delivered, send the thank you email
    if (status === 'delivered') {
      const currentOrderData = (await orderRef.get()).data();
      if (currentOrderData) {
        await sendOrderDeliveredEmail({ id, ...currentOrderData });
      }
    }

    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("Update Delivery Status Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get delivery boy stats (Earnings etc)
// @route   GET /api/delivery/stats
// @access  Private (Delivery Boy)
export const getDeliveryStats = async (req: Request, res: Response) => {
  try {
    const deliveryBoyId = (req as any).user.id;
    const snapshot = await db.collection('orders')
      .where('deliveryBoyId', '==', deliveryBoyId)
      .where('status', '==', 'delivered')
      .get();

    const deliveredCount = snapshot.size;
    const earnings = deliveredCount * 40; // Example: 40 rupees per delivery

    res.json({
      deliveredCount,
      earnings,
      rating: 4.8
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update live location of delivery boy
// @route   POST /api/delivery/location
// @access  Private (Delivery Boy)
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { lat, lng, orderId } = req.body;
    const deliveryBoyId = (req as any).user.id;

    // Update delivery boy's current location in user doc
    await db.collection('users').doc(deliveryBoyId).update({
      currentLocation: { lat, lng, updatedAt: new Date().toISOString() }
    });

    // Also update order if specific orderId is provided
    if (orderId) {
      await db.collection('orders').doc(orderId).update({
        deliveryLocation: { lat, lng, updatedAt: new Date().toISOString() }
      });
    }

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
