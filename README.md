# Find a Nook

A simple study room booking app. Browse available rooms, pick a date and time slot, and book — no double-booking possible.

## What it does
- **Authentication**: sign up, log in, log out (via Supabase Auth)
- **CRUD**: create a booking, view all your bookings, cancel (delete) a booking
- **Core business flow**: browse rooms → pick a date → view available time slots → book → see it under "My Bookings" → cancel if needed

## Tech stack
- **Next.js** (React) — frontend and routing
- **Supabase** — authentication and Postgres database
- **Vercel** — deployment/hosting

## Project structure
```
app/
  page.js            → redirects to /login or /dashboard
  login/page.js       → login form
  signup/page.js       → signup form
  dashboard/page.js    → browse rooms & book a slot (core flow)
  my-bookings/page.js  → view/cancel your bookings
components/
  Navbar.js            → nav bar with logout
lib/
  supabaseClient.js     → Supabase connection setup
```

## Database schema
Two tables in Supabase:
- `rooms` — fixed list of rooms (name, capacity)
- `bookings` — user_id, room_id, booking_date, slot — with a unique constraint on (room_id, booking_date, slot) to prevent double-booking, and row-level security so users can only cancel their own bookings.

## Running locally
1. Clone this repo
2. Run `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key (found in Supabase → Project Settings → API)
4. Run `npm run dev`
5. Open `http://localhost:3000`

## Deployment
Deployed on Vercel, connected to this GitHub repo. Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are set in the Vercel project settings.

## Test credentials
(Add a test account here after deployment, e.g.)
- Email: test@example.com
- Password: test1234
