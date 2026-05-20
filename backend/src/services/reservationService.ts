import { db } from '../config/firebase';
import { ReservationInput } from '../validations/reservationSchema';

export const reservationService = {
  async create(data: ReservationInput & { userId?: string }) {
    const reservationData = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('reservations').add(reservationData);
    return { id: docRef.id, ...reservationData };
  },

  async getAll() {
    const snapshot = await db.collection('reservations').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getByUserId(userId: string) {
    const snapshot = await db.collection('reservations')
      .where('userId', '==', userId)
      .get();
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async checkAvailability(date: string, time: string) {
    const DEFAULT_TABLES = [
      { id: 'T1', capacity: 2, type: 'Window View' },
      { id: 'T2', capacity: 2, type: 'Window View' },
      { id: 'T3', capacity: 4, type: 'Center' },
      { id: 'T4', capacity: 4, type: 'Center' },
      { id: 'T5', capacity: 6, type: 'VIP Corner' },
      { id: 'T6', capacity: 2, type: 'Center' },
      { id: 'T7', capacity: 4, type: 'Wall View' },
      { id: 'T8', capacity: 8, type: 'Grand Suite' },
      { id: 'T9', capacity: 2, type: 'Cozy Corner' },
      { id: 'T10', capacity: 2, type: 'Cozy Corner' },
    ];

    // Fetch tables from Firestore
    const tablesSnapshot = await db.collection('tables').get();
    let TOTAL_TABLES = tablesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fallback if database is empty
    if (TOTAL_TABLES.length === 0) {
      TOTAL_TABLES = DEFAULT_TABLES;
    }

    const snapshot = await db.collection('reservations')
      .where('date', '==', date)
      .where('time', '==', time)
      .get();

    const bookedTableIds = snapshot.docs
      .filter(doc => doc.data().status !== 'cancelled')
      .map(doc => doc.data().tableId);

    return TOTAL_TABLES.map(table => ({
      ...table,
      isAvailable: !bookedTableIds.includes(table.id)
    }));
  },

  async updateStatus(id: string, status: string) {
    const docRef = db.collection('reservations').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error('Reservation not found');
    }

    const data = doc.data()!;

    if (status === 'confirmed') {
      // Check for conflicts
      const snapshot = await db.collection('reservations')
        .where('date', '==', data.date)
        .where('time', '==', data.time)
        .where('status', '==', 'confirmed')
        .get();

      const isAlreadyBooked = snapshot.docs.some(d => d.id !== id && d.data().tableId === data.tableId);
      if (isAlreadyBooked) {
        throw new Error('Table already confirmed for another guest at this time');
      }
    }

    await docRef.update({ status });
    return { message: 'Status updated successfully' };
  }
};
