import { ValidationResult, ValidationError, TcombType } from '../types';
import { t } from '../tcomb';
import { getTypeInfo } from '../util';

/**
 * Shared validation utilities to eliminate duplication across components
 * Consolidates ValidationResult creation and error handling patterns
 */
export class ValidationUtils {
  /**
   * Creates a ValidationResult with consistent structure
   * Eliminates the repetitive ValidationResult creation pattern
   */
  static createValidationResult(
    isValid: boolean,
    value: unknown,
    errors: ValidationError[] = [],
  ): ValidationResult {
    return new t.ValidationResult({ errors, value });
  }

  /**
   * Validates required list fields - consolidates duplicate validation logic from Form.tsx
   * Checks if a list field is required and validates it accordingly
   */
  static validateRequiredListField(
    fieldValue: unknown,
    fieldType: TcombType | Record<string, unknown>,
    fieldName: string,
    formValue: unknown,
  ): ValidationResult | null {
    // Only proceed if it's a proper TcombType with meta
    if (!fieldType || typeof fieldType !== 'object' || !('meta' in fieldType)) {
      return null;
    }

    const tcombType = fieldType as TcombType;
    const fieldMeta = tcombType.meta;
    const fieldTypeInfo = getTypeInfo(tcombType);

    if (fieldMeta?.kind === 'list' && !fieldTypeInfo.isMaybe) {
      // Check for empty array
      if (Array.isArray(fieldValue) && fieldValue.length === 0) {
        return {
          isValid: () => false,
          value: formValue,
          errors: [
            {
              message: 'This field is required',
              path: fieldName ? [fieldName] : [],
              actual: fieldValue,
              expected: tcombType,
            },
          ],
        } as ValidationResult;
      }

      // Check for array with only null/empty values
      if (Array.isArray(fieldValue) && fieldValue.length > 0) {
        const hasValidEntries = fieldValue.some(
          item => item !== null && item !== undefined && item !== '' && item !== 'null',
        );
        if (!hasValidEntries) {
          return {
            isValid: () => false,
            value: formValue,
            errors: [
              {
                message: 'This field is required',
                path: fieldName ? [fieldName] : [],
                actual: fieldValue,
                expected: tcombType,
              },
            ],
          } as ValidationResult;
        }
      }
    }

    return null; // No validation error
  }

  /**
   * Utility functions for common object/array validation patterns
   * Consolidates repetitive type checking patterns used throughout the codebase
   */

  /**
   * Checks if a value is a non-null object (but not an array)
   * Replaces: typeof value === 'object' && value !== null && !Array.isArray(value)
   */
  static isNonNullObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Checks if a value is an empty object
   * Replaces: typeof value === 'object' && value !== null && Object.keys(value).length === 0
   */
  static isEmptyObject(value: unknown): boolean {
    return this.isNonNullObject(value) && Object.keys(value).length === 0;
  }

  /**
   * Checks if a value is a non-empty array
   * Replaces: Array.isArray(value) && value.length > 0
   */
  static isNonEmptyArray(value: unknown): value is unknown[] {
    return Array.isArray(value) && value.length > 0;
  }

  /**
   * Checks if a value is an empty array
   * Replaces: Array.isArray(value) && value.length === 0
   */
  static isEmptyArray(value: unknown): value is unknown[] {
    return Array.isArray(value) && value.length === 0;
  }

  /**
   * Safely gets object property with type checking
   * Replaces repetitive object property access patterns
   */
  static getObjectProperty<T = unknown>(
    obj: unknown,
    key: string,
    defaultValue?: T,
  ): T | undefined {
    if (this.isNonNullObject(obj) && key in obj) {
      return obj[key] as T;
    }
    return defaultValue;
  }

  /**
   * Creates a standardized validation error object
   * Consolidates the repetitive error object creation
   */
  static createFieldError(
    message: string,
    path: string[],
    actual: unknown,
    expected: unknown,
  ): ValidationError {
    return {
      message,
      path,
      actual,
      expected: expected as TcombType,
    };
  }

  /**
   * Alias for createFieldError for backward compatibility
   */
  static createValidationError(
    message: string,
    path: (string | number)[],
    actual: unknown,
    expected: unknown,
  ): ValidationError {
    return this.createFieldError(message, path as string[], actual, expected);
  }

  /**
   * Normalizes error messages for consistent display
   */
  static normalizeErrorMessage(message: string): string {
    if (message.includes('Invalid value null') && message.includes('expected one of')) {
      return 'Please select a value';
    }
    return message;
  }

  /**
   * Creates a successful validation result
   */
  static createSuccessResult(value: unknown): ValidationResult {
    return this.createValidationResult(true, value, []);
  }

