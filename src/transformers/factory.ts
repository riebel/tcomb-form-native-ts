import { Transformer, NumberTransformer } from '../types';
import { Nil } from '../tcomb';
import { toNull, parseNumber } from '../util';

export class TransformerFactory {
  static createNilAwareTransformer<T>(
    defaultValue: T,
    formatFn?: (value: unknown) => T,
    parseFn?: (value: unknown) => unknown,
  ): Transformer {
    return {
      format: (value: unknown) =>
        Nil.is(value) ? defaultValue : formatFn ? formatFn(value) : (value as T),
      parse: (value: unknown) => (parseFn ? parseFn(value) : value),
    };
  }

  static createStringTransformer(): Transformer {
    return this.createNilAwareTransformer('', value => String(value), toNull);
  }

  static createNumberTransformer(): NumberTransformer {
    return {
      format: (value: string | number) => {
        return Nil.is(value) ? '' : String(value);
      },
      parse: (value: string | null) => {
        if (Nil.is(value)) {
          return null;
        }

        if (typeof value === 'string' && value.trim() === '') {
          return null;
        }

        if (typeof value === 'string') {
          const normalizedValue = value.replace(/,/g, '.');
          return parseNumber(normalizedValue);
        }

        return parseNumber(value);
      },
    };
  }

  static createBooleanTransformer(): Transformer {
    return this.createNilAwareTransformer(false);
  }

  static createArrayTransformer(): Transformer {
    return {
      format: (value: unknown) => {
        if (Nil.is(value)) {
          return [];
        }
        if (!Array.isArray(value)) {
          return [value];
        }
        return value;
      },
      parse: (value: unknown) => value,
    };
  }

  static createDateTransformer(): Transformer {
    return {
      format: (value: unknown) => {
        if (Nil.is(value)) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        }
        return value;
      },
      parse: (value: unknown) => {
        if (Nil.is(value)) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        }
        return value;
      },
    };
  }

  static createSelectTransformer(nullOption?: { value: unknown; text: string }): Transformer {
    return {
      format: (value: unknown) => (Nil.is(value) && nullOption ? nullOption.value : String(value)),
      parse: (value: unknown) => {
        if (nullOption && nullOption.value === value) {
          return null;
        }
        return value;
      },
    };
  }
}
