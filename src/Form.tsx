import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import {
  ComponentContext,
  ComponentProps,
  ComponentOptions,
  FormProps,
  FormRef,
  TcombType,
  ValidationResult,
} from './types';
import {
  getComponentOptions,
  getFormComponentName,
  getTypeInfo,
  isTcombType,
  UIDGenerator,
  parseNumber,
} from './util';
import { templates } from './templates/bootstrap';
import { stylesheet } from './stylesheets/bootstrap';
import { i18n } from './i18n/en';
import { Component } from './Component';
import { t } from './tcomb';
import { ValidationUtils } from './validation/utils';

function extractRequiredFieldMappings(obj: unknown): Record<string, string[]> {
  const mappings: Record<string, string[]> = {};

  if (!obj || typeof obj !== 'object') {
    return mappings;
  }

  const schema = obj as Record<string, unknown>;

  if (schema.properties && typeof schema.properties === 'object') {
    const properties = schema.properties as Record<string, unknown>;

    Object.entries(properties).forEach(([fieldName, fieldSchema]) => {
      if (fieldSchema && typeof fieldSchema === 'object' && !Array.isArray(fieldSchema)) {
        const fieldObj = fieldSchema as Record<string, unknown>;

        if (fieldObj.required && Array.isArray(fieldObj.required)) {
          mappings[fieldName] = fieldObj.required;
        }

        if (fieldObj.type === 'object' && fieldObj.properties) {
          const nestedMappings = extractRequiredFieldMappings(fieldObj);
          Object.assign(mappings, nestedMappings);

          if (fieldObj.required && Array.isArray(fieldObj.required)) {
            mappings[fieldName] = fieldObj.required;
          }
        }
      }
    });
  }

  if ('_originalSchema' in schema && schema._originalSchema) {
    const nestedMappings = extractRequiredFieldMappings(schema._originalSchema);
    Object.assign(mappings, nestedMappings);
  }

  return mappings;
}

type StructComponentOptions = ComponentOptions & {
  fields?: Record<string, ComponentOptions>;
};

type ListComponentOptions = ComponentOptions & {
  item?: ComponentOptions;
};

type FieldComponentOptions = ComponentOptions & {
  required?: boolean;
  optional?: boolean;
};

const DATETIME_STRING_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const NUMERIC_PATH_REGEX = /^\d+$/;

function isNumericPathSegment(segment: string | number): boolean {
  return (
    typeof segment === 'number' || (typeof segment === 'string' && NUMERIC_PATH_REGEX.test(segment))
  );
}

function getFieldTypeAtPath(type: TcombType, path: (string | number)[]): TcombType | null {
  let currentType: TcombType | null = type;

  for (let index = 0; index < path.length; index += 1) {
    if (!currentType) {
      return null;
    }

    const typeInfo = getTypeInfo(currentType);
    const innerType = (typeInfo.innerType ?? currentType) as TcombType;
    const meta = innerType.meta;

    if (!meta) {
      return null;
    }

    const segment = path[index];

    if (isNumericPathSegment(segment)) {
      if (meta.kind === 'list' && meta.type) {
        currentType = meta.type as TcombType;
        continue;
      }
      return null;
    }

    if (meta.kind === 'struct' && meta.props && segment in meta.props) {
      currentType = meta.props[segment as string] as TcombType;
      continue;
    }

    return null;
  }

  return currentType;
}

function getFieldOptionsForPath(
  componentOptions: ComponentOptions | undefined,
  path: (string | number)[],
): ComponentOptions | undefined {
  if (!componentOptions) {
    return undefined;
  }

  let currentOptions: ComponentOptions | undefined = componentOptions;

  for (let index = 0; index < path.length; index += 1) {
    if (!currentOptions) {
      return undefined;
    }

    const segment = path[index];

    if (isNumericPathSegment(segment)) {
      currentOptions = (currentOptions as ListComponentOptions).item;
      continue;
    }

    const structOptions = currentOptions as StructComponentOptions;

    if (!structOptions.fields) {
      return undefined;
    }

    currentOptions = structOptions.fields[segment as string];
  }

  return currentOptions;
}

