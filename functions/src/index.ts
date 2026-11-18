// signInWithPin: the only way to get a session. The PIN is never stored: each
// Member has a document pins/{HMAC-SHA256(PIN)} -> { uid }, where the HMAC key
// lives in Secret Manager (PIN_HMAC_KEY), not in env files, the repo or the
// client bundle. Wrong attempts are counted in total (not per IP: with four
// digits there are only 10,000 PINs): three wrong attempts within the window
// lock sign-in for everyone for five minutes. A correct PIN does not reset the
// counter, so it cannot be used to dodge the lockout.
import { createHmac } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

initializeApp();

const PIN_HMAC_KEY = defineSecret('PIN_HMAC_KEY');
const MAX_FAILURES = 3;
const LOCK_MS = 5 * 60 * 1000;

interface GateState {
  failures: number;
  lastFailureAt: number;
  lockedUntil: number;
}

export const signInWithPin = onCall(
  { region: 'europe-west1', secrets: [PIN_HMAC_KEY], maxInstances: 5 },
  async (request) => {
    const pin = (request.data as { pin?: unknown } | undefined)?.pin;
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      throw new HttpsError('invalid-argument', 'PIN must be four digits.');
    }

    const db = getFirestore();
    const stateRef = db.doc('gate/state');
    const now = Date.now();

    // Decide inside a transaction so concurrent guesses cannot beat the counter.
    const allowed = await db.runTransaction(async (tx) => {
      const state = (await tx.get(stateRef)).data() as GateState | undefined;
      if (state && state.lockedUntil > now) return false;
      const stale = !state || now - state.lastFailureAt > LOCK_MS || state.lockedUntil > 0;
      const failures = stale ? 0 : state.failures;
      // Reserve an attempt up front; it is released below on success.
      const next: GateState = {
        failures: failures + 1,
        lastFailureAt: now,
        lockedUntil: failures + 1 >= MAX_FAILURES ? now + LOCK_MS : 0,
      };
      tx.set(stateRef, next);
      return true;
    });
    if (!allowed) throw new HttpsError('resource-exhausted', 'Locked.');

    const hash = createHmac('sha256', PIN_HMAC_KEY.value()).update(pin).digest('hex');
    const snap = await db.doc(`pins/${hash}`).get();
    const uid = snap.exists ? (snap.data() as { uid?: string }).uid : undefined;

    if (!uid) {
      const after = (await stateRef.get()).data() as GateState;
      if (after.lockedUntil > Date.now()) throw new HttpsError('resource-exhausted', 'Locked.');
      throw new HttpsError('permission-denied', 'Wrong PIN.');
    }
    // Success: give back the attempt reserved above (and the lock it may have tripped).
    await db.runTransaction(async (tx) => {
      const s = (await tx.get(stateRef)).data() as GateState;
      const failures = Math.max(0, s.failures - 1);
      tx.set(stateRef, { ...s, failures, lockedUntil: failures < MAX_FAILURES ? 0 : s.lockedUntil });
    });
    return { token: await getAuth().createCustomToken(uid) };
  },
);
