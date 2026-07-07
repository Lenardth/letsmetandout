# SafeMeet Mobile

Expo mobile app plus a local FastAPI backend.

## First Setup

```sh
npm install
cp .env.example .env
cp backend/.env.example backend/.env
```

Install backend dependencies into your preferred Python environment:

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
- Generated files such as `.DS_Store` and Metro file maps should stay out of commits.
- The existing web polyfills currently block a clean `npm run typecheck`; fix those before treating typecheck as a required gate.
