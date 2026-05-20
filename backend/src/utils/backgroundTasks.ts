import { db } from '../config/firebase';
import { sendReservationReminderEmail } from './emailUtils';

export const initBackgroundTasks = () => {
  console.log('[Background Tasks] Reservation Reminder System Initialized');
  
  // Check every 15 minutes
  setInterval(async () => {
    console.log('[Reminder Check] Scanning for upcoming reservations...');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    try {
      const snapshot = await db.collection('reservations')
        .where('date', '==', today)
        .where('status', '==', 'confirmed')
        .get();

      const currentTime = now.getHours() * 60 + now.getMinutes();

      snapshot.docs.forEach(async (doc) => {
        const data = doc.data();
        
        // Skip if reminder already sent
        if (data.reminderSent) return;

        // Parse time (HH:MM)
        const [hours, minutes] = data.time.split(':').map(Number);
        const resTime = hours * 60 + minutes;

        // If reservation is between 45 and 75 minutes from now
        const diff = resTime - currentTime;
        if (diff > 45 && diff <= 75) {
          console.log(`[Reminder] Sending 1hr reminder to ${data.email} for Table ${data.tableId}`);
          await sendReservationReminderEmail(data);
          
          // Mark as sent
          await doc.ref.update({ reminderSent: true });
        }
      });
    } catch (error) {
      console.error('[Reminder Error] Failed to scan reservations:', error);
    }
  }, 15 * 60 * 1000); // 15 Minutes
};
