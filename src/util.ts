import {
  TcombType,
  TypeInfo,
  ValidationContext,
  ComponentOptions,
  UIDGenerator as IUIDGenerator,
} from './types';

const t = require('tcomb-validation');

export function getOptionsOfEnum(type: TcombType): Array<{ value: string; text: string }> {
  let enumType = type;
  if (type.meta.kind === 'maybe' && type.meta.type) {
    enumType = type.meta.type;
  }

  const enums = enumType.meta.map;

  if (!enums) {
    return [];
  }

  const keys = Object.keys(enums);
  const filteredKeys = keys.filter(value => typeof enums[value] !== 'undefined');

  const options = filteredKeys.map(value => ({
    value,
    text: String(enums[value]),
  }));

  return options;
}

export function getTypeInfo(
  type: TcombType | Record<string, unknown> | object | Function,
): TypeInfo {
  if (!isTcombType(type)) {
    return {
      type: type as TcombType,
      isMaybe: false,
      isSubtype: false,
      innerType: type as TcombType,
      getValidationErrorMessage: undefined,
    };
  }

  let innerType = type;
  let isMaybe = false;
  let isSubtype = false;
  let kind: string;
  let innerGetValidationErrorMessage:
    | ((_value: unknown, _path: string[], _context: ValidationContext) => string)
    | undefined;

  const tcombType = type as TcombType;

  if (tcombType.meta && tcombType.meta.kind === 'maybe') {
    isMaybe = true;
  }

  if (t.getTypeName && typeof t.getTypeName === 'function') {
    const typeName = t.getTypeName(tcombType);
    if (typeName && typeName.includes('?')) {
      isMaybe = true;
    }
  }

  // Unwrap nested type wrappers (maybe, subtype) to get the core type
  while (innerType && innerType.meta) {
    kind = innerType.meta.kind;
    if (t.Function.is(innerType.getValidationErrorMessage)) {
      innerGetValidationErrorMessage = innerType.getValidationErrorMessage;
    }
    if (kind === 'maybe') {
      isMaybe = true;
      innerType = innerType.meta.type!;
      continue;
    }
    if (kind === 'subtype') {
      isSubtype = true;
      innerType = innerType.meta.type!;
      continue;
    }
    break;
  }

  const getValidationErrorMessage = innerGetValidationErrorMessage
    ? (value: unknown, path: string[], context: ValidationContext) => {
        const result = t.validate(value, type, { path, context });
        if (!result.isValid()) {
          for (let i = 0, len = result.errors.length; i < len; i++) {
            if (t.Function.is(result.errors[i].expected.getValidationErrorMessage)) {
              return result.errors[i].message;
            }
          }
          return innerGetValidationErrorMessage!(value, path, context);
        }
        return '';
      }
    : undefined;

  return {
    type,
    isMaybe,
    isSubtype,
    innerType,
    getValidationErrorMessage,
  };
}

function underscored(s: string): string {
  return s
    .trim()
    .replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function humanize(s: string): string {
  return capitalize(underscored(s).replace(/_id$/, '').replace(/_/g, ' '));
}

export function merge<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  a: T,
  b: U,
): T & U {
  return t.mixin(t.mixin({}, a), b, true);
}

export function move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const element = arr.splice(fromIndex, 1)[0];
  arr.splice(toIndex, 0, element);
  return arr;
}

export class UIDGenerator implements IUIDGenerator {
  private seed: string;
  private counter: number;

  constructor(seed: string) {
    this.seed = 'tfid-' + seed + '-';
    this.counter = 0;
  }

  next(): string {
    return this.seed + this.counter++;
  }
}

function containsUnion(type: TcombType): boolean {
  if (!type || !type.meta) {
    return false;
  }
  switch (type.meta.kind) {
    case 'union':
      return true;
    case 'maybe':
    case 'subtype':
      return type.meta.type ? containsUnion(type.meta.type) : false;
    default:
      return false;
  }
}