function normalizeValueForValidation(
  value: unknown,
  currentType: TcombType,
  componentOptions?: ComponentOptions,
): unknown {
  const typeInfo = getTypeInfo(currentType);
  const innerType = typeInfo.innerType ?? currentType;
  const innerMeta = innerType.meta;

  if (!innerMeta) {
    return value;
  }

  if (value === null || value === undefined) {
    if (typeInfo.isMaybe) {
      return value;
    }
    if (innerMeta.kind === 'struct') {
      return {};
    }
    if (innerMeta.kind === 'list') {
      return [];
    }
    if (innerMeta.kind === 'enums' && !typeInfo.isMaybe) {
      return '';
    }
    return value;
  }

  if (innerMeta.kind === 'struct' && innerMeta.props) {
    const structValue = ValidationUtils.isNonNullObject(value)
      ? { ...(value as Record<string, unknown>) }
      : {};

    const structOptions = (componentOptions as StructComponentOptions | undefined)?.fields ?? {};

    for (const [fieldName, fieldType] of Object.entries(innerMeta.props)) {
      if (!isTcombType(fieldType)) {
        continue;
      }

      const fieldOptions = structOptions[fieldName];
      const existingValue = structValue[fieldName];
      const normalizedChild = normalizeValueForValidation(existingValue, fieldType, fieldOptions);

      if (normalizedChild !== undefined) {
        structValue[fieldName] = normalizedChild;
      } else {
        delete structValue[fieldName];
      }
    }

    for (const [fieldName, fieldType] of Object.entries(innerMeta.props)) {
      const childTypeInfo = getTypeInfo(fieldType);
      const childInnerType = childTypeInfo.innerType ?? fieldType;
      const childMeta = childInnerType.meta;
      const childDisplayName = (childInnerType as { displayName?: string }).displayName;

      if (!(fieldName in structValue)) {
        if (
          childMeta?.kind === 'irreducible' &&
          !childTypeInfo.isMaybe &&
          childDisplayName === 'Boolean'
        ) {
          structValue[fieldName] = false;
        } else if (childMeta?.kind === 'struct' && !childTypeInfo.isMaybe) {
          structValue[fieldName] = {};
        }
      }
    }

    return structValue;
  }

  if (innerMeta.kind === 'list' && innerMeta.type) {
    const listValue = Array.isArray(value) ? value : [];
    const itemOptions = (componentOptions as ListComponentOptions | undefined)?.item;
    return listValue.map(item =>
      normalizeValueForValidation(item, innerMeta.type as TcombType, itemOptions),
    );
  }

  if (
    (innerType === t.Number ||
      (innerMeta.kind === 'irreducible' &&
        ((innerType as { displayName?: string }).displayName || '').toLowerCase() === 'number')) &&
    typeof value === 'string'
  ) {
    const normalizedStringValue = value.replace(/,/g, '.');
    const parsed = parseNumber(normalizedStringValue);
    if (parsed !== null) {
      return parsed;
    }
    if (value.trim() === '') {
      return null;
    }
    return value;
  }

  if (typeof value === 'string' && DATETIME_STRING_REGEX.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  if (innerMeta.kind === 'enums' && !typeInfo.isMaybe && (value === null || value === undefined)) {
    return '';
  }

  return value;
}

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
  const validationAttemptedRef = useRef(false);

  useEffect(() => {
    setFormValue(value);
    validationAttemptedRef.current = false;
  }, [value]);

  useEffect(() => {
    if (type) {
      const requiredFieldMappings = extractRequiredFieldMappings(type);
      if (Object.keys(requiredFieldMappings).length > 0) {
        (globalThis as Record<string, unknown>).__TCOMB_SCHEMA_REQUIRED_FIELDS__ =
          requiredFieldMappings;
      }
    }
  }, [type]);

  const uidGenerator = useMemo(() => new UIDGenerator('form'), []);

  const mergedTemplates = useMemo(() => ({ ...templates, ...customTemplates }), [customTemplates]);
  const mergedI18n = useMemo(() => ({ ...i18n, ...customI18n }), [customI18n]);
  const mergedStylesheet = useMemo(
    () => ({ ...stylesheet, ...customStylesheet }),
    [customStylesheet],
  );

  const rootRequiredFields = useMemo(() => {
    if (
      type &&
      typeof type === 'object' &&
      'jsonSchema' in type &&
      typeof type.jsonSchema === 'object' &&
      type.jsonSchema !== null
    ) {
      const jsonSchema = type.jsonSchema as { required?: string[] };
      return Array.isArray(jsonSchema.required) ? jsonSchema.required : [];
    }

    if (
      type &&
      typeof type === 'object' &&
      'required' in type &&
      Array.isArray((type as { required: string[] }).required)
    ) {
      return (type as { required: string[] }).required;
    }

    return [];
  }, [type]);

  const originalSchema = useMemo(() => {
    if (type && typeof type === 'object') {
      if ('properties' in type && typeof type.properties === 'object') {
        return type as Record<string, unknown>;
      }

      if ('_originalSchema' in type) {
        return (type as Record<string, unknown>)._originalSchema as Record<string, unknown>;
      }

      if ('jsonSchema' in type && typeof type.jsonSchema === 'object') {
        return type.jsonSchema as Record<string, unknown>;
      }

      if ('schema' in type && typeof type.schema === 'object') {
        return type.schema as Record<string, unknown>;
      }
    }

    if (type && typeof type === 'function') {
      const tcombType = type as unknown as { meta?: Record<string, unknown> };
      if (tcombType.meta) {
        if ('_originalSchema' in tcombType.meta) {
          return tcombType.meta._originalSchema as Record<string, unknown>;
        }

        if ('jsonSchema' in tcombType.meta) {
          return tcombType.meta.jsonSchema as Record<string, unknown>;
        }

        if ('schema' in tcombType.meta) {
          return tcombType.meta.schema as Record<string, unknown>;
        }

        if ('props' in tcombType.meta && typeof tcombType.meta.props === 'object') {
          const props = tcombType.meta.props as Record<string, unknown>;

          const reconstructedSchema: Record<string, unknown> = {
            type: 'object',
            properties: {},
          };

          for (const [propName, propType] of Object.entries(props)) {
            if (typeof propType === 'function') {
              const propTcombType = propType as unknown as { meta?: Record<string, unknown> };
              if (propTcombType.meta) {
                if (propTcombType.meta.kind === 'struct' && 'props' in propTcombType.meta) {
                  const nestedProps = propTcombType.meta.props as Record<string, unknown>;
                  const nestedSchema: Record<string, unknown> = {
                    type: 'object',
                    properties: {},
                    required: [],
                  };

                  for (const [nestedPropName, nestedPropType] of Object.entries(nestedProps)) {
                    if (typeof nestedPropType === 'function') {
                      const nestedTcombType = nestedPropType as unknown as {
                        meta?: Record<string, unknown>;
                      };
                      const isRequired = nestedTcombType.meta?.kind !== 'maybe';

                      if (isRequired) {
                        (nestedSchema.required as string[]).push(nestedPropName);
                      }

                      (nestedSchema.properties as Record<string, unknown>)[nestedPropName] = {
                        type: 'string',
                      };
                    }
                  }

                  (reconstructedSchema.properties as Record<string, unknown>)[propName] =
                    nestedSchema;
                }
              }
            }
          }

          if (Object.keys(reconstructedSchema.properties as Record<string, unknown>).length > 0) {
            return reconstructedSchema;
          }
        }
      }
    }

    if (context && typeof context === 'object' && 'originalSchema' in context) {
      return context.originalSchema as Record<string, unknown>;
    }

    if (options && typeof options === 'object' && 'originalSchema' in options) {
      return (options as Record<string, unknown>).originalSchema as Record<string, unknown>;
    }

    if (options && typeof options === 'object' && 'context' in options) {
      const optionsContext = (options as Record<string, unknown>).context;
      if (
        optionsContext &&
        typeof optionsContext === 'object' &&
        'originalSchema' in optionsContext
      ) {
        return (optionsContext as Record<string, unknown>).originalSchema as Record<
          string,
          unknown
        >;
      }
    }

    return null;
  }, [type, context, options]);

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
      context: {
        ...context,
        required: rootRequiredFields,
        originalSchema: originalSchema,
      },
      validationAttempted: validationAttemptedRef.current,
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
      rootRequiredFields,
      originalSchema,
    ],
  );

  const handleChange = useCallback(
    (newValue: T, _path?: string[]) => {
      setFormValue(newValue);

      validationAttemptedRef.current = false;
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
        // Validation failed
      }
    }

    if (!type || !('meta' in type) || !('is' in type)) {
      return ValidationUtils.createSuccessResult(formValue);
    }

    const tcombType = type as TcombType;
    const transformedValue = normalizeValueForValidation(formValue, tcombType, options);
    const typeMeta = tcombType.meta as { kind?: string };

    let result: ValidationResult;
    let isValid: boolean;

    try {
      result = t.validate(transformedValue, tcombType, { path: [], context });
      isValid = result.isValid();

      if (!isValid && result.errors) {
        const filteredErrors = result.errors.filter(error => {
          if (
            (error.actual === null || error.actual === '') &&
            error.expected &&
            (error.expected as { displayName?: string }).displayName === 'Number' &&
            (error.message.includes('Invalid value null') ||
              error.message.includes('Invalid value ""'))
          ) {
            const pathSegments = Array.isArray(error.path)
              ? (error.path as (string | number)[])
              : [];
            const fieldComponentOptions = getFieldOptionsForPath(options, pathSegments) as
              | FieldComponentOptions
              | undefined;
            const isExplicitlyRequired = fieldComponentOptions?.required === true;
            const fieldAllowsNullByOptions =
              fieldComponentOptions?.required === false || fieldComponentOptions?.optional === true;

            const fieldTypeAtPath = pathSegments.length
              ? getFieldTypeAtPath(tcombType, pathSegments)
              : tcombType;
            const fieldTypeInfo = fieldTypeAtPath ? getTypeInfo(fieldTypeAtPath) : null;
            const fieldAllowsNullByType = fieldTypeInfo?.isMaybe === true;

            if ((fieldAllowsNullByType || fieldAllowsNullByOptions) && !isExplicitlyRequired) {
              return false;
            }
          }
          return true;
        });

        if (filteredErrors.length === 0) {
          isValid = true;
          result = ValidationUtils.createSuccessResult(transformedValue);
        } else if (filteredErrors.length < result.errors.length) {
          result = {
            ...result,
            errors: filteredErrors,
            isValid: () => false,
          };
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error';
      const finalMessage =
        errorMessage.includes('Invalid value null') && errorMessage.includes('expected one of')
          ? 'Please select a value'
          : 'Validation error';

      result = ValidationUtils.createErrorResult(
        transformedValue,
        finalMessage,
        [],
        transformedValue,
        type,
      );
      isValid = false;
    }

    if (isValid) {
      const typeInfo = getTypeInfo(tcombType);

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

            if (fieldTypeName?.toLowerCase() === 'number') {
              const structOptions = options as { fields?: Record<string, { required?: boolean }> };
              const fieldOptions = structOptions?.fields?.[fieldName];
              const isExplicitlyRequired = fieldOptions?.required === true;

              const isInvalidNumber = typeof fieldValue === 'number' && isNaN(fieldValue);

              if (isExplicitlyRequired && (fieldValue === null || fieldValue === undefined)) {
                return ValidationUtils.createErrorResult(
                  transformedValue,
                  'This field is required',
                  [fieldName],
                  fieldValue,
                  fieldType,
                );
              }

              if (isInvalidNumber) {
                return ValidationUtils.createErrorResult(
                  transformedValue,
                  'Please enter a valid number',
                  [fieldName],
                  fieldValue,
                  fieldType,
                );
              }
            } else {
              const typeForValidation =
                (fieldTypeName?.toLowerCase() as
                  | 'string'
                  | 'array'
                  | 'object'
                  | 'any'
                  | undefined) || 'any';
              const isInvalid = ValidationUtils.isEmptyValue(fieldValue, typeForValidation);

              if (isInvalid) {
                return ValidationUtils.createErrorResult(
                  transformedValue,
                  'This field is required',
                  [fieldName],
                  fieldValue,
                  fieldType,
                );
              }
            }
          }

          if (fieldMeta?.kind === 'enums' && !fieldTypeInfo.isMaybe) {
            const isInvalid = ValidationUtils.isEmptyValue(fieldValue);
            if (isInvalid) {
              return ValidationUtils.createErrorResult(
                transformedValue,
                'Please select a value',
                [fieldName],
                fieldValue,
                fieldType,
              );
            }
          }
        }
      }

      if (typeMeta?.kind === 'list' && !typeInfo.isMaybe) {
        if (ValidationUtils.isEmptyValue(transformedValue, 'array')) {
          return ValidationUtils.createErrorResult(
            transformedValue,
            'This field is required',
            [],
            transformedValue,
            type,
          );
        }

        if (Array.isArray(transformedValue) && transformedValue.length > 0) {
          const hasValidEntries = !ValidationUtils.hasOnlyNullValues(transformedValue);
          if (!hasValidEntries) {
            return ValidationUtils.createErrorResult(
              transformedValue,
              'This field is required',
              [],
              transformedValue,
              type,
            );
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

          const listValidationResult = ValidationUtils.validateRequiredListField(
            fieldValue,
            fieldType,
            fieldName,
            transformedValue,
          );
          if (listValidationResult) {
            return listValidationResult;
          }
        }
      }
    }

    return result;
  }, [formValue, type, context, options]);

  const getValue = useCallback((): unknown => {
    try {
      validationAttemptedRef.current = true;

      const result = validate();
      const isValid = result.isValid();

      if (isValid) {
        return result.value;
      } else {
        return null;
      }
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

    const tcombType = type as TcombType;
    const transformedValue = normalizeValueForValidation(formValue, tcombType, options);
    const typeInfo = getTypeInfo(tcombType);
    const typeMeta = tcombType.meta as { kind?: string };

    const listValidationResult = ValidationUtils.validateRequiredListField(
      transformedValue,
      tcombType,
      '',
      transformedValue,
    );
    if (listValidationResult) {
      return listValidationResult;
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
      typeof transformedValue === 'object' &&
      transformedValue !== null
    ) {
      const structValue = transformedValue as Record<string, unknown>;
      const props = typeMeta.props as Record<string, TcombType>;

      for (const [fieldName, fieldType] of Object.entries(props)) {
        const fieldValue = structValue[fieldName];

        const listValidationResult = ValidationUtils.validateRequiredListField(
          fieldValue,
          fieldType,
          fieldName,
          transformedValue,
        );
        if (listValidationResult) {
          return listValidationResult;
        }

        const fieldMeta = fieldType.meta;
        const fieldTypeInfo = getTypeInfo(fieldType);
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

    return t.validate(transformedValue, tcombType, { path: [], context });
  }, [formValue, type, context, options]);

  const getComponent = useCallback((): React.ComponentType<unknown> | null => {
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
  } else if (isTcombType(actualType) && 'getTcombFormFactory' in actualType) {
    ComponentClass = actualType.getTcombFormFactory!(componentOptions);
  } else {
    ComponentClass = Component.resolveComponent(actualType, componentOptions, 'Form');
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
  __INTERNAL__: {
    normalizeValueForValidation,
  },
}) as typeof FormComponent & {
  templates: typeof templates;
  stylesheet: typeof stylesheet;
  i18n: typeof i18n;
  __INTERNAL__: {
    normalizeValueForValidation: typeof normalizeValueForValidation;
  };
};

Object.assign(Form, {
  defaultProps: {
    options: {},
    templates,
    stylesheet,
    i18n,
  },
});
