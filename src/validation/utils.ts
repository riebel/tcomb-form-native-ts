import { ValidationResult, ValidationError, TcombType } from '../types';
import { t } from '../tcomb';
import { getTypeInfo } from '../util';

export class ValidationUtils {
  static createValidationResult(
    isValid: boolean,
    value: unknown,
    errors: ValidationError[] = [],
  ): ValidationResult {
    return new t.ValidationResult({ errors, value });
  }

  static validateRequiredListField(
    fieldValue: unknown,
    fieldType: TcombType | Record<string, unknown>,
    fieldName: string,
    formValue: unknown,
  ): ValidationResult | null {
    if (!fieldType || typeof fieldType !== 'object' || !('meta' in fieldType)) {
      return null;
    }

    const tcombType = fieldType as TcombType;
    const fieldMeta = tcombType.meta;
    const fieldTypeInfo = getTypeInfo(tcombType);

    if (fieldMeta?.kind === 'list' && !fieldTypeInfo.isMaybe) {
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

    return null;
  }

  static isNonNullObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  static isEmptyObject(value: unknown): boolean {
    return this.isNonNullObject(value) && Object.keys(value).length === 0;
  }

  static isNonEmptyArray(value: unknown): value is unknown[] {
    return Array.isArray(value) && value.length > 0;
  }

  static isEmptyArray(value: unknown): value is unknown[] {
    return Array.isArray(value) && value.length === 0;
  }

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

  static createValidationError(
    message: string,
    path: (string | number)[],
    actual: unknown,
    expected: unknown,
  ): ValidationError {
    return this.createFieldError(message, path as string[], actual, expected);
  }

  static normalizeErrorMessage(message: string): string {
    if (message.includes('Invalid value null') && message.includes('expected one of')) {
      return 'Please select a value';
    }
    return message;
  }

  static createSuccessResult(value: unknown): ValidationResult {
    return this.createValidationResult(true, value, []);
  }

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

  static hasOnlyNullValues(value: unknown[]): boolean {
    return (
      Array.isArray(value) &&
      value.every(item => item === null || item === undefined || item === '' || item === 'null')
    );
  }

  static createRequiredFieldError(
    fieldName: string,
    fieldValue: unknown,
    fieldType: unknown,
  ): ValidationError {
    return this.createFieldError('This field is required', [fieldName], fieldValue, fieldType);
  }

  static createSelectFieldError(
    fieldName: string,
    fieldValue: unknown,
    fieldType: unknown,
  ): ValidationError {
    return this.createFieldError('Please select a value', [fieldName], fieldValue, fieldType);
  }

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
