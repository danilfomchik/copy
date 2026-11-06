// Tiny dependency-free schema combinators. Each validator returns a list of
// human-readable problems (with the JSON path) instead of throwing, so the
// build can report every mistake in the Content file at once.

export type Problems = string[];
export interface Schema<T> {
  check(value: unknown, path: string, out: Problems): void;
  readonly _type?: T;
}
export type Infer<S> = S extends Schema<infer T> ? T : never;

const describe = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'масив' : typeof v);

export const str = (): Schema<string> => ({
  check(v, path, out) {
    if (typeof v !== 'string') out.push(`${path}: очікується рядок, отримано ${describe(v)}`);
    else if (v.trim() === '') out.push(`${path}: рядок не може бути порожнім`);
  },
});

export const obj = <S extends Record<string, Schema<any>>>(
  shape: S,
): Schema<{ [K in keyof S]: Infer<S[K]> }> => ({
  check(v, path, out) {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) {
      out.push(`${path}: очікується об'єкт, отримано ${describe(v)}`);
      return;
    }
    const rec = v as Record<string, unknown>;
    for (const key of Object.keys(shape)) {
      if (!(key in rec)) out.push(`${path}.${key}: відсутнє обов'язкове поле`);
      else shape[key].check(rec[key], `${path}.${key}`, out);
    }
    for (const key of Object.keys(rec)) {
      if (!(key in shape)) out.push(`${path}.${key}: невідоме поле (можлива помилка в назві)`);
    }
  },
});

export const arr = <T>(item: Schema<T>): Schema<T[]> => ({
  check(v, path, out) {
    if (!Array.isArray(v)) {
      out.push(`${path}: очікується масив, отримано ${describe(v)}`);
      return;
    }
    v.forEach((x, i) => item.check(x, `${path}[${i}]`, out));
  },
});

export function validate<T>(schema: Schema<T>, value: unknown): Problems {
  const out: Problems = [];
  schema.check(value, 'content', out);
  return out;
}
