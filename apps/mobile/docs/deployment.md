# SafeMeet deployment

Prepared on 8 October 2026 for a non-payment beta. Production publishing has not been performed. Wallet funding, settlement, penalties and refunds remain disabled.

## Prepared configuration

- iOS bundle ID and Android package: `com.safemeet.mobile`. Confirm ownership/availability before the first store build; these identify the app permanently in the stores.
- URL scheme: `safemeet`. Existing Expo project and owner retained.
- EAS production profile uses the production environment, production update channel and automatic build-number increments. Emulator mode is explicitly off.
- Build uploads exclude backend files, local environment files, demo data and credentials. Configure public Firebase values in EAS, rather than relying on the local `.env` being uploaded.
- The post-install build hook validates all six Firebase fields and the intended project/app ID. It fails on emulator mode or known client credential variables.

## Before a beta build

1. Configure the six `EXPO_PUBLIC_FIREBASE_*` variables listed in `.env.example` in the EAS **production** environment. Use Firebase project `letsmeetandou`, web app `1:896459332759:web:08056f94e56b76d5961dd2`. Client configuration is public; never put Admin credentials in the app. See [EAS environment configuration](https://docs.expo.dev/eas/environment-variables/manage/).
2. Confirm Email/Password Authentication is enabled, verification/reset email templates are correct, and the configured Storage bucket exists with billing/access configured. Check current configuration with `npm run firebase:check`; this validates Auth reachability only.
3. Review and publish Firestore rules/indexes and Storage rules to the existing project. The local tests do not publish them. After review, use `npx firebase-tools deploy --project letsmeetandou --only firestore:rules,firestore:indexes,storage`.
4. Run `npm run release:check`, `npm run test:unit`, `npm run typecheck`, and `npm run release:export`. Rules tests require local Auth/Firestore/Storage emulators; run `node --test tests/firestoreRules.test.mjs tests/storageRules.test.mjs` against those services.
5. Build for physical-device testing: `npx eas-cli build --platform ios --profile production`. EAS requires Apple signing credentials and membership. Android: `npx eas-cli build --platform android --profile production`.
6. Test both roles on the installed release build against live Firebase: signup, verification, login/relaunch/logout/reset, photo selection/replacement, discovery, provider listing, mirrored booking decisions, group invitation/consent/withdrawal and permission/error states. Expo Go checks do not replace this test.

No cloud build has been queued by this preparation. No production user/data migration is included. Existing production accounts without account roles need explicit migration or tested role registration.

## Public store release blockers

- Provide actual linked privacy policy, terms and safety guidelines before accepting consent; the current signup checkbox has no policy links.
- Implement and verify an account/data deletion flow, plus the relevant store privacy/data-safety disclosures. This app handles profiles, photos, phone numbers and booking/group data.
- Complete abuse reporting/moderation for user photos/profiles and provider listings before unrestricted public access.
- Verify store metadata, screenshots, support contact and review access credentials; demo emulator credentials do not work in production.
- Keep payments disabled until the trusted server ledger, payment integration, consent enforcement, refunds/disputes and reviewed withdrawal terms in `feature-readiness.md` are implemented.

Submit only after these gates: `npx eas-cli submit --platform ios --profile production --latest` (or `--platform android`). Submission configuration still requires store account details. For updates, use the matching production environment/channel and verify runtime compatibility; do not publish demo settings.

References: [EAS build profiles](https://docs.expo.dev/build/eas-json/), [build ignore files](https://docs.expo.dev/build-reference/easignore/).
