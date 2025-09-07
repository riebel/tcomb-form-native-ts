import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { View } from 'react-native';
import {
  FormProps,
  FormRef,
  ComponentContext,
  ValidationResult,
  ValidationError,
  ComponentProps,
  TcombType,
} from './types';
import { getTypeInfo } from './util';
import { UIDGenerator, getFormComponentName, getComponentOptions, isTcombType } from './util';
import { templates } from './templates/bootstrap';
import { stylesheet } from './stylesheets/bootstrap';
import { i18n } from './i18n/en';
import { Textbox } from './Textbox';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { List } from './List';
import { Struct } from './Struct';

const t = require('tcomb-validation');

const componentRegistry = {
  Textbox,
  Select,
  Checkbox,
  DatePicker,
  List,
  Struct,
};

function InnerForm<T>(props: FormProps<T>, ref: React.Ref<FormRef>) {
  const {
    type,
    options = {},
    value,
    onChange,
    context,
    templates: customTemplates,
    i18n: customI18n,
    stylesheet: customStylesheet,
  } = props;

  const [formValue, setFormValue] = useState(value);

  useEffect(() => {
    setFormValue(value);
  }, [value]);

  const uidGenerator = useMemo(() => new UIDGenerator('form'), []);

  const mergedTemplates = useMemo(() => ({ ...templates, ...customTemplates }), [customTemplates]);
  const mergedI18n = useMemo(() => ({ ...i18n, ...customI18n }), [customI18n]);
  const mergedStylesheet = useMemo(
    () => ({ ...stylesheet, ...customStylesheet }),
    [customStylesheet],
  );

  const ctx: ComponentContext = useMemo(
    () => ({
      auto: options.auto || 'labels',
      label: options.label,
      templates: mergedTemplates,
      i18n: mergedI18n,
      uidGenerator,
      path: [],
      stylesheet: mergedStylesheet,
      config: options.config,
      context,
    }),
    [
      options.auto,
      options.label,
      options.config,
      mergedTemplates,
      mergedI18n,
      mergedStylesheet,
      uidGenerator,
      context,
    ],
  );

  const handleChange = useCallback(
    (newValue: T, _path?: string[]) => {
      setFormValue(newValue);
      if (onChange) {
        onChange(newValue, _path);
      }
    },
    [onChange],
  );

  const childComponentRef = useRef<{ validate?: () => ValidationResult }>(null);

  const validate = useCallback((): ValidationResult => {
    if (childComponentRef.current && typeof childComponentRef.current.validate === 'function') {
      try {
        childComponentRef.current.validate();
      } catch {
        // Continue with form validation even if child validation fails
      }
    }

    // Handle non-tcomb types with basic validation
    if (!type || !('meta' in type) || !('is' in type)) {
      const basicResult = {
        isValid: () => true,
        value: formValue,
        errors: [],
      };
      return basicResult;
    }

    // Custom validation for required lists and enums
    const typeInfo = getTypeInfo(type);
    const typeMeta = type.meta as { kind?: string };
    if (typeMeta?.kind === 'list' && !typeInfo.isMaybe) {
      if (Array.isArray(formValue) && formValue.length === 0) {
        const errorResult = {
          isValid: () => false,
          value: formValue,
          errors: [
            {
              message: 'This field is required',
              path: [],
              actual: formValue,
              expected: type,
            },
          ],
        } as ValidationResult;
        return errorResult;
      }
    }

    if (typeMeta?.kind === 'enums' && !typeInfo.isMaybe) {
      if (formValue === '' || formValue === null || formValue === undefined) {
        const errorResult = {
          isValid: () => false,
          value: formValue,
          errors: [
            {
              message: 'This field is required',
              path: [],
              actual: formValue,
              expected: type,
            },
          ],
        } as ValidationResult;
        return errorResult;
      }
    }

    // Validate struct fields
    if (
      typeMeta?.kind === 'struct' &&
      'props' in typeMeta &&
      typeMeta.props &&
      typeof formValue === 'object' &&
      formValue !== null
    ) {
      const structValue = formValue as Record<string, unknown>;
      const props = typeMeta.props as Record<string, TcombType>;

      for (const [fieldName, fieldType] of Object.entries(props)) {
        const fieldValue = structValue[fieldName];
        const fieldMeta = fieldType.meta;
        const fieldTypeInfo = getTypeInfo(fieldType);

        if (fieldMeta?.kind === 'list' && !fieldTypeInfo.isMaybe) {
          if (Array.isArray(fieldValue) && fieldValue.length === 0) {
            const errorResult = {
              isValid: () => false,
              value: formValue,
              errors: [
                {
                  message: 'This field is required',
                  path: [fieldName],
                  actual: fieldValue,
                  expected: fieldType,
                },
              ],
            } as ValidationResult;
            return errorResult;
          }
        }

        if (!fieldTypeInfo.isMaybe && (fieldMeta?.kind === 'irreducible' || !fieldMeta?.kind)) {
          if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
            const errorResult = {
              isValid: () => false,
              value: formValue,
              errors: [
                {
                  message: 'This field is required',
                  path: [fieldName],
                  actual: fieldValue,
                  expected: fieldType,
                },
              ],
            } as ValidationResult;
            return errorResult;
          }
        }

        if (fieldMeta?.kind === 'enums' && !fieldTypeInfo.isMaybe) {
          if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
            const errorResult = {
              isValid: () => false,
              value: formValue,
              errors: [
                {
                  message: 'This field is required',
                  path: [fieldName],
                  actual: fieldValue,
                  expected: fieldType,
                },
              ],
            } as ValidationResult;
            return errorResult;
          }
        }
      }
    }

    // Transform values before validation to handle component transformers (e.g., DatePicker)
    let transformedValue = formValue;

    // Apply transformers for struct fields if this is a struct type
    if (
      typeMeta?.kind === 'struct' &&
      'props' in typeMeta &&
      typeMeta.props &&
      typeof formValue === 'object' &&
      formValue !== null
    ) {
      transformedValue = { ...formValue };
      const structValue = transformedValue as Record<string, unknown>;
      const props = typeMeta.props as Record<string, TcombType>;

      // Transform each field that might have a component transformer
      for (const [fieldName, fieldValue] of Object.entries(structValue)) {
        const fieldType = props[fieldName];
        const fieldMeta = fieldType?.meta;
        const fieldTypeInfo = getTypeInfo(fieldType);

        if (fieldValue !== null && fieldValue !== undefined) {
          // Check if this field is a date field (ISO string that should be Date)
          if (
            typeof fieldValue === 'string' &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(fieldValue)
          ) {
            const date = new Date(fieldValue);
            if (!isNaN(date.getTime())) {
              structValue[fieldName] = date;
            }
          }
        } else {
          // Handle null/undefined values for enum fields to prevent tcomb validation errors
          if (
            fieldMeta?.kind === 'enums' &&
            !fieldTypeInfo.isMaybe &&
            (fieldValue === null || fieldValue === undefined)
          ) {
            // For required enum fields with null values, use empty string to trigger validation error
            // This prevents tcomb from throwing an exception while still allowing validation to fail properly
            structValue[fieldName] = '';
          }
        }
      }
    }

    // Use tcomb validation with transformed values, handling enum validation errors
    let result: ValidationResult;
    let isValid: boolean;

    try {
      result = t.validate(transformedValue, type, { path: [], context });
      isValid = result.isValid();
    } catch (error) {
      // Handle tcomb validation errors (e.g., null values for enums)
      const errorMessage = error instanceof Error ? error.message : 'Validation error';

      // Create a validation result for the error
      result = {
        isValid: () => false,
        value: transformedValue,
        errors: [
          {
            message:
              errorMessage.includes('Invalid value null') &&
              errorMessage.includes('expected one of')
                ? 'Please select a value'
                : 'Validation error',
            path: [],
            actual: transformedValue,
            expected: type,
          },
        ],
      } as ValidationResult;
      isValid = false;
    }

    // Extract field-specific errors from validation result
    if (!isValid && result.errors) {
      const fieldErrors: Record<string, string> = {};
      result.errors.forEach((error: ValidationError) => {
        if (error.path && error.path.length > 0) {
          const fieldName = error.path[0];
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = error.message || 'Validation error';
          }
        }
      });
      // Field errors are no longer stored at form level
      // Each field manages its own validation state
    }

    return result;
  }, [formValue, type, context]);

  const getValue = useCallback((): unknown => {
    // Like the /old version: validate automatically and return null if invalid
    try {
      const result = validate();
      return result.isValid() ? result.value : null;
    } catch {
      return null;
    }
  }, [validate]);

  const pureValidate = useCallback((): ValidationResult => {
    // Validation without side effects (no state updates) - tcomb types are functions, not objects!
    if (!type || !('meta' in type) || !('is' in type)) {
      return {
        isValid: () => true,
        value: formValue,
        errors: [],
      };
    }

    // Apply the same custom validation logic as the main validate() method
    const typeInfo = getTypeInfo(type);
    const typeMeta = type.meta as { kind?: string };

    // Check for required empty lists
    if (typeMeta?.kind === 'list' && !typeInfo.isMaybe) {
      if (Array.isArray(formValue) && formValue.length === 0) {
        return {
          isValid: () => false,
          value: formValue,
          errors: [
            {
              message: 'This field is required',
              path: [],
              actual: formValue,
              expected: type,
            },
          ],
        } as ValidationResult;
      }
    }

    if (typeMeta?.kind === 'enums' && !typeInfo.isMaybe) {
      if (formValue === '' || formValue === null || formValue === undefined) {
        return {
          isValid: () => false,
          value: formValue,
          errors: [
            {
              message: 'This field is required',
              path: [],
              actual: formValue,
              expected: type,
            },
          ],
        } as ValidationResult;
      }
    }

    // Validate struct fields
    if (
      typeMeta?.kind === 'struct' &&
      'props' in typeMeta &&
      typeMeta.props &&
      typeof formValue === 'object' &&
      formValue !== null
    ) {
      const structValue = formValue as Record<string, unknown>;
      const props = typeMeta.props as Record<string, TcombType>;

      for (const [fieldName, fieldType] of Object.entries(props)) {
        const fieldValue = structValue[fieldName];
        const fieldMeta = fieldType.meta;
        const fieldTypeInfo = getTypeInfo(fieldType);

        if (fieldMeta?.kind === 'list' && !fieldTypeInfo.isMaybe) {
          if (Array.isArray(fieldValue) && fieldValue.length === 0) {
            return {
              isValid: () => false,
              value: formValue,
              errors: [
                {
                  message: 'This field is required',
                  path: [fieldName],
                  actual: fieldValue,
                  expected: fieldType,
                },
              ],
            } as ValidationResult;
          }
        }

        if (fieldMeta?.kind === 'enums' && !fieldTypeInfo.isMaybe) {
          if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
            return {
              isValid: () => false,
              value: formValue,
              errors: [
                {
                  message: 'This field is required',
                  path: [fieldName],
                  actual: fieldValue,
                  expected: fieldType,
                },
              ],
            } as ValidationResult;
          }
        }
      }
    }

    return t.validate(formValue, type, { path: [], context });
  }, [formValue, type, context]);

  const getComponent = useCallback((path: string[]): React.ComponentType<unknown> | null => {
    return null;
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      getValue,
      validate,
      getComponent,
      pureValidate,
    }),
    [getValue, validate, getComponent, pureValidate],
  );

  const actualType = type;

  // Create component options with hasError state and field errors included as dependency
  // This ensures child components re-render when hasError state changes
  const componentOptions = React.useMemo(() => {
    const baseOptions = { ...options };
    // Don't pass validation errors to child components automatically
    // Let each field manage its own validation state independently
    // baseOptions.fieldErrors = validationErrors;
    return getComponentOptions(baseOptions, {}, formValue, actualType);
  }, [options, formValue, actualType]);

  // Determine which component to render based on type and options
  let ComponentClass: React.ComponentType<ComponentProps>;
  if (componentOptions.factory) {
    ComponentClass = componentOptions.factory;
  } else if (
    isTcombType(actualType) &&
    'getTcombFormFactory' in actualType &&
    typeof actualType.getTcombFormFactory === 'function'
  ) {
    ComponentClass = actualType.getTcombFormFactory(componentOptions);
  } else {
    const componentName = getFormComponentName(actualType, componentOptions);
    ComponentClass = componentRegistry[
      componentName as keyof typeof componentRegistry
    ] as React.ComponentType<ComponentProps>;
  }

  if (!ComponentClass) {
    const componentName = getFormComponentName(actualType, componentOptions);
    throw new Error(`[tcomb-form-native] Component ${componentName} not found`);
  }

  const componentProps = React.useMemo(
    () => ({
      type: actualType,
      options: componentOptions,
      value: formValue,
      ctx,
      onChange: (value: unknown, path: string[]) => handleChange(value as T, path),
      context,
    }),
    [actualType, componentOptions, formValue, ctx, handleChange, context],
  );

  const rootComponent = React.createElement(
    ComponentClass as React.ComponentType<
      ComponentProps & { ref?: React.Ref<{ validate?: () => ValidationResult }> }
    >,
    {
      ...componentProps,
      ref: childComponentRef,
    },
  );

  return <View>{rootComponent}</View>;
}

const FormComponent = forwardRef(InnerForm) as <T = Record<string, unknown>>(
  props: FormProps<T> & { ref?: React.Ref<FormRef> },
) => React.ReactElement | null;

export const Form = Object.assign(FormComponent, {
  displayName: 'Form',
  templates,
  stylesheet,
  i18n,
}) as typeof FormComponent & {
  templates: typeof templates;
  stylesheet: typeof stylesheet;
  i18n: typeof i18n;
};

Object.assign(Form, {
  defaultProps: {
    options: {},
    templates,
    stylesheet,
    i18n,
  },
});
