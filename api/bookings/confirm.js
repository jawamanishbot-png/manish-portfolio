import { db } from '../_firebase.js';
import { handleError, getBookingById, updateBooking } from '../_utils.js';

/**
 * POST /api/bookings/confirm
 * Confirm payment and update booking status
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({
        error: 'bookingId and paymentIntentId are required',
      });
    }

    // Get the booking
    const booking = await getBookingById(bookingId);

    // Verify the payment intent matches
    if (booking.stripe_id !== paymentIntentId) {
      return res.status(400).json({
        error: 'Payment intent does not match booking',
      });
    }

    // Update booking status to pending (ready for admin review)
    const updatedBooking = await updateBooking(bookingId, {
      status: 'pending',
      payment_confirmed_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      booking: updatedBooking,
    });
  } catch (err) {
    console.error('Booking confirm error:', err);
    return handleError(res, err);
  }
}
