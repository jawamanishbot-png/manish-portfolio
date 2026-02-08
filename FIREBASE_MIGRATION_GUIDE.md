# Firebase Hosting & Cloud Functions Migration Guide

This document explains the migration from Vercel Serverless Functions to Firebase Cloud Functions and Firebase Hosting.

## Overview

### Before (Vercel)
- **Frontend**: React + Vite served from Vercel
- **API**: Vercel Serverless Functions in `/api` directory
- **Backend**: Firebase Firestore + Firebase Auth
- **Issues**: Environment variable management on Vercel was problematic

### After (Firebase)
- **Frontend**: React + Vite served from Firebase Hosting
- **API**: Firebase Cloud Functions in `/functions` directory
- **Backend**: Firebase Firestore + Firebase Auth (same)
- **Benefits**: 
  - Unified platform (everything in Firebase)
  - Better environment variable handling
  - Same-origin API calls (no CORS issues)
  - Simplified deployment

## Project Structure

```
manish-portfolio/
├── src/                    # Frontend (React + Vite)
│   ├── components/        
│   ├── services/
│   │   └── api.js        # Updated to work with Firebase Functions
│   └── config/
├── functions/              # Cloud Functions (NEW)
│   ├── src/
│   │   ├── index.js       # Main entry point with Express routing
│   │   ├── bookings/      # Booking functions
│   │   ├── webhooks/      # Stripe webhook handler
│   │   ├── email.js       # Email utilities
│   │   └── firebase-admin.js  # Firebase Admin setup
│   └── package.json
├── api/                    # OLD: Vercel functions (deprecated, can be deleted)
├── firebase.json           # Firebase configuration (NEW)
├── .firebaserc             # Firebase project config (NEW)
├── .env.local             # Environment variables
└── package.json           # Updated scripts

```

## Setup Instructions

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Install Dependencies

```bash
# Install root dependencies (if needed)
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Environment Variables

The `.env.local` file contains all necessary configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=manish-portfolio-bookings
# ... other Firebase settings

# Cloud Functions need these in functions/.env or Firebase runtime config:
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_EMAIL=jawa.manish@gmail.com
```

#### Setting Environment Variables for Cloud Functions

**Option A: Using Firebase Console (Recommended for Production)**

1. Go to Firebase Console → Project Settings → Functions
2. Set environment variables in the runtime configuration tab

**Option B: Using Local Testing**

Create a `.env` file in the `functions/` directory with your secrets for local testing:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=jawa.manish@gmail.com
```

### 4. Local Development with Emulator

Start the Firebase emulator to test everything locally:

```bash
npm run emulate
```

This starts:
- **Hosting Emulator**: http://localhost:5000 (your React app)
- **Functions Emulator**: http://localhost:5001 (API)
- **Firestore Emulator**: http://localhost:8080
- **Auth Emulator**: http://localhost:9099

#### For Emulator Testing

Update `.env.local`:

```env
VITE_USE_EMULATOR=true
```

The frontend will automatically route API calls to `http://localhost:5001/manish-portfolio-bookings/us-central1/api`.

### 5. Build Frontend

```bash
npm run build
```

This creates the `dist/` folder used by Firebase Hosting.

### 6. Deploy to Firebase

#### Deploy Everything (Functions + Hosting)

```bash
npm run deploy:firebase
```

#### Deploy Only Functions

```bash
npm run deploy:functions
```

#### Deploy Only Hosting (Frontend)

```bash
npm run deploy:hosting
```

## API Endpoints

All API endpoints are now under the Firebase Cloud Functions:

### Development (Local)
- **Relative paths** (same as Vercel): `/api/bookings/create`, `/api/bookings/list`, etc.
- **With emulator**: `http://localhost:5001/manish-portfolio-bookings/us-central1/api/bookings/create`

### Production (Firebase Hosting)
- **Relative paths**: `/api/bookings/create`, `/api/bookings/list`, etc.
- **Direct Function URLs** (if needed):
  - `https://manish-portfolio-bookings.firebaseapp.com/api/bookings/create`
  - `https://us-central1-manish-portfolio-bookings.cloudfunctions.net/api/bookings/create`

## API Functions

### Booking Functions

#### POST /api/bookings/create
Creates a new booking request.

**Request:**
```json
{
  "email": "user@example.com",
  "context": "I want to discuss..."
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "auto-generated-id",
  "message": "Your request has been submitted..."
}
```

#### GET /api/bookings/list
Lists all bookings (admin only, requires Firebase ID token).

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "bookings": [
    {
      "id": "...",
      "email": "...",
      "status": "pending|approved|rejected",
      "created_at": "2024-02-08T...",
      ...
    }
  ]
}
```

#### POST /api/bookings/approve
Approves a booking and sends user a calendar link (admin only).

**Request:**
```json
{
  "bookingId": "...",
  "calEventUrl": "https://cal.com/..."
}
```

#### POST /api/bookings/reject
Rejects a booking and sends user notification (admin only).

**Request:**
```json
{
  "bookingId": "..."
}
```

### Webhooks

#### POST /api/webhooks/stripe
Stripe webhook handler for payment confirmations.

**Headers:**
```
stripe-signature: <stripe-signature>
```

## Migrating Stripe Webhook

After deploying to Firebase, update your Stripe webhook endpoint:

1. **Development (Local Emulator)**:
   - You can't receive webhooks on localhost
   - Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:5001/...`

2. **Production**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://manish-portfolio-bookings.firebaseapp.com/api/webhooks/stripe`
   - Or use the Cloud Functions URL: `https://us-central1-manish-portfolio-bookings.cloudfunctions.net/api/webhooks/stripe`

## Troubleshooting

### "Cannot find module 'firebase-admin'"
Make sure to run `npm install` in the `functions/` directory.

### "Emulator connection error"
Ensure Firebase emulator is running with `npm run emulate`.

### "401 Unauthorized" on admin endpoints
- Check that your Firebase ID token is valid
- Ensure `ADMIN_EMAIL` in environment matches your email
- Verify token hasn't expired

### Stripe webhook not working
- Check webhook signature is valid
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Look at Cloud Functions logs: `firebase functions:log`

### Email not sending
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Check Gmail app passwords are created (if using 2FA)
- Look at Cloud Functions logs for errors

## Frontend Changes

The frontend API service (`src/services/api.js`) has been updated to:

1. Support both relative paths (Firebase Hosting) and direct URLs (local emulator)
2. Automatically detect emulator mode from `VITE_USE_EMULATOR` environment variable
3. Route requests to the correct Cloud Functions endpoint

**No changes needed in components** - the API service handles routing automatically.

## Deployment Checklist

- [ ] Environment variables configured in Firebase Console
- [ ] Stripe webhook updated to new endpoint
- [ ] Email credentials (Gmail app password) set up
- [ ] `npm run build` succeeds without errors
- [ ] `firebase deploy` succeeds
- [ ] Test booking creation in production
- [ ] Test admin approval flow
- [ ] Test Stripe webhook (if applicable)
- [ ] Monitor Cloud Functions logs for errors

## Rollback Plan

If needed, you can rollback to Vercel:

1. The old `/api` directory is still present but unused
2. Deploy to Vercel with `vercel deploy`
3. Update frontend to use Vercel URLs if needed

## Next Steps

1. Delete the old `/api` directory once everything is stable on Firebase
2. Monitor Cloud Functions logs for performance and errors
3. Consider setting up Cloud Monitoring alerts
4. Document any custom configuration in your team wiki

---

For more info: [Firebase Hosting](https://firebase.google.com/docs/hosting) | [Cloud Functions](https://firebase.google.com/docs/functions)
