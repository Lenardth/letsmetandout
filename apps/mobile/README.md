# SafeMeet Mobile

Expo SDK 57 uses Firebase Email/Password Authentication and Cloud Firestore. Existing project: `letsmeetandou`; existing web app: `1:896459332759:web:08056f94e56b76d5961dd2`. Configuration lives in ignored `.env`. Never put service-account credentials in the app.

## Backend setup

Official Firebase agent skills are used for backend work; see `AGENTS.md`.

1. Authenticate the Firebase CLI with an account that manages the project:

   ```sh
   npx -y firebase-tools@latest login
   npx -y firebase-tools@latest firestore:databases:list --project letsmeetandou
   ```

2. Inspect the existing database edition before creating another database. The mobile SDK targets the default `(default)` database using the modular Firestore document SDK. If no database exists, choose its edition and permanent region in Firebase Console → Firestore Database → Create database. Avoid test mode; use the rules provided here. Live database details could not be inspected without CLI credentials.
3. Review the prototype `firebase/firestore.rules` against any existing project rules before deployment; publishing replaces the project's current rules. Email/Password provisioning is declared in `firebase.json`:

   ```sh
   npx -y firebase-tools@latest deploy --only auth,firestore --project letsmeetandou
   ```

   Alternatively enable Authentication → Get started → Sign-in method → Email/Password in Firebase Console and publish the Firestore rules there.

4. Run `npm run firebase:check`, restart Expo with `npm run dev -- --clear`, and create an account. Confirm the email before signing in. Password reset and verification resend are available on login. Native sessions persist in AsyncStorage.

Firebase CLI login is available. The CLI deployment dry-run enabled Firestore and created the Standard default database in `nam5` (US). Live Auth/rules deployment remains pending explicit approval after automatic approval review blocked publication. Public config and SDK code cannot themselves enable a provider. Existing Realtime Database records are not copied or deleted by this migration; they require a deliberate data migration if present. The legacy RTDB rules are retained for reference and are not deployed by the current configuration.

## Firestore data model

- `profiles/{uid}`: name, city, province, bio, interests, optional HTTPS photo, completion flag, Firestore creation timestamp. No email or phone here. Users edit their own profile; Discover lists complete profiles for verified members with completed profiles.
- `account_details/{uid}`: private phone and agreements; owner-only reads and initial creation.
- `stores/{storeId}`: business owner, public contact/location, optional photo, maximum party size, integer deposit cents and creation timestamp. Verified members with complete profiles can create and edit their own listings.
- `accounts/{uid}/bookings/{bookingId}` and `stores/{storeId}/reservation_requests/{bookingId}`: atomically mirrored booking requests. Only the merchant can accept/decline; both copies must agree. Booking date remains epoch milliseconds in South African UTC+02:00. No client can change price or mark payment paid.
- `wallets/{uid}` and `wallets/{uid}/transactions/{transactionId}`: balances and transactions maintained only by trusted server workflows. Owner-only reads; missing balance shows zero.
- `groups/{id}` and `meetup_plans/{id}`: admin-managed real records, including creation timestamps; member reads only.

Profile and private account details are created in one Firestore batch. If Auth succeeds but profile setup fails, the account is preserved and can finish its public profile after verification/sign-in. No demo users, automatic data migration, checkout, or real deposits are included. Business owners manually confirm table availability. Listing subscriptions and payment provider integration remain pending.

## Checks

```sh
npm run typecheck
npm run test:firebase
npm run test:business
npm run test:auth        # Stalled signup/login and recovery checks
npm run test:rules       # Requires Java 21+, uses demo emulator only
npm run firebase:check
```

The adapter/business checks and local emulator access-control tests passed. These checks do not confirm live provisioning. Adapter tests use mocks; Firestore rule tests in `tests/firestoreRules.test.mjs` require a running Firestore emulator and `@firebase/rules-unit-testing`. They use a demo project and never create production users or data. Firestore emulator requires Java 21 or newer.

For EAS builds/updates, configure the same public Firebase variables in the chosen EAS environment. The earlier FastAPI backend is retained for legacy development only.

Authentication requests now have deadlines (30 seconds for password authentication, 15 seconds for profile/email requests). Startup readiness also has a deadline. Signup sends verification alongside profile creation; stalled profile writes cannot block the email. A deadline does not cancel queued Firebase operations: recovery messages preserve accounts already created and direct users to verify/sign in instead of repeating signup.
