# Vercel Deployment Guide

This guide walks through deploying the booking system to production on Vercel.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier works)
- All credentials from `BOOKING_SYSTEM_SETUP.md` ready

## Step 1: Push to GitHub

```bash
cd /Users/myclaudputer/.openclaw/workspace/manish-portfolio

# Make sure branch is clean
git status

# Push feature branch
git push origin feature/booking-system

# Create Pull Request on GitHub
# - Review changes
# - Merge to main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project: No (first time)
# - Project name: manish-portfolio
# - Framework: Vite (auto-detected)
# - Build command: npm run build
```

### Option B: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New"** → **"Project"**
3. **Import GitHub Project**
   - Select your repository: `manish-portfolio`
   - Click "Import"

4. **Configure Project Settings**
   - Framework: Vite (should be auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables** (Critical!)
   - Click "Environment Variables"
   - Add ALL variables from `.env.production.local`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   VITE_ADMIN_EMAIL=jawa.manish@gmail.com
   ADMIN_EMAIL=jawa.manish@gmail.com
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=...
   FIREBASE_PRIVATE_KEY_ID=...
   FIREBASE_PRIVATE_KEY=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_CLIENT_ID=...
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=...
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~5 minutes)
   - You'll get a production URL: `https://manish-portfolio.vercel.app`

## Step 3: Post-Deployment Configuration

### 1. Update Stripe Webhook

Your Vercel deployment URL is now live. Update Stripe:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Find your existing webhook endpoint
3. Update URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Or create new endpoint if needed
4. Test webhook delivery

### 2. Update Google OAuth Redirect URI

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID for Web
3. Update Authorized redirect URIs:
   - Add: `https://your-domain.vercel.app`
   - Keep: `http://localhost:5173` (for local dev)
4. Save

### 3. Update Firebase Security Rules

Firebase is currently in "test mode". Switch to production rules:

1. Go to Firebase Console → Firestore Database
2. Click "Rules" tab
3. Replace test rules with production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bookings - Authenticated users can only read their own
    match /bookings/{document=**} {
      allow write: if false; // Only backend can write
      allow read: if request.auth.uid != null && request.auth.token.email == resource.data.email;
    }
    
    // Allow backend service account full access (via Admin SDK)
    match /{document=**} {
      allow read, write: if request.auth.uid != null && 
        request.auth.token.firebase.identities["google.com"][0] == "jawa.manish@gmail.com";
    }
  }
}
```

4. Click "Publish"

### 4. Enable Email Delivery (Gmail)

If using Gmail SMTP:

1. Gmail must have 2FA enabled
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `EMAIL_PASSWORD` in Vercel environment variables

For production email at scale, consider:
- **SendGrid** (free tier: 100 emails/day)
- **AWS SES** (cheaper at scale)
- **Mailgun** (reliable)

## Step 4: Testing Production

### 1. Test User Flow

1. Open your production URL: `https://your-domain.vercel.app`
2. Click "Schedule a 25-Min Call"
3. Fill form with test email
4. Use Stripe test card: `4242 4242 4242 4242`
5. Should see success confirmation
6. Check Firebase for booking document

### 2. Test Admin Dashboard

1. Open: `https://your-domain.vercel.app/admin`
2. Click "Sign in with Google"
3. Use: `jawa.manish@gmail.com`
4. Should see pending bookings
5. Approve one and verify email is sent
6. Check Firebase for `approved` status

### 3. Monitor Logs

Go to Vercel Dashboard → Project → Deployments:

1. Click latest deployment
2. Go to "Logs" tab
3. Watch for real-time function execution
4. Check for any errors

## Step 5: Switch to Live Stripe Keys

**IMPORTANT**: Only do this after thoroughly testing with test keys!

1. Go to Stripe Dashboard → Developers → API Keys
2. Switch from "Test mode" toggle to enable "Live"
3. Copy Live publishable key (starts with `pk_live_`)
4. Copy Live secret key (starts with `sk_live_`)

5. Update Vercel environment variables:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

6. Redeploy on Vercel:
   - Go to Dashboard → Deployments
   - Click "Redeploy" on latest
   - Or just push changes to main branch

**WARNING**: Live keys will process real payments. Test thoroughly!

## Troubleshooting

### "Environment variables not found"

- Go to Settings → Environment Variables
- Verify all variables are added
- Must click "Save" for each variable
- Redeploy after adding variables
- Wait 1-2 minutes for propagation

### "Firebase authentication failed"

- Check `FIREBASE_PRIVATE_KEY` includes actual `\n` characters
- Ensure service account JSON is valid
- Verify `FIREBASE_PROJECT_ID` matches your project

### "Stripe webhook not delivering"

- Check webhook URL is exactly: `https://your-domain.vercel.app/api/webhooks/stripe`
- Verify signing secret in environment variables
- Check Vercel logs for errors
- Test webhook manually from Stripe dashboard

### "Google OAuth redirect URI mismatch"

- Error: "The redirect URI provided is not registered"
- Solution: Add `https://your-domain.vercel.app` to OAuth 2.0 credentials
- May take 5-10 minutes to propagate

### "Emails not sending in production"

- Verify `EMAIL_USER` and `EMAIL_PASSWORD` correct
- Gmail requires app password (not main password)
- Check Vercel logs for nodemailer errors
- Verify Gmail 2FA enabled

### "500 errors on booking API"

1. Check Vercel function logs:
   - Dashboard → Deployments → Latest → Logs
   
2. Common causes:
   - Missing environment variable
   - Invalid Firebase credentials
   - Database connection timeout
   
3. Test with curl:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/bookings/create \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","context":"test"}'
   ```

## Monitoring & Maintenance

### Weekly Checks

- [ ] Visit homepage - layout looks good
- [ ] Test booking flow - payment works
- [ ] Check admin dashboard - can approve bookings
- [ ] Review Stripe dashboard - no failed transactions

### Monthly Checks

- [ ] Review booking volume in Firebase
- [ ] Check error logs in Vercel
- [ ] Verify emails are delivering
- [ ] Check Stripe webhook delivery success rate

### Growth Checks

As traffic increases:
- Monitor Vercel function duration
- Set up alerts for errors
- Review Firebase quota usage
- Consider upgrading Stripe plan

## Rollback Plan

If deployment breaks production:

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Redeploy"
4. Takes ~5 minutes to restore

Or manually roll back:
```bash
git revert HEAD
git push origin main
# Vercel auto-redeploys on main push
```

## Custom Domain

To use a custom domain (e.g., `bookings.manishjawa.com`):

1. In Vercel Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your domain
4. Follow DNS setup instructions (provider-specific)
5. Update Google OAuth redirect URI
6. Update Stripe webhook URL
7. SSL certificate auto-provisioned by Vercel

## Database Backups

Firebase provides automatic backups, but you should also:

1. Export Firestore data weekly:
   ```bash
   gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
   ```

2. Or use Firebase console:
   - Firestore Database → More Options → Export
   - Choose Cloud Storage bucket
   - Run weekly

## Support

For Vercel deployment issues:
- https://vercel.com/docs
- https://vercel.com/support

For Firebase issues:
- https://firebase.google.com/support
- Firebase console → Help & Support

For Stripe issues:
- https://stripe.com/support
- Stripe dashboard → Help & Support
