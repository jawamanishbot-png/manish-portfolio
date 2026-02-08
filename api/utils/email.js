import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
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
