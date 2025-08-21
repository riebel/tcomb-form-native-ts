import { TypeWithMeta, TypeInfo } from './types/field.types';

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
