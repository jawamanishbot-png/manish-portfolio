# Booking System MVP - Testing Guide

## Pre-Testing Checklist

- [ ] `.env.local` file created with all credentials
- [ ] Firebase project created and Firestore enabled
- [ ] Stripe test keys obtained
- [ ] Gmail account with 2FA and app password configured
- [ ] Google OAuth credentials set up with localhost redirect
- [ ] Dependencies installed: `npm install`

## Environment Setup

### 1. Firebase Setup (Required)

```bash
# Go to Firebase Console
# 1. Create new project: "manish-portfolio"
# 2. Create Firestore Database (test mode)
# 3. Get credentials from Project Settings > Service Accounts
# 4. Copy web credentials from Project Settings > General

# Update .env.local with:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# etc.
```

### 2. Stripe Test Keys (Required)

```bash
# Go to Stripe Dashboard > Developers > API Keys
# Copy test keys:
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Gmail App Password (Optional for Local Testing)

```bash
# Go to Google Account > Security > App passwords
# Generate 16-character password
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### 4. Google OAuth Client ID (Required for Admin)

```bash
# Go to Google Cloud Console > Credentials
# Create OAuth 2.0 Client ID for Web
# Add http://localhost:5173 to redirect URIs
# No separate variable needed - OAuth configured in Firebase
```

## Testing Flow

### Phase 1: Environment & Dependencies

```bash
cd /Users/myclaudputer/.openclaw/workspace/manish-portfolio
npm install
npm run dev
```

Expected: App runs on `http://localhost:5173`

### Phase 2: Frontend Components

1. **Visit Homepage**
   - URL: `http://localhost:5173/`
   - Look for "📅 Schedule a 25-Min Call" button
   - Button should be visible in hero section

2. **Open Booking Modal**
   - Click "Schedule a 25-Min Call"
   - Modal should appear with smooth animation
   - Should have close button (✕)
   - Check responsive design on mobile view

3. **Test Form Elements**
   - Email input should accept emails
   - Text area should accept multiple lines
   - Stripe card element should be visible
   - All inputs should be required

### Phase 3: Stripe Payment Integration

1. **Fill Booking Form**
   - Email: `test@example.com`
   - Topic: `Let's discuss AI/ML strategy`

2. **Test Stripe Payment**
   - Card Number: `4242 4242 4242 4242` (Stripe test card)
   - Expiry: Any future date (e.g., 12/26)
   - CVC: Any 3 digits (e.g., 123)
   - Click "Book Call ($100 USD)"

3. **Expected Behavior**
   - Loading state: "Processing..."
   - Success page: Green checkmark
   - Message: "Booking Request Submitted"
   - Form resets

4. **Verify in Firebase**
   - Go to Firebase Console > Firestore
   - Check `bookings` collection
   - Should see new document with:
     - `status: "pending"`
     - `email: "test@example.com"`
     - `payment_status: "pending"`

### Phase 4: Admin Dashboard - Unauthenticated

1. **Navigate to Admin**
   - URL: `http://localhost:5173/admin`
   - Should see login prompt
   - Should say "Sign in with Google"

2. **Try Login with Non-Admin Email**
   - Click "Sign In with Google"
   - Use different email (not jawa.manish@gmail.com)
   - Should see error: "Access denied. Only jawa.manish@gmail.com can access"

### Phase 5: Admin Dashboard - Authenticated

1. **Sign In with Admin Email**
   - Click "Sign In with Google"
   - Use: `jawa.manish@gmail.com`
   - Should show dashboard
   - Should display your email in top right

2. **View Bookings**
   - Should see filter buttons: Pending, Approved, Rejected, All
   - Should show your test booking in Pending list
   - Should display: email, topic, created date

3. **Test Filters**
   - Click "Pending": Should show 1 booking
   - Click "Approved": Should show 0 bookings
   - Click "All": Should show 1 booking

### Phase 6: Approve Booking Flow

1. **Click Approve Button**
   - Should open modal: "Approve Booking"
   - Shows user email and topic
   - Has input field for "Cal.com Event URL"

2. **Enter Cal.com URL**
   - Enter: `https://cal.com/manish/30min`
   - Click "Send Approval & Link"

3. **Expected Behavior**
   - Success alert: "Booking approved! User will receive..."
   - Modal closes
   - Booking moves to "Approved" filter
   - Shows green badge "Approved"
   - Displays Cal.com link

