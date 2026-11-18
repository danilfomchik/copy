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
import { dirname, resolve } from 'node:path';
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

// "avatar" in the Member file is the path of an image file (relative to the Member
// file); it is stored inline in the Member document as a data URL. A Firestore
// document is limited to 1 MiB, so the image is capped well below that.
const MAX_AVATAR_BYTES = 300 * 1024;
const MAGIC = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
};
const MIME_BY_EXT = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

function avatarDataUrl(file, baseDir) {
  const path = resolve(baseDir, file);
  const mime = MIME_BY_EXT[path.slice(path.lastIndexOf('.')).toLowerCase()];
  if (!mime) throw new Error('Avatar must be a .jpg, .jpeg, .png or .webp file.');
  const bytes = readFileSync(path);
  if (!MAGIC[mime](bytes)) throw new Error(`Avatar ${file} is not a real ${mime} image.`);
  if (bytes.length > MAX_AVATAR_BYTES) {
    throw new Error(`Avatar is ${Math.round(bytes.length / 1024)} KB; the limit is ${MAX_AVATAR_BYTES / 1024} KB. Resize or compress it.`);
  }
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

const member = JSON.parse(readFileSync(args.member, 'utf8'));
for (const f of ['fullName', 'birthDate', 'avatar', 'updatedAt', 'label']) {
  if (typeof member[f] !== 'string' || !member[f]) throw new Error(`Member file is missing "${f}"`);
}
member.avatar = avatarDataUrl(member.avatar, dirname(resolve(args.member)));

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
