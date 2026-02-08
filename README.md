# Manish Jawa - Booking System

A modern booking system for consulting sessions with Manish Jawa. Built with React + Vite frontend, Node.js serverless backend (Vercel), and Firebase database.

## 🎯 Features

- **Simple Booking Form**: Email + topic submission
- **Firebase Database**: Real-time booking storage and management
- **Admin Dashboard**: Review, approve, and reject booking requests
- **Google OAuth**: Secure admin authentication
- **Cal.com Integration**: Schedule meetings after admin approval
- **Email Notifications**: Automated approval and scheduling links
- **Responsive Design**: Works on desktop and mobile devices

## 🔄 Booking Flow

### User Experience

1. **Submit Request**
   - User visits the portfolio site
   - Clicks "Book a Call" button
   - Fills in email and topic/context
   - Clicks "Request Consultation"
   - Sees success message: "Your request has been submitted. We'll review it and send you a calendar link if approved."

2. **Admin Review**
   - Admin Dashboard shows new pending booking
   - Admin reviews email and context
   - Admin approves or rejects

3. **Scheduling**
   - If approved: Admin sends Cal.com scheduling link via email
   - User receives link, selects preferred time
   - Meeting is scheduled

### Technical Flow

```
User Form (email + topic)
   ↓
POST /api/bookings/create
   ↓ (Backend)
Store booking with status "pending"
   ↓
Return success message
   ↓
Show success screen: "Request submitted. Awaiting admin review."
   ↓
Admin reviews in dashboard
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

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Admin Configuration
ADMIN_EMAIL=jawa.manish@gmail.com

# Cal.com Configuration (for sending scheduling links)
CAL_COM_API_KEY=your_cal_com_api_key (optional)

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
- **Response**: `{ success: true, bookingId, message }`

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

## 🔐 Security Features

- **Firebase Admin SDK**: Secure backend database access
- **Google OAuth**: Only authorized admin can access dashboard
- **HTTPS Only**: All communications use HTTPS
- **No Payment Data**: No card or payment information stored

## 📊 Booking Statuses

| Status | Description | Actions |
|--------|-------------|---------|
| **pending** | Booking submitted, awaiting admin review | Admin: Approve/Reject |
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

## 🧪 Testing Locally

### User Flow Testing

1. Start dev server: `npm run dev`
2. Click "Book a Call" on the homepage
3. Fill in test email and topic
4. Click "Request Consultation"
5. Should show success message: "Your request has been submitted. We'll review it and send you a calendar link if approved."

### Admin Testing

1. Visit `http://localhost:5173/admin`
2. Sign in with Google (test account must match ADMIN_EMAIL)
3. Should show "Pending" section with your test booking
4. Click "Approve" on the pending booking
5. Enter a test Cal.com URL
6. Click "Send Approval & Link"

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

## 🔄 Database Schema

### Bookings Collection

```json
{
  "id": "booking_123",
  "email": "user@example.com",
  "context": "Discussion about leadership...",
  "status": "pending",
  "cal_event_url": "https://cal.com/manish/...",
  "created_at": "2026-02-08T12:00:00.000Z",
  "updated_at": "2026-02-08T12:05:00.000Z",
  "approved_at": "2026-02-08T12:05:00.000Z",
  "approved_by": "jawa.manish@gmail.com"
}
```

## 🐛 Troubleshooting

### Booking Form Not Submitting

- Check `VITE_APP_URL` is correct in `.env.local`
- Check browser console for errors
- Verify Firebase configuration is correct

### Admin Can't See Pending Bookings

- Verify user is logged in with correct Google account
- Verify `ADMIN_EMAIL` in `.env.local` matches the email
- Check that bookings exist in Firebase with status "pending"

### Approval Email Not Sent

- Verify email service configuration in API
- Check Vercel logs: `vercel logs`
- Ensure booking.email is valid

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cal.com API](https://cal.com/docs/api)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Firebase Auth with Google](https://firebase.google.com/docs/auth/web/google-signin)

## 📄 License

All rights reserved. © Manish Jawa 2026.

## 🤝 Support

For questions or issues, contact: jawa.manish@gmail.com
