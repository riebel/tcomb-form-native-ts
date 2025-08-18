import { TypeWithMeta } from './types/template.types';

interface EnumType {
  meta: {
    map: Record<string, string>;
  };
}

interface EnumOption {
  value: string;
  text: string | undefined;
}

/**
 * Gets options for an enum type
 * @param type - The enum type
 * @returns Array of options
 */
export function getOptionsOfEnum(type: EnumType): EnumOption[] {
  const enums = type.meta.map;
  return Object.keys(enums).map(value => ({
    value,
    text: enums[value],
  }));
}

/**
 * UID Generator class for creating unique identifiers
 */
export class UIDGenerator {
  private seed: number;

  /**
   * Create a new UIDGenerator
   * @param seed - Initial seed value (default: 0)
   */
  constructor(seed = 0) {
    this.seed = seed;
  }

  /**
   * Get the next unique identifier
   * @returns The next unique identifier
   */
  next(): number {
    return this.seed++;
  }
}

/**
 * Checks if a type contains a union
 * @param type - The type to check
 * @returns True if the type contains a union
 */
function containsUnion(type: TypeWithMeta): boolean {
  return Boolean(type?.meta?.kind === 'union');
}

/**
 * Gets the concrete type from a union type based on a value
 * @param type - The union type
 * @param value - The value to determine the type from
 * @returns The concrete type
 */
function getUnionConcreteType(type: TypeWithMeta, value: unknown): TypeWithMeta {
  if (!containsUnion(type)) {
    return type;
  }

  for (const t of type.meta.types as TypeWithMeta[]) {
    try {
      t(value);
      return t;
    } catch (e) {
      // Try the next type
    }
  }

  return (type.meta.types?.[0] as TypeWithMeta) || type;
}

/**
 * Gets the type from a union type based on a value
 * @param type - The type (possibly a union)
 * @param value - The value to determine the type from
 * @returns The concrete type
 */
export function getTypeFromUnion(type: TypeWithMeta, value: unknown): TypeWithMeta {
  return containsUnion(type) ? getUnionConcreteType(type, value) : type;
}

interface TypeInfo {
  kind: 'irreducible' | 'struct' | 'list';
  type: TypeWithMeta;
  isMaybe: boolean;
  isSubtype: boolean;
  isEnum: boolean;
  isList: boolean;
  isDict: boolean;
  isPrimitive: boolean;
  isObject: boolean;
  isUnion: boolean;
  isRefinement: boolean;
}

/**
 * Gets type information for a given type
 * @param type - The type to get info for
 * @returns Type information
 */
export function getTypeInfo(type: TypeWithMeta | null): TypeInfo {
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
    info.isMaybe = type.meta.kind === 'maybe';
    info.isSubtype = type.meta.kind === 'subtype';
    info.isEnum = type.meta.kind === 'enums';
    info.isList = type.meta.kind === 'list';
    info.isDict = type.meta.kind === 'dict';
    info.isUnion = type.meta.kind === 'union';
    info.isRefinement = type.meta.kind === 'refinement';
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
