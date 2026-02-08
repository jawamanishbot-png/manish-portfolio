# Manish Jawa - Booking System

A modern booking and payment system for consulting sessions with Manish Jawa. Built with React + Vite frontend, Node.js serverless backend (Vercel), Firebase database, and Stripe for secure payments.

## 🎯 Features

- **Stripe Checkout Integration**: Secure hosted checkout experience
- **Firebase Database**: Real-time booking storage and management
- **Admin Dashboard**: Review, approve, and reject booking requests
- **Google OAuth**: Secure admin authentication
- **Cal.com Integration**: Schedule meetings after payment confirmation
- **Email Notifications**: Automated confirmations and scheduling links
- **Responsive Design**: Works on desktop and mobile devices

## 🔄 Booking Flow

### User Experience

1. **Browse & Submit Request**
   - User visits the portfolio site
   - Clicks "Book a Call" button
   - Fills in email and topic/context
   - Clicks "Book Call ($100 USD)"

2. **Payment**
   - User is redirected to Stripe Checkout (hosted)
   - User enters card details securely
   - User completes payment
   - Receives success page with confirmation

3. **Admin Review**
   - Payment webhook triggers (Stripe → Your Backend)
   - Booking status changes to "paid"
   - Admin Dashboard shows new paid booking
   - Admin reviews context and approves/rejects

4. **Scheduling**
   - If approved: Admin sends Cal.com scheduling link via email
   - User receives link, selects preferred time
   - Meeting is scheduled

### Technical Flow

```
User Form
   ↓
POST /api/bookings/create
   ↓ (Backend)
Create Stripe Checkout Session
Store booking (pending)
   ↓
Return checkout_url
   ↓
Redirect to: https://checkout.stripe.com/pay/{session_id}
   ↓ (Stripe Hosted)
User Completes Payment
   ↓
Webhook: checkout.session.completed
   ↓ (Backend)
Update booking status → "paid"
   ↓
Admin Dashboard shows "Paid - Awaiting Review"
   ↓
Admin approves + sends Cal.com link
   ↓
User receives email with scheduling link
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Vercel account (for deployment)
- Firebase project
- Stripe account
- Google OAuth credentials

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (Test Keys)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Admin Configuration
ADMIN_EMAILS=jawa.manish@gmail.com

# Cal.com Configuration
CAL_COM_API_KEY=your_cal_com_api_key

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Firebase Service Account (for backend)
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json

# Application URLs
VITE_APP_URL=http://localhost:5173
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Endpoints

### Create Booking
- **POST** `/api/bookings/create`
- **Body**: `{ email, context }`
- **Response**: `{ bookingId, session_id, checkout_url }`

### List Bookings (Admin)
- **GET** `/api/bookings/list`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ bookings: [...] }`

### Approve Booking (Admin)
- **POST** `/api/bookings/approve`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ bookingId, calEventUrl }`
- **Response**: `{ success: true, message: "..." }`

### Reject Booking (Admin)
- **POST** `/api/bookings/reject`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ bookingId }`
- **Response**: `{ success: true, message: "..." }`

### Stripe Webhook
- **POST** `/api/webhooks/stripe`
- **Header**: `stripe-signature: {signature}`
- **Handled Events**:
  - `checkout.session.completed` - Payment successful
  - `checkout.session.async_payment_succeeded` - Async payment succeeded
  - `checkout.session.async_payment_failed` - Async payment failed

## 🔐 Security Features

- **Stripe Webhook Verification**: All webhooks verified with signature
- **JWT Authentication**: Admin routes protected with JWT tokens
- **Firebase Admin SDK**: Secure backend database access
- **Google OAuth**: Only authorized admin can access dashboard
- **HTTPS Only**: Checkout and webhooks require HTTPS
- **No Card Storage**: Cards handled by Stripe, never stored locally

## 📊 Booking Statuses

