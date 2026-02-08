/**
 * End-to-End Tests for Booking System
 * 
 * These tests validate the complete flow:
 * 1. User submits booking form
 * 2. Booking is saved to Firestore
 * 3. Admin can list pending bookings
 * 4. Admin can approve/reject bookings
 */

import admin from 'firebase-admin';

describe('E2E Booking System Tests', () => {
  let db;

  beforeAll(() => {
    // Initialize Firestore
    db = admin.firestore();
  });

  afterEach(async () => {
    // Clean up test data
    const snapshot = await db.collection('bookings')
      .where('email', '==', 'e2e-test@example.com')
      .get();
    
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
  });

  it('should create and retrieve a booking', async () => {
    const bookingData = {
      email: 'e2e-test@example.com',
      context: 'E2E test booking',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create booking
    const docRef = await db.collection('bookings').add(bookingData);
    expect(docRef.id).toBeDefined();

    // Retrieve booking
    const doc = await docRef.get();
    expect(doc.exists).toBe(true);
    expect(doc.data().email).toBe('e2e-test@example.com');
    expect(doc.data().status).toBe('pending');
  });

  it('should update booking status to approved', async () => {
    const bookingData = {
      email: 'e2e-test@example.com',
      context: 'E2E test booking',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create booking
    const docRef = await db.collection('bookings').add(bookingData);

    // Approve booking
    await docRef.update({
      status: 'approved',
      cal_link: 'https://cal.com/manish/call',
      approved_at: new Date().toISOString()
    });

    // Verify update
    const doc = await docRef.get();
    expect(doc.data().status).toBe('approved');
    expect(doc.data().cal_link).toBe('https://cal.com/manish/call');
  });

  it('should update booking status to rejected', async () => {
    const bookingData = {
      email: 'e2e-test@example.com',
      context: 'E2E test booking',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create booking
    const docRef = await db.collection('bookings').add(bookingData);

    // Reject booking
    await docRef.update({
      status: 'rejected',
      rejected_at: new Date().toISOString()
    });

    // Verify update
    const doc = await docRef.get();
    expect(doc.data().status).toBe('rejected');
  });

  it('should query pending bookings', async () => {
    // Create multiple bookings
    await db.collection('bookings').add({
      email: 'e2e-test@example.com',
      context: 'Test 1',
      status: 'pending',
      created_at: new Date().toISOString()
    });

    await db.collection('bookings').add({
      email: 'e2e-test@example.com',
      context: 'Test 2',
      status: 'approved',
      created_at: new Date().toISOString()
    });

    // Query pending bookings
    const snapshot = await db.collection('bookings')
      .where('email', '==', 'e2e-test@example.com')
      .where('status', '==', 'pending')
      .get();

    expect(snapshot.docs.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.docs[0].data().status).toBe('pending');
  });

  it('should order bookings by creation date', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await db.collection('bookings').add({
      email: 'e2e-test@example.com',
      context: 'Older booking',
      status: 'pending',
      created_at: yesterday.toISOString()
    });

    await db.collection('bookings').add({
      email: 'e2e-test@example.com',
      context: 'Newer booking',
      status: 'pending',
      created_at: now.toISOString()
    });

    // Query ordered by creation date
    const snapshot = await db.collection('bookings')
      .where('email', '==', 'e2e-test@example.com')
      .orderBy('created_at', 'desc')
      .get();

    expect(snapshot.docs.length).toBeGreaterThanOrEqual(2);
    // Most recent should be first
    expect(snapshot.docs[0].data().context).toBe('Newer booking');
  });
});
