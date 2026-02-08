# Booking System - Quick Start Guide

## 5-Minute Setup for Local Development

### Step 1: Clone & Install
```bash
cd /path/to/manish-portfolio
npm install
```

### Step 2: Create `.env.local`
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Step 3: Fill in Credentials

Get these from:

**Firebase** (firebase.google.com)
- Create new project
- Enable Firestore
- Copy from Project Settings → General:
```
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Stripe** (stripe.com/docs/testing)
```
VITE_STRIPE_PUBLIC_KEY=pk_test_51ABC...
STRIPE_SECRET_KEY=sk_test_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_test_1...  (optional for local)
```

**Google OAuth** (console.cloud.google.com)
- Create OAuth 2.0 Web application
- Add `http://localhost:5173` to authorized redirect URIs
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456...
```

**Admin Email** (who can access `/admin`)
```
ADMIN_EMAILS=jawa.manish@gmail.com
```

### Step 4: Create Firebase Collections

In Firebase Console → Firestore:

1. Create collection: `bookings` (auto-generated IDs)
2. Create collection: `admin_users` (custom doc IDs = google_id)

No initial data needed - will be created by the app.

### Step 5: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## Quick Test Flow (2 minutes)

1. **Click "Schedule a 25-Min Call"** button
2. **Fill form:**
   - Email: `test@example.com`
   - Topic: `Let's discuss AI/ML`
3. **Enter Stripe card:** `4242 4242 4242 4242`
4. **Click "Book Call"** → See success message
5. **Go to `/admin`** → Sign in with Google
6. **Approve booking** with Cal.com link: `https://cal.com/manish/30min`
7. **Check Firebase** → Booking should be approved

## Deploy to Vercel (5 minutes)

### Step 1: Push to Git
```bash
git add .
git commit -m "feat: booking system ready for deployment"
git push origin feature/booking-system
```

### Step 2: Connect to Vercel
1. Go to vercel.com
2. Import project from GitHub
3. Select `feature/booking-system` branch

### Step 3: Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

Copy all variables from `.env.local` EXCEPT:
- Remove `VITE_` prefix for backend variables
- Keep `VITE_` prefix for frontend variables

### Step 4: Add Firebase Service Account (Production Only)
1. In Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Paste entire JSON as `FIREBASE_SERVICE_ACCOUNT_KEY`

### Step 5: Deploy
```bash
git push origin feature/booking-system
```

Vercel auto-deploys. Check vercel.com for deployment status.

## Verify Deployment

1. Visit your Vercel URL
2. Test booking flow
3. Go to `/admin` and sign in
4. Approve/reject bookings
5. Check Stripe Dashboard → Payments for transactions

## Troubleshooting

### Firebase: "Permission denied"
→ Firestore is in production mode. Temporarily set to test mode, or use production rules

### Stripe: Payment fails
→ Using live key? Use test keys with `4242 4242 4242 4242` card

### Google OAuth: "Unauthorized"
→ Email not in `ADMIN_EMAILS` or not added to Google OAuth authorized redirect URIs

### Admin dashboard: Can't sign in
→ Check browser console for errors, verify Google CLIENT_ID in `.env.local`

## File Structure Overview

```
src/
  └── components/
      ├── BookingModal.jsx      ← Scheduling button & modal
      ├── BookingForm.jsx       ← Payment form
      └── AdminDashboard.jsx    ← Admin panel

api/
  ├── auth/google.js            ← Google OAuth verification
  ├── bookings/
  │   ├── create.js             ← Start payment
  │   ├── confirm.js            ← Confirm payment
  │   ├── list.js               ← Get all bookings
  │   ├── approve.js            ← Send Cal.com link
  │   └── reject.js             ← Reject & notify
  └── stripe/webhook.js         ← Payment confirmations
```

## Next Steps

After deployment:
1. ✅ Update Google OAuth redirect URI to your Vercel domain
2. ✅ Update Stripe webhook URL to `https://your-domain/api/stripe/webhook`
3. ✅ Set up email provider (SendGrid/Mailgun) for notifications
4. ✅ Configure Firebase production Firestore rules
5. ✅ Monitor errors in Vercel logs

## Support Files

- **README.md** - Full documentation
- **MVP_TESTING.md** - Detailed testing guide
- **.env.example** - All environment variables
- **QUICKSTART.md** - This file!

## Success Checklist

- [ ] `.env.local` filled with all credentials
- [ ] Firebase Firestore collections created
- [ ] `npm install` completed
- [ ] `npm run dev` running on localhost:5173
- [ ] Booking form visible on homepage
- [ ] Test booking payment succeeds
- [ ] Admin dashboard accessible at `/admin`
- [ ] Can approve/reject bookings in admin
- [ ] Booking data visible in Firebase Firestore

## Issues?

1. Check **MVP_TESTING.md** for detailed test flows
2. Check **README.md** for comprehensive docs
3. Look at browser console for client errors
4. Check Vercel logs for server errors
5. Verify all `.env.local` variables are correct

**Ready to go!** 🚀
