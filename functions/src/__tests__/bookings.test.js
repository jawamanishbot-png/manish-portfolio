import { jest } from '@jest/globals';

// --- Firebase Admin mock setup ---
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn();
const mockOrderBy = jest.fn();
const mockCollection = jest.fn();
const mockVerifyIdToken = jest.fn();

const mockFirestore = jest.fn(() => ({
  collection: mockCollection,
}));

const mockAuth = jest.fn(() => ({
  verifyIdToken: mockVerifyIdToken,
}));

jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    firestore: mockFirestore,
    auth: mockAuth,
    apps: [{}],
    initializeApp: jest.fn(),
  },
}));

// Mock email module
const mockSendApprovalEmail = jest.fn().mockResolvedValue(undefined);
const mockSendRejectionEmail = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule('../email.js', () => ({
  sendApprovalEmail: mockSendApprovalEmail,
  sendRejectionEmail: mockSendRejectionEmail,
}));

// Import handlers after mocking
const { createBooking } = await import('../bookings/create.js');
const { listBookings } = await import('../bookings/list.js');
const { approveBooking } = await import('../bookings/approve.js');
const { rejectBooking } = await import('../bookings/reject.js');

// Helper to create mock res
function mockRes() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ==================== createBooking ====================
describe('createBooking', () => {
  beforeEach(() => {
    mockCollection.mockReturnValue({ doc: mockDoc });
    mockDoc.mockReturnValue({ set: mockSet });
    mockSet.mockResolvedValue({});
  });

  it('creates a booking with valid email and context', async () => {
    const req = { method: 'POST', body: { email: 'test@example.com', context: 'Discuss AI' } };
    const res = mockRes();

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.bookingId).toMatch(/^booking_\d+_/);
    expect(response.message).toContain('submitted');

    expect(mockCollection).toHaveBeenCalledWith('bookings');
    expect(mockDoc).toHaveBeenCalledWith(response.bookingId);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        id: response.bookingId,
        email: 'test@example.com',
        context: 'Discuss AI',
        status: 'pending',
      })
    );
  });

  it('rejects missing email', async () => {
    const req = { method: 'POST', body: { context: 'Topic' } };
    const res = mockRes();

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing email or context' });
  });

  it('rejects missing context', async () => {
    const req = { method: 'POST', body: { email: 'test@example.com' } };
    const res = mockRes();

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing email or context' });
  });

  it('rejects invalid email format', async () => {
    const req = { method: 'POST', body: { email: 'not-an-email', context: 'Topic' } };
    const res = mockRes();

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
  });

  it('rejects non-POST requests', async () => {
    const req = { method: 'GET', body: {} };
    const res = mockRes();

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('returns 500 on Firestore write failure', async () => {
    mockSet.mockRejectedValue(new Error('Firestore unavailable'));
    const req = { method: 'POST', body: { email: 'test@example.com', context: 'Topic' } };
    const res = mockRes();

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Firestore unavailable' });
  });
});

