import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

initializeApp({
  credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : applicationDefault(),
});

const db = getFirestore();

async function seed() {
  // Members
  const members = [
    { name: 'Ali Yılmaz', email: 'ali@example.com', phone: '5551112233', membershipType: 'Gold' },
    { name: 'Ayşe Demir', email: 'ayse@example.com', phone: '5552223344', membershipType: 'Silver' },
  ];
  for (const member of members) {
    await db.collection('members').add(member);
  }

  // Classes
  const classes = [
    { name: 'Pilates', instructor: 'Elif Kaya', schedule: 'Pazartesi 10:00' },
    { name: 'Crossfit', instructor: 'Mert Can', schedule: 'Çarşamba 18:00' },
  ];
  for (const gymClass of classes) {
    await db.collection('classes').add(gymClass);
  }

  // Attendance
  const attendance = [
    { memberId: '1', classId: '1', date: '2025-06-15', status: 'present' },
    { memberId: '2', classId: '2', date: '2025-06-15', status: 'absent' },
  ];
  for (const record of attendance) {
    await db.collection('attendance').add(record);
  }

  // Payments
  const payments = [
    { memberId: '1', amount: 500, date: '2025-06-10', status: 'paid' },
    { memberId: '2', amount: 350, date: '2025-06-12', status: 'pending' },
  ];
  for (const payment of payments) {
    await db.collection('payments').add(payment);
  }

  // Parental Consent
  const consents = [
    { memberId: '2', parentName: 'Fatma Demir', consentDate: '2025-06-01', consentGiven: true },
  ];
  for (const consent of consents) {
    await db.collection('parentalConsent').add(consent);
  }

  // Health History
  const histories = [
    { memberId: '1', details: 'No issues', lastUpdate: '2025-06-01' },
    { memberId: '2', details: 'Asthma', lastUpdate: '2025-06-10' },
  ];
  for (const history of histories) {
    await db.collection('healthHistory').add(history);
  }

  console.log('Database seeded successfully.');
}

seed().catch((err) => {
  console.error('Seeder error:', err);
  process.exit(1);
});
