import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './CheckoutSuccess.css';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingInfo, setBookingInfo] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // In a real app, you'd verify the session on the backend
    // For now, we just show a success message
    if (sessionId) {
      setBookingInfo({
        sessionId,
        message: 'Your payment has been received!',
      });
    }
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="checkout-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card success">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        
        <div className="success-content">
          <p className="main-message">
            Thank you for booking a consultation with Manish Jawa!
          </p>
          
          <div className="info-box">
            <h3>What happens next?</h3>
            <ul>
              <li>Your booking request has been received</li>
              <li>Manish will review your request and context</li>
              <li>Within 24 hours, you'll receive a Cal.com scheduling link via email</li>
              <li>You can then select your preferred time slot</li>
            </ul>
          </div>

          <div className="receipt-box">
            <p><strong>Session ID:</strong> {sessionId}</p>
            <p><strong>Amount:</strong> $100.00 USD</p>
            <p><strong>Status:</strong> Paid</p>
          </div>

          <p className="confirmation-email">
            A confirmation email has been sent to your email address.
          </p>

          <div className="action-buttons">
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="support-box">
        <h3>Need Help?</h3>
        <p>
          If you have any questions, please reach out to{' '}
          <a href="mailto:jawa.manish@gmail.com">jawa.manish@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