  /**
   * Creates a failed validation result with a single error
   */
  static createErrorResult(
    value: unknown,
    message: string,
    path: string[] = [],
    actual?: unknown,
    expected?: unknown,
  ): ValidationResult {
    const error = this.createFieldError(
      message,
      path,
      actual !== undefined ? actual : value,
      expected || 'valid value',
    );
    return this.createValidationResult(false, value, [error]);
  }

  /**
   * Checks if a value is empty based on its expected type
   * Consolidates empty value checking logic across components
   */
  static isEmptyValue(
    value: unknown,
    type: 'string' | 'array' | 'object' | 'any' = 'any',
  ): boolean {
    if (value === null || value === undefined) return true;

    switch (type) {
      case 'string':
        return value === '';
      case 'array':
        return Array.isArray(value) && value.length === 0;
      case 'object':
        return (
          typeof value === 'object' && Object.keys(value as Record<string, unknown>).length === 0
        );
      case 'any':
        return (
          value === '' ||
          ValidationUtils.isEmptyArray(value) ||
          ValidationUtils.isEmptyObject(value)
        );
      default:
        return false;
    }
  }

  /**
   * Checks if an array contains only null/undefined values
   * Used by List component validation
   */
  static hasOnlyNullValues(value: unknown[]): boolean {
    return (
      Array.isArray(value) &&
      value.every(item => item === null || item === undefined || item === '' || item === 'null')
    );
  }

  /**
   * Creates a required field error with standardized message
   */
  static createRequiredFieldError(
    fieldName: string,
    fieldValue: unknown,
    fieldType: unknown,
  ): ValidationError {
    return this.createFieldError('This field is required', [fieldName], fieldValue, fieldType);
  }

  /**
   * Creates a select field error with standardized message
   */
  static createSelectFieldError(
    fieldName: string,
    fieldValue: unknown,
    fieldType: unknown,
  ): ValidationError {
    return this.createFieldError('Please select a value', [fieldName], fieldValue, fieldType);
  }

  /**
   * Validates a string field for required/empty conditions
   */
  static validateStringField(
    fieldValue: unknown,
    fieldType: TcombType,
    fieldName: string,
    isRequired: boolean = true,
  ): ValidationError | null {
    if (isRequired && this.isEmptyValue(fieldValue, 'string')) {
      return this.createRequiredFieldError(fieldName, fieldValue, fieldType);
    }
    return null;
  }

  /**
   * Validates a number field for required/empty conditions
   */
  static validateNumberField(
    fieldValue: unknown,
    fieldType: TcombType,
    fieldName: string,
    isRequired: boolean = true,
  ): ValidationError | null {
    if (
      isRequired &&
      (fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        (typeof fieldValue === 'number' && isNaN(fieldValue)))
    ) {
      return this.createRequiredFieldError(fieldName, fieldValue, fieldType);
    }
    return null;
  }

  /**
   * Validates an enum/select field for required/empty conditions
   */
  static validateEnumField(
    fieldValue: unknown,
    fieldType: TcombType,
    fieldName: string,
    isRequired: boolean = true,
  ): ValidationError | null {
    if (isRequired && this.isEmptyValue(fieldValue, 'string')) {
      return this.createSelectFieldError(fieldName, fieldValue, fieldType);
    }
    return null;
  }

  /**
   * Validates a boolean field for required conditions
   */
  static validateBooleanField(
    fieldValue: unknown,
    fieldType: TcombType,
    fieldName: string,
    isRequired: boolean = true,
  ): ValidationError | null {
    if (isRequired && (fieldValue === null || fieldValue === undefined)) {
      return this.createRequiredFieldError(fieldName, fieldValue, fieldType);
    }
    return null;
  }

  /**
   * Validates a date field for required/empty conditions
   */
  static validateDateField(
    fieldValue: unknown,
    fieldType: TcombType,
    fieldName: string,
    isRequired: boolean = true,
  ): ValidationError | null {
    if (isRequired && (fieldValue === null || fieldValue === undefined || fieldValue === '')) {
      return this.createRequiredFieldError(fieldName, fieldValue, fieldType);
    }
    return null;
  }

  /**
   * Validates an array/list field for required/empty conditions
   */
  static validateArrayField(
    fieldValue: unknown,
    fieldType: TcombType,
    fieldName: string,
    isRequired: boolean = true,
  ): ValidationError | null {
    if (isRequired) {
      if (this.isEmptyValue(fieldValue, 'array')) {
        return this.createRequiredFieldError(fieldName, fieldValue, fieldType);
      }

      if (Array.isArray(fieldValue) && this.hasOnlyNullValues(fieldValue)) {
        return this.createRequiredFieldError(fieldName, fieldValue, fieldType);
      }
    }
    return null;
  }
}
