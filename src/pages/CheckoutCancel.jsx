import { Link } from 'react-router-dom';
import './CheckoutCancel.css';

export default function CheckoutCancel() {
  return (
    <div className="checkout-container">
      <div className="checkout-card cancel">
        <div className="cancel-icon">✕</div>
        <h1>Payment Cancelled</h1>
        
        <div className="cancel-content">
          <p className="main-message">
            Your payment was not completed.
          </p>
          
          <div className="info-box">
            <h3>What happened?</h3>
            <ul>
              <li>Your payment was cancelled or timed out</li>
              <li>No charges have been made to your card</li>
              <li>You can try booking again anytime</li>
            </ul>
          </div>

          <p className="next-steps">
            If you encountered any issues or have questions, feel free to reach out:
          </p>

          <div className="action-buttons">
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
            <a href="mailto:jawa.manish@gmail.com" className="btn btn-secondary">
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <div className="support-box">
        <h3>Have Questions?</h3>
        <p>
          Reach out to Manish at{' '}
          <a href="mailto:jawa.manish@gmail.com">jawa.manish@gmail.com</a>{' '}
          if you'd like to discuss booking a consultation.
        </p>
      </div>
    </div>
  );
}
