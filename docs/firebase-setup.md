# Firebase setup (PIN gate)

One-time setup by the administrator. Nothing here needs a PIN in the repo, an env file or CI.

1. **Create a Firebase project** at console.firebase.google.com and upgrade it to the **Blaze** plan (required for Cloud Functions and Secret Manager; this app's usage stays within the free tier).
2. **Enable products:** Firestore (production mode, region `europe-west1`) and Authentication (click *Get started*; no sign-in provider is needed, the function mints custom tokens).
3. **Register a Web app** (Project settings > General) and paste its config into `src/firebase-config.ts`. These values are public by design.
4. **Install tools:** `npm i -g firebase-tools`, `firebase login`, `gcloud auth application-default login`, then `firebase use --add` to pick the project.
5. **Create the HMAC key** (a random 32-byte secret that never leaves Secret Manager):
   `openssl rand -hex 32 | firebase functions:secrets:set PIN_HMAC_KEY --data-file -`
   (The piped value ends in a newline; the function and the seed script both trim it, so they hash with the same key.)
6. **Deploy rules and the function:**
   `firebase deploy --only firestore:rules` and `cd functions && npm install && npm run deploy`.
   Then let the function sign custom tokens (without this, sign-in fails with `iam.serviceAccounts.signBlob denied`):
   `gcloud projects add-iam-policy-binding <project-id> --member=serviceAccount:<project-number>-compute@developer.gserviceaccount.com --role=roles/iam.serviceAccountTokenCreator`
   Wait a minute for it to propagate.
7. **Create a Member** (repeat per Member; each PIN must be unique):
   `cd functions && node scripts/seed-member.mjs --project <project-id> --member ../content/members/member.example.json`
   The `avatar` field is a path to an image file (jpeg, png or webp, at most 300 KB, relative to the Member file, e.g. `avatars/member-avatar.example.png`); the script inlines it.
   The Member file also needs a `scan` object (`memberNumber`, `homeStation`, `tier`, `issuedAt`, `validUntil`, `confirmedAt`): the script writes it, with the Member's `fullName`, `label` and `birthDate`, to the public Scan record `scans/{scanId}` shown on the Scan page, and stores the `scanId` on the Member. The id is kept across re-runs, so existing QR codes keep working.
   The script asks for the 4-digit PIN at a hidden prompt and stores only its HMAC.
   To change a Member's PIN or data, re-run it with `--uid <uid>` (printed on creation).
   To delete a Member (data, PIN and Auth user): `cd functions && node scripts/delete-member.mjs --project <project-id> --uid <uid>`.
8. **Optional hardening:** enable App Check, and set a budget alert on the project.

## How it works

`PIN gate` -> callable `signInWithPin` -> HMAC lookup in `pins/` -> custom token -> `members/{uid}` read under `firestore.rules`.
The QR code links to `scan.html?id=<scanId>`; the Scan page reads `scans/{scanId}` without signing in. The rules allow `get` of a single Scan record but not listing, so only someone holding the link can read it.
Three wrong attempts (counted across all devices, since a four-digit PIN has only 10,000 values) lock sign-in for five minutes.
The session lives in memory only, so every cold start asks for the PIN again.
