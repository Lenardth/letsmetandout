# SafeMeet Mobile

Expo SDK 57 uses Firebase Email/Password Authentication and Cloud Firestore. Existing project: `letsmeetandou`; existing web app: `1:896459332759:web:08056f94e56b76d5961dd2`. Configuration lives in ignored `.env`. Never put service-account credentials in the app.

## Demo logins

Local customer, friend and provider accounts are available through the Firebase emulator. See [demo login details and startup](docs/demo-login.md).

## Customer and provider experiences

Members must select Customer or Service provider during signup. Account type is saved in owner-only `account_roles/{uid}` and cannot be switched by the client. Existing accounts without a type complete this choice once after signing in. Navigation uses the saved account type across devices.

- Customer: Places, Discover, Groups, Plans, Bookings, Wallet and Profile.
- Service provider: My business (listings and incoming reservation requests), Wallet and Profile. This area is intended for shop owners, venue operators and hosts; current listing categories remain Restaurant, Café and Venue, and bookings remain table requests. Product sales and host event bookings are not implemented.

Prototype Firestore rules require a provider account for listing writes and reservation decisions, and a customer account for new booking requests. Deploy the updated rules before using this registration flow against production; local changes do not publish rules.

## Backend setup

Official Firebase agent skills are used for backend work; see `AGENTS.md`.

1. Authenticate the Firebase CLI with an account that manages the project:

   ```sh
   npx -y firebase-tools@latest login
   npx -y firebase-tools@latest firestore:databases:list --project letsmeetandou
   ```

2. Inspect the existing database edition before creating another database. The mobile SDK targets the default `(default)` database using the modular Firestore document SDK. If no database exists, choose its edition and permanent region in Firebase Console → Firestore Database → Create database. Avoid test mode; use the rules provided here. The existing Standard `(default)` database in `nam5` was verified using a read-only CLI check.
3. Review the prototype `firebase/firestore.rules` against any existing project rules before deployment; publishing replaces the project's current rules. Email/Password provisioning is declared in `firebase.json`:

   ```sh
   npx -y firebase-tools@latest deploy --only auth,firestore --project letsmeetandou
   ```

   Alternatively enable Authentication → Get started → Sign-in method → Email/Password in Firebase Console and publish the Firestore rules there.

4. Run `npm run firebase:check`, restart Expo with `npm run dev -- --clear`, and create an account. Confirm the email before signing in. Password reset and verification resend are available on login. Native sessions persist in AsyncStorage.

Firebase CLI login is available. The CLI deployment dry-run enabled Firestore and created the Standard default database in `nam5` (US). Live Auth/rules deployment remains pending explicit approval after automatic approval review blocked publication. Public config and SDK code cannot themselves enable a provider. Existing Realtime Database records are not copied or deleted by this migration; they require a deliberate data migration if present. The legacy RTDB rules are retained for reference and are not deployed by the current configuration.

## Firestore data model

- `profiles/{uid}`: name, city, province, bio, interests, optional HTTPS photo, completion flag, Firestore creation timestamp. No email or phone here. Users edit their own profile; Discover lists complete profiles for verified members with completed profiles.
- `account_details/{uid}`: private phone and agreements; owner-only reads and validated writes.
- `account_roles/{uid}`: customer or provider; owner-only reads, immutable after registration.
- `stores/{storeId}`: business owner, public contact/location, optional photo, maximum party size, integer deposit cents and creation timestamp. Verified providers with complete profiles can create and edit their own listings.
- `accounts/{uid}/bookings/{bookingId}` and `stores/{storeId}/reservation_requests/{bookingId}`: atomically mirrored booking requests. Only the merchant can accept/decline; both copies must agree. Booking date remains epoch milliseconds in South African UTC+02:00. No client can change price or mark payment paid.
- `wallets/{uid}` and `wallets/{uid}/transactions/{transactionId}`: balances and transactions maintained only by trusted server workflows. Owner-only reads; missing balance shows zero.
- `booking_groups/{id}`: member-only get-together proposals with a place, equal contribution budget, withdrawal deadline and charge cap. Owner, membership and terms are immutable. Each invited member is identified by their Profile member ID.
- `booking_groups/{id}/agreements/{uid}`: only that member can approve or decline; an approved member can request withdrawal. Share amounts are validated against the immutable proposal. Approvals do not collect money or confirm a booking.
- `group_wallets/{id}` and its `transactions`: only group members can read; all client money writes are denied. No settlement backend exists yet.
- `groups/{id}` and `meetup_plans/{id}`: legacy admin-managed real records, including creation timestamps; member reads only. The Groups tab now uses private `booking_groups`.

