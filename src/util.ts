import { TypeWithMeta, TypeInfo } from './types/field.types';

/** Simple UID generator */
export class UIDGenerator {
  private readonly prefix: string;
  private counter: number;

  /** Format: tfid-<seed>-<n> */
  constructor(seed: number | string = 0) {
    const s = typeof seed === 'number' ? String(seed) : seed;
    this.prefix = `tfid-${s}-`;
    this.counter = 0;
  }

  /** Next unique id */
  next(): string {
    const id = `${this.prefix}${this.counter}`;
    this.counter += 1;
    return id;
  }
}

/** Derive shape flags from a tcomb-like type */
export function getTypeInfo(type: TypeWithMeta | null): TypeInfo {
  console.log('[getTypeInfo] Called with type:', {
    hasType: !!type,
    typeName: type?.name || 'unknown',
    typeDisplayName: type?.displayName || 'unknown',
    hasMeta: !!type?.meta,
    metaKeys: type?.meta ? Object.keys(type.meta) : [],
    meta: type?.meta,
  });

  const info: TypeInfo = {
    kind: 'irreducible',
    type: type as TypeWithMeta,
    isMaybe: false,
    isSubtype: false,
    isEnum: false,
    isList: false,
    isDict: false,
    isPrimitive: false,
    isObject: false,
    isUnion: false,
    isRefinement: false,
  };

  if (!type) {
    return info;
  }

  if (type.meta) {
    const kind = (type.meta as { kind?: string }).kind;
    if (typeof kind === 'string' && kind.length > 0) {
      // Preserve canonical kind string from tcomb meta
      info.kind = kind as TypeInfo['kind'];
    }
    info.isMaybe = kind === 'maybe';
    info.isSubtype = kind === 'subtype';
    info.isEnum = kind === 'enums';
    info.isList = kind === 'list';
    info.isDict = kind === 'dict';
    info.isUnion = kind === 'union';
    info.isRefinement = kind === 'refinement';
  } else {
  }

  info.isPrimitive =
    !info.isMaybe &&
    !info.isSubtype &&
    !info.isEnum &&
    !info.isList &&
    !info.isDict &&
    !info.isUnion &&
    !info.isRefinement;
  info.isObject = info.isSubtype || info.isDict;
  return info;
}

/* Utility helpers */

/** Humanize: firstName -> First name; first_name -> First name */
export function humanize(input: string): string {
  const withSpaces = input
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/** Shallow merge returning a new object */
export function merge<A extends object, B extends Partial<A>>(a: A, b: B): A {
  return Object.assign({}, a, b);
}

/** Move array item from index `from` to `to` (non-mutating) */
export function move<T>(arr: readonly T[], from: number, to: number): T[] {
  const len = arr.length;
  if (from < 0 || from >= len || to < 0 || to >= len || from === to) {
    return arr.slice();
  }
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Type guards for meta
function hasMeta(x: unknown): x is { meta: Record<string, unknown> } {
  return typeof x === 'object' && x !== null && 'meta' in (x as Record<string, unknown>);
}
function isEnums(x: unknown): x is { meta: { kind: string; map?: Record<string, unknown> } } {
  if (!hasMeta(x)) return false;
  const kind = (x as { meta: Record<string, unknown> }).meta.kind;
  return typeof kind === 'string';
}

/** Build enum options: [{ value, text }] */
export function getOptionsOfEnum(
  type: TypeWithMeta | null,
): ReadonlyArray<{ value: string; text: string }> {
  if (!type || !isEnums(type) || type.meta.kind !== 'enums') return [];
  const map = (type.meta as { map?: Record<string, unknown> }).map;
  if (!map) return [];
  return Object.keys(map).map(key => ({ value: key, text: String(map[key]) }));
}

/** For union types with dispatch, get concrete type for value */
export function getTypeFromUnion(
  union: TypeWithMeta | null,
  value: unknown,
): TypeWithMeta | undefined {
  if (!union || !hasMeta(union)) return undefined;
  const meta = union.meta as { kind?: string; dispatch?: (v: unknown) => unknown };
  if (meta.kind !== 'union' || typeof meta.dispatch !== 'function') return undefined;
  const concrete = meta.dispatch(value);
  return (concrete as TypeWithMeta) ?? undefined;
}

/** Resolve component options from static, function, array (union), or record */
export function getComponentOptions<O>(
  options: O | ((value: unknown) => O) | Record<string, O> | Array<O> | undefined,
  value: unknown,
  type?: TypeWithMeta | null,
): O | undefined {
  // Function form
  if (typeof options === 'function') {
    return (options as (v: unknown) => O)(value);
  }
  if (!options) return undefined;

  // Array form: union variant options in declaration order
  if (Array.isArray(options) && type && hasMeta(type)) {
    const meta = type.meta as {
      kind?: string;
      types?: TypeWithMeta[];
      dispatch?: (v: unknown) => unknown;
    };
    if (meta.kind === 'union' && Array.isArray(meta.types) && typeof meta.dispatch === 'function') {
      const concrete = meta.dispatch(value) as TypeWithMeta | undefined;
      if (concrete) {
        const idx = meta.types.findIndex(t => t === concrete);
        if (idx >= 0 && idx < options.length) {
          const chosen = options[idx];
          // Recurse for nested unions
          return getComponentOptions(chosen as unknown as O, value, concrete) ?? (chosen as O);
        }
      }
    }
  }

  // Record form: keyed by concrete type name
  if (typeof options === 'object' && options !== null) {
    const asRecord = options as Record<string, O> & Partial<O>;
    const concrete = getTypeFromUnion(type ?? null, value);
    if (concrete && hasMeta(concrete)) {
      const meta = concrete.meta as { name?: string };
      const key = meta.name || (concrete as { name?: string }).name || undefined;
      if (key && Object.prototype.hasOwnProperty.call(asRecord, key)) {
        return asRecord[key] as O;
      }
    }
    return options as O;
  }

  return undefined;
}
