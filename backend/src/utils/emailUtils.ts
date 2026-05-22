import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL for Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('[Email] Connection Error:', error);
  } else {
    console.log('[Email] Server is ready to take our messages');
  }
});

export const sendOrderConfirmation = async (order: any) => {
  const { id, items, totalAmount, shippingDetails, paymentMethod } = order;
  const email = shippingDetails.email;

  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${item.name} x ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Playfair Display', serif; background-color: #000; color: #fff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #c5a059;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #c5a059; letter-spacing: 5px; margin: 0;">THE DIVINE</h1>
        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Luxury Dining Experience</p>
      </div>

      <h2 style="color: #fff; font-weight: normal; border-bottom: 1px solid #c5a059; padding-bottom: 10px;">Order Confirmation</h2>
      <p style="color: #ccc;">Thank you for choosing The Divine. Your order has been received and is being prepared with excellence.</p>
      
      <div style="margin: 30px 0;">
        <p style="margin: 5px 0;"><strong style="color: #c5a059;">Order ID:</strong> #${id}</p>
        <p style="margin: 5px 0;"><strong style="color: #c5a059;">Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong style="color: #c5a059;">Status:</strong> Preparing</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="color: #c5a059; text-transform: uppercase; font-size: 12px;">
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #c5a059;">Item</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #c5a059;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 20px 10px; font-weight: bold; font-size: 18px;">Total Amount</td>
            <td style="padding: 20px 10px; font-weight: bold; font-size: 18px; text-align: right; color: #c5a059;">₹${totalAmount}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: #111; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <h3 style="color: #c5a059; margin-top: 0; font-size: 14px; text-transform: uppercase;">Delivery Address</h3>
        <p style="color: #ccc; margin: 0; font-size: 14px; line-height: 1.6;">
          ${shippingDetails.name}<br>
          ${shippingDetails.address}<br>
          ${shippingDetails.city}, ${shippingDetails.postalCode}<br>
          Phone: ${shippingDetails.phone}
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 11px; margin-top: 40px;">
        <p>&copy; ${new Date().getFullYear()} THE DIVINE KITCHEN. All rights reserved.</p>
        <p>This is a luxury automated message. Please do not reply.</p>
      </div>
    </div>
  `;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"THE DIVINE" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmed - #${id}`,
        html: html,
      });
      console.log(`[ORDER EMAIL] Sent successfully to ${email}`);
    }
  } catch (error) {
    console.error(`[ORDER EMAIL ERROR] Failed to send:`, error);
  }
};

export const sendOutForDeliveryEmail = async (order: any) => {
  const { id, shippingDetails } = order;
  const email = shippingDetails.email;

  const html = `
    <div style="font-family: 'Playfair Display', serif; background-color: #000; color: #fff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #c5a059;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #c5a059; letter-spacing: 5px; margin: 0;">THE DIVINE</h1>
        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Luxury Dining Experience</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 50px; margin-bottom: 10px;">🚚</div>
        <h2 style="color: #c5a059; font-weight: normal; margin: 0;">Your Order is En Route!</h2>
        <p style="color: #ccc;">Exciting news! Your luxury meal has left The Divine and is currently on its way to you.</p>
      </div>
      
      <div style="background-color: #111; padding: 25px; border-radius: 10px; border-left: 4px solid #c5a059; margin-bottom: 30px;">
        <p style="margin: 5px 0; font-size: 14px;"><strong style="color: #c5a059;">Order ID:</strong> #${id}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong style="color: #c5a059;">Estimated Arrival:</strong> 15-20 Minutes</p>
        <p style="margin: 15px 0 5px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Delivery Partner</p>
        <p style="margin: 0; font-weight: bold; color: #fff;">The Divine Elite Delivery</p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="http://localhost:3000/orders/${id}/track" style="background-color: #c5a059; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 5px;">Track Live Delivery</a>
      </div>

      <div style="border-top: 1px solid #333; padding-top: 20px; text-align: center;">
        <p style="color: #888; font-size: 13px;">Please be ready at your delivery location.</p>
        <p style="color: #c5a059; font-style: italic;">"Wait for the flavor, it's worth it."</p>
      </div>

      <div style="text-align: center; color: #666; font-size: 11px; margin-top: 40px;">
        <p>&copy; ${new Date().getFullYear()} THE DIVINE KITCHEN. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"THE DIVINE" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Order #${id} is Out for Delivery!`,
        html: html,
      });
      console.log(`[DELIVERY EMAIL] Sent successfully to ${email}`);
    }
  } catch (error) {
    console.error(`[DELIVERY EMAIL ERROR] Failed to send:`, error);
  }
};

