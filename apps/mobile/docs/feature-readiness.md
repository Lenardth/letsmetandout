# SafeMeet feature readiness

Verified locally on 7 October 2026. This records implementation status, not a claim that all proposed features are complete.

| Feature | Current implementation | Remaining release work |
| --- | --- | --- |
| Customer/provider registration | Required signup choice, private immutable account type, separate protected navigation | Publish reviewed rules; test native and web signup, verification and multi-device login |
| Profiles and discovery | Profile completion/editing, real photo selection/cropping/upload and confirmed-profile browsing | Provision production Storage, publish reviewed Storage rules, test picker on physical iPhone, richer preferences and local language review |
| Provider listings | Restaurant, café and venue listings; owner-only writes | Edit UI, business verification, shop catalogue and host event workflows |
| Table bookings | SA dates, validated price/party size, mirrored requests, provider decisions, safe retry IDs | Availability calendar, capacity reservations, rescheduling and cancellation |
| Get-together groups | Create private group, invite by member ID, immutable budget/place/membership/terms | Friendly invitation links, verified customer lookup, expiry/cancellation and replacement flows |
| Gazata equal split | Integer-cent arithmetic; organiser receives rounding cents | Custom shares, own-item bills and sponsored shares |
| Member consent | Each member records their own approval/decline; withdrawal breaks unanimity | Enforce consent again in a trusted payment settlement workflow |
| Personal and group money | Client balance/transaction writes denied; personal read errors do not show invented balances | Select payment provider; build server ledger, verified webhooks, idempotency, reconciliation and payout/refund handling |
| Withdrawal charges | Agreed cap and deadline; own withdrawal request; tested estimate bounded by actual costs/contribution | No live charge exists; reviewed terms, server calculation, cancellation exceptions, replacement refunds and dispute resolution |
| South African experience | Rand amounts, South African time, local get-together wording | Confirm Gazata spelling, local speaker review, translated interfaces and inclusive imagery |
| Reviews and trust | Not implemented | Business verification, reviews tied to completed bookings and abuse/reporting tools |
| Communication | Signup verification/reset emails | Booking reminders, private enquiry threads and opt-in invitation sharing |
| Provider insights/offers | Not implemented | Booking conversion reports, offers and quiet-period availability |
| Venue hire/events/shop orders | Not implemented | Dedicated quote, hire, ticketing and order fulfilment workflows |

## Verification

32 unit/adapter tests and 11 emulator scenarios passed (the emulator reports 12 tests including its parent test) on 8 October 2026. Expo Doctor passed all 21 checks. TypeScript and the final Expo web export passed. See [security review](security-review.json) for the scoped audit.

- Unit/adapter checks: authentication deadlines and recovery, required roles, private/public signup fields, monetary validation, exact equal shares, consensus and withdrawal estimates.
- Firestore emulator: role immutability, ownership, mirrored booking integrity, production adapter retries, member-only group access, individual consent, fixed terms, rejected wallet tampering and orphan access.
- TypeScript and Expo web export: build checks only; neither establishes successful native device behaviour or live payments.
- Read-only Firebase checks identify the existing Standard default database. No tests publish production rules or create production users.

## Payment release gates

Choose a provider supporting the intended contributions, provider payouts and refunds. Define who holds funds and who is responsible for disputes. Keep credentials on the server. Build a ledger in integer cents, authenticate all requests, verify payment notifications, enforce unanimous approval at settlement, prevent replay/duplicate charges, and reconcile provider outcomes. Test failed payments, concurrent withdrawals, provider cancellations, refunds and stale approvals before enabling money movement.

The mobile client must never mark contributions paid, choose its own penalties, or treat an approval as payment confirmation. Money remains disabled until these gates pass.

### Profile photo verification

Three photo validation/URL tests, four demo configuration tests, and the Storage emulator scenario passed. Storage checks cover anonymous/unverified uploads, cross-user writes/deletes, file type/size limits, permitted owner replacements and rejected unsafe metadata changes. TypeScript passed and the updated iOS bundle returned HTTP 200. Physical iPhone photo selection/cropping has not been verified by the agent. Storage rules are a local prototype pending production review and deployment.

## Deployment preparation

Production app identifiers, URL scheme, EAS environment/channel configuration, credential exclusions and a build configuration guard are prepared. See [deployment steps and outstanding release gates](deployment.md). This is preparation for a non-payment beta, not a completed store release.
