# Demo logins

These are local Firebase emulator accounts, not production logins.

| Experience | Email | Password |
| --- | --- | --- |
| Customer | customer@demo.safemeet.test | SafeMeetDemo!2026 |
| Customer friend | friend@demo.safemeet.test | SafeMeetDemo!2026 |
| Service provider | provider@demo.safemeet.test | SafeMeetDemo!2026 |

## Start the demo

Requires Java 21+ and the installed npm dependencies. In separate terminals:

1. `npm run demo:emulators` — keep running; loads/saves local data in ignored `.firebase-demo/`.
2. `npm run demo:seed` — creates or refreshes the three verified accounts and a curated set of real South African venues with Pexels imagery; verifies each login.
3. `npm run demo:app` — open the web app and choose Sign in.

Email verification is completed through the Auth emulator's local verification codes. No real emails or SMS are sent. Profiles are complete and account types are already assigned. The provider owns the seeded venue listings. The venues and public contact details are included for demonstration only; table requests are not sent to those businesses. Venue photos are loaded from Pexels and credited in the Places screen. Member IDs are printed by the seed script and are visible in Profile for group invitations.

For the Android emulator, set `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=10.0.2.2` when starting `demo:app`. Web and the iOS simulator use `127.0.0.1`. For a physical iPhone use the setup below.

Stop Expo and run normal `npm run dev -- --clear` to return to the configured live Firebase project. Demo mode uses a separate Firebase app/session and a `demo-` project with no live fallback; it is rejected in production builds.

Wallet funding, payments and refunds remain disabled. These credentials do not demonstrate real money movement.

Implementation references: [Firebase Auth emulator](https://firebase.google.com/docs/emulator-suite/connect_auth) and [Firestore emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore).

## Expo Go on your iPhone

Connect the iPhone and Mac to the same trusted Wi-Fi. Install/update Expo Go from the App Store. This project uses Expo SDK 57; Expo Go must support that SDK.

1. Stop any already-running local demo emulators (Ctrl+C) to save their data.
2. Run `npm run demo:emulators:lan` in one terminal. This restores the saved accounts and makes Auth/Firestore/Storage reachable from your phone. Requires Java 21+.
3. If starting with an empty demo, run `npm run demo:seed` in another terminal.
4. Run `npm run demo:iphone` in another terminal. It automatically detects the Mac's Wi-Fi IPv4 address and uses it for both Expo and Firebase.
5. Scan the terminal QR code with the iPhone Camera and open it in Expo Go. Allow Expo Go access to your local network if prompted.
6. Choose Sign in and use the demo credentials above.

Keep both terminals running. If Expo asks for an account, run `npx expo login` on the Mac and sign in to Expo Go with the same Expo account. This Expo account is separate from your SafeMeet demo login. See [Expo's device setup instructions](https://docs.expo.dev/get-started/start-developing/).

If automatic address detection picks the wrong adapter, run `SAFEMEET_DEMO_HOST=YOUR_MAC_WIFI_IP npm run demo:iphone`. On this Mac the address detected during setup was `192.168.100.51`; it can change when the network changes.

To check Firebase reachability from the iPhone, open `http://YOUR_MAC_WIFI_IP:9099/emulator/v1/projects/demo-safemeet-login/oobCodes` in Safari. A JSON response confirms the Auth emulator can be reached. If it cannot connect, check Mac firewall access, Wi-Fi guest isolation and iPhone Local Network permission. Expo's tunnel only tunnels Metro; it does not tunnel these Firebase emulators.

## Upload your profile picture

In Profile, tap **Edit profile & picture**, then **Upload profile picture**. Select and crop a photo from your iPhone library. Uploads are saved in the local Storage emulator (port 9199), and appear in Profile and Discover. Each demo member can upload their own picture; no stock faces are assigned to accounts. JPEG/PNG uploads are limited to 5 MB. Keep the emulator running and reload Expo Go after an app update.

Photo download links can be shared by anyone who has the link. These are profile pictures, not private documents. Production uploads require a provisioned Firebase Storage bucket and published, reviewed `firebase/storage.rules`; no production rules were deployed.
