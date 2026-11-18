# Members sign in with a PIN checked by a Firebase backend

Supersedes [0001](0001-static-offline-content.md) for the Member's personal data. Orbit Pass now asks for a four-digit PIN before showing anything, and the Member's data is no longer bundled: it is stored in Firestore and readable only by the Member who entered their PIN. A Cloud Function looks the PIN up by its HMAC (key in Secret Manager) and returns a Firebase custom token; Firestore rules then limit each Member to their own record. Three wrong attempts, counted across all devices, lock sign-in for five minutes.

We rejected shipping a hashed PIN in the bundle (a four-digit PIN falls to offline brute force in milliseconds) and keeping the PIN in an env file or the repo (readable by anyone with the build). Only a server-side check keeps the PIN secret. The cost is that the PIN cannot be checked offline.

## Consequences

- The shell, Services, Listings, FAQ and interface text stay in the Content file and still work offline once loaded. The Member data exists only in memory for the session.
- A cold start with no network shows the Offline page; a signed-in session keeps working offline.
- The Content-Security-Policy now allows connections to Google API and Cloud Functions hosts, not only to the app's own origin.
- Accounts are created by hand with `functions/scripts/seed-member.mjs`; there is no sign-up.
- The Member record holds `fullName`, `birthDate`, `label`, `updatedAt` and the Avatar as an inline data URL (jpeg, png or webp, at most 300 KB); the seed script validates it.
- Wrong attempts are counted in one shared record, so one person's mistakes lock sign-in for every Member.
- The "no requests leave the origin" test from 0001 no longer applies and was removed.
