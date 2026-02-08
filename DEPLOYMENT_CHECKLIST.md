# Firebase Hosting & Cloud Functions Deployment Checklist

## Pre-Deployment Setup

### Step 1: Authenticate with Firebase
```bash
firebase login
```
This opens a browser to authenticate with your Google account. Use the account that owns the Firebase project.

### Step 2: Verify Project Configuration
```bash
firebase projects:list
```
Should show `manish-portfolio-bookings` in the list.

### Step 3: Verify firebase.json
The `.firebaserc` file should contain:
```json
{
  "projects": {
    "default": "manish-portfolio-bookings"
  }
}
```

## Environment Variables Configuration

### For Cloud Functions

Cloud Functions need access to secrets and API keys. Set these in two places:

#### Option A: Local Testing (.env in functions/ directory)
Create `functions/.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=jawa.manish@gmail.com
```

#### Option B: Production (Firebase Console)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `manish-portfolio-bookings` project
3. Go to Functions → Environment variables
4. Set all required variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `ADMIN_EMAIL`

**Or use Firebase CLI:**
```bash
firebase functions:config:set stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..." \
  email.user="your-email@gmail.com" \
  email.password="your-app-password" \
  admin.email="jawa.manish@gmail.com"
```

Then update functions code to read from `functions.config()`:
```javascript
const config = functions.config();
const stripeSecret = config.stripe.secret_key;
```

**Or use Runtime Env Vars (Node 16+, recommended):**
1. Set in Firebase Console directly
2. They're automatically injected as environment variables

### For Frontend

The frontend gets configuration from `.env.local`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_AUTH_DOMAIN`
- etc.

These are embedded at build time, so make sure they're correct before running `npm run build`.

## Local Testing with Emulator

### 1. Create Functions Environment File
Create `functions/.env` with test credentials:
```env
STRIPE_SECRET_KEY=sk_test_4eC39HqLyjWDarht...
STRIPE_WEBHOOK_SECRET=whsec_test_...
EMAIL_USER=test@gmail.com
EMAIL_PASSWORD=test-app-password
ADMIN_EMAIL=jawa.manish@gmail.com
```

### 2. Update Frontend for Emulator
Update `.env.local`:
```env
VITE_USE_EMULATOR=true
```

### 3. Start Emulator
```bash
npm run emulate
```

Emulator URLs:
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5001 (internal)
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099

### 4. Test API Endpoints
```bash
# Create a booking (no auth needed)
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","context":"Test booking"}'

# Get bookings (requires Firebase ID token)
curl -X GET http://localhost:5000/api/bookings/list \
  -H "Authorization: Bearer <firebase-id-token>"
```

### 5. Test in Browser
1. Open http://localhost:5000
2. Create a booking
3. Log in as admin (use Firebase emulator auth)
4. View and approve/reject bookings

## Building for Production

### Step 1: Build Frontend
```bash
npm run build
```
Creates `dist/` folder with optimized React app.

### Step 2: Verify Build
```bash
ls -la dist/
# Should contain: index.html, assets/, favicon.ico
```

### Step 3: Preview Hosting Locally
```bash
firebase hosting:channel:deploy preview
# Or preview with emulator:
firebase emulators:start --only hosting
```

## Deployment to Firebase

### Option 1: Deploy Everything (Recommended for first time)
```bash
npm run deploy:firebase
```

This deploys:
- Cloud Functions
- Hosting (frontend)
- Database rules (if any)

### Option 2: Deploy Components Separately

**Just Functions:**
```bash
npm run deploy:functions
```

**Just Hosting:**
```bash
npm run deploy:hosting
```

### Monitoring Deployment
```bash
# Watch deployment progress
firebase deploy --debug

# View deployment history
firebase hosting:channels:list

# View function logs
firebase functions:log
```

## Post-Deployment Configuration

### 1. Configure Stripe Webhook

Update Stripe webhook endpoint to point to Firebase:

**URL:** `https://manish-portfolio-bookings.firebaseapp.com/api/webhooks/stripe`

Or use the Cloud Functions URL directly:
`https://us-central1-manish-portfolio-bookings.cloudfunctions.net/api/webhooks/stripe`

**Events to listen:**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

### 2. Update Any External Services
If other services call your API (e.g., Cal.com webhooks), update URLs to:
```
https://manish-portfolio-bookings.firebaseapp.com/api/...
```

### 3. Set Up Monitoring

In Firebase Console:
1. Go to Functions → Logs
2. Monitor for errors
3. Set up alerts for failed invocations

## Testing in Production

### 1. Test Booking Creation
```bash
curl -X POST https://manish-portfolio-bookings.firebaseapp.com/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","context":"Production test"}'
```

### 2. Test Admin Functions
```bash
# Get ID token (via Firebase Console Auth)
curl -X GET https://manish-portfolio-bookings.firebaseapp.com/api/bookings/list \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

### 3. Test Stripe Webhook
```bash
# Use Stripe CLI to test
stripe trigger checkout.session.completed
```

## Troubleshooting

### "Error: No such service: apphosting"
This is expected if you haven't set up App Hosting. Ignore it.

### Functions show 502 errors
- Check Cloud Functions logs: `firebase functions:log`
- Verify environment variables are set
- Check for unhandled promise rejections

### Cold start is slow (first invocation)
This is normal for Cloud Functions. Subsequent invocations are faster.

### API returns 401 Unauthorized
- Verify admin email matches `ADMIN_EMAIL` in config
- Check Firebase ID token is valid
- Ensure user is authenticated

### Emails not sending
- Verify Gmail app password is set correctly
- Check if 2FA is enabled on Gmail account
- View Cloud Functions logs for nodemailer errors

## Rollback Plan

### If Something Breaks After Deployment

**Quick Rollback (keep current version deployed):**
```bash
# Deploy the previous version
firebase hosting:channels:deploy previous
```

**or redeploy the last working build:**
```bash
npm run build
firebase deploy --only hosting
```

**Full Rollback to Vercel:**
1. Keep old `/api` directory code (don't delete yet)
2. Deploy to Vercel: `vercel deploy`
3. Update frontend to point to Vercel URLs if needed

## Cleanup

### After Confirming Deployment is Stable

1. **Delete old API directory** (after 1-2 weeks of production use):
   ```bash
   rm -rf api/
   git add -A
   git commit -m "Remove deprecated Vercel API functions"
   ```

2. **Remove `.vercelignore` and `vercel.json`:**
   ```bash
   rm .vercelignore vercel.json
   ```

3. **Archive old code in git:**
   ```bash
   git tag -a vercel-deprecated-v1 -m "Last version using Vercel Serverless Functions"
   git push origin vercel-deprecated-v1
   ```

## Success Criteria

- [ ] Frontend loads at `https://manish-portfolio-bookings.firebaseapp.com`
- [ ] Booking creation works (no auth required)
- [ ] Admin can log in and view bookings
- [ ] Admin can approve/reject bookings
- [ ] Emails are sent on approval/rejection
- [ ] Stripe webhook receives and processes payments
- [ ] Cloud Functions logs show no errors
- [ ] Page load times are acceptable

## Next Review Points

- After 1 week of production: Check Cloud Functions cold start times
- After 1 month: Review cost metrics in Firebase Console
- Quarterly: Check for any deprecated dependencies

---

**Need Help?**
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