4. **Verify in Firebase**
   - Go to Firestore
   - Check booking document
   - Should have:
     - `status: "approved"`
     - `cal_event_url: "https://cal.com/..."`
     - `approved_at: [timestamp]`

### Phase 7: Reject Booking Flow (Optional)

1. **Create Another Test Booking**
   - Go back to `http://localhost:5173/`
   - Create new booking with `test2@example.com`
   - Complete payment with same Stripe card

2. **Reject from Admin**
   - Go to `/admin`
   - Should see 2 pending bookings
   - Click Reject on second booking
   - Confirm dialog

3. **Verify in Firebase**
   - Check booking status changed to `"rejected"`
   - Should have `rejected_at` timestamp

### Phase 8: Email Testing (Production Only)

In production with Gmail configured:

1. **Approved Booking Email**
   - User receives email: "Your Booking Request Approved"
   - Email contains Cal.com link
   - Can click to schedule

2. **Rejected Booking Email**
   - User receives email: "Your Booking Request - Update"
   - Professional rejection message

*Note: Emails won't send in development without Gmail credentials*

## Test Cards for Stripe

| Card Number | Use Case | Result |
|---|---|---|
| 4242 4242 4242 4242 | Standard success | Succeeds immediately |
| 4000 0025 0000 3155 | 3D Secure | Requires auth popup |
| 4000 0000 0000 9995 | Always declines | Declines |
| 5555 5555 5555 4444 | Mastercard | Succeeds immediately |

## Debugging Tips

### JavaScript Console Errors

```javascript
// Check Firebase config
firebase.initializeApp({...})

// Check API calls
fetch('/api/bookings/create', {...})
  .then(r => r.json())
  .then(d => console.log(d))
```

### Network Tab

1. Open DevTools > Network tab
2. Create booking
3. Check requests to `/api/bookings/create` and `/api/bookings/confirm`
4. Should see 200 status codes

### Firebase Console

1. Check Collections > bookings
2. Verify documents created
3. Check Authentication > Users (Google OAuth sign-ins)
4. Monitor Firestore reads/writes

### Stripe Dashboard

1. Go to Developers > Webhooks
2. Check webhook delivery
3. Go to Payments
4. Verify test transactions appear
5. Check test mode indicator (red banner)

## Test Results Checklist

### User Flow
- [ ] Booking button appears on homepage
- [ ] Modal opens/closes smoothly
- [ ] Form accepts all inputs
- [ ] Stripe payment processes successfully
- [ ] Success confirmation displays
- [ ] Booking appears in Firebase

### Admin Flow
- [ ] Login with Google works
- [ ] Non-admin email is rejected
- [ ] Admin can view bookings list
- [ ] Filters work (Pending/Approved/Rejected/All)
- [ ] Can approve booking
- [ ] Cal.com link is saved
- [ ] Can reject booking

### Integrations
- [ ] Firebase documents created correctly
- [ ] Stripe payment intents created
- [ ] Firebase auth tokens validate admin

## Known Limitations (Development)

1. **Email Sending**: Won't work without Gmail credentials
2. **Webhook Testing**: Requires ngrok or similar for local testing
3. **CORS**: Only works on localhost during development
4. **Rate Limiting**: Not implemented in development

## Next Steps After MVP Testing

1. **Deploy to Vercel**
   - Set environment variables in Vercel dashboard
   - Update Stripe webhook URL to production
   - Update Google OAuth redirect URI

2. **Production Firestore**
   - Switch from test mode to production rules
   - Set up automated backups
   - Configure audit logging

3. **Email Configuration**
   - Set up Gmail SMTP or SendGrid
   - Create email templates
   - Test on production with real user email

4. **Monitoring**
   - Set up Sentry for error tracking
   - Configure Stripe alert notifications
   - Enable Firebase performance monitoring

5. **Security**
   - Implement rate limiting
   - Add CSRF protection
   - Review Firestore security rules
   - Enable API key restrictions

## Support

If tests fail:
1. Check browser console for errors
2. Check Vercel/localhost terminal output
3. Verify all `.env.local` variables are set
4. Check Firebase Firestore rules (should be in test mode)
5. Verify Stripe test keys (not live keys)

Contact: Check CloudWatch/Vercel logs for API errors
