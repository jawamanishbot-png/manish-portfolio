# Stripe Checkout Migration Guide

## Overview

This document outlines the changes made to migrate from **embedded Stripe Payment Element** to **Stripe Checkout (hosted)**.

## ✨ Benefits of Stripe Checkout

1. **Better Conversion**: Hosted checkout optimized for conversion
2. **Fewer Integration Issues**: Stripe handles the UI/UX
3. **Payment Methods**: Automatically supports Apple Pay, Google Pay, Link, and more
4. **PCI Compliance**: Fully PCI DSS compliant
5. **Mobile Optimized**: Native mobile payment experience
6. **Fraud Prevention**: Built-in fraud detection

## 🔄 Changed Components

### Backend API (`/api/bookings/create.js`)

#### Before (PaymentIntent)
```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000,
  currency: 'usd',
  metadata: { email, context },
});

return res.status(200).json({
  bookingId,
  clientSecret: paymentIntent.client_secret,
});
```

#### After (Checkout Session)
```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Consultation...' },
      unit_amount: 10000,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.VITE_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.VITE_APP_URL}/checkout/cancel`,
  customer_email: email,
  metadata: { email, context },
});

return res.status(200).json({
  bookingId,
  session_id: session.id,
  checkout_url: session.url,
});
```

**Key Changes:**
- Create Checkout Session instead of PaymentIntent
- Return `checkout_url` (Stripe's hosted page URL)
- Set success/cancel URLs for redirect flow
- Store `stripe_session_id` instead of `payment_intent_id`

---

### Frontend (`BookingForm.jsx`)

#### Before (Embedded CardElement)
```javascript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function BookingFormContent() {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    // Create booking
    const { clientSecret } = await createBooking(email, context);
    
    // Confirm payment locally
    const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { email },
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement /> {/* Embedded payment form */}
      <button disabled={!stripe || !elements}>Pay</button>
    </form>
  );
}

export default function BookingForm() {
  return (
    <Elements stripe={getStripe()}>
      <BookingFormContent />
    </Elements>
  );
}
```

#### After (Redirect to Checkout)
```javascript
function BookingForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create booking and get checkout URL
    const { checkout_url } = await createBooking(email, context);
    
    // Redirect to Stripe Checkout
    window.location.href = checkout_url;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" ... /> {/* No card input! */}
      <button type="submit">Book Call ($100)</button>
    </form>
  );
}
```

**Key Changes:**
- Removed `@stripe/react-stripe-js` Elements/CardElement
- Removed `Elements` wrapper
- Redirect to Stripe's hosted checkout instead of handling locally
- Much simpler form - just email and topic
- No card input on your site

---

### Webhook Handler (`/api/webhooks/stripe.js`)

#### Before (PaymentIntent Events)
```javascript
case 'payment_intent.succeeded': {
  const paymentIntent = event.data.object;
  
  const bookingsSnapshot = await db.collection('bookings')
    .where('payment_intent_id', '==', paymentIntent.id)
    .get();
  
  await bookingRef.update({
    payment_status: 'succeeded',
    paid_at: new Date().toISOString(),
  });
  break;
}
```

#### After (Checkout Session Events)
```javascript
case 'checkout.session.completed': {
  const session = event.data.object;
  
  const bookingsSnapshot = await db.collection('bookings')
    .where('stripe_session_id', '==', session.id)
    .get();
  
  if (session.payment_status === 'paid') {
    await bookingRef.update({
      payment_status: 'paid',
      status: 'paid', // Awaiting admin review
      stripe_session_id: session.id,
      payment_intent_id: session.payment_intent,
      paid_at: new Date().toISOString(),
    });
  }
  break;
}
```

**Key Changes:**
- Listen for `checkout.session.completed` instead of `payment_intent.succeeded`
- Query by `stripe_session_id` instead of `payment_intent_id`
- Set status to `"paid"` (awaiting admin review) instead of auto-approving
- Handle `checkout.session.async_payment_*` events for delayed payments

---

### Database Schema

#### Before
```json
{
  "id": "booking_123",
  "email": "...",
  "status": "pending", // or "approved"
  "payment_intent_id": "pi_...",
  "payment_status": "pending" // or "succeeded"
}
```

#### After
```json
{
  "id": "booking_123",
  "email": "...",
  "status": "pending" // or "paid" or "approved"
  "stripe_session_id": "cs_test_...",
  "payment_intent_id": "pi_...", // From session
  "payment_status": "paid" // or "failed"
}
```

**Key Changes:**
- Added `stripe_session_id` (primary identifier for webhooks)
- `status` can now be `"paid"` (admin review stage)
- `payment_status` = "paid" when Stripe confirms

---

## 📊 Booking Flow Changes

### Before
```
User fills form with card details
       ↓
