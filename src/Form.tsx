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
        // Continue validation
      }
    }

    if (!type || !('meta' in type) || !('is' in type)) {
      const basicResult = {
        isValid: () => true,
        value: formValue,
        errors: [],
      };
      return basicResult;
    }

    let transformedValue = formValue;
    const typeMeta = type.meta as { kind?: string };

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

      for (const [fieldName, fieldValue] of Object.entries(structValue)) {
        const fieldType = props[fieldName];
        const fieldMeta = fieldType?.meta;
        const fieldTypeInfo = getTypeInfo(fieldType);

        if (fieldValue !== null && fieldValue !== undefined) {
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
          if (
            fieldMeta?.kind === 'enums' &&
            !fieldTypeInfo.isMaybe &&
            (fieldValue === null || fieldValue === undefined)
          ) {
            structValue[fieldName] = '';
          }
        }
      }

      for (const [fieldName, fieldType] of Object.entries(props)) {
        if (!(fieldName in structValue)) {
          const fieldMeta = fieldType?.meta;
          const fieldTypeInfo = getTypeInfo(fieldType);

          if (
            fieldMeta?.kind === 'irreducible' &&
            !fieldTypeInfo.isMaybe &&
            (fieldType as { displayName?: string }).displayName === 'Boolean'
          ) {
            structValue[fieldName] = false;
          }
        }
      }
    }

    let result: ValidationResult;
    let isValid: boolean;

    try {
      result = t.validate(transformedValue, type, { path: [], context });
      isValid = result.isValid();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error';

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

    if (isValid) {
      const typeInfo = getTypeInfo(type);

      if (
        typeMeta?.kind === 'struct' &&
        'props' in typeMeta &&
        typeMeta.props &&
        typeof transformedValue === 'object' &&
        transformedValue !== null
      ) {
        const structValue = transformedValue as Record<string, unknown>;
        const props = typeMeta.props as Record<string, TcombType>;

        for (const [fieldName, fieldType] of Object.entries(props)) {
          const fieldValue = structValue[fieldName];
          const fieldMeta = fieldType.meta;
          const fieldTypeInfo = getTypeInfo(fieldType);

          if (fieldMeta?.kind === 'irreducible' && !fieldTypeInfo.isMaybe) {
            const fieldTypeName = (fieldType as { displayName?: string }).displayName;
            let isInvalid = false;
            let errorMessage = 'This field is required';

            if (fieldTypeName === 'String') {
              isInvalid = fieldValue === '' || fieldValue === null || fieldValue === undefined;
            } else if (fieldTypeName === 'Number') {
              isInvalid =
                fieldValue === null ||
                fieldValue === undefined ||
                fieldValue === '' ||
                (typeof fieldValue === 'number' && isNaN(fieldValue));
            } else if (fieldTypeName === 'Boolean') {
              isInvalid = fieldValue === null || fieldValue === undefined;
            } else if (fieldTypeName === 'Date') {
              isInvalid = fieldValue === null || fieldValue === undefined || fieldValue === '';
            } else {
              isInvalid = fieldValue === null || fieldValue === undefined;
            }

            if (isInvalid) {
              return {
                isValid: () => false,
                value: transformedValue,
                errors: [
                  {
                    message: errorMessage,
                    path: [fieldName],
                    actual: fieldValue,
                    expected: fieldType,
                  },
                ],
              } as ValidationResult;
            }
          }

          if (fieldMeta?.kind === 'enums' && !fieldTypeInfo.isMaybe) {
            const isInvalid = fieldValue === '' || fieldValue === null || fieldValue === undefined;
            if (isInvalid) {
              return {
                isValid: () => false,
                value: transformedValue,
                errors: [
                  {
                    message: 'Please select a value',
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

      if (typeMeta?.kind === 'list' && !typeInfo.isMaybe) {
        if (Array.isArray(transformedValue) && transformedValue.length === 0) {
          return {
            isValid: () => false,
            value: transformedValue,
            errors: [
              {
                message: 'This field is required',
                path: [],
                actual: transformedValue,
                expected: type,
              },
            ],
          } as ValidationResult;
        }

        if (Array.isArray(transformedValue) && transformedValue.length > 0) {
          const hasValidEntries = transformedValue.some(
            item => item !== null && item !== undefined,
          );
          if (!hasValidEntries) {
            return {
              isValid: () => false,
              value: transformedValue,
              errors: [
                {
                  message: 'This field is required',
                  path: [],
                  actual: transformedValue,
                  expected: type,
                },
              ],
            } as ValidationResult;
          }
        }
      }

      if (
        typeMeta?.kind === 'struct' &&
        'props' in typeMeta &&
        typeMeta.props &&
        typeof transformedValue === 'object' &&
        transformedValue !== null
      ) {
        const structValue = transformedValue as Record<string, unknown>;
        const props = typeMeta.props as Record<string, TcombType>;

        for (const [fieldName, fieldType] of Object.entries(props)) {
          const fieldValue = structValue[fieldName];
          const fieldMeta = fieldType.meta;
          const fieldTypeInfo = getTypeInfo(fieldType);

          if (fieldMeta?.kind === 'list' && !fieldTypeInfo.isMaybe) {
            if (Array.isArray(fieldValue) && fieldValue.length === 0) {
              return {
                isValid: () => false,
                value: transformedValue,
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

            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              const hasValidEntries = fieldValue.some(item => item !== null && item !== undefined);
              if (!hasValidEntries) {
                return {
                  isValid: () => false,
                  value: transformedValue,
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
      }
    }

    return result;
  }, [formValue, type, context]);

  const getValue = useCallback((): unknown => {
    try {
      const result = validate();
      return result.isValid() ? result.value : null;
    } catch {
      return null;
    }
  }, [validate]);

  const pureValidate = useCallback((): ValidationResult => {
    if (!type || !('meta' in type) || !('is' in type)) {
      return {
        isValid: () => true,
        value: formValue,
        errors: [],
      };
    }

    const typeInfo = getTypeInfo(type);
    const typeMeta = type.meta as { kind?: string };

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

  const componentOptions = React.useMemo(() => {
    const baseOptions = { ...options };
    return getComponentOptions(baseOptions, {}, formValue, actualType);
  }, [options, formValue, actualType]);

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
