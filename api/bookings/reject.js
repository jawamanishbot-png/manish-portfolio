import { db } from '../_firebase.js';
import { getAuthUser, handleError, getBookingById, updateBooking, sendEmail } from '../_utils.js';

/**
 * POST /api/bookings/reject
 * Reject a booking and notify the user
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin user
    const authUser = await getAuthUser(req);

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        error: 'bookingId is required',
      });
    }

    // Get the booking
    const booking = await getBookingById(bookingId);

    // Update booking status to rejected
    const updatedBooking = await updateBooking(bookingId, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    });

    // Send email to user notifying rejection
    const emailSubject = 'Update on Your Booking Request';
    const emailHtml = `
      <h2>Booking Update</h2>
      <p>Hi,</p>
      <p>Thank you for your interest in scheduling a call with Manish. Unfortunately, we're unable to schedule your call at this time.</p>
      <p>Feel free to reach out again in the future or connect via LinkedIn.</p>
      <p>Best regards,<br/>Manish Jawa</p>
    `;

    // Send email (will be improved with actual email provider)
    try {
      await sendEmail(booking.email, emailSubject, emailHtml);
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
      // Don't fail the entire request if email fails
    }

    return res.status(200).json({
      success: true,
      booking: updatedBooking,
    });
  } catch (err) {
    console.error('Booking reject error:', err);
    return handleError(res, err, 401);
  }
}