confirmCardPayment() → immediate confirmation
       ↓
Webhook confirms payment
       ↓
Status: "approved" (auto-approved)
```

### After
```
User fills form (no card yet)
       ↓
Redirect to Stripe Checkout (hosted)
       ↓
User pays on Stripe's page
       ↓
Webhook: checkout.session.completed
       ↓
Status: "paid" (awaiting admin review)
       ↓
Admin Dashboard shows paid bookings
       ↓
Admin approves + sends Cal.com link
```

---

## 🎯 Admin Dashboard Updates

### New "Paid - Awaiting Review" Filter

Added filter to show paid bookings that need admin review:

```javascript
<button className="filter-btn">
  💰 Paid - Awaiting Review (5)
</button>
```

Admin can now:
1. Review paid booking details
2. Approve → sends Cal.com link
3. Reject → optional refund

---

## 🔗 New Pages

### `/checkout/success`
- Shown after Stripe Checkout completes successfully
- Displays confirmation message
- Shows session ID and amount
- Link back to home

### `/checkout/cancel`
- Shown if user cancels payment
- No charges made to card
- Encourages user to try again
- Support contact link

---

## 🔐 Security Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Card Input | Your site (risky) | Stripe's hosted page (safe) |
| PCI Compliance | Complex | Fully handled by Stripe |
| Fraud Detection | Manual | Stripe's AI-powered |
| Payment Methods | Card only | Card, Apple Pay, Google Pay, Link |
| Mobile UX | Manual implementation | Optimized by Stripe |

---

## 📝 Migration Checklist

- [x] Refactor `api/bookings/create.js` to create Checkout Session
- [x] Update `BookingForm.jsx` to remove CardElement
- [x] Update webhook handler for `checkout.session.completed`
- [x] Create success page (`CheckoutSuccess.jsx`)
- [x] Create cancel page (`CheckoutCancel.jsx`)
- [x] Update App.jsx routing
- [x] Update AdminDashboard to show "paid" status
- [x] Update API service to remove `confirmBooking` call
- [x] Test with Stripe test keys
- [x] Update documentation

---

## 🧪 Testing Checklist

### Local Testing

1. **Booking Creation**
   - [ ] Fill form with valid email and topic
   - [ ] Click "Book Call"
   - [ ] Verify redirect to Stripe Checkout

2. **Payment**
   - [ ] Enter test card `4242 4242 4242 4242`
   - [ ] Complete payment
   - [ ] Verify redirect to `/checkout/success`

3. **Webhook**
   - [ ] Check Firebase database for updated booking
   - [ ] Verify status changed to "paid"
   - [ ] Verify `stripe_session_id` is stored

4. **Admin**
   - [ ] Visit `/admin`
   - [ ] Sign in with Google
   - [ ] Verify paid booking appears
   - [ ] Approve and send Cal.com link

5. **Cancel Flow**
   - [ ] Go through checkout again
   - [ ] Click "Cancel" in Stripe Checkout
   - [ ] Verify redirect to `/checkout/cancel`

### Production Testing

1. Update `STRIPE_WEBHOOK_SECRET` with production key
2. Update success/cancel URLs to production domain
3. Test with real payment (use Stripe test mode first)
4. Verify webhook delivery in Stripe Dashboard
5. Monitor error logs in Vercel

---

## 🚀 Deployment

### Environment Variables to Update

```env
# Ensure these are correct
VITE_APP_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

### Stripe Webhook Setup

1. Add new endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`

2. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Post-Deployment

1. Test with real test payment
2. Monitor webhook delivery in Stripe Dashboard
3. Check Vercel logs for any errors
4. Send test email to admin to confirm bookings appear

---

## 📊 Metrics to Track

- **Conversion Rate**: Compare before/after payment completion rates
- **Failed Payments**: Monitor `checkout.session.async_payment_failed` events
- **Booking Volume**: Dashboard shows count by status
- **Admin Response Time**: Time from "paid" to "approved"

---

## 💡 Future Improvements

1. **Discount Codes**: Add coupon support in Checkout Session
2. **Subscription**: Option for recurring monthly sessions
3. **Payment Plans**: Multiple installments
4. **Tax**: Add tax calculation based on location
5. **Analytics**: Track conversion funnel metrics
6. **Email Templates**: Customize confirmation emails

---

## 🆘 Support

For issues or questions:
- Check Stripe Dashboard logs
- Review Vercel function logs
- Verify environment variables
- Test webhook manually in Stripe
- Contact: jawa.manish@gmail.com
