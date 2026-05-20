import { db } from '../config/firebase';

export const cleanupOldReservations = async () => {
  try {
    const now = new Date();
    const snapshot = await db.collection('reservations').get();
    const batch = db.batch();
    let deletionsCount = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      try {
        const resDateTime = new Date(`${data.date}T${data.time || '00:00'}`);
        const diffInHours = (now.getTime() - resDateTime.getTime()) / (1000 * 60 * 60);

        // Delete if more than 24 hours old
        if (diffInHours > 24) {
          batch.delete(doc.ref);
          deletionsCount++;
        }
      } catch (err) {
        // Skip invalid dates
      }
    });

    if (deletionsCount > 0) {
      await batch.commit();
      console.log(`[Cleanup] Successfully removed ${deletionsCount} old reservations.`);
    }
  } catch (error) {
    console.error('[Cleanup] Error during reservation cleanup:', error);
  }
};
