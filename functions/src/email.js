import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const buttonStyle = 'padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 14px;';

export const sendApprovalEmail = async (userEmail, details = {}) => {
  const { meetLink, eventLink, paymentUrl, paymentAmount, topic } = details;

  // Build sections conditionally
  let meetingSection = '';
  if (meetLink) {
    meetingSection = `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px; font-weight: 600; color: #166534;">Your Meeting is Scheduled</p>
        <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">A Google Calendar invite has been sent to your email with all the details.</p>
        <a href="${meetLink}" style="${buttonStyle} background-color: #22c55e; color: #050505;">
          Join Google Meet
        </a>
        ${eventLink ? `<p style="margin: 12px 0 0; font-size: 13px;"><a href="${eventLink}" style="color: #16a34a;">View Calendar Event</a></p>` : ''}
      </div>
    `;
  }

  let paymentSection = '';
  if (paymentUrl && paymentAmount) {
    paymentSection = `
      <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #5b21b6;">Consultation Fee</p>
        <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
          Amount: <strong>$${paymentAmount}</strong>
        </p>
        <a href="${paymentUrl}" style="${buttonStyle} background-color: #7c3aed; color: white;">
          Complete Payment
        </a>
      </div>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Booking Request Approved — Manish Jawa',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
        <div style="padding: 32px 0; border-bottom: 1px solid #e5e7eb;">
          <h1 style="margin: 0 0 8px; font-size: 22px; color: #111827;">Request Approved</h1>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Your consultation request has been approved</p>
        </div>

        ${topic ? `
        <div style="padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Topic</p>
          <p style="margin: 6px 0 0; color: #374151;">${topic}</p>
        </div>
        ` : ''}

        ${meetingSection}
        ${paymentSection}

        ${!meetLink && !paymentUrl ? `
        <div style="padding: 20px 0;">
          <p>Manish has reviewed your request and will be in touch shortly to schedule a time.</p>
        </div>
        ` : ''}

        <div style="padding: 24px 0; border-top: 1px solid #e5e7eb; margin-top: 12px;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            Best regards,<br />
            <strong style="color: #374151;">Manish Jawa</strong>
          </p>
        </div>
      </div>
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
    subject: 'Your Booking Request — Update from Manish',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
        <div style="padding: 32px 0; border-bottom: 1px solid #e5e7eb;">
          <h1 style="margin: 0 0 8px; font-size: 22px; color: #111827;">Thank You for Your Interest</h1>
        </div>
        <div style="padding: 20px 0;">
          <p>Thanks for submitting a booking request. Unfortunately, Manish is unable to accommodate your request at this time.</p>
          <p>Please feel free to reach out again in the future or connect via <a href="https://linkedin.com/in/manishjawa" style="color: #22c55e;">LinkedIn</a>.</p>
        </div>
        <div style="padding: 24px 0; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            Best regards,<br />
            <strong style="color: #374151;">Manish Jawa</strong>
          </p>
        </div>
      </div>
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
