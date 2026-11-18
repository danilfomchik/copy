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
}

const FIELDS: (keyof Member)[] = ['fullName', 'birthDate', 'avatar', 'updatedAt', 'label'];
const AVATAR = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

export function parseMember(data: unknown): Member {
  const d = (data ?? {}) as Record<string, unknown>;
  const out = {} as Member;
  for (const f of FIELDS) {
    if (typeof d[f] !== 'string') throw new Error(`Member field missing: ${f}`);
    out[f] = d[f] as string;
  }
  if (!AVATAR.test(out.avatar)) throw new Error('Member field invalid: avatar');
  return out;
}
