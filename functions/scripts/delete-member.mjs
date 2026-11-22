// Deletes a Member: members/{uid}, their Scan record scans/{scanId}, every PIN
// document pointing at that uid, and the Firebase Auth user (which also ends any signed-in session). Run by the
// administrator, never in CI. This cannot be undone.
//
//   node scripts/delete-member.mjs --project <id> --uid <uid>
//
// Shows who is about to be deleted and asks you to type "delete" to confirm.
// Needs: `gcloud auth application-default login` and access to the project.
import readline from 'node:readline';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, all) => (v.startsWith('--') ? [...acc, [v.slice(2), all[i + 1]]] : acc), []),
);
if (!args.project || !args.uid) {
  console.error('Usage: node scripts/delete-member.mjs --project <id> --uid <uid>');
  process.exit(1);
}
// The uid goes into a Firestore path, so refuse anything that could change it.
if (!/^[A-Za-z0-9_-]{1,128}$/.test(args.uid)) throw new Error('That does not look like a Member uid.');

function ask(question) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); res(answer.trim()); });
  });
}

// The Auth API needs a quota project on local Application Default Credentials.
function authHelp(e) {
  if (!String(e?.message).includes('quota project')) return e;
  return new Error(
    `Firebase Auth refused the request: no quota project is set.\n` +
      `Run: gcloud auth application-default set-quota-project ${args.project}\n` +
      `then re-run this command. Firestore data deleted so far stays deleted.`,
  );
}

initializeApp({ projectId: args.project });
const db = getFirestore();

const ref = db.doc(`members/${args.uid}`);
const snap = await ref.get();
const pins = await db.collection('pins').where('uid', '==', args.uid).get();
const authUser = await getAuth().getUser(args.uid).catch((e) => {
  if (e?.code === 'auth/user-not-found') return null;
  throw authHelp(e);
});
if (!snap.exists && pins.empty && !authUser) throw new Error(`No Member with uid ${args.uid} in ${args.project}.`);

console.log(`Member:  ${snap.exists ? `${snap.data().fullName} (${snap.data().label})` : '(no members/ document; finishing an interrupted delete)'}`);
console.log(`uid:     ${args.uid}`);
console.log(`PINs:    ${pins.size} will be removed`);
if ((await ask('Type "delete" to permanently remove this Member: ')) !== 'delete') {
  console.log('Cancelled. Nothing was deleted.');
  process.exit(0);
}

// PINs first: once they are gone the Member can no longer sign in.
await Promise.all(pins.docs.map((d) => d.ref.delete()));
const scanId = snap.exists ? snap.data().scanId : undefined;
if (typeof scanId === 'string' && /^[0-9a-f]{32}$/.test(scanId)) await db.doc(`scans/${scanId}`).delete();
await ref.delete();
if (authUser) await getAuth().deleteUser(args.uid).catch((e) => { throw authHelp(e); });
console.log(`Member ${args.uid} deleted.`);
