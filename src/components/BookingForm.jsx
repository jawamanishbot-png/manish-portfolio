import { useState, useRef } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../config/stripe';
import { createBooking, confirmBooking } from '../services/api';
import './BookingForm.css';

function BookingFormContent() {
  const stripe = useStripe();
  const elements = useElements();
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
      // Step 1: Create booking in Firebase and get payment intent
      const { bookingId, clientSecret } = await createBooking(email, context);

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Step 3: Confirm booking in Firebase
      await confirmBooking(bookingId, paymentIntent.id);

      setSuccess(true);
      setSuccessMessage(
        'Payment successful! Your booking request has been submitted. Manish will review it and send you a Cal.com scheduling link within 24 hours.'
      );
      setEmail('');
      setContext('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="booking-success">
        <div className="success-icon">✓</div>
        <h3>Booking Request Submitted</h3>
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

      <div className="form-group">
        <label htmlFor="card">Card Details *</label>
        <div className="stripe-element">
          <CardElement id="card" disabled={loading} />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={!stripe || !elements || loading}
      >
        {loading ? 'Processing...' : 'Book Call ($100 USD)'}
      </button>

      <p className="form-note">
        💳 Your payment is secure and processed by Stripe. We never store your full card details.
      </p>
    </form>
  );
}

export default function BookingForm() {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <BookingFormContent />
    </Elements>
  );
}
