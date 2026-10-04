# SafeMeet Mobile

Expo mobile app plus a local FastAPI backend.

The app uses Expo SDK 57 with React Native 0.86 and React 19.2.
Install Node.js 22.13 or newer before running the commands below.
Use an Expo Go version that supports SDK 57. After upgrading an existing
development build, rebuild it before opening the app.

Supabase connection settings are available in `.env.example`. Copy the project
URL and publishable key from the project's Connect dialog into `.env`, then
restart Expo. Never put a secret or service-role key in `EXPO_PUBLIC_*` variables.
The client helper is `src/utils/supabase.js`. Signup, login, and Discover still use
the local API until the Supabase project's user/profile schema is connected.
Supabase Auth accounts need an application profile table with Row Level Security
before they can be listed in Discover; the mobile client cannot list `auth.users`.

## First Setup

```sh
npm install
cp .env.example .env
cp backend/.env.example backend/.env
```

Install backend dependencies into the local Python environment used by `npm run api`:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Daily Workflow

Terminal 1: start the API.

```sh
npm run api
```

Terminal 2: start Expo for a phone on the same Wi-Fi.

```sh
npm run dev
```

Scan the QR code with Expo Go. If the phone cannot connect, set `EXPO_PUBLIC_API_URL`
in `.env` to your Mac's LAN IP, for example:

```sh
EXPO_PUBLIC_API_URL=http://192.168.0.199:8000/api/v1
```

## Useful Commands

```sh
npm run dev        # Expo LAN QR for phones
npm run dev:local  # Expo localhost for browser/simulator
npm run dev:tunnel # Expo tunnel when LAN is blocked
npm run api        # FastAPI on 0.0.0.0:8000
npm run typecheck  # TypeScript check
```

## Notes

- The app now reads real backend data. Empty database tables show empty states instead of dummy cards.
- Keep `npm run api` running alongside Expo. The local database is `backend/safemeet.db`;
  signing up creates users that appear on Discover. To use an existing database, set
  `DATABASE_URL` in `backend/.env` before starting the API.
- Generated files such as `.DS_Store` and Metro file maps should stay out of commits.
- The existing web polyfills currently block a clean `npm run typecheck`; fix those before treating typecheck as a required gate.