function getUnionConcreteType(type: TcombType, value: unknown): TcombType {
  const kind = type.meta.kind;
  if (kind === 'union') {
    if (type.dispatch && typeof type.dispatch === 'function') {
      const concreteType = type.dispatch(value);
      if (process.env.NODE_ENV !== 'production') {
        t.assert(
          t.isType(concreteType),
          () =>
            'Invalid value ' +
            t.assert.stringify(value) +
            ' supplied to ' +
            t.getTypeName(type) +
            ' (no constructor returned by dispatch)',
        );
      }
      return concreteType;
    }
    return type;
  } else if (kind === 'maybe') {
    if (type.meta.type) {
      const innerType = getUnionConcreteType(type.meta.type, value);
      if (innerType !== type.meta.type) {
        return innerType;
      }
      return t.maybe(innerType, type.meta.name);
    }
    return type;
  } else if (kind === 'subtype') {
    if (type.meta.type) {
      const innerType = getUnionConcreteType(type.meta.type, value);
      if (innerType !== type.meta.type) {
        return innerType;
      }
      return t.subtype(innerType, type.meta.predicate!, type.meta.name);
    }
    return type;
  }
  return type;
}

export function isTcombType(type: unknown): type is TcombType {
  return (
    (typeof type === 'object' || typeof type === 'function') &&
    type !== null &&
    'meta' in type &&
    'is' in type
  );
}

export function getTypeFromUnion(
  type: TcombType | Record<string, unknown> | object | Function,
  value: unknown,
): TcombType | Record<string, unknown> | object | Function {
  if (isTcombType(type) && containsUnion(type)) {
    const concreteType = getUnionConcreteType(type, value);
    return concreteType;
  }
  return type;
}

function getUnion(type: TcombType): TcombType {
  if (type.meta.kind === 'union') {
    return type;
  }
  return getUnion(type.meta.type!);
}

function findIndex<T>(arr: T[], element: T): number {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (arr[i] === element) {
      return i;
    }
  }
  return -1;
}

export function getComponentOptions(
  options:
    | ComponentOptions
    | ComponentOptions[]
    | ((value: unknown) => ComponentOptions)
    | null
    | undefined,
  defaultOptions: ComponentOptions,
  value: unknown,
  type: TcombType | Record<string, unknown> | object | Function,
): ComponentOptions {
  if (t.Nil.is(options)) {
    return defaultOptions;
  }
  if (t.Function.is(options)) {
    return (options as (value: unknown) => ComponentOptions)(value);
  }
  if (t.Array.is(options) && isTcombType(type) && containsUnion(type)) {
    const union = getUnion(type);
    const concreteType = union.dispatch!(value);
    const index = findIndex(union.meta.types!, concreteType);
    return getComponentOptions(
      (options as ComponentOptions[])[index],
      defaultOptions,
      value,
      concreteType,
    );
  }
  return options as ComponentOptions;
}

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function toNull(value: unknown): unknown {
  return (t.String.is(value) && (value as string).trim() === '') || isNil(value) ? null : value;
}

export function parseNumber(value: unknown): number | null {
  if (!t.String.is(value)) {
    return toNull(value) as number | null;
  }
  const n = parseFloat(value as string);
  const isNumeric = parseFloat(value as string) - n + 1 >= 0;
  return isNumeric ? n : (toNull(value) as number | null);
}

export function getFormComponentName(
  type: TcombType | Record<string, unknown> | object | Function,
  options: ComponentOptions,
): string {
  if (options.factory) {
    return 'Custom';
  }

  if (!isTcombType(type)) {
    return 'Struct';
  }

  if (type.getTcombFormFactory) {
    return 'Custom';
  }
  const name = t.getTypeName(type);
  switch (type.meta.kind) {
    case 'irreducible':
      return type === t.Boolean ? 'Checkbox' : type === t.Date ? 'DatePicker' : 'Textbox';
    case 'struct':
      return 'Struct';
    case 'list':
      return 'List';
    case 'enums':
      return 'Select';
    case 'maybe':
    case 'subtype':
      return getFormComponentName(type.meta.type!, options);
    default:
      throw new Error(`[tcomb-form-native] unsupported type ${name}`);
  }
}

function sortByText(a: { text: string }, b: { text: string }): number {
  return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
}

export function getComparator(
  order: 'asc' | 'desc',
): (a: { text: string }, b: { text: string }) => number {
  return {
    asc: sortByText,
    desc: (a: { text: string }, b: { text: string }) => -sortByText(a, b),
  }[order];
}
