# CLAUDE.md - AI Assistant Guide for manish-portfolio

## Project Overview

Executive portfolio website for Manish Jawa with an integrated booking system. Users can view the portfolio and request consultation bookings; an admin panel allows approving/rejecting requests with email notifications.

**Live stack:** React 19 + Vite 7 frontend, Firebase Cloud Functions backend, Firestore for data, Firebase Auth for admin access, Nodemailer for emails, Cal.com for scheduling.

## Quick Start

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Run dev server (frontend)
npm run dev          # Starts Vite on http://localhost:5173

# Run Firebase emulators (backend)
firebase emulators:start   # Functions:5001, Firestore:8080, Auth:9099
```

## Project Structure

```
├── src/                          # Frontend (React + Vite)
│   ├── components/
│   │   ├── AdminDashboard.jsx    # Admin booking management panel
│   │   ├── BookingForm.jsx       # User booking request form
│   │   └── BookingModal.jsx      # Modal wrapper for BookingForm
│   ├── config/
│   │   └── firebase.js           # Firebase client init (hardcoded config)
│   ├── services/
│   │   └── api.js                # API client (createBooking, getBookings, etc.)
│   ├── __tests__/
│   │   └── BookingForm.test.jsx  # Jest tests for BookingForm
│   ├── App.jsx                   # Main portfolio page + routing root
│   ├── main.jsx                  # Entry point, React Router setup
│   ├── App.css                   # Portfolio page styles
│   └── index.css                 # Global styles
├── functions/                    # Firebase Cloud Functions (backend)
│   ├── src/
│   │   ├── index.js              # Express app, function exports
│   │   ├── firebase.js           # Firebase Admin SDK init
│   │   ├── email.js              # Nodemailer email templates
│   │   ├── bookings/             # Booking CRUD handlers
│   │   │   ├── create.js         # POST /api/bookings/create
│   │   │   ├── list.js           # GET  /api/bookings/list (admin)
│   │   │   ├── approve.js        # POST /api/bookings/approve (admin, sends email)
│   │   │   └── reject.js         # POST /api/bookings/reject (admin, sends email)
│   │   └── __tests__/
│   │       └── bookings.test.js  # Unit tests for all handlers (28 tests)
│   ├── jest.config.js            # Jest config for backend tests
│   └── package.json              # Backend dependencies (Node 20)
├── public/                       # Static assets
├── firebase.json                 # Firebase hosting + functions config
├── vite.config.js                # Vite build config
└── .env.example                  # Required environment variables template
```

## Routes

| Path     | Component        | Purpose                    |
|----------|------------------|----------------------------|
| `/`      | App.jsx          | Main portfolio page        |
| `/admin` | AdminDashboard   | Admin booking management   |

## API Endpoints

| Endpoint                  | Method | Auth         | Purpose                          |
|---------------------------|--------|--------------|----------------------------------|
| `/api/bookings/create`    | POST   | None         | Submit booking (email + context) |
| `/api/bookings/list`      | GET    | Bearer Token | List all bookings (admin)        |
| `/api/bookings/approve`   | POST   | Bearer Token | Approve + send email with Cal link |
| `/api/bookings/reject`    | POST   | Bearer Token | Reject + send rejection email    |
| `/api/health`             | GET    | None         | Health check                     |

## Key Commands

```bash
# Development
npm run dev                    # Vite dev server
firebase emulators:start       # Local backend emulators

# Build & Deploy
npm run build                  # Vite build → /dist
npm run deploy:firebase        # Build + deploy all to Firebase
npm run deploy:functions       # Deploy Cloud Functions only
npm run deploy:hosting         # Build + deploy hosting only

# Testing
cd functions && npm test       # Backend unit tests (28 tests)
npm run test:jest              # Frontend unit tests (BookingForm)

# Linting
npm run lint                   # ESLint
```

## Tech Stack Details

- **Frontend:** React 19, React Router DOM 7, Vite 7, plain CSS (dark theme, no Tailwind)
- **Backend:** Firebase Cloud Functions (Node 20), Express 4
- **Database:** Firestore (`bookings` collection, documents keyed by booking ID)
- **Auth:** Firebase Auth + Google OAuth (admin only, restricted to `jawa.manish@gmail.com`)
- **Email:** Nodemailer with Gmail SMTP
- **Scheduling:** Cal.com integration (links sent in approval emails)
- **Module system:** ES modules throughout (`"type": "module"`)

## Architecture & Conventions

### Frontend
- **State management:** React hooks only (useState, useEffect) — no Redux/Context
- **Styling:** Plain CSS files per component, dark theme with `#22c55e` green accent
- **Firebase config:** Hardcoded in `src/config/firebase.js` (env vars not available at Vite build time)
- **API calls:** Centralized in `src/services/api.js` using fetch

### Backend (Cloud Functions)
- **Pattern:** Express routes inside a single Firebase Cloud Function (`api`)
- **Storage:** Booking data stored in Firestore `bookings` collection, one document per booking keyed by booking ID
- **Auth flow:** Firebase ID token verification → admin email check
- **Email:** Approval/rejection handlers send emails via Nodemailer, but continue even if email fails
- **Email templates:** HTML emails with inline styles in `functions/src/email.js`

### Data Model — Booking

```json
{
  "id": "booking_{timestamp}_{random}",
  "email": "user@example.com",
  "context": "Discussion topic",
  "status": "pending | approved | rejected",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "approved_at": "ISO timestamp (if approved)",
  "approved_by": "admin email (if approved)",
  "cal_event_url": "https://cal.com/... (if approved)"
}
```

## Important Context for AI Assistants

### Storage History
Bookings were originally in Firestore, briefly migrated to Cloud Storage (JSON files), and have been **migrated back to Firestore** as the current production database. The `bookings` collection in Firestore is the single source of truth.

### Firebase Config is Hardcoded
The frontend Firebase config in `src/config/firebase.js` is hardcoded (not from env vars) because Vite env vars weren't reliably available at build time. This is intentional.

### Admin Access
Admin functionality is restricted to the email `jawa.manish@gmail.com` via hardcoded checks in both frontend (`AdminDashboard.jsx`) and backend (`list.js`, `approve.js`, `reject.js`).

## Environment Variables

See `.env.example` for the full list. Key groups:

- **Firebase:** `VITE_FIREBASE_*` (frontend), `FIREBASE_SERVICE_ACCOUNT_KEY` (backend)
- **Auth:** `VITE_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Email:** `EMAIL_USER`, `EMAIL_PASSWORD` (Gmail app password)
- **Admin:** `ADMIN_EMAILS`, `VITE_ADMIN_EMAIL`
- **App:** `VITE_APP_URL`, `JWT_SECRET`

## Common Tasks

### Adding a new API endpoint
1. Create handler in `functions/src/bookings/` (or new directory)
2. Register route in `functions/src/index.js` Express app
3. Add corresponding client function in `src/services/api.js`

### Adding a new frontend section
1. Add content in `App.jsx` (single-page portfolio)
2. Style in `App.css`
3. Follow existing patterns: section container → heading → grid/flex layout

### Modifying email templates
Edit `functions/src/email.js` — templates use inline HTML/CSS styles for email client compatibility.

### Running tests
```bash
cd functions && npm test   # Backend handler tests
npm run test:jest          # Frontend component tests
```

## Documentation Files

- `README.md` — Main project overview
- `QUICKSTART.md` — 5-minute setup guide
- `BOOKING_SYSTEM_README.md` / `BOOKING_SYSTEM_SETUP.md` — Booking system docs
- `PAYMENT_REMOVAL_SUMMARY.md` — Stripe removal notes
