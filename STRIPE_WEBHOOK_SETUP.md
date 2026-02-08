# Stripe Webhook Configuration for Firebase

## Overview

Stripe webhooks require special handling because they need the raw request body to verify the webhook signature. This guide explains how to set it up with Firebase Cloud Functions.

## How It Works

### Signature Verification
1. Stripe sends a POST request with a `stripe-signature` header
2. The signature contains: timestamp, version, and HMAC signature
3. We reconstruct the request body and verify the signature matches
4. **Important**: The body must be the exact raw bytes, not parsed JSON

### Our Implementation

In `functions/src/index.js`, we handle this with middleware:

```javascript
// Middleware to handle raw body for Stripe webhooks
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON parser for other routes (after raw body parser)
app.use(express.json());
```

This ensures:
- Stripe webhook route receives raw Buffer
- Other routes receive parsed JSON

## Stripe Webhook Setup

### 1. Create a Stripe Webhook Endpoint

After deploying to Firebase, you'll have:
- **Hosting URL**: `https://manish-portfolio-bookings.firebaseapp.com`
- **Cloud Functions URL**: `https://us-central1-manish-portfolio-bookings.cloudfunctions.net`

Both work, but Hosting URL is cleaner. Use:
```
https://manish-portfolio-bookings.firebaseapp.com/api/webhooks/stripe
```

### 2. Configure in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → Webhooks
3. Click "Add endpoint"
4. Paste the endpoint URL: `https://manish-portfolio-bookings.firebaseapp.com/api/webhooks/stripe`
5. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded` (optional)
   - `checkout.session.async_payment_failed` (optional)
6. Click "Add endpoint"
7. Copy the webhook signing secret (starts with `whsec_`)

### 3. Configure Webhook Secret

Add the webhook secret to Cloud Functions environment:

#### Option A: Firebase Console
1. Firebase Console → Functions → Runtime environment variables
2. Add variable: `STRIPE_WEBHOOK_SECRET` = `whsec_...`

#### Option B: Firebase CLI
```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

Then update your code to read from config.

#### Option C: Runtime Secret Management (Recommended)
Use Google Secret Manager for better security:

```bash
gcloud secrets create stripe-webhook-secret --replication-policy="automatic"
echo -n "whsec_..." | gcloud secrets versions add stripe-webhook-secret --data-file=-
```

Then in functions/src/webhooks/stripe.js:
```javascript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

const webhookSecret = await client.accessSecretVersion({
  name: `projects/PROJECT_ID/secrets/stripe-webhook-secret/versions/latest`,
});
```

## Testing Webhooks Locally

### Using Stripe CLI

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)

2. Listen to webhooks:
```bash
stripe listen --forward-to localhost:5001/manish-portfolio-bookings/us-central1/api/webhooks/stripe
```

You'll get:
```
> Ready! Your webhook signing secret is: whsec_test_secret_...
```

3. Copy the signing secret to `functions/.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_test_secret_...
```

4. In another terminal, start the emulator:
```bash
npm run emulate
```

5. Trigger a test event:
```bash
stripe trigger checkout.session.completed
```

6. Watch logs:
```bash
firebase functions:log --follow
```

### Manual Testing (if Stripe CLI not available)

Get a Stripe test signing secret and create a test webhook payload:

```javascript
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_...');

// Get a test webhook signature
const payload = JSON.stringify({
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_...',
      payment_status: 'paid'
    }
  }
});

const timestamp = Math.floor(Date.now() / 1000);
const testSignature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: 'whsec_test_...'
});

// Now POST to localhost:5000/api/webhooks/stripe with this signature
```

## Webhook Handler Implementation

Our implementation in `functions/src/webhooks/stripe.js`:

```javascript
export const handleStripeWebhook = async (req, res) => {
  // Get the signature from headers
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    // Reconstruct the event from the raw body
    event = stripe.webhooks.constructEvent(
      req.body,  // This is the raw Buffer
      signature,
      webhookSecret
    );
  } catch (error) {
    // Signature verification failed
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      // Update booking in Firestore
      break;
    }
    // ... other event types
  }

  return res.status(200).json({ received: true });
};
```

## Common Issues & Solutions

### Issue 1: "Invalid Signature" Error

**Cause**: Body is being parsed as JSON before reaching the webhook handler.

