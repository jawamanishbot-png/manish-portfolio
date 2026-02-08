# Booking System Testing Guide

## Manual Testing

### 1. Test Booking Submission

**URL:** https://manish-portfolio-bookings.web.app

**Steps:**
1. Click "Schedule a Call with Manish" button
2. Fill in:
   - Email: `test@example.com`
   - Topic: `I want to discuss growth strategies`
3. Click "Request Consultation"

**Expected Result:**
- Success message: "Your request has been submitted. Awaiting admin review."
- Modal closes
- No errors in browser console

**Test Cases:**
- ✅ Valid email + topic → Success
- ❌ Invalid email format → Error message
- ❌ Missing email or topic → Error message (button disabled or validation)
- ❌ Network error → Error message shown

---

### 2. Test Admin Dashboard

**URL:** https://manish-portfolio-bookings.web.app/admin

**Steps:**
1. Click "Sign in with Google"
2. Use: `jawa.manish.bot@gmail.com`
3. Should see pending bookings list

**Expected Result:**
- List of pending bookings with email, topic, creation date
- "Approve" and "Reject" buttons for each booking
- Can enter Cal.com link URL when approving

**Test Cases:**
- ✅ Login with correct email → Access dashboard
- ❌ Login with different email → "Access denied" error
- ✅ See pending bookings from previous submission
- ✅ Approve booking → Status changes to "approved"
- ✅ Reject booking → Status changes to "rejected"

---

### 3. Test Firebase Data Persistence

**Steps:**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check `bookings` collection

**Expected Result:**
- Documents with fields: `id`, `email`, `context`, `status`, `created_at`, `updated_at`
- Status values: `pending`, `approved`, `rejected`
- Timestamps are ISO format

**Document Structure:**
```json
{
  "id": "booking-123",
  "email": "test@example.com",
  "context": "I want to discuss growth strategies",
  "status": "pending",
  "created_at": "2026-02-08T11:22:00.000Z",
  "updated_at": "2026-02-08T11:22:00.000Z",
  "cal_link": "https://cal.com/manish/..." (if approved),
  "approved_at": "2026-02-08T11:25:00.000Z" (if approved)
}
```

---

## Automated Testing

### Run Tests

```bash
# Unit tests
npm test -- src/__tests__/BookingForm.test.jsx
npm test -- functions/src/__tests__/bookings.test.js

# E2E tests (requires live Firebase)
npm test -- functions/src/__tests__/e2e.test.js
```

### Test Files

1. **`src/__tests__/BookingForm.test.jsx`**
   - Tests form validation
   - Tests successful submission
   - Tests error handling
   - Tests loading state

2. **`functions/src/__tests__/bookings.test.js`**
   - Tests POST /api/bookings/create
   - Tests email validation
   - Tests required fields
   - Tests HTTP method validation

3. **`functions/src/__tests__/e2e.test.js`**
   - Tests complete booking flow
   - Tests Firestore CRUD operations
   - Tests booking status transitions
   - Tests querying and ordering

---

## Smoke Tests (Quick Validation)

Quick checks after deployment:

- [ ] Visit homepage → No errors
- [ ] Click "Schedule a Call" → Modal opens
- [ ] Submit form with valid data → Success message
- [ ] Go to `/admin` → Can sign in with Google
- [ ] Admin sees bookings list → Data persists
- [ ] Approve/reject booking → Status updates in Firestore

---

## Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| Browser cache issues | Hard refresh (Cmd+Shift+R) |
| Firebase not initialized | Check env vars are set correctly |
| Admin can't see bookings | Verify email is in ADMIN_EMAILS |
| 404 error on booking submit | Cloud Functions may be deploying (wait 5 min) |

---

## Performance Benchmarks

**Expected Response Times:**
- Form submission: < 2 seconds
- Admin login: < 3 seconds
- Load bookings list: < 1 second
- Approve/reject action: < 1 second

---

## Debugging

### Browser Console
```javascript
// Check if Firebase is initialized
console.log('Firebase app:', window.__FIREBASE_APP__);

// Check API calls
window.__API_DEBUG__ = true;
```

### Cloud Functions Logs
```bash
firebase functions:log --project manish-portfolio-bookings
```

### Firestore Queries
```bash
# Check booking data
firebase firestore:get bookings --project manish-portfolio-bookings
```

---

## Deployment Verification

After deploying to production:

```bash
# Check function status
firebase functions:describe api --project manish-portfolio-bookings

# Check logs for errors
firebase functions:log --project manish-portfolio-bookings | grep -i error

# Verify Firestore is reachable
curl -X GET https://us-central1-manish-portfolio-bookings.cloudfunctions.net/api/health
```

**Expected:** `{"status":"ok"}`