Profile, private account details and account type are created in one Firestore batch. If Auth succeeds but profile setup fails, the account is preserved and can finish its public profile after verification/sign-in. No demo users, automatic data migration, checkout, or real deposits are included. Business owners manually confirm table availability. Listing subscriptions and payment provider integration remain pending.

## Checks

```sh
npm run typecheck
npm run test:firebase
npm run test:business
npm run test:groups      # Contribution arithmetic, consensus and withdrawal estimates
npm run test:auth        # Stalled signup/login and recovery checks
npm run test:rules       # Requires Java 21+, uses demo emulator only
npm run firebase:check
```

The adapter/business/group checks and local emulator access-control tests passed. The rules suite exercises the production booking/group adapters against a demo Firestore database as well as adversarial access checks. These checks do not confirm live provisioning. Adapter tests use mocks; Firestore rule tests in `tests/firestoreRules.test.mjs` require a running Firestore emulator and `@firebase/rules-unit-testing`. They use a demo project and never create production users or data. Firestore emulator requires Java 21 or newer.

For EAS builds/updates, configure the same public Firebase variables in the chosen EAS environment. The earlier FastAPI backend is retained for legacy development only.

Authentication requests now have deadlines (30 seconds for password authentication, 15 seconds for profile/email requests). Startup readiness also has a deadline. Signup sends verification alongside profile creation; stalled profile writes cannot block the email. A deadline does not cancel queued Firebase operations: recovery messages preserve accounts already created and direct users to verify/sign in instead of repeating signup.

## Group kitty and release readiness

The current group flow records a proposed get-together and each member's decision. All members must approve for the screen to show everyone has agreed. A withdrawal request removes that approval from consensus. Any change to the budget, place, membership or withdrawal terms requires a new group. "Gazata" is a provisional label pending local spelling review.

The withdrawal calculation is an estimate only: before or at the agreed deadline the charge is zero; afterward it is capped by the accepted maximum, actual unrecoverable costs and confirmed contribution. No organiser or client can levy a charge. Cancellation exceptions, replacement-member refunds, disputes and legally reviewed payment terms must be implemented before real money is enabled.

Wallet screens display unavailable/inactive states rather than inventing a zero balance after an error. Booking requests reuse an ID on retry and transactionally create both copies. Network deadlines do not cancel already-started operations; users should refresh before repeating an uncertain action.

See [feature readiness](docs/feature-readiness.md) for remaining features and the distinction between local verification and production readiness. Updated Firestore rules are not published by tests. Production signup, multi-device checks and payment tests remain release gates.

### Real profile pictures

Customers and providers can choose and crop their own profile picture from their photo library in **Profile → Edit profile & picture**. Saved photos appear in Profile and Discover; missing photos use initials rather than invented faces. Firebase Storage stores JPEG/PNG images up to 5 MB, with verified-owner uploads and unique filenames. The local demo includes Storage on port 9199. Download links are shareable, so profile pictures are not private files. Production Storage provisioning and reviewed rules deployment remain release steps.

## Deployment

See [deployment preparation and release gates](docs/deployment.md). Run `npm run release:check` before a production build. EAS builds now require configured production Firebase variables; local backend secrets and emulator data are excluded. The app is prepared for a non-payment beta build, with live provisioning and store release requirements still outstanding.