**Solution**: Ensure `express.raw()` middleware is applied to the webhook route BEFORE `express.json()`:

```javascript
// ✓ Correct order
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());
```

```javascript
// ✗ Wrong order (will fail)
app.use(express.json());
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
```

### Issue 2: Webhook Not Received

**Cause**: Endpoint URL is incorrect or not accessible.

**Solution**:
1. Test the endpoint: `curl https://manish-portfolio-bookings.firebaseapp.com/api/webhooks/stripe`
   - Should return 405 (Method Not Allowed)
2. Check Stripe webhook delivery logs:
   - Stripe Dashboard → Webhooks → Select endpoint → Logs
3. Check Cloud Functions logs:
   - `firebase functions:log`

### Issue 3: Webhook Signature Fails in Production but Works Locally

**Cause**: Different webhook secrets for local testing vs production.

**Solution**:
1. Set `STRIPE_WEBHOOK_SECRET` in Firebase Console
2. Make sure to use production secret in production deployment
3. Use test webhook secret locally only

### Issue 4: "Cannot read property 'private_key' of undefined"

This is about Firebase Admin SDK initialization, not webhook-specific.

**Solution**: Ensure Cloud Functions have proper Firebase credentials (auto-provided by Firebase).

## Webhook Event Processing

We handle these Stripe events:

### checkout.session.completed
Fired when checkout completes (payment captured or scheduled).

```javascript
case 'checkout.session.completed': {
  const session = event.data.object;
  
  if (session.payment_status === 'paid') {
    // Update booking as paid
    await db.collection('bookings').doc(bookingId).update({
      payment_status: 'paid',
      status: 'paid',
      paid_at: new Date().toISOString()
    });
  }
  break;
}
```

### checkout.session.async_payment_succeeded
Fired when async payment (e.g., bank transfer) succeeds.

```javascript
case 'checkout.session.async_payment_succeeded': {
  const session = event.data.object;
  // Same as above - mark as paid
  break;
}
```

### checkout.session.async_payment_failed
Fired when async payment fails.

```javascript
case 'checkout.session.async_payment_failed': {
  const session = event.data.object;
  // Mark booking as payment failed
  await db.collection('bookings').doc(bookingId).update({
    payment_status: 'failed',
    payment_error: 'Async payment failed'
  });
  break;
}
```

## Monitoring Webhooks

### Via Firebase Console
1. Functions → Logs
2. Filter by function: `api`
3. Look for webhook invocations

### Via Stripe Dashboard
1. Developers → Webhooks
2. Select endpoint
3. View:
   - Delivery status (success/failed)
   - Response times
   - Error messages

### Via Logs
```bash
firebase functions:log --follow
```

## Updating Webhook Secret

If you need to rotate the webhook secret:

1. In Stripe Dashboard:
   - Webhooks → Select endpoint → Rotate signing secret
   - New secret is generated

2. Update in Firebase:
   - Console: Update `STRIPE_WEBHOOK_SECRET` environment variable
   - OR: `firebase functions:config:set stripe.webhook_secret="new_whsec_..."`

3. Redeploy functions:
   ```bash
   firebase deploy --only functions
   ```

## Security Best Practices

1. **Never hardcode secrets**: Use environment variables
2. **Use Google Secret Manager**: For production secrets
3. **Verify signatures**: Always verify webhook signature before processing
4. **Idempotent handlers**: Process same webhook multiple times safely
5. **Log events**: Log all webhook events for debugging
6. **Error handling**: Return 200 even on error (tell Stripe we received it)

## Examples

### Testing Local Webhook
```bash
# Terminal 1: Start emulator
npm run emulate

# Terminal 2: Listen to webhooks
stripe listen --forward-to localhost:5001/manish-portfolio-bookings/us-central1/api/webhooks/stripe

# Terminal 3: Trigger test event
stripe trigger checkout.session.completed

# Watch logs in Terminal 1
```

### Testing Production Webhook
```bash
# After deploying to Firebase
stripe trigger checkout.session.completed --live

# Or use the Stripe Dashboard to resend a webhook
# Developers → Webhooks → Select endpoint → Logs → Select event → Resend
```

---

For more details, see:
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe Signature Verification](https://stripe.com/docs/webhooks/signatures)
- [Firebase Cloud Functions with Express](https://firebase.google.com/docs/functions/http-events)
