// The only module that talks to Firebase. A PIN is sent to the `signInWithPin`
// Cloud Function, which returns a custom token; the Member record is then read
// from Firestore under the Firestore rules. The session is kept in memory only,
// so every cold start (and every reload) lands on the PIN gate again.
import { initializeApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, setPersistence, signInWithCustomToken, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc, getFirestore } from 'firebase/firestore/lite';
import { FUNCTIONS_REGION, firebaseConfig } from './firebase-config';
import { parseMember, type Member } from './member';

export type SignInResult =
  | { ok: true; member: Member }
  | { ok: false; reason: 'wrong' | 'locked' | 'offline' };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const ready = setPersistence(auth, inMemoryPersistence);

function codeOf(e: unknown): string {
  return typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
}

export async function signInWithPin(pin: string): Promise<SignInResult> {
  try {
    await ready;
    const call = httpsCallable<{ pin: string }, { token: string }>(
      getFunctions(app, FUNCTIONS_REGION),
      'signInWithPin',
    );
    const { data } = await call({ pin });
    const { user } = await signInWithCustomToken(auth, data.token);
    const snap = await getDoc(doc(getFirestore(app), 'members', user.uid));
    return { ok: true, member: parseMember(snap.data()) };
  } catch (e) {
    const code = codeOf(e);
    if (code === 'functions/permission-denied' || code === 'functions/invalid-argument') {
      return { ok: false, reason: 'wrong' };
    }
    if (code === 'functions/resource-exhausted') return { ok: false, reason: 'locked' };
    await signOut(auth).catch(() => {});
    return { ok: false, reason: 'offline' };
  }
}

export function lock(): Promise<void> {
  return signOut(auth).catch(() => {});
}
