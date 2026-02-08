import { useState } from 'react';
import { createBooking } from '../services/api';
import './BookingForm.css';

export default function BookingForm() {
  const [email, setEmail] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create booking and get Stripe Checkout URL
      const { checkout_url } = await createBooking(email, context);

      // Redirect to Stripe Checkout
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="booking-success">
        <div className="success-icon">✓</div>
        <h3>Redirecting to Payment</h3>
        <p>{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="context">What would you like to discuss? *</label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Share your topic, challenges, or what you'd like guidance on..."
          rows="4"
          required
          disabled={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Book Call ($100 USD)'}
      </button>

      <p className="form-note">
        💳 Your payment is secure and processed by Stripe. You'll be redirected to our secure checkout.
      </p>
    </form>
  );
}
