import { createBooking } from '../bookings/create.js';
import admin from 'firebase-admin';

// Mock Firebase Admin
jest.mock('firebase-admin');

describe('Booking API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings/create', () => {
    it('should create a booking with valid email and context', async () => {
      const mockReq = {
        method: 'POST',
        body: {
          email: 'test@example.com',
          context: 'I want to discuss AI strategies'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Firestore
      const mockSet = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn().mockReturnValue({ set: mockSet, id: 'booking-123' });
      const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
      const mockFirestore = jest.fn().mockReturnValue({ collection: mockCollection });
      
      admin.firestore = mockFirestore;

      await createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          bookingId: 'booking-123',
          message: 'Your request has been submitted. Awaiting admin review.'
        })
      );
    });

    it('should reject request without email', async () => {
      const mockReq = {
        method: 'POST',
        body: {
          context: 'Some context'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Missing email or context'
        })
      );
    });

    it('should reject invalid email format', async () => {
      const mockReq = {
        method: 'POST',
        body: {
          email: 'invalid-email',
          context: 'Some context'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid email format'
        })
      );
    });

    it('should reject non-POST requests', async () => {
      const mockReq = {
        method: 'GET',
        body: {}
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createBooking(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Method not allowed'
        })
      );
    });
  });
});
