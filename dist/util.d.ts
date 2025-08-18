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
export declare function getOptionsOfEnum(type: EnumType): EnumOption[];
/**
 * UID Generator class for creating unique identifiers
 */
export declare class UIDGenerator {
    private seed;
    /**
     * Create a new UIDGenerator
     * @param seed - Initial seed value (default: 0)
     */
    constructor(seed?: number);
    /**
     * Get the next unique identifier
     * @returns The next unique identifier
     */
    next(): number;
}
/**
 * Gets the type from a union type based on a value
 * @param type - The type (possibly a union)
 * @param value - The value to determine the type from
 * @returns The concrete type
 */
export declare function getTypeFromUnion(type: TypeWithMeta, value: unknown): TypeWithMeta;
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
export declare function getTypeInfo(type: TypeWithMeta | null): TypeInfo;
export {};