export const sendOrderDeliveredEmail = async (order: any) => {
  const { id, shippingDetails } = order;
  const email = shippingDetails.email;

  const html = `
    <div style="font-family: 'Playfair Display', serif; background-color: #000; color: #fff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #c5a059;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #c5a059; letter-spacing: 5px; margin: 0;">THE DIVINE</h1>
        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Luxury Dining Experience</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 50px; margin-bottom: 10px;">🍽️</div>
        <h2 style="color: #c5a059; font-weight: normal; margin: 0;">Order Delivered!</h2>
        <p style="color: #ccc;">Your luxury dining experience has arrived. We hope you enjoy every bite.</p>
      </div>
      
      <div style="background-color: #111; padding: 25px; border-radius: 10px; border: 1px solid #333; margin-bottom: 30px; text-align: center;">
        <p style="color: #888; font-size: 12px; text-transform: uppercase;">Order Reference</p>
        <p style="margin: 5px 0; font-size: 18px; color: #fff; letter-spacing: 2px;">#${id}</p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <p style="color: #fff; font-size: 16px;">How was your experience?</p>
        <div style="margin-top: 15px;">
          <span style="font-size: 30px; margin: 0 10px; cursor: pointer;">⭐</span>
          <span style="font-size: 30px; margin: 0 10px; cursor: pointer;">⭐</span>
          <span style="font-size: 30px; margin: 0 10px; cursor: pointer;">⭐</span>
          <span style="font-size: 30px; margin: 0 10px; cursor: pointer;">⭐</span>
          <span style="font-size: 30px; margin: 0 10px; cursor: pointer;">⭐</span>
        </div>
      </div>

      <div style="border-top: 1px solid #333; padding-top: 20px; text-align: center;">
        <p style="color: #ccc; font-size: 14px;">Thank you for choosing <strong style="color: #c5a059;">The Divine</strong>.</p>
        <p style="color: #888; font-size: 12px;">We look forward to serving you again soon.</p>
      </div>

      <div style="text-align: center; color: #666; font-size: 11px; margin-top: 40px;">
        <p>&copy; ${new Date().getFullYear()} THE DIVINE KITCHEN. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"THE DIVINE" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Delivered - Enjoy Your Meal!`,
        html: html,
      });
      console.log(`[DELIVERED EMAIL] Sent successfully to ${email}`);
    }
  } catch (error) {
    console.error(`[DELIVERED EMAIL ERROR] Failed to send:`, error);
  }
};

export const sendReservationConfirmationEmail = async (resData: any) => {
  const { name, email, date, time, tableId, guests } = resData;

  const html = `
    <div style="font-family: 'Playfair Display', serif; background-color: #000; color: #fff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #c5a059;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #c5a059; letter-spacing: 5px; margin: 0;">THE DIVINE</h1>
        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Luxury Dining Experience</p>
      </div>
      
      <div style="border: 1px solid #c5a059; padding: 30px; background: rgba(197, 160, 89, 0.05); text-align: center;">
        <h2 style="color: #c5a059; font-weight: normal; margin-bottom: 10px;">Reservation Confirmed</h2>
        <p style="color: #ccc; font-size: 14px;">We are delighted to confirm your table at The Divine.</p>
        
        <div style="margin: 30px 0; border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 20px 0;">
          <table style="width: 100%; color: #fff; font-size: 14px;">
            <tr>
              <td style="text-align: left; color: #888; padding: 5px 0;">GUEST</td>
              <td style="text-align: right; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="text-align: left; color: #888; padding: 5px 0;">DATE</td>
              <td style="text-align: right; font-weight: bold;">${date}</td>
            </tr>
            <tr>
              <td style="text-align: left; color: #888; padding: 5px 0;">TIME</td>
              <td style="text-align: right; font-weight: bold;">${time}</td>
            </tr>
            <tr>
              <td style="text-align: left; color: #888; padding: 5px 0;">TABLE</td>
              <td style="text-align: right; font-weight: bold;">Table ${tableId}</td>
            </tr>
            <tr>
              <td style="text-align: left; color: #888; padding: 5px 0;">GUESTS</td>
              <td style="text-align: right; font-weight: bold;">${guests} People</td>
            </tr>
          </table>
        </div>

        <p style="color: #888; font-size: 12px; font-style: italic;">"A table is waiting for you in paradise."</p>
      </div>

      <div style="text-align: center; color: #666; font-size: 11px; margin-top: 40px;">
        <p>&copy; ${new Date().getFullYear()} THE DIVINE KITCHEN. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"THE DIVINE" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Reservation Confirmed - See You Soon!`,
        html: html,
      });
      console.log(`[RESERVATION EMAIL] Sent successfully to ${email}`);
    }
  } catch (error) {
    console.error(`[RESERVATION EMAIL ERROR] Failed to send:`, error);
  }
};

export const sendReservationReminderEmail = async (resData: any) => {
  const { name, email, time, tableId } = resData;

  const html = `
    <div style="font-family: 'Playfair Display', serif; background-color: #000; color: #fff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #c5a059;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #c5a059; letter-spacing: 5px; margin: 0;">THE DIVINE</h1>
      </div>
      
      <div style="text-align: center;">
        <h2 style="color: #c5a059; font-weight: normal; font-style: italic;">Your Table Awaits</h2>
        <p style="color: #ccc; line-height: 1.6;">Dear ${name}, this is a gentle reminder for your reservation at <b>${time}</b> today. We are preparing everything for your arrival.</p>
        
        <div style="margin: 30px auto; width: 50px; height: 1px; background: #c5a059;"></div>
        
        <p style="font-size: 12px; color: #888; text-transform: uppercase;">Table ${tableId} • See You in 1 Hour</p>
      </div>
    </div>
  `;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"THE DIVINE" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `REMINDER: Your Table at The Divine`,
        html: html,
      });
      console.log(`[REMINDER EMAIL] Sent successfully to ${email}`);
    }
  } catch (error) {
    console.error(`[REMINDER EMAIL ERROR] Failed to send:`, error);
  }
};
