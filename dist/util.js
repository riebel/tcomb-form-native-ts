"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeInfo = exports.getTypeFromUnion = exports.UIDGenerator = exports.getOptionsOfEnum = void 0;
/**
 * Gets options for an enum type
 * @param type - The enum type
 * @returns Array of options
 */
function getOptionsOfEnum(type) {
    const enums = type.meta.map;
    return Object.keys(enums).map(value => ({
        value,
        text: enums[value],
    }));
}
exports.getOptionsOfEnum = getOptionsOfEnum;
/**
 * UID Generator class for creating unique identifiers
 */
class UIDGenerator {
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
    next() {
        return this.seed++;
    }
}
exports.UIDGenerator = UIDGenerator;
/**
 * Checks if a type contains a union
 * @param type - The type to check
 * @returns True if the type contains a union
 */
function containsUnion(type) {
    var _a;
    return Boolean(((_a = type === null || type === void 0 ? void 0 : type.meta) === null || _a === void 0 ? void 0 : _a.kind) === 'union');
}
/**
 * Gets the concrete type from a union type based on a value
 * @param type - The union type
 * @param value - The value to determine the type from
 * @returns The concrete type
 */
function getUnionConcreteType(type, value) {
    var _a;
    if (!containsUnion(type)) {
        return type;
    }
    for (const t of type.meta.types) {
        try {
            t(value);
            return t;
        }
        catch (e) {
            // Try the next type
        }
    }
    return ((_a = type.meta.types) === null || _a === void 0 ? void 0 : _a[0]) || type;
}
/**
 * Gets the type from a union type based on a value
 * @param type - The type (possibly a union)
 * @param value - The value to determine the type from
 * @returns The concrete type
 */
function getTypeFromUnion(type, value) {
    return containsUnion(type) ? getUnionConcreteType(type, value) : type;
}
exports.getTypeFromUnion = getTypeFromUnion;
/**
 * Gets type information for a given type
 * @param type - The type to get info for
 * @returns Type information
 */
function getTypeInfo(type) {
    const info = {
        kind: 'irreducible',
        type: type,
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
exports.getTypeInfo = getTypeInfo;
