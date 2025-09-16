import { Transformer, NumberTransformer } from '../types';
import { Nil } from '../tcomb';
import { toNull, parseNumber } from '../util';

/**
 * Shared transformer factory to eliminate duplication across components
 * Consolidates common Nil handling patterns and transformation logic
 */
export class TransformerFactory {
  /**
   * Creates a transformer with Nil-aware formatting and optional custom transformation
   */
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

  /**
   * Creates a string transformer (used by Textbox)
   * Handles null values by converting to empty string, parses using toNull
   */
  static createStringTransformer(): Transformer {
    return this.createNilAwareTransformer('', value => String(value), toNull);
  }

  /**
   * Creates a number transformer (used by Textbox for numeric fields)
   * Handles European decimal notation and null values
   */
  static createNumberTransformer(): NumberTransformer {
    return {
      format: (value: string | number) => (Nil.is(value) ? '' : String(value)),
      parse: (value: string | null) => {
        if (value) {
          const normalizedValue = value.replace(/,/g, '.');
          return parseNumber(normalizedValue);
        }
        return parseNumber(value);
      },
    };
  }

  /**
   * Creates a boolean transformer (used by Checkbox)
   * Defaults to false for null values
   */
  static createBooleanTransformer(): Transformer {
    return this.createNilAwareTransformer(false);
  }

  /**
   * Creates an array transformer (used by List)
   * Handles null values by converting to empty array, single values to array
   */
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

  /**
   * Creates a date transformer (used by DatePicker)
   * Handles string dates and null values
   */
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

  /**
   * Creates a select transformer with null option handling
   * Used by Select component with custom null option behavior
   */
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
