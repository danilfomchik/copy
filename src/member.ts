// The Member's personal data. It is stored in Firestore (members/{uid}), never
// bundled, and only readable by the signed-in Member (see firestore.rules).
export interface Member {
  fullName: string;
  birthDate: string;
  tier: string;
  membershipNumber: string;
}

const FIELDS: (keyof Member)[] = ['fullName', 'birthDate', 'tier', 'membershipNumber'];

export function parseMember(data: unknown): Member {
  const d = (data ?? {}) as Record<string, unknown>;
  const out = {} as Member;
  for (const f of FIELDS) {
    if (typeof d[f] !== 'string') throw new Error(`Member field missing: ${f}`);
    out[f] = d[f] as string;
  }
  return out;
}
