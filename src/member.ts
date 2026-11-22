import { SCAN_ID } from '../qr-message';

// The Member's personal data. It is stored in Firestore (members/{uid}), never
// bundled, and only readable by the signed-in Member (see firestore.rules).
export interface Member {
  fullName: string;
  birthDate: string;
  /** Inline image as a data URL (jpeg, png or webp); the admin supplies a file, see seed-member.mjs. */
  avatar: string;
  /** Free text shown in the card ribbon, e.g. "08.10.2026 • Документ оновлено о 09:10". */
  updatedAt: string;
  /** Short text shown above the Member's name on the card. */
  label: string;
  /** Id of the Member's public Scan record (scans/{scanId}), encoded in the QR code. Missing until re-seeded. */
  scanId?: string;
}

const FIELDS = ['fullName', 'birthDate', 'avatar', 'updatedAt', 'label'] as const;
const AVATAR = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

export function parseMember(data: unknown): Member {
  const d = (data ?? {}) as Record<string, unknown>;
  const out = {} as Member;
  for (const f of FIELDS) {
    if (typeof d[f] !== 'string') throw new Error(`Member field missing: ${f}`);
    out[f] = d[f] as string;
  }
  if (!AVATAR.test(out.avatar)) throw new Error('Member field invalid: avatar');
  if (typeof d.scanId === 'string' && SCAN_ID.test(d.scanId)) out.scanId = d.scanId;
  return out;
}

// The Scan record: the public copy of a Member's details shown on the Scan
// page. It lives in scans/{scanId}, which anyone holding the id may read (see
// firestore.rules), so it holds only these fields: never the avatar or PIN.
export interface ScanRecord {
  fullName: string;
  label: string;
  birthDate: string;
  memberNumber: string;
  homeStation: string;
  tier: string;
  issuedAt: string;
  validUntil: string;
  confirmedAt: string;
}

const SCAN_FIELDS = [
  'fullName', 'label', 'birthDate', 'memberNumber', 'homeStation', 'tier', 'issuedAt', 'validUntil', 'confirmedAt',
] as const;

export function parseScanRecord(data: unknown): ScanRecord {
  const d = (data ?? {}) as Record<string, unknown>;
  const out = {} as ScanRecord;
  for (const f of SCAN_FIELDS) {
    if (typeof d[f] !== 'string') throw new Error(`Scan field missing: ${f}`);
    out[f] = d[f] as string;
  }
  return out;
}