| Status | Description | Actions |
|--------|-------------|---------|
| **pending** | Initial booking created, awaiting payment | User: Complete payment |
| **paid** | Payment received, awaiting admin review | Admin: Approve/Reject |
| **approved** | Admin approved, Cal.com link sent | User: Schedule time |
| **rejected** | Admin rejected booking | User: Create new request |

## 🎨 Frontend Structure

```
src/
├── components/
│   ├── BookingForm.jsx         # Main form (redirects to Stripe Checkout)
│   ├── BookingModal.jsx        # Modal wrapper for form
│   ├── AdminDashboard.jsx      # Admin panel for managing bookings
│   └── *.css                   # Component styles
├── pages/
│   ├── CheckoutSuccess.jsx     # Success page after payment
│   └── CheckoutCancel.jsx      # Cancellation page
├── services/
│   └── api.js                  # API client functions
├── config/
│   └── stripe.js               # Stripe initialization
└── App.jsx                     # Main routing
```

## ⚙️ Backend Structure

```
api/
├── bookings/
│   ├── create.js               # Create checkout session
│   ├── list.js                 # List all bookings (admin)
│   ├── approve.js              # Approve booking
│   ├── reject.js               # Reject booking
│   └── confirm.js              # Legacy endpoint
├── webhooks/
│   └── stripe.js               # Stripe webhook handler
└── utils/
    └── firebase-admin.js       # Firebase initialization
```

## 🧪 Testing Stripe Checkout

### Test Card Numbers

Use these in Stripe Checkout (test mode):

- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **Decline**: `4000 0000 0000 0002`

Any future expiry date and any 3-digit CVC

### Testing Locally

1. Start dev server: `npm run dev`
2. Click "Book a Call" on the homepage
3. Fill in test email and topic
4. Click "Book Call"
5. Use test card `4242 4242 4242 4242`
6. Complete payment
7. Should redirect to `/checkout/success?session_id=...`

### Admin Testing

1. Visit `http://localhost:5173/admin`
2. Sign in with Google (test account)
3. Should show "Paid - Awaiting Review" section
4. Click "Approve" on a paid booking
5. Enter a test Cal.com URL
6. Send approval

## 📝 Stripe Webhook Setup

In Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Add new endpoint:
   - **URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Events**: Select:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
3. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## 🚀 Deployment to Vercel

### 1. Configure Vercel Project

```bash
vercel link
```

### 2. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add all env vars from `.env.local`

### 3. Deploy

```bash
npm run build
vercel deploy --prod
```

### 4. Update Stripe Webhook

1. In Stripe Dashboard, update webhook URL to your Vercel domain:
   - `https://yourdomain.vercel.app/api/webhooks/stripe`

## 🔄 Database Schema

### Bookings Collection

```json
{
  "id": "booking_123",
  "email": "user@example.com",
  "context": "Discussion about leadership...",
  "status": "paid",
  "payment_status": "paid",
  "stripe_session_id": "cs_test_...",
  "payment_intent_id": "pi_...",
  "cal_event_url": "https://cal.com/manish/...",
  "created_at": "2026-02-08T12:00:00.000Z",
  "updated_at": "2026-02-08T12:05:00.000Z",
  "paid_at": "2026-02-08T12:01:00.000Z"
}
```

## 🐛 Troubleshooting

### Stripe Checkout Not Redirecting

- Check `VITE_APP_URL` is correct in `.env.local`
- Ensure Stripe test keys are set
- Check browser console for errors

### Webhook Not Triggering

- Verify webhook secret in Stripe Dashboard
- Check Vercel logs: `vercel logs`
- Ensure webhook endpoint is receiving POST requests

### Admin Can't See Paid Bookings

- Verify booking status is "paid" in Firebase
- Check that user is logged in with correct Google account
- Verify `ADMIN_EMAILS` contains the admin email

### Payment Succeeds But No Booking Update

- Check webhook logs in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` matches in Vercel
- Check Firebase database permissions

## 📚 Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cal.com API](https://cal.com/docs/api)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

## 📄 License

All rights reserved. © Manish Jawa 2026.

## 🤝 Support

For questions or issues, contact: jawa.manish@gmail.com
