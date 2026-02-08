# Booking System Setup Guide

This guide covers the complete setup and deployment of the booking system for Manish Jawa's portfolio.

## Overview

The booking system includes:
- **User Flow**: Portfolio → Booking Modal → Payment Form (Stripe) → Confirmation
- **Admin Dashboard**: Google OAuth login → View bookings → Approve/Reject → Send Cal.com links
- **Tech Stack**:
  - Frontend: React + Vite
  - Backend: Vercel Serverless Functions
  - Database: Firebase Firestore
  - Payment: Stripe
  - Calendar: Cal.com
  - Auth: Google OAuth (Admin)
  - Email: Gmail SMTP via Nodemailer

## Prerequisites

1. **Google Cloud Project** (for Firebase & OAuth)
2. **Stripe Account** (for payments)
3. **Gmail Account** (for sending emails)
4. **Cal.com Account** (for scheduling)
5. **Vercel Account** (for deployment)

## Step 1: Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: `manish-portfolio-booking`
3. Enable Firestore Database:
   - Go to "Firestore Database"
   - Click "Create Database"
   - Choose "Start in test mode" (for development)
   - Select region: `us-central1`

### Create Firestore Collections

The system will auto-create collections, but you can pre-create them:

**Collection: `bookings`**
```
Document structure:
{
  id: string,
  email: string,
  context: string,
  status: "pending" | "approved" | "rejected",
  payment_intent_id: string,
  payment_id: string,
  payment_status: "pending" | "succeeded" | "failed",
  cal_event_url: string,
  created_at: ISO timestamp,
  updated_at: ISO timestamp,
  paid_at: ISO timestamp,
  approved_at: ISO timestamp,
  rejected_at: ISO timestamp,
}
```

### Get Firebase Credentials

1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file
4. Extract these values:
   - `project_id`
   - `private_key`
   - `client_email`
   - And others for `.env.local`

### Get Frontend API Keys

1. Go to Project Settings → General
2. Copy Firebase config values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

## Step 2: Stripe Setup

### Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to "Developers" → "API Keys"
3. Copy:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### Create Webhook Endpoint

1. Go to "Developers" → "Webhooks"
2. Click "Add an endpoint"
3. URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Events: Select `payment_intent.succeeded` and `payment_intent.payment_failed`
5. Copy the **Signing Secret** (starts with `whsec_`)

## Step 3: Google OAuth Setup

### Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Application type: Web application
6. Authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://your-domain.vercel.app` (production)
7. Copy the **Client ID** (for frontend)

## Step 4: Gmail Setup (Email Sending)

### Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication (if not enabled)
3. Go to "App passwords"
4. Select "Mail" and "Windows Computer" (or custom)
5. Generate password (16 characters)
6. Copy this password (don't use your actual Gmail password)

## Step 5: Environment Variables

### Create `.env.local` (Development)

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials from steps 1-4.

### Create `.env.production.local` (Production)

Same variables but with production keys from Stripe & Firebase.

## Step 6: Local Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Test Booking Flow

1. Click "Schedule a 25-Min Call" button
2. Enter test email: `test@example.com`
3. Enter test topic: `Discuss AI/ML strategy`
4. Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Click "Book Call ($100 USD)"
6. Should see success confirmation

### Test Admin Dashboard

1. Navigate to `http://localhost:5173/admin`
2. Click "Sign In with Google"
3. Must use `jawa.manish@gmail.com` (configured in `.env.local`)
4. View pending bookings
5. Click "Approve" and enter a Cal.com URL: `https://cal.com/manish/demo`
6. Booking should update and email would be sent (in production)

## Step 7: Deployment to Vercel

### Deploy Frontend

```bash
# Commit all changes
git add .
git commit -m "feat: add booking system"

# Push to GitHub
git push origin feature/booking-system

# Create pull request and merge to main
```

### Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/)
2. Import your GitHub project
3. Configure environment variables:
   - Go to "Settings" → "Environment Variables"
   - Add all variables from `.env.production.local`
4. Deploy

### Post-Deployment

1. Update Stripe webhook URL to production domain
2. Update Google OAuth redirect URI to production domain
3. Test payment flow on production
4. Monitor Stripe logs for webhook events

## Step 8: Cal.com Setup (Optional)

If using Cal.com for scheduling:

1. Create account at [cal.com](https://cal.com/)
2. Set up an event type (e.g., "30-min consulting call")
3. Get the public event URL: `https://cal.com/username/event-slug`
4. Use this URL when approving bookings in admin dashboard

Alternatively, use Calendly: `https://calendly.com/username/event`

## Database Schema

### bookings Collection

```javascript
{
  id: "booking_uuid",
  email: "user@example.com",
  context: "User's discussion topic",
  status: "pending", // pending, approved, rejected
  payment_intent_id: "pi_xxxxx",
  payment_id: "pi_xxxxx",
  payment_status: "succeeded", // pending, succeeded, failed
  cal_event_url: "https://cal.com/manish/call",
  created_at: "2024-02-08T12:00:00Z",
  updated_at: "2024-02-08T12:00:00Z",
  paid_at: "2024-02-08T12:00:01Z",
  approved_at: "2024-02-08T14:00:00Z",
  approved_by: "jawa.manish@gmail.com",
  rejected_at: null,
}
```

## API Endpoints

All endpoints are Vercel serverless functions:

### POST `/api/bookings/create`
Create booking and get Stripe payment intent
- Body: `{ email, context }`
- Response: `{ bookingId, clientSecret, amount }`

### POST `/api/bookings/confirm`
Confirm payment and finalize booking
- Body: `{ bookingId, paymentIntentId }`
- Response: `{ success, message, bookingId }`

### GET `/api/bookings/list`
Get all bookings (admin only)
- Auth: Bearer token (Firebase ID token)
- Response: `{ bookings: [...] }`

### POST `/api/bookings/approve`
Approve booking and send Cal.com link email
- Auth: Bearer token
- Body: `{ bookingId, calEventUrl }`
- Response: `{ success, message, bookingId }`

### POST `/api/bookings/reject`
Reject booking and send rejection email
- Auth: Bearer token
- Body: `{ bookingId }`
- Response: `{ success, message, bookingId }`

### POST `/api/webhooks/stripe`
Stripe webhook for payment events
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Monitoring

### Stripe Dashboard
- Monitor transactions
- Check webhook delivery
- Review test vs. live payments

### Firebase Console
- Monitor Firestore reads/writes
- Check authentication logs
- View database structure

### Vercel Logs
- Monitor function execution
- Check error logs
- View performance metrics

## Troubleshooting

### "Access denied" in admin dashboard
- Ensure you're logged in with `jawa.manish@gmail.com`
- Check `VITE_ADMIN_EMAIL` environment variable

### Stripe payment fails
- Use test card: `4242 4242 4242 4242`
- Use future expiry date and any CVC
- Check Stripe dashboard for error messages

### Emails not sending
- Verify Gmail app password is correct
- Check 2FA is enabled on Gmail account
- Check email logs in Firebase functions

### Firebase auth fails
- Verify service account JSON is correctly parsed
- Check `FIREBASE_PRIVATE_KEY` includes `\n` characters
- Ensure Firestore Database is created and in test mode (dev)

## Production Checklist

- [ ] Firebase Firestore security rules updated (not test mode)
- [ ] Stripe keys switched to production
- [ ] Gmail credentials configured
- [ ] Google OAuth credentials updated for production domain
- [ ] Stripe webhook URL updated to production
- [ ] Admin email verified in environment
- [ ] Database backups enabled
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] SSL certificate enabled on Vercel
- [ ] Rate limiting configured on API endpoints
- [ ] Analytics tracking added
- [ ] Test full user flow on production

## Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Stripe test keys** - Only for development
3. **Firebase test mode** - Switch to production rules before launch
4. **Email passwords** - Use app passwords, not main passwords
5. **Private keys** - Securely store Firebase service account key
6. **CORS** - Already configured for Vercel domains
7. **Rate limiting** - Implement to prevent abuse

## Support

For issues or questions:
- Check Stripe documentation: https://stripe.com/docs
- Check Firebase docs: https://firebase.google.com/docs
- Check Vercel docs: https://vercel.com/docs
