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

export interface ArrOptions {
  /** The array must have at least one entry. */
  nonEmpty?: boolean;
  /** Object entries must have distinct values of this string field. */
  uniqueBy?: string;
}

export const arr = <T>(item: Schema<T>, opts: ArrOptions = {}): Schema<T[]> => ({
  check(v, path, out) {
    if (!Array.isArray(v)) {
      out.push(`${path}: очікується масив, отримано ${describe(v)}`);
      return;
    }
    if (opts.nonEmpty && v.length === 0) out.push(`${path}: масив не може бути порожнім`);
    v.forEach((x, i) => item.check(x, `${path}[${i}]`, out));
    if (opts.uniqueBy) {
      const key = opts.uniqueBy;
      const seen = new Map<string, number>();
      v.forEach((x, i) => {
        const id = (x as Record<string, unknown> | null)?.[key];
        if (typeof id !== 'string') return;
        const first = seen.get(id);
        if (first === undefined) seen.set(id, i);
        else out.push(`${path}[${i}].${key}: значення "${id}" повторюється (вже є в ${path}[${first}])`);
      });
    }
  },
});

export function validate<T>(schema: Schema<T>, value: unknown): Problems {
  const out: Problems = [];
  schema.check(value, 'content', out);
  return out;
}
