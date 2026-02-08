import { db } from '../_firebase.js';
import { getAuthUser, handleError, getBookingById, updateBooking, sendEmail } from '../_utils.js';

/**
 * POST /api/bookings/approve
 * Approve a booking and send user the Cal.com link
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin user
    const authUser = await getAuthUser(req);

    const { bookingId, calEventUrl } = req.body;

    if (!bookingId || !calEventUrl) {
      return res.status(400).json({
        error: 'bookingId and calEventUrl are required',
      });
    }

    // Get the booking
    const booking = await getBookingById(bookingId);

    // Update booking status to approved
    const updatedBooking = await updateBooking(bookingId, {
      status: 'approved',
      cal_link: calEventUrl,
      approved_at: new Date().toISOString(),
    });

    // Send email to user with Cal.com link
    const emailSubject = 'Your Call with Manish is Confirmed!';
    const emailHtml = `
      <h2>Your Booking is Approved!</h2>
      <p>Hi,</p>
      <p>Thank you for your interest in a call with Manish. Your booking has been approved!</p>
      <p><strong>Schedule your call here:</strong></p>
      <p><a href="${calEventUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Book Your 25-Minute Call</a></p>
      <p>If the button doesn't work, you can also copy and paste this link: ${calEventUrl}</p>
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
    console.error('Booking approve error:', err);
    return handleError(res, err, 401);
  }
}