// ==================== listBookings ====================
describe('listBookings', () => {
  const adminToken = 'valid-admin-token';

  beforeEach(() => {
    mockVerifyIdToken.mockResolvedValue({ email: 'jawa.manish@gmail.com' });

    const mockSnapshot = {
      forEach: (cb) => {
        [
          { data: () => ({ id: 'b1', status: 'pending', created_at: '2026-01-02T00:00:00Z' }) },
          { data: () => ({ id: 'b2', status: 'approved', created_at: '2026-01-01T00:00:00Z' }) },
        ].forEach(cb);
      },
    };
    mockOrderBy.mockReturnValue({ get: jest.fn().mockResolvedValue(mockSnapshot) });
    mockCollection.mockReturnValue({ orderBy: mockOrderBy });
  });

  it('lists bookings for admin user', async () => {
    const req = { method: 'GET', headers: { authorization: `Bearer ${adminToken}` } };
    const res = mockRes();

    await listBookings(req, res);

    expect(mockVerifyIdToken).toHaveBeenCalledWith(adminToken);
    expect(mockCollection).toHaveBeenCalledWith('bookings');
    expect(mockOrderBy).toHaveBeenCalledWith('created_at', 'desc');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      bookings: [
        { id: 'b1', status: 'pending', created_at: '2026-01-02T00:00:00Z' },
        { id: 'b2', status: 'approved', created_at: '2026-01-01T00:00:00Z' },
      ],
    });
  });

  it('rejects missing auth header', async () => {
    const req = { method: 'GET', headers: {} };
    const res = mockRes();

    await listBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing authorization token' });
  });

  it('rejects invalid token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    const req = { method: 'GET', headers: { authorization: 'Bearer bad-token' } };
    const res = mockRes();

    await listBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('rejects non-admin user', async () => {
    mockVerifyIdToken.mockResolvedValue({ email: 'stranger@example.com' });
    const req = { method: 'GET', headers: { authorization: `Bearer ${adminToken}` } };
    const res = mockRes();

    await listBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
  });

  it('rejects non-GET requests', async () => {
    const req = { method: 'POST', headers: {} };
    const res = mockRes();

    await listBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

// ==================== approveBooking ====================
describe('approveBooking', () => {
  const adminToken = 'valid-admin-token';

  beforeEach(() => {
    mockVerifyIdToken.mockResolvedValue({ email: 'jawa.manish@gmail.com' });
    mockGet.mockResolvedValue({ exists: true, data: () => ({ id: 'b1', email: 'user@test.com', status: 'pending' }) });
    mockUpdate.mockResolvedValue({});
    mockDoc.mockReturnValue({ get: mockGet, update: mockUpdate });
    mockCollection.mockReturnValue({ doc: mockDoc });
  });

  it('approves a pending booking and sends email', async () => {
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1', calEventUrl: 'https://cal.com/manish/30min' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(mockCollection).toHaveBeenCalledWith('bookings');
    expect(mockDoc).toHaveBeenCalledWith('b1');
    expect(mockSendApprovalEmail).toHaveBeenCalledWith('user@test.com', 'https://cal.com/manish/30min');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'approved',
        cal_event_url: 'https://cal.com/manish/30min',
        approved_by: 'jawa.manish@gmail.com',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Booking approved and email sent' });
  });

  it('continues if email send fails', async () => {
    mockSendApprovalEmail.mockRejectedValue(new Error('SMTP down'));
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1', calEventUrl: 'https://cal.com/manish/30min' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(mockUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 for non-existent booking', async () => {
    mockGet.mockResolvedValue({ exists: false });
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'nonexistent', calEventUrl: 'https://cal.com/manish/30min' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Booking not found' });
  });

  it('rejects missing bookingId', async () => {
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { calEventUrl: 'https://cal.com/manish/30min' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing bookingId or calEventUrl' });
  });

  it('rejects missing calEventUrl', async () => {
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing bookingId or calEventUrl' });
  });

  it('rejects invalid URL format', async () => {
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1', calEventUrl: 'not-a-url' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid URL format' });
  });

  it('rejects non-admin user', async () => {
    mockVerifyIdToken.mockResolvedValue({ email: 'stranger@example.com' });
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1', calEventUrl: 'https://cal.com/manish/30min' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
  });

  it('rejects missing auth header', async () => {
    const req = {
      method: 'POST',
      headers: {},
      body: { bookingId: 'b1', calEventUrl: 'https://cal.com/manish/30min' },
    };
    const res = mockRes();

    await approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects non-POST requests', async () => {
    const req = { method: 'GET', headers: {}, body: {} };
    const res = mockRes();

    await approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

// ==================== rejectBooking ====================
describe('rejectBooking', () => {
  const adminToken = 'valid-admin-token';

  beforeEach(() => {
    mockVerifyIdToken.mockResolvedValue({ email: 'jawa.manish@gmail.com' });
    mockGet.mockResolvedValue({ exists: true, data: () => ({ id: 'b1', email: 'user@test.com', status: 'pending' }) });
    mockUpdate.mockResolvedValue({});
    mockDoc.mockReturnValue({ get: mockGet, update: mockUpdate });
    mockCollection.mockReturnValue({ doc: mockDoc });
  });

  it('rejects a pending booking and sends email', async () => {
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1' },
    };
    const res = mockRes();

    await rejectBooking(req, res);

    expect(mockCollection).toHaveBeenCalledWith('bookings');
    expect(mockDoc).toHaveBeenCalledWith('b1');
    expect(mockSendRejectionEmail).toHaveBeenCalledWith('user@test.com');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'rejected',
        rejected_by: 'jawa.manish@gmail.com',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Booking rejected and email sent' });
  });

  it('continues if email send fails', async () => {
    mockSendRejectionEmail.mockRejectedValue(new Error('SMTP down'));
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1' },
    };
    const res = mockRes();

    await rejectBooking(req, res);

    expect(mockUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 for non-existent booking', async () => {
    mockGet.mockResolvedValue({ exists: false });
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'nonexistent' },
    };
    const res = mockRes();

    await rejectBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Booking not found' });
  });

  it('rejects missing bookingId', async () => {
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: {},
    };
    const res = mockRes();

    await rejectBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing bookingId' });
  });

  it('rejects non-admin user', async () => {
    mockVerifyIdToken.mockResolvedValue({ email: 'stranger@example.com' });
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: { bookingId: 'b1' },
    };
    const res = mockRes();

    await rejectBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
  });

  it('rejects invalid token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer bad-token' },
      body: { bookingId: 'b1' },
    };
    const res = mockRes();

    await rejectBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('rejects non-POST requests', async () => {
    const req = { method: 'GET', headers: {}, body: {} };
    const res = mockRes();

    await rejectBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
