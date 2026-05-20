import * as admin from 'firebase-admin';

// Initialize Firebase
const serviceAccount = require('../serviceAccount.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const TOTAL_TABLES = [
  { id: 'T1', capacity: 2 }, { id: 'T2', capacity: 2 }, { id: 'T3', capacity: 2 },
  { id: 'T4', capacity: 4 }, { id: 'T5', capacity: 4 }, { id: 'T6', capacity: 4 },
  { id: 'T7', capacity: 6 }, { id: 'T8', capacity: 6 },
  { id: 'T9', capacity: 8 }, { id: 'T10', capacity: 10 }
];

async function seedTables() {
  console.log('Seeding tables...');
  const batch = db.batch();
  
  TOTAL_TABLES.forEach(table => {
    const tableRef = db.collection('tables').doc(table.id);
    batch.set(tableRef, table);
  });

  await batch.commit();
  console.log('Tables seeded successfully!');
  process.exit(0);
}

seedTables().catch(err => {
  console.error('Error seeding tables:', err);
  process.exit(1);
});
