import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendApprovalEmail = async (userEmail, calEventUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Booking Request Approved - Schedule Your Call with Manish',
    html: `
      <h2>Great news! Your booking request has been approved.</h2>
      <p>Manish has reviewed your request and is ready to meet with you.</p>
      <p>
        <strong>Click the link below to schedule your 25-minute call:</strong>
      </p>
      <p>
        <a href="${calEventUrl}" style="padding: 10px 20px; background-color: #22c55e; color: black; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          Schedule Your Call
        </a>
      </p>
      <p>Or copy this link: <a href="${calEventUrl}">${calEventUrl}</a></p>
      <p>Looking forward to our conversation!</p>
      <p>Best regards,<br />Manish Jawa</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send approval email:', error);
    throw error;
  }
};

export const sendRejectionEmail = async (userEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Booking Request - Update from Manish',
    html: `
      <h2>Thank you for your interest</h2>
      <p>Thanks for submitting a booking request. Unfortunately, Manish is unable to accommodate your request at this time.</p>
      <p>Please feel free to reach out again in the future or connect via LinkedIn.</p>
      <p>Best regards,<br />Manish Jawa</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    throw error;
  }
};

export const sendBookingNotificationEmail = async (bookingData) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'jawa.manish@gmail.com';
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'New Booking Request - Action Required',
    html: `
      <h2>🎉 You have a new booking request!</h2>
      <p><strong>From:</strong> ${bookingData.email}</p>
      <p><strong>Booking ID:</strong> ${bookingData.id}</p>
      <p><strong>Context/Message:</strong></p>
      <blockquote style="background-color: #f3f4f6; padding: 12px; border-left: 4px solid #22c55e;">
        ${bookingData.context.replace(/\n/g, '<br />')}
      </blockquote>
      <p><strong>Submitted:</strong> ${new Date(bookingData.created_at).toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })} PST</p>
      <p>
        <a href="https://manish-portfolio-bookings.web.app/admin" style="padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-top: 12px;">
          Review in Admin Dashboard
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
        Log in to your admin dashboard to approve or reject this request.
      </p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking notification email sent to ${adminEmail} for booking ${bookingData.id}`);
  } catch (error) {
    console.error('Failed to send booking notification email:', error);
    // Don't throw - log but continue, don't fail the booking
  }
};
