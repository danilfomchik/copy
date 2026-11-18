// Creates (or replaces) a Member: writes members/{uid} and the PIN lookup
// document pins/{HMAC(PIN)}. Run by the administrator, never in CI.
//
//   node scripts/seed-member.mjs --project <id> --member ../content/member.example.json [--uid <uid>]
//
// The PIN is typed at a hidden prompt, so it never lands in shell history, env
// files or the repo. The HMAC key is read from Secret Manager through gcloud.
// Needs: `gcloud auth application-default login` and access to the project.
import { createHmac, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import readline from 'node:readline';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, all) => (v.startsWith('--') ? [...acc, [v.slice(2), all[i + 1]]] : acc), []),
);
if (!args.project || !args.member) {
  console.error('Usage: node scripts/seed-member.mjs --project <id> --member <file.json> [--uid <uid>]');
  process.exit(1);
}

const member = JSON.parse(readFileSync(args.member, 'utf8'));
for (const f of ['fullName', 'birthDate', 'tier', 'membershipNumber']) {
  if (typeof member[f] !== 'string') throw new Error(`Member file is missing "${f}"`);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

const pin = await askHidden('PIN (4 digits): ');
if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly four digits.');

const key = execFileSync(
  'gcloud',
  ['secrets', 'versions', 'access', 'latest', '--secret=PIN_HMAC_KEY', `--project=${args.project}`],
  { encoding: 'utf8' },
).trim();
const hash = createHmac('sha256', key).update(pin).digest('hex');

initializeApp({ projectId: args.project });
const db = getFirestore();
const uid = args.uid ?? randomUUID();

const existing = await db.doc(`pins/${hash}`).get();
if (existing.exists && existing.data().uid !== uid) {
  throw new Error('That PIN already belongs to another Member. Pick a different one.');
}
await db.doc(`members/${uid}`).set(member);
await db.doc(`pins/${hash}`).set({ uid });
// Changing a Member's PIN must retire the old one.
const old = await db.collection('pins').where('uid', '==', uid).get();
await Promise.all(old.docs.filter((d) => d.id !== hash).map((d) => d.ref.delete()));
console.log(`Member ${uid} saved. Re-run with --uid ${uid} to change their data or PIN.`);
