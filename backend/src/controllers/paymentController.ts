import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { sendOrderConfirmation } from '../utils/emailUtils';
const PaytmChecksum = require('paytmchecksum');

const PAYTM_MID = process.env.PAYTM_MID || 'YOUR_MID_HERE';
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || 'YOUR_MERCHANT_KEY_HERE';
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || 'WEBSTAGING'; // WEBSTAGING for sandbox, DEFAULT for production
const PAYTM_ENV = process.env.PAYTM_ENV || 'stage'; // 'stage' or 'prod'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const PAYTM_HOST = PAYTM_ENV === 'prod' 
  ? 'securegw.paytm.in' 
  : 'securegw-stage.paytm.in';

// @desc    Initiate Paytm Transaction
// @route   POST /api/payment/initiate
// @access  Private
export const initiateTransaction = async (req: Request, res: Response) => {
  try {
    const { amount, orderId, email, phone, name } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: 'Amount and OrderID are required' });
    }

    // Format amount to 2 decimal places as Paytm expects a string representation
    const formattedAmount = Number(amount).toFixed(2);

    const paytmParams = {
      body: {
        requestType: "Payment",
        mid: PAYTM_MID,
        websiteName: PAYTM_WEBSITE,
        orderId: orderId,
        callbackUrl: `${BACKEND_URL}/api/payment/callback`,
        txnAmount: {
          value: formattedAmount,
          currency: "INR",
        },
        userInfo: {
          custId: (req as any).user?.id || `CUST_${Date.now()}`,
          email: email || (req as any).user?.email || '',
          mobile: phone || '',
        },
      }
    };

    // Generate Checksum
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body), 
      PAYTM_MERCHANT_KEY
    );

    const requestData = {
      head: {
        signature: checksum
      },
      body: paytmParams.body
    };

    const postData = JSON.stringify(requestData);

    // Call Paytm Initiate Transaction API
    const response = await fetch(`https://${PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(postData))
      },
      body: postData
    });

    const result = await response.json();

    if (result.body && result.body.resultInfo && result.body.resultInfo.resultStatus === 'S') {
      res.json({
        success: true,
        txnToken: result.body.txnToken,
        orderId: orderId,
        amount: formattedAmount,
        mid: PAYTM_MID,
        paytmHost: PAYTM_HOST
      });
    } else {
      console.error("Paytm Initiate Failed:", result.body?.resultInfo);
      res.status(400).json({ 
        message: result.body?.resultInfo?.resultMsg || 'Failed to initiate payment transaction with Paytm.' 
      });
    }
  } catch (error) {
    console.error("Initiate Transaction Error:", error);
    res.status(500).json({ message: 'Internal server error while initiating payment.' });
  }
};

// @desc    Paytm Transaction Callback
// @route   POST /api/payment/callback
// @access  Public (Called by Paytm Server via POST Form Submission)
export const paymentCallback = async (req: Request, res: Response) => {
  try {
    const paytmResponse = req.body;
    console.log("Paytm Callback Received:", paytmResponse);

    const receivedSignature = paytmResponse.CHECKSUMHASH;
    delete paytmResponse.CHECKSUMHASH;

    // Verify Checksum Signature
    const isSignatureValid = PaytmChecksum.verifySignature(
      paytmResponse, 
      PAYTM_MERCHANT_KEY, 
      receivedSignature
    );

    const orderId = paytmResponse.ORDERID;

    if (!isSignatureValid) {
      console.error("Paytm Checksum Verification Failed for Order:", orderId);
      return res.redirect(`${CLIENT_URL}/checkout?payment=failed&msg=Security checksum verification failed.`);
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error("Order not found in DB:", orderId);
      return res.redirect(`${CLIENT_URL}/checkout?payment=failed&msg=Order record not found.`);
    }

    const orderData = orderDoc.data();

    if (paytmResponse.STATUS === 'TXN_SUCCESS') {
      // Update order status to paid and preparing
      const updateData = {
        status: 'preparing',
        paymentStatus: 'paid',
        paymentMethod: 'Paytm Online',
        paymentDetails: {
          transactionId: paytmResponse.TXNID,
          bankTxnId: paytmResponse.BANKTXNID || '',
          gatewayName: paytmResponse.GATEWAYNAME || '',
          paymentMode: paytmResponse.PAYMENTMODE || '',
          txnDate: paytmResponse.TXNDATE || new Date().toISOString()
        }
      };

      await orderRef.update(updateData);

      // Send confirmation email
      const updatedOrder = { id: orderId, ...orderData, ...updateData };
      try {
        await sendOrderConfirmation(updatedOrder);
      } catch (emailErr) {
        console.error("Failed to send order email:", emailErr);
      }

      // Redirect client to order history/success page
      res.redirect(`${CLIENT_URL}/my-orders?payment=success&orderId=${orderId}`);
    } else {
      // Update order status as failed
      await orderRef.update({
        status: 'payment_failed',
        paymentStatus: 'failed',
        paymentDetails: {
          respCode: paytmResponse.RESPCODE,
          respMsg: paytmResponse.RESPMSG
        }
      });

      res.redirect(`${CLIENT_URL}/checkout?payment=failed&msg=${encodeURIComponent(paytmResponse.RESPMSG || 'Transaction declined by bank.')}`);
    }
  } catch (error) {
    console.error("Paytm Callback Processing Error:", error);
    res.redirect(`${CLIENT_URL}/checkout?payment=failed&msg=Internal server error processing payment response.`);
  }
};
