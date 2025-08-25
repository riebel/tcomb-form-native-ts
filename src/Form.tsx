import React, { Component, forwardRef, useImperativeHandle, useRef } from 'react';
import { validate } from 'tcomb-validation';

import List from './components/List';
import Struct from './components/Struct';
import Checkbox from './fields/Checkbox';
import DatePicker from './fields/DatePicker';
import Select from './fields/Select';
import Textbox from './fields/Textbox';

// CRITICAL DEBUG: Verify DatePicker import and ReactComponent availability
console.log('[Form.tsx] DatePicker import check:', {
  hasDatePicker: !!DatePicker,
  hasReactComponent: !!DatePicker.ReactComponent,
  componentName:
    DatePicker.ReactComponent?.displayName || DatePicker.ReactComponent?.name || 'undefined',
  datePickerName: DatePicker.name || 'DatePicker',
  datePickerKeys: Object.keys(DatePicker || {}),
  datePickerPrototype: Object.getOwnPropertyNames(DatePicker.prototype || {}),
  reactComponentType: typeof DatePicker.ReactComponent,
});

import {
  ListTemplateProps,
  StructTemplateProps,
  TypeWithMeta,
  AnyTemplateProps,
  FieldComponentType,
  FormProps,
  MinimalFormRef,
  FormState,
  FormInputComponent,
  I18n,
} from './types/field.types';
import type { AutoLabelCtx } from './types/field.types';
import { getTypeInfo, UIDGenerator, getComponentOptions } from './util';
import { applyAutoLabel, appendOptionalSuffix } from './utils/field';
import { renderFieldComponent, canUseCentralizedRenderer } from './utils/componentRenderer';
import { DateModeOptions } from './types/utility.types';
import defaultStylesheet from './stylesheets/bootstrap';

function isTypeWithMeta(x: unknown): x is TypeWithMeta {
  return (
    typeof x === 'function' ||
    (typeof x === 'object' && x !== null && 'meta' in (x as Record<string, unknown>))
  );
}

const defaultGetComponent = <T,>(
  type: TypeWithMeta | null,
  options: Record<string, unknown> = {},
): FieldComponentType<T> => {
  console.log('[defaultGetComponent] Called with:', {
    hasType: !!type,
    typeName: type?.name || 'unknown',
    typeDisplayName: type?.displayName || 'unknown',
    hasOptions: !!options,
    optionsKeys: Object.keys(options || {}),
  });

  if (!type) {
    console.log('[defaultGetComponent] No type provided, returning Textbox');
    return Textbox.ReactComponent as FieldComponentType<T>;
  }

  const typeInfo = getTypeInfo(type);
  console.log('[defaultGetComponent] Type analysis:', {
    typeName: type.name || 'unknown',
    typeDisplayName: type.displayName || 'unknown',
    kind: typeInfo.kind,
    isUnion: typeInfo.isUnion,
    isEnum: typeInfo.isEnum,
    isMaybe: typeInfo.isMaybe,
    isSubtype: typeInfo.isSubtype,
    isList: typeInfo.isList,
    isDict: typeInfo.isDict,
    isPrimitive: typeInfo.isPrimitive,
    isObject: typeInfo.isObject,
    isRefinement: typeInfo.isRefinement,
    typeMeta: type.meta,
  });

  // For unions, default to the first variant; runtime dispatch still works via `dispatch`.
  if (typeInfo.isUnion) {
    console.log('[defaultGetComponent] Processing union type');
    const unionMeta = type.meta as { types?: TypeWithMeta[] } | undefined;
    const variants = unionMeta?.types;
    const first = variants && variants.length > 0 ? variants[0] : null;
    console.log('[defaultGetComponent] Union variants:', {
      variantCount: variants?.length || 0,
      firstVariant: first?.name || 'none',
    });
    return defaultGetComponent(first, options);
  }

  if (typeInfo.isEnum) {
    console.log('[defaultGetComponent] Detected enum type, returning Select');
    return Select.ReactComponent as FieldComponentType<T>;
  }

  if (typeInfo.isMaybe || typeInfo.isSubtype) {
    console.log('[defaultGetComponent] Processing maybe/subtype:', {
      isMaybe: typeInfo.isMaybe,
      isSubtype: typeInfo.isSubtype,
      sameAsOriginal: typeInfo.type === type,
      innerTypeName: typeInfo.type?.name || 'unknown',
      fieldName: (options as { name?: string } | undefined)?.name || 'unknown',
    });
    if (typeInfo.type === type) {
      console.log('[defaultGetComponent] Maybe/subtype same as original, returning Textbox');
      return Textbox.ReactComponent as FieldComponentType<T>;
    }

    // Get inner type info to see what we're recursing into
    const innerTypeInfo = getTypeInfo(typeInfo.type);
    console.log('[defaultGetComponent] Inner type analysis before recursion:', {
      innerKind: innerTypeInfo.kind,
      innerIsList: innerTypeInfo.isList,
      innerTypeName: typeInfo.type?.name || 'unknown',
      fieldName: (options as { name?: string } | undefined)?.name || 'unknown',
      willRecurseIntoList: innerTypeInfo.kind === 'list',
    });

    console.log('[defaultGetComponent] Recursing into maybe/subtype inner type');
    return defaultGetComponent(typeInfo.type, options);
  }

  console.log('[defaultGetComponent] Processing by kind:', typeInfo.kind);
  switch (typeInfo.kind) {
    case 'struct':
      console.log('[defaultGetComponent] Returning Struct component');
      return Struct as unknown as FieldComponentType<T>;
    case 'list': {
      console.log(
        '[defaultGetComponent] Processing list type - checking if should be Select vs List',
      );

      // Check if this list should render as a Select component (multi-select)
      // This happens when:
      // 1. The list contains primitive types (String, Number, etc.)
      // 2. The options suggest it's for selection rather than dynamic item management
      // 3. The field name suggests it's for assignment/selection (assignedUsers, selectedItems, etc.)

      const listMeta = type.meta as { type?: TypeWithMeta } | undefined;
      const itemType = listMeta?.type;
      const optionsWithName = options as { name?: string } | undefined;
      const fieldName = optionsWithName?.name || '';

      console.log('[defaultGetComponent] List analysis:', {
        hasItemType: !!itemType,
        itemTypeName: itemType?.name || 'unknown',
        itemTypeKind: itemType?.meta?.kind || 'unknown',
        fieldName,
        options: Object.keys(options || {}),
      });

      // If the list contains primitive types (String, Number, Boolean) and looks like a selection field,
      // render as Select component for better UX
      const isPrimitiveItemType =
        itemType &&
        (itemType.name === 'String' ||
          itemType.name === 'Number' ||
          itemType.name === 'Boolean' ||
          // Also check for irreducible types that are primitives
          (itemType.meta?.kind === 'irreducible' &&
            (itemType.displayName === 'String' ||
              itemType.displayName === 'Number' ||
              itemType.displayName === 'Boolean')));

      const looksLikeSelectionField =
        fieldName &&
        (fieldName.toLowerCase().includes('assigned') ||
          fieldName.toLowerCase().includes('selected') ||
          fieldName.toLowerCase().includes('chosen') ||
          fieldName.toLowerCase().includes('users') ||
          fieldName.toLowerCase().includes('items') ||
          fieldName.toLowerCase().includes('options') ||
          fieldName.toLowerCase().includes('clients') ||
          fieldName.toLowerCase().includes('members'));

      // Check if options explicitly indicate this should be a select
      const optionsWithSelectProps = options as
        | {
            factory?: string;
            component?: string;
            multiple?: boolean;
            enum?: unknown;
            options?: unknown;
          }
        | undefined;

      const hasSelectOptions =
        optionsWithSelectProps &&
        (optionsWithSelectProps.factory === 'Select' ||
          optionsWithSelectProps.component === 'Select' ||
          optionsWithSelectProps.multiple === true ||
          optionsWithSelectProps.enum ||
          optionsWithSelectProps.options);

      console.log('[defaultGetComponent] Selection detection:', {
        isPrimitiveItemType,
        looksLikeSelectionField,
        hasSelectOptions,
        shouldUseSelect: isPrimitiveItemType && (looksLikeSelectionField || hasSelectOptions),
        fieldNameLower: fieldName.toLowerCase(),
        fieldNameMatches: {
          assigned: fieldName.toLowerCase().includes('assigned'),
          selected: fieldName.toLowerCase().includes('selected'),
          users: fieldName.toLowerCase().includes('users'),
          clients: fieldName.toLowerCase().includes('clients'),
        },
      });

      if (isPrimitiveItemType && (looksLikeSelectionField || hasSelectOptions)) {
        console.log(
          '[defaultGetComponent] List with primitive items detected as selection field, returning Select',
        );
        return Select.ReactComponent as FieldComponentType<T>;
      }

      console.log('[defaultGetComponent] Returning List component for dynamic item management');
      return List.ReactComponent as FieldComponentType<T>;
    }
    case 'irreducible':
      console.log('[defaultGetComponent] Processing irreducible type:', typeInfo.type.name);
      switch (typeInfo.type.name) {
        case 'Boolean':
          console.log('[defaultGetComponent] Returning Checkbox component');
          return Checkbox.ReactComponent as FieldComponentType<T>;
        case 'Date':
          console.log('[defaultGetComponent] Checking DatePicker component availability');
          if (DatePicker.ReactComponent) {
            console.log('[defaultGetComponent] Returning DatePicker component');
            return DatePicker.ReactComponent as FieldComponentType<T>;
          } else {
            console.warn(
              '[defaultGetComponent] DatePicker.ReactComponent undefined, falling back to Textbox',
            );
            return Textbox.ReactComponent as FieldComponentType<T>;
          }
        case 'Number':
          console.log('[defaultGetComponent] Returning Textbox for Number');
          return Textbox.ReactComponent as FieldComponentType<T>;
        case 'String':
          console.log('[defaultGetComponent] Returning Textbox for String');
          return Textbox.ReactComponent as FieldComponentType<T>;
        default:
          console.log(
            '[defaultGetComponent] Returning Textbox for unknown irreducible type:',
            typeInfo.type.name,
          );
          return Textbox.ReactComponent as FieldComponentType<T>;
      }
    default:
      console.log('[defaultGetComponent] Returning Textbox for unknown kind:', typeInfo.kind);
      return Textbox.ReactComponent as FieldComponentType<T>;
  }
};

function hasDateMode(options: unknown): options is DateModeOptions {
  return typeof options === 'object' && options !== null && 'mode' in options;
}

function shouldCoerceToDatePicker(args: {
  dispatchedType: TypeWithMeta | null | undefined;
  fieldName: string | number;
  resolvedOptions?: unknown;
  value?: unknown;
}): boolean {
  const { dispatchedType, fieldName, resolvedOptions, value } = args;

  console.log('[shouldCoerceToDatePicker] Called with:', {
    fieldName,
    hasDispatchedType: !!dispatchedType,
    typeName: dispatchedType?.displayName || dispatchedType?.name || 'unknown',
    hasResolvedOptions: !!resolvedOptions,
    valueType: typeof value,
  });

  const ti = dispatchedType ? getTypeInfo(dispatchedType) : null;
  const isCoercibleType = ti?.kind === 'irreducible' || ti?.isMaybe === true;

  console.log('[shouldCoerceToDatePicker] Type analysis:', {
    typeKind: ti?.kind,
    isCoercibleType,
    isMaybe: ti?.isMaybe,
  });

  if (!isCoercibleType) {
    console.log('[shouldCoerceToDatePicker] Not coercible type, returning false');
    return false;
  }

  // Check options mode
  if (hasDateMode(resolvedOptions) && resolvedOptions.mode) {
    const validModes = ['date', 'time', 'datetime'] as const;
    if (validModes.includes(resolvedOptions.mode as 'date' | 'time' | 'datetime')) {
      return true;
    }
  }

  // Check field name pattern
  const name = String(fieldName).toLowerCase();
  const nameMatches = /(date|datum|dob|birth|zeit|time|from|start|until|end)$/i.test(name);
  console.log('[shouldCoerceToDatePicker] Field name check:', {
    fieldName,
    name,
    nameMatches,
  });
  if (nameMatches) {
    console.log('[shouldCoerceToDatePicker] Field name matches date pattern, returning true');
    return true;
  }

  // Check value type
  const isDateValue = value instanceof Date;
  const isDateString = typeof value === 'string' && !Number.isNaN(Date.parse(value));
  console.log('[shouldCoerceToDatePicker] Value check:', {
    isDateValue,
    isDateString,
    valueType: typeof value,
  });
  if (isDateValue || isDateString) {
    console.log('[shouldCoerceToDatePicker] Value is date-like, returning true');
    return true;
  }

  console.log('[shouldCoerceToDatePicker] No coercion criteria met, returning false');
  return false;
}

class FormImpl<T> extends Component<FormProps<T>, FormState> {
  static defaultProps: Partial<FormProps> = {
    value: undefined,
    options: {},
    context: {},
    stylesheet: defaultStylesheet,
    templates: {},
    i18n: {},
  };

  private input = React.createRef<FormInputComponent<T>>();
  private listKeys: string[] = [];
  private uidGen: UIDGenerator = new UIDGenerator(0);
  private static __seedCounter = 0;
  private readonly __instanceSeed: string = '';
  // Nested input refs by path (e.g., '0', '0.1', 'address.street')
  private refRegistry: Map<string, FormInputComponent<unknown>> = new Map();
  // Stable keys for nested lists by path (e.g., 'address.phones')
  private listKeysByPath: Map<string, string[]> = new Map();

  private makePathKey(path: Array<string | number>): string {
    return path.map(k => String(k)).join('.');
  }

  private registerRef(path: Array<string | number>, ref: FormInputComponent<unknown> | null) {
    const key = this.makePathKey(path);
    if (!key) return; // skip root
    if (ref) {
      this.refRegistry.set(key, ref);
    } else {
      this.refRegistry.delete(key);
    }
  }

  private ensureNestedListKeys(path: Array<string | number>, desiredLength: number) {
    const key = this.makePathKey(path);
    let arr = this.listKeysByPath.get(key);
    if (!arr) {
      arr = [];
      this.listKeysByPath.set(key, arr);
    }
    if (arr.length < desiredLength) {
      const toAdd = desiredLength - arr.length;
      for (let i = 0; i < toAdd; i++) {
        arr.push(String(this.uidGen.next()));
      }
    } else if (arr.length > desiredLength) {
      arr.splice(desiredLength);
    }
    return arr;
  }

  constructor(props: FormProps<T>) {
    console.log('[FormImpl] Constructor called with props:', {
      hasType: !!props.type,
      hasValue: !!props.value,
      hasOnChange: !!props.onChange,
      hasOptions: !!props.options,
      hasTemplates: !!props.templates,
      hasStylesheet: !!props.stylesheet,
    });
    super(props);
    // Initialize per-instance seed for stable UID generation
    this.__instanceSeed = this.getSeed();
    this.uidGen = new UIDGenerator(this.__instanceSeed);
    console.log('[FormImpl] Constructor completed, instanceSeed:', this.__instanceSeed);
  }

  // Expose UID generator
  public getUIDGenerator() {
    return this.uidGen;
  }

  // Read current value without triggering validation
  private readValue(): T | undefined {
    return this.input.current?.getValue() ?? this.props.value;
  }

  pureValidate() {
    // Delegate to root input's pureValidate when available
    const root = this.input.current as unknown as {
      pureValidate?: () => ReturnType<typeof validate>;
    } | null;
    if (root && typeof root.pureValidate === 'function') {
      return root.pureValidate();
    }
    const { type } = this.props;
    const value = this.readValue();
    if (!isTypeWithMeta(type)) {
      return validate(value, null as unknown as TypeWithMeta, this.getValidationOptions());
    }
    return validate(value, type, this.getValidationOptions());
  }

  validate(): ReturnType<typeof validate> {
    // Delegate to root input's validate when available
    const root = this.input.current as unknown as {
      validate?: () => ReturnType<typeof validate>;
      setState?: (s: { hasError: boolean }) => void;
    } | null;
    if (root && typeof root.validate === 'function') {
      return root.validate();
    }
    const result = this.pureValidate();
    this.input.current?.setState({ hasError: !result.isValid() });
    return result;
  }

  getValue(): T | null {
    // Trigger validation and set error state like legacy behavior
    const result = this.pureValidate();
    this.input.current?.setState({ hasError: !result.isValid() });
    return result.isValid() ? (this.readValue() as T | null) : null;
  }

  private getValidationOptions() {
    return {};
  }

  getComponentAtPath(path?: Array<string | number> | string): FormInputComponent<T> | undefined {
    // Root if no path
    if (
      !path ||
      (Array.isArray(path) && path.length === 0) ||
      (typeof path === 'string' && path.trim() === '')
    ) {
      return this.input.current as unknown as FormInputComponent<T>;
    }
    // Support string paths like 'address.street' or 'phones.0'
    const parts: Array<string | number> = Array.isArray(path)
      ? path
      : String(path)
          .split('.')
          .map(seg => (String(Number(seg)) === seg ? Number(seg) : seg));
    const key = this.makePathKey(parts);
    const ref = this.refRegistry.get(key);
    return ref as unknown as FormInputComponent<T> | undefined;
  }

  // Alias matching MinimalFormRef
  getComponent(path?: Array<string | number> | string): FormInputComponent<T> | undefined {
    return this.getComponentAtPath(path);
  }

  // Provide a stable per-instance seed
  getSeed(): string {
    const n = ++FormImpl.__seedCounter;
    return String(n);
  }

  render() {
    console.log('[FormImpl] Render started with props:', {
      hasType: !!this.props.type,
      typeKind: this.props.type ? getTypeInfo(this.props.type as TypeWithMeta)?.kind : 'none',
      hasValue: !!this.props.value,
      valueType: typeof this.props.value,
      hasOnChange: !!this.props.onChange,
      hasOptions: !!this.props.options,
      hasTemplates: !!this.props.templates,
      hasStylesheet: !!this.props.stylesheet,
    });

    const {
      type,
      options = {},
      value,
      onChange,
      context,
      stylesheet = {},
      templates = {},
      i18n,
      ...otherProps
    } = this.props;

    const getComponent = options.getComponent || defaultGetComponent;
    console.log(
      '[FormImpl] Using getComponent:',
      getComponent === defaultGetComponent ? 'default' : 'custom',
    );

    // Allow overriding UID generator via props/options
    const providedGen = (options as { uidGenerator?: UIDGenerator } | undefined)?.uidGenerator;
    if (providedGen && this.uidGen !== providedGen) {
      console.log('[FormImpl] Overriding UID generator');
      this.uidGen = providedGen;
    }

    const tType = isTypeWithMeta(type) ? type : null;
    console.log('[FormImpl] Type analysis:', {
      isTypeWithMeta: !!tType,
      typeName: tType?.displayName || tType?.name || 'unknown',
      typeKind: tType ? getTypeInfo(tType)?.kind : 'none',
    });

    const Component = getComponent(tType, options);
    console.log(
      '[FormImpl] Selected component:',
      Component?.displayName || Component?.name || 'anonymous',
    );

    const resolvedOptions = getComponentOptions(options as unknown, value, tType);
    // Build ctx with uidGenerator and path-aware context
    const baseAuto = (options as { auto?: string } | undefined)?.auto ?? ('labels' as const);
    const baseConfig = (options as { config?: Record<string, unknown> } | undefined)?.config || {};

    const makeCtx = (
      path: Array<string | number>,
      ss = stylesheet,
      overrides?: { auto?: string; config?: Record<string, unknown>; i18n?: I18n },
    ) => {
      const auto = (overrides?.auto ?? baseAuto) as string;
      // Derive a default label from the last path segment so applyAutoLabel can render it
      const defaultLabel = path.length > 0 ? String(path[path.length - 1]) : undefined;
      return {
        auto,
        label: defaultLabel as string | undefined,
        i18n: (overrides?.i18n ?? (i18n as unknown)) as unknown,
        templates: templates as unknown,
        stylesheet: ss as unknown,
        uidGenerator: this.uidGen,
        // Merge config: outer ctx, then base options, then overrides
        config: {
          ...(context as { config?: Record<string, unknown> } | undefined)?.config,
          ...baseConfig,
          ...(overrides?.config || {}),
        } as Record<string, unknown>,
        context,
        path,
      };
    };
    const baseCtx = makeCtx([]);
    const baseProps = {
      ref: this.input,
      type,
      value,
      onChange,
      context,
      stylesheet,
      templates,
      i18n,
      ctx: baseCtx,
      options: (resolvedOptions ?? options) as Record<string, unknown>,
      ...otherProps,
    };

    // Prefer branching by type kind to avoid identity mismatches across module copies
    const rootTypeInfo = tType ? getTypeInfo(tType) : null;
    console.log('[FormImpl] Root type info:', {
      kind: rootTypeInfo?.kind,
      isStruct: rootTypeInfo?.kind === 'struct',
      isList: rootTypeInfo?.kind === 'list',
      componentName: Component?.displayName || Component?.name,
    });

    if (rootTypeInfo?.kind === 'struct') {
      console.log('[FormImpl] Rendering struct type');
      // Render struct children to register per-field refs
      const structMeta = (tType?.meta as { props?: Record<string, TypeWithMeta> } | undefined)
        ?.props;
      const structValue: Record<string, unknown> =
        value && typeof value === 'object' && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {};

      const declFieldNames = structMeta ? Object.keys(structMeta) : [];
      // Support struct field ordering via options.order
      const structOrder = (options as { order?: ReadonlyArray<string> } | undefined)?.order;
      const fieldNames =
        Array.isArray(structOrder) && structOrder.length
          ? [
              // include only declared fields in the provided order first
              ...structOrder.filter(
                k => !!structMeta && Object.prototype.hasOwnProperty.call(structMeta, k),
              ),
              // append the remaining declared fields not listed in order, preserving declaration order
              ...declFieldNames.filter(k => !structOrder.includes(k)),
            ]
          : declFieldNames;

      const children = fieldNames.map(fieldName => {
        console.log('[FormImpl] Processing struct field:', fieldName);
        const rawChildType = structMeta?.[fieldName] as TypeWithMeta | undefined;
        const dispatchedChildType =
          (
            rawChildType as unknown as { dispatch?: (v: unknown) => TypeWithMeta | undefined }
          )?.dispatch?.(structValue[fieldName]) ||
          rawChildType ||
          null;
        console.log('[FormImpl] Field type info:', {
          fieldName,
          hasRawType: !!rawChildType,
          hasDispatchedType: !!dispatchedChildType,
          dispatchedKind: dispatchedChildType ? getTypeInfo(dispatchedChildType)?.kind : 'none',
        });

        let ChildComponent = getComponent(dispatchedChildType, options);
        console.log(
          '[FormImpl] Child component for field',
          fieldName,
          ':',
          ChildComponent?.displayName || ChildComponent?.name || 'anonymous',
        );
        if (!ChildComponent) {
          console.log('[FormImpl] No child component found for field:', fieldName);
          return null;
        }

        // Resolve per-field options from options.fields[fieldName] first
        const fieldOptionsRaw = options as Record<string, unknown> | undefined as
          | { fields?: Record<string, unknown>; item?: unknown }
          | undefined;
        const perFieldRaw = fieldOptionsRaw?.fields?.[fieldName];
        const perFieldResolved = getComponentOptions(
          perFieldRaw as unknown,
          structValue[fieldName],
          dispatchedChildType,
        );
        const childResolvedOptions =
          perFieldResolved ??
          getComponentOptions(options as unknown, structValue[fieldName], dispatchedChildType);

        // Apply legacy coercion after options are resolved with runtime validation
        if (
          ChildComponent === Textbox.ReactComponent &&
          shouldCoerceToDatePicker({
            dispatchedType: dispatchedChildType,
            fieldName,
            resolvedOptions: childResolvedOptions,
            value: structValue[fieldName],
          })
        ) {
          console.log('[FormImpl] DatePicker coercion triggered for field:', fieldName);
          console.log('[FormImpl] DatePicker component check:', {
            hasDatePicker: !!DatePicker,
            hasReactComponent: !!DatePicker.ReactComponent,
            componentName:
              DatePicker.ReactComponent?.displayName ||
              DatePicker.ReactComponent?.name ||
              'undefined',
            datePickerKeys: Object.keys(DatePicker || {}),
          });

          // CRITICAL: Runtime validation to prevent undefined component errors
          if (!DatePicker.ReactComponent) {
            console.warn(
              '[FormImpl] DatePicker.ReactComponent is undefined, falling back to Textbox for field:',
              fieldName,
              {
                datePickerModule: DatePicker,
                hasDatePicker: !!DatePicker,
                datePickerKeys: Object.keys(DatePicker || {}),
                datePickerPrototype: DatePicker.prototype
                  ? Object.getOwnPropertyNames(DatePicker.prototype)
                  : [],
                datePickerStatic: DatePicker ? Object.getOwnPropertyNames(DatePicker) : [],
                fallbackToTextbox: true,
              },
            );
            // Try to access ReactComponent through different paths
            const datePickerWithComponent = DatePicker as {
              ReactComponent?: unknown;
              default?: { ReactComponent?: unknown };
            };
            const prototypeWithComponent = DatePicker.prototype as {
              constructor?: { ReactComponent?: unknown };
            };

            const reactComponent =
              datePickerWithComponent?.ReactComponent ||
              datePickerWithComponent?.default?.ReactComponent ||
              prototypeWithComponent?.constructor?.ReactComponent;

            if (reactComponent) {
              console.log('[FormImpl] Found DatePicker.ReactComponent through alternative path');
              ChildComponent = reactComponent as unknown as FieldComponentType<T>;
            } else {
              console.log(
                '[FormImpl] No alternative DatePicker paths found, using Textbox fallback for field:',
                fieldName,
              );
              // CRITICAL FIX: Actually set ChildComponent to Textbox as fallback
              ChildComponent = Textbox.ReactComponent as unknown as FieldComponentType<T>;
            }
          } else {
            ChildComponent = DatePicker.ReactComponent as unknown as FieldComponentType<T>;
          }

          console.log('[FormImpl] After coercion with validation, ChildComponent:', {
            componentName:
              (ChildComponent as React.ComponentType)?.displayName ||
              (ChildComponent as React.ComponentType)?.name ||
              'anonymous',
            isUndefined: ChildComponent === undefined,
            isTextbox: ChildComponent === Textbox.ReactComponent,
            isDatePicker: ChildComponent === DatePicker.ReactComponent,
          });
        }

        const handleFieldChange = (nextValue: unknown) => {
          const next = { ...structValue, [fieldName]: nextValue } as unknown as T;
          onChange?.(next, [fieldName]);
        };

        // Allow per-field stylesheet override
        const fieldStylesheet = (perFieldResolved as { stylesheet?: unknown } | undefined)
          ?.stylesheet as Record<string, unknown> | undefined;

        const childStylesheet = (
          fieldStylesheet ? { ...stylesheet, ...fieldStylesheet } : stylesheet
        ) as typeof stylesheet;

        const childCtx = makeCtx([fieldName], childStylesheet, {
          auto: (perFieldResolved as { auto?: string } | undefined)?.auto,
          config: (perFieldResolved as { config?: Record<string, unknown> } | undefined)?.config,
          i18n: (perFieldResolved as { i18n?: I18n } | undefined)?.i18n,
        });
        // Compute label/help/error/hasError/required for templates which expect them via props
        let childLabel: React.ReactNode | null | undefined = (
          perFieldResolved as { label?: React.ReactNode } | undefined
        )?.label;
        childLabel = applyAutoLabel(childLabel, childCtx as unknown as AutoLabelCtx);
        childLabel = appendOptionalSuffix(
          childLabel,
          dispatchedChildType as unknown as { meta?: { optional?: boolean; kind?: string } },
          childCtx as unknown as { i18n?: { optional?: string } },
        );
        const childRequired = !(
          dispatchedChildType as { meta?: { optional?: boolean } } | undefined
        )?.meta?.optional;
        const childBaseProps = {
          ...baseProps,
          type: dispatchedChildType,
          value: structValue[fieldName],
          onChange: handleFieldChange as (v: T) => void,
          options: (childResolvedOptions ?? options) as Record<string, unknown>,
          stylesheet: childStylesheet,
          ctx: childCtx,
          label: childLabel ?? undefined,
          help: (perFieldResolved as { help?: React.ReactNode } | undefined)?.help,
          error: (perFieldResolved as { error?: React.ReactNode } | undefined)?.error,
          hasError: (perFieldResolved as { hasError?: boolean } | undefined)?.hasError,
          required: childRequired,
          hidden: (perFieldResolved as { hidden?: boolean } | undefined)?.hidden,
          disabled: (perFieldResolved as { disabled?: boolean } | undefined)?.disabled,
          ref: (r: FormInputComponent<unknown> | null) => this.registerRef([fieldName], r),
        } as const;

        // Use centralized renderer for simple components
        if (canUseCentralizedRenderer(ChildComponent)) {
          return renderFieldComponent({
            Component: ChildComponent,
            baseProps: childBaseProps,
            resolvedOptions: (childResolvedOptions as Record<string, unknown>) || {},
            value: structValue[fieldName],
            onChange: handleFieldChange,
            key: fieldName,
          });
        }
        if (ChildComponent === (Struct as unknown as FieldComponentType<T>)) {
          // Nested struct: render fields and register refs using [fieldName, inner]
          const innerStructMeta = (
            dispatchedChildType?.meta as { props?: Record<string, TypeWithMeta> }
          )?.props;
          const innerValue: Record<string, unknown> =
            structValue[fieldName] && typeof structValue[fieldName] === 'object'
              ? (structValue[fieldName] as Record<string, unknown>)
              : {};

          const innerDeclNames = innerStructMeta ? Object.keys(innerStructMeta) : [];
          // Per-field ordering for nested structs via options.fields[<name>].order
          const innerOrder = (perFieldResolved as { order?: ReadonlyArray<string> } | undefined)
            ?.order;
          const innerFieldNames =
            Array.isArray(innerOrder) && innerOrder.length
              ? [
                  ...innerOrder.filter(
                    k =>
                      !!innerStructMeta && Object.prototype.hasOwnProperty.call(innerStructMeta, k),
                  ),
                  ...innerDeclNames.filter(k => !innerOrder.includes(k)),
                ]
              : innerDeclNames;
          const innerChildren = innerFieldNames.map(innerName => {
            const rawInnerType = innerStructMeta?.[innerName] as TypeWithMeta | undefined;
            const dispatchedInnerType =
              (
                rawInnerType as unknown as { dispatch?: (v: unknown) => TypeWithMeta | undefined }
              )?.dispatch?.(innerValue[innerName]) ||
              rawInnerType ||
              null;

            let InnerComponent = getComponent(dispatchedInnerType, options);
            if (!InnerComponent) return null;

            const innerResolvedOptions = getComponentOptions(
              options as unknown,
              innerValue[innerName],
              dispatchedInnerType,
            );

            // Apply legacy coercion after options are resolved
            if (
              InnerComponent === Textbox.ReactComponent &&
              shouldCoerceToDatePicker({
                dispatchedType: dispatchedInnerType,
                fieldName: innerName,
                resolvedOptions: innerResolvedOptions,
                value: innerValue[innerName],
              })
            ) {
              if (DatePicker.ReactComponent) {
                InnerComponent = DatePicker.ReactComponent as unknown as FieldComponentType<T>;
              } else {
                console.warn(
                  '[FormImpl] DatePicker.ReactComponent undefined for inner component, using Textbox',
                );
                InnerComponent = Textbox.ReactComponent as unknown as FieldComponentType<T>;
              }
            }

            const handleInnerChange = (nextVal: unknown) => {
              const nextInner = { ...innerValue, [innerName]: nextVal };
              const nextStruct = { ...structValue, [fieldName]: nextInner } as unknown as T;
              onChange?.(nextStruct, [fieldName, innerName]);
            };

            const innerCtx = makeCtx([fieldName, innerName], undefined, {
              auto: (perFieldResolved as { auto?: string } | undefined)?.auto,
              config: (perFieldResolved as { config?: Record<string, unknown> } | undefined)
                ?.config,
              i18n: (perFieldResolved as { i18n?: I18n } | undefined)?.i18n,
            });
            let innerLabel: React.ReactNode | null | undefined = (
              perFieldResolved as { label?: React.ReactNode } | undefined
            )?.label;
            innerLabel = applyAutoLabel(innerLabel, innerCtx as unknown as AutoLabelCtx);
            innerLabel = appendOptionalSuffix(
              innerLabel,
              dispatchedInnerType as unknown as { meta?: { optional?: boolean; kind?: string } },
              innerCtx as unknown as { i18n?: { optional?: string } },
            );
            const innerRequired = !(
              dispatchedInnerType as { meta?: { optional?: boolean } } | undefined
            )?.meta?.optional;

            const innerBaseProps = {
              ...baseProps,
              type: dispatchedInnerType,
              value: innerValue[innerName],
              onChange: handleInnerChange as (v: T) => void,
              options: (innerResolvedOptions ?? options) as Record<string, unknown>,
              ctx: innerCtx,
              label: innerLabel ?? undefined,
              help: (perFieldResolved as { help?: React.ReactNode } | undefined)?.help,
              error: (perFieldResolved as { error?: React.ReactNode } | undefined)?.error,
              hasError: (perFieldResolved as { hasError?: boolean } | undefined)?.hasError,
              required: innerRequired,
              ref: (r: FormInputComponent<unknown> | null) =>
                this.registerRef([fieldName, innerName], r),
            } as const;

            // Use centralized renderer for simple components
            if (canUseCentralizedRenderer(InnerComponent)) {
              return renderFieldComponent({
                Component: InnerComponent,
                baseProps: innerBaseProps,
                resolvedOptions: (innerResolvedOptions as Record<string, unknown>) || {},
                value: innerValue[innerName],
                onChange: handleInnerChange,
                key: innerName,
              });
            }
            // These cases are now handled by the centralized renderer above
            if (InnerComponent === List.ReactComponent) {
              const innerItems = Array.isArray(innerValue[innerName])
                ? (innerValue[innerName] as unknown[])
                : [];
              const innerListMeta =
                (dispatchedInnerType?.meta as { type?: unknown; of?: unknown } | undefined) ?? {};
              const innerItemType = (innerListMeta.type ?? innerListMeta.of) as
                | TypeWithMeta
                | undefined;

              const handleInnerAdd = () => {
                const next = innerItems.slice();
                next.push(null as unknown as unknown);
                const nextStruct = { ...structValue, [fieldName]: next } as unknown as T;
                onChange?.(nextStruct, [fieldName, innerName]);
              };
              const handleInnerRemove = (idx: number) => {
                const next = innerItems.slice();
                next.splice(idx, 1);
                const nextStruct = { ...structValue, [fieldName]: next } as unknown as T;
                onChange?.(nextStruct, [fieldName, innerName]);
              };
              const handleInnerMoveUp = (idx: number) => {
                if (idx <= 0) return;
                const next = innerItems.slice();
                const tmp = next[idx - 1];
                next[idx - 1] = next[idx];
                next[idx] = tmp;
                const nextStruct = { ...structValue, [fieldName]: next } as unknown as T;
                onChange?.(nextStruct, [fieldName, innerName]);
              };
              const handleInnerMoveDown = (idx: number) => {
                if (idx >= innerItems.length - 1) return;
                const next = innerItems.slice();
                const tmp = next[idx + 1];
                next[idx + 1] = next[idx];
                next[idx] = tmp;
                const nextStruct = { ...structValue, [fieldName]: next } as unknown as T;
                onChange?.(nextStruct, [fieldName, innerName]);
              };

              const i18nForList = ((innerBaseProps.ctx as { i18n?: I18n } | undefined)?.i18n ||
                (perFieldResolved as { i18n?: I18n } | undefined)?.i18n ||
                (options as { i18n?: I18n } | undefined)?.i18n ||
                undefined) as I18n | undefined;

              const listI18n = (i18nForList || {}) as Partial<{
                add: React.ReactNode;
                remove: React.ReactNode;
                up: React.ReactNode;
                down: React.ReactNode;
              }>;

              const listProps: ListTemplateProps<unknown> = {
                ...(innerBaseProps as unknown as ListTemplateProps<unknown>),
                label: String((innerBaseProps as { label?: unknown })?.label ?? ''),
                items: innerItems.map((it, i) => ({
                  key: String(i),
                  input: null,
                  buttons: [
                    {
                      type: 'remove',
                      label: (listI18n.remove as React.ReactNode) ?? 'Remove',
                      click: () => handleInnerRemove(i),
                    },
                  ],
                })),
                onAdd: handleInnerAdd,
                onRemove: handleInnerRemove,
                onMoveUp: handleInnerMoveUp,
                onMoveDown: handleInnerMoveDown,
                addLabel: listI18n.add as React.ReactNode,
                removeLabel: listI18n.remove as React.ReactNode,
                upLabel: listI18n.up as React.ReactNode,
                downLabel: listI18n.down as React.ReactNode,
                renderItem: (it: unknown, idx: number) => {
                  // If innerType has a dispatch (union), use it to pick concrete type
                  const dispatched =
                    (
                      innerItemType as unknown as {
                        dispatch?: (v: unknown) => TypeWithMeta | undefined;
                      }
                    )?.dispatch?.(it) ||
                    innerItemType ||
                    null;
                  let ItemComponent = getComponent(dispatched, options);
                  if (!ItemComponent) return null;
                  // Resolve per-item options: prefer list field options.item, then global options.item, then fallback to options
                  const rawItemOptions =
                    (listProps as { item?: unknown }).item ??
                    (fieldOptionsRaw?.item as unknown) ??
                    (options as unknown);
                  const itemResolvedOptions = getComponentOptions(rawItemOptions, it, dispatched);
                  // Apply legacy coercion after options are resolved
                  if (
                    ItemComponent === Textbox.ReactComponent &&
                    shouldCoerceToDatePicker({
                      dispatchedType: dispatched as TypeWithMeta,
                      fieldName: idx,
                      resolvedOptions: itemResolvedOptions,
                      value: it,
                    })
                  ) {
                    if (DatePicker.ReactComponent) {
                      ItemComponent = DatePicker.ReactComponent as unknown as FieldComponentType<T>;
                    } else {
                      console.warn(
                        '[FormImpl] DatePicker.ReactComponent undefined for list item, using Textbox',
                      );
                      ItemComponent = Textbox.ReactComponent as unknown as FieldComponentType<T>;
                    }
                  }
                  const thisItemPath: Array<string | number> = [fieldName, innerName, idx];
                  const keys = this.ensureNestedListKeys([fieldName], innerItems.length);

                  const handleItemChange = (nextValue: unknown) => {
                    const next = innerItems.slice();
                    next[idx] = nextValue;
                    const nextStruct = { ...structValue, [fieldName]: next } as unknown as T;
                    onChange?.(nextStruct, thisItemPath);
                  };

                  const itemCtx = makeCtx(thisItemPath, undefined, {
                    auto: (itemResolvedOptions as { auto?: string } | undefined)?.auto,
                    config: (
                      itemResolvedOptions as { config?: Record<string, unknown> } | undefined
                    )?.config,
                    i18n: (itemResolvedOptions as { i18n?: I18n } | undefined)?.i18n,
                  });
                  let itemLabel: React.ReactNode | null | undefined = (
                    itemResolvedOptions as { label?: React.ReactNode } | undefined
                  )?.label;
                  itemLabel = applyAutoLabel(itemLabel, itemCtx as unknown as AutoLabelCtx);
                  itemLabel = appendOptionalSuffix(
                    itemLabel,
                    dispatched as unknown as { meta?: { optional?: boolean; kind?: string } },
                    itemCtx as unknown as { i18n?: { optional?: string } },
                  );
                  const itemRequired = !(
                    dispatched as { meta?: { optional?: boolean } } | undefined
                  )?.meta?.optional;

                  const itemBaseProps = {
                    ...baseProps,
                    type: dispatched,
                    value: it,
                    onChange: handleItemChange as (v: T) => void,
                    options: (itemResolvedOptions ?? options) as Record<string, unknown>,
                    ctx: itemCtx,
                    label: itemLabel ?? undefined,
                    help: (itemResolvedOptions as { help?: React.ReactNode } | undefined)?.help,
                    error: (itemResolvedOptions as { error?: React.ReactNode } | undefined)?.error,
                    hasError: (itemResolvedOptions as { hasError?: boolean } | undefined)?.hasError,
                    required: itemRequired,
                    ref: (r: FormInputComponent<unknown> | null) =>
                      this.registerRef(thisItemPath, r),
                  } as const;

                  // Use centralized renderer for simple components
                  if (canUseCentralizedRenderer(ItemComponent)) {
                    return renderFieldComponent({
                      Component: ItemComponent,
                      baseProps: itemBaseProps,
                      resolvedOptions: (itemResolvedOptions as Record<string, unknown>) || {},
                      value: it,
                      onChange: handleItemChange,
                      key: keys[idx] ?? String(idx),
                    });
                  }

                  return React.createElement(
                    ItemComponent as React.ComponentType<AnyTemplateProps<T>>,
                    {
                      key: keys[idx] ?? String(idx),
                      ...(itemBaseProps as unknown as AnyTemplateProps<T>),
                    },
                  );
                },
              } as ListTemplateProps<unknown>;

              const ListComp1 = List.ReactComponent as React.ComponentType<
                ListTemplateProps<unknown>
              >;
              return <ListComp1 key={innerName} {...listProps} />;
            }

            return React.createElement(InnerComponent as React.ComponentType<AnyTemplateProps<T>>, {
              key: innerName,
              ...(innerBaseProps as unknown as AnyTemplateProps<T>),
            });
          });

          // Compute Struct label with legend alias, auto-label and optional suffix
          const childOpts =
            (childBaseProps.options as { label?: React.ReactNode; legend?: React.ReactNode }) || {};
          let structLabel: React.ReactNode | undefined = childOpts.label ?? childOpts.legend;
          const structCtxForAuto = {
            auto: (childBaseProps.ctx as { auto: string } | undefined)?.auto ?? 'none',
            label:
              typeof (childBaseProps.ctx as { label?: unknown } | undefined)?.label === 'string'
                ? ((childBaseProps.ctx as { label?: string } | undefined)?.label as string)
                : undefined,
            i18n: (childBaseProps.ctx as { i18n?: { optional?: string } } | undefined)?.i18n,
          } as { auto: string; label?: string; i18n?: { optional?: string } };
          structLabel = applyAutoLabel(structLabel, structCtxForAuto) ?? undefined;
          const structI18nCtx = { i18n: structCtxForAuto?.i18n } as
            | { i18n?: { optional?: string } }
            | undefined;
          structLabel =
            appendOptionalSuffix(
              structLabel,
              (dispatchedChildType as unknown) || undefined,
              structI18nCtx,
            ) ?? undefined;

          const structRequired = !(
            dispatchedChildType as { meta?: { optional?: boolean } } | undefined
          )?.meta?.optional;

          // Allow per-struct template override via options.template
          const StructTemplate =
            ((childBaseProps.options as { template?: React.ComponentType<StructTemplateProps> })
              ?.template as React.ComponentType<StructTemplateProps> | undefined) || Struct;

          return (
            <StructTemplate
              key={fieldName}
              {...(childBaseProps as unknown as StructTemplateProps)}
              label={structLabel ?? undefined}
              required={structRequired}
              showRequiredIndicator={true}
            >
              {innerChildren}
            </StructTemplate>
          );
        }
        // These cases are now handled by the centralized renderer above
        if (ChildComponent === List.ReactComponent) {
          // Nested list under struct: reuse list renderer with path prefix of the field name
          const items = Array.isArray(structValue[fieldName])
            ? (structValue[fieldName] as unknown[])
            : [];

          // Determine inner item type for this list field (not currently used here)
          const _listMeta =
            (dispatchedChildType?.meta as { type?: unknown; of?: unknown } | undefined) ?? {};
          const _childInnerType = (_listMeta.type ?? _listMeta.of) as TypeWithMeta | undefined;

          const handleAddChild = () => {
            const next = items.slice();
            next.push(null as unknown as unknown);
            handleFieldChange(next);
            // maintain stable keys for nested list
            const keys = this.ensureNestedListKeys([fieldName], next.length);
            keys[keys.length - 1] = String(this.uidGen.next());
          };
          const handleRemoveChild = (idx: number) => {
            const next = items.slice();
            next.splice(idx, 1);
            handleFieldChange(next);
            this.ensureNestedListKeys([fieldName], next.length);
            // keys array is already resized by ensureNestedListKeys
          };
          const handleMoveUpChild = (idx: number) => {
            if (idx <= 0) return;
            const next = items.slice();
            const tmp = next[idx - 1];
            next[idx - 1] = next[idx];
            next[idx] = tmp;
            handleFieldChange(next);
            const keys = this.ensureNestedListKeys([fieldName], next.length);
            const ktmp = keys[idx - 1];
            keys[idx - 1] = keys[idx];
            keys[idx] = ktmp;
          };
          const handleMoveDownChild = (idx: number) => {
            if (idx >= items.length - 1) return;
            const next = items.slice();
            const tmp = next[idx + 1];
            next[idx + 1] = next[idx];
            next[idx] = tmp;
            handleFieldChange(next);
            const keys = this.ensureNestedListKeys([fieldName], next.length);
            const ktmp = keys[idx + 1];
            keys[idx + 1] = keys[idx];
            keys[idx] = ktmp;
          };

          const listFieldOptions = (perFieldResolved as Record<string, unknown> | undefined) ?? {};
          const listI18nTop = (i18n || {}) as Partial<{
            add: React.ReactNode;
            remove: React.ReactNode;
            up: React.ReactNode;
            down: React.ReactNode;
          }>;
          // Do not pass field input ref down to List template (function components cannot receive refs)
          const { ref: _ignoreFieldRef, ...childBaseNoRef } = childBaseProps as unknown as {
            ref?: unknown;
          } & Record<string, unknown>;
          const listBaseProps = {
            ...(childBaseNoRef as unknown as ListTemplateProps<unknown>),
            onAdd: handleAddChild,
            onRemove: handleRemoveChild,
            onMoveUp: handleMoveUpChild,
            onMoveDown: handleMoveDownChild,
            addLabel:
              (listFieldOptions as { addLabel?: React.ReactNode }).addLabel ??
              (listI18nTop.add as React.ReactNode),
            removeLabel:
              (listFieldOptions as { removeLabel?: React.ReactNode }).removeLabel ??
              (listI18nTop.remove as React.ReactNode),
            upLabel:
              (listFieldOptions as { upLabel?: React.ReactNode }).upLabel ??
              (listI18nTop.up as React.ReactNode),
            downLabel:
              (listFieldOptions as { downLabel?: React.ReactNode }).downLabel ??
              (listI18nTop.down as React.ReactNode),
            required: !(dispatchedChildType as { meta?: { optional?: boolean } } | undefined)?.meta
              ?.optional,
            showRequiredIndicator: true,
          };
          // List.ReactComponent consumes items via props, not children
          const ListComp2 = List.ReactComponent as React.ComponentType<ListTemplateProps<unknown>>;
          return <ListComp2 key={fieldName} {...listBaseProps} />;
        }

        return React.createElement(ChildComponent as React.ComponentType<AnyTemplateProps<T>>, {
          key: fieldName,
          ...(childBaseProps as unknown as AnyTemplateProps<T>),
        });
      });

      // Build Struct wrapper props with label auto/legend alias and optional suffix
      const structOptions = (resolvedOptions ?? options) as
        | {
            label?: React.ReactNode;
            legend?: React.ReactNode;
            help?: React.ReactNode;
            error?: React.ReactNode;
            hasError?: boolean;
            template?: React.ComponentType<StructTemplateProps>;
          }
        | Record<string, unknown>;
      let rootStructLabel: React.ReactNode | undefined =
        (structOptions as { label?: React.ReactNode; legend?: React.ReactNode }).label ??
        (structOptions as { legend?: React.ReactNode }).legend;
      const rootStructCtxForAuto = {
        auto: (baseCtx as { auto: string } | undefined)?.auto ?? 'none',
        label:
          typeof (baseCtx as { label?: unknown } | undefined)?.label === 'string'
            ? ((baseCtx as { label?: string } | undefined)?.label as string)
            : undefined,
        i18n: (baseCtx as { i18n?: { optional?: string } } | undefined)?.i18n,
      } as { auto: string; label?: string; i18n?: { optional?: string } };
      rootStructLabel = applyAutoLabel(rootStructLabel, rootStructCtxForAuto) ?? undefined;
      const rootI18nCtx = { i18n: rootStructCtxForAuto?.i18n } as
        | { i18n?: { optional?: string } }
        | undefined;
      rootStructLabel =
        appendOptionalSuffix(rootStructLabel, tType ?? undefined, rootI18nCtx) ?? undefined;

      const rootStructRequired = !(tType as { meta?: { optional?: boolean } } | undefined)?.meta
        ?.optional;

      const RootStructTemplate = (
        structOptions as { template?: React.ComponentType<StructTemplateProps> }
      ).template
        ? ((structOptions as { template?: React.ComponentType<StructTemplateProps> })
            .template as React.ComponentType<StructTemplateProps>)
        : Struct;

      // Do not pass root ref to Struct template (may be a function component)
      const { ref: _ignoreRootRef, ...basePropsNoRef } = baseProps as unknown as {
        ref?: unknown;
      } & Record<string, unknown>;
      const structTemplateProps: StructTemplateProps = {
        ...(basePropsNoRef as unknown as StructTemplateProps),
        label: rootStructLabel ?? undefined,
        help: (structOptions as { help?: React.ReactNode }).help,
        error: (structOptions as { error?: React.ReactNode }).error,
        hasError: (structOptions as { hasError?: boolean }).hasError,
        required: rootStructRequired,
        showRequiredIndicator: true,
      };
      // Filter out null children to prevent React errors
      const safeChildren = children.filter(Boolean) as React.ReactNode[];
      console.log('[FormImpl] Struct render complete:', {
        totalFields: fieldNames.length,
        totalChildren: children.length,
        renderedChildren: safeChildren.length,
        filteredOut: children.length - safeChildren.length,
        templateName:
          (RootStructTemplate as React.ComponentType)?.displayName ||
          (RootStructTemplate as React.ComponentType)?.name ||
          'unknown',
      });

      console.log('[FormImpl] About to render RootStructTemplate with children:', {
        childrenTypes: safeChildren.map(child => typeof child),
        hasValidChildren: safeChildren.every(child => child != null),
      });

      return <RootStructTemplate {...structTemplateProps}>{safeChildren}</RootStructTemplate>;
    }
    // Use centralized renderer for simple components
    if (canUseCentralizedRenderer(Component)) {
      return renderFieldComponent({
        Component,
        baseProps,
        resolvedOptions:
          (resolvedOptions as Record<string, unknown>) ??
          (options as Record<string, unknown>) ??
          {},
        value,
        onChange: (v: unknown) => onChange?.(v as T, undefined),
        key: 'root',
      });
    }
    if (rootTypeInfo?.kind === 'list' || Component === List.ReactComponent) {
      // Determine inner item type (support union dispatch at render time)
      const listMeta = (tType?.meta as { type?: unknown; of?: unknown } | undefined) ?? {};
      const innerType = (listMeta.type ?? listMeta.of) as TypeWithMeta | undefined;

      const items = Array.isArray(value) ? (value as unknown[]) : [];
      // Ensure listKeys length matches current items length (append as needed)
      if (this.listKeys.length < items.length) {
        const toAdd = items.length - this.listKeys.length;
        for (let i = 0; i < toAdd; i++) {
          this.listKeys.push(String(this.uidGen.next()));
        }
      } else if (this.listKeys.length > items.length) {
        this.listKeys.splice(items.length);
      }

      const handleAdd = () => {
        const next = items.slice();
        // Push a neutral placeholder; consumers can provide defaults via templates/options
        next.push(null as unknown as unknown);
        (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(next, []);
        // add corresponding stable key
        this.listKeys.push(String(this.uidGen.next()));
      };

      const handleRemove = (index: number) => {
        const next = items.slice();
        next.splice(index, 1);
        (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(next, []);
        // remove key at same index
        this.listKeys.splice(index, 1);
      };

      const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        const next = items.slice();
        const tmp = next[index - 1];
        next[index - 1] = next[index];
        next[index] = tmp;
        (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(next, []);
        // swap keys accordingly
        const ktmp = this.listKeys[index - 1];
        this.listKeys[index - 1] = this.listKeys[index];
        this.listKeys[index] = ktmp;
      };

      const handleMoveDown = (index: number) => {
        if (index >= items.length - 1) return;
        const next = items.slice();
        const tmp = next[index + 1];
        next[index + 1] = next[index];
        next[index] = tmp;
        (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(next, []);
        // swap keys accordingly
        const ktmp = this.listKeys[index + 1];
        this.listKeys[index + 1] = this.listKeys[index];
        this.listKeys[index] = ktmp;
      };

      const renderItem = (
        item: unknown,
        index: number,
        pathPrefix: Array<string | number> = [],
      ) => {
        // If innerType has a dispatch (union), use it to pick concrete type
        const dispatched =
          (
            innerType as unknown as { dispatch?: (v: unknown) => TypeWithMeta | undefined }
          )?.dispatch?.(item) ||
          innerType ||
          null;
        const ItemComponent = getComponent(dispatched, options);

        const handleItemChange = (nextValue: unknown) => {
          const next = items.slice();
          next[index] = nextValue;
          (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(next, [
            index,
          ]);
        };

        if (!ItemComponent) return null;

        const itemResolvedOptions = getComponentOptions(options as unknown, item, dispatched);
        const thisItemPath = [...pathPrefix, index];
        const itemBaseProps = {
          ...baseProps,
          type: dispatched,
          value: item,
          onChange: handleItemChange as (v: T) => void,
          options: (itemResolvedOptions ?? options) as Record<string, unknown>,
          ref: (r: FormInputComponent<unknown> | null) => this.registerRef(thisItemPath, r),
        } as const;

        // Use centralized renderer for simple components
        if (canUseCentralizedRenderer(ItemComponent)) {
          return renderFieldComponent({
            Component: ItemComponent,
            baseProps: itemBaseProps,
            resolvedOptions: (itemResolvedOptions as Record<string, unknown>) || {},
            value: item,
            onChange: handleItemChange,
            key: this.listKeys[index],
          });
        }
        if (ItemComponent === List.ReactComponent) {
          // Nested lists: render recursively using the same mechanism
          const ListComp3 = List.ReactComponent as React.ComponentType<ListTemplateProps<unknown>>;
          return (
            <ListComp3
              key={this.listKeys[index]}
              {...(itemBaseProps as unknown as ListTemplateProps<unknown>)}
              label={String((itemBaseProps as { label?: unknown })?.label ?? '')}
              items={(Array.isArray(item) ? (item as unknown[]) : []).map((it, i) => ({
                key: String(i),
                input: null,
                buttons: [
                  {
                    type: 'remove',
                    label: (options?.i18n as I18n | undefined)?.remove ?? 'Remove',
                    click: () => handleRemove(i),
                  },
                ],
              }))}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              renderItem={(it, idx) => renderItem(it, idx, thisItemPath)}
            />
          );
        }

        return React.createElement(ItemComponent as React.ComponentType<AnyTemplateProps<T>>, {
          key: this.listKeys[index],
          ...(itemBaseProps as unknown as AnyTemplateProps<T>),
        });
      };

      const { onChange: _omitOnChange, ...restBase } = baseProps as Record<string, unknown> & {
        onChange?: unknown;
      };
      void _omitOnChange;

      const ListComp4 = List.ReactComponent as React.ComponentType<ListTemplateProps<unknown>>;
      return (
        <ListComp4
          {...(restBase as unknown as ListTemplateProps<unknown>)}
          label={String((restBase as { label?: unknown })?.label ?? '')}
          items={items.map((it, i) => ({
            key: String(i),
            input: null,
            buttons: [
              {
                type: 'remove',
                label: (options?.i18n as I18n | undefined)?.remove ?? 'Remove',
                click: () => handleRemove(i),
              },
            ],
          }))}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          renderItem={renderItem}
        />
      );
    }
    if (Component === Struct) {
      return <Struct {...(baseProps as unknown as StructTemplateProps)}>{null}</Struct>;
    }

    return React.createElement(Component as React.ComponentType<AnyTemplateProps<T>>, {
      ...(baseProps as unknown as AnyTemplateProps<T>),
    });
  }
}

// Re-export MinimalFormRef type from central types for external consumers
export type { MinimalFormRef };

// ForwardRef wrapper to expose a relaxed ref shape `{ getValue(): T }`
const Form = forwardRef(<T,>(props: FormProps<T>, ref: React.Ref<MinimalFormRef<T>>) => {
  const innerRef = useRef<FormImpl<T>>(null);
  useImperativeHandle(
    ref,
    () => ({
      getValue() {
        return innerRef.current?.getValue() ?? null;
      },
      validate() {
        if (innerRef.current) return innerRef.current.validate();
        // fallback validation without mutating state when ref not ready
        const { type, value } = props;
        const tType = isTypeWithMeta(type) ? type : (null as unknown as TypeWithMeta);
        return validate(value as unknown, tType, {});
      },
      pureValidate() {
        if (innerRef.current) return innerRef.current.pureValidate();
        const { type, value } = props;
        const tType = isTypeWithMeta(type) ? type : (null as unknown as TypeWithMeta);
        return validate(value as unknown, tType, {});
      },
      // Minimal legacy helper: returns the root component when path is omitted or empty
      getComponent(path?: Array<string | number>) {
        return innerRef.current?.getComponentAtPath(path);
      },
      getUIDGenerator() {
        return innerRef.current?.getUIDGenerator();
      },
    }),
    [innerRef, props],
  );
  return <FormImpl ref={innerRef} {...props} />;
});

Form.displayName = 'Form';

export default Form;
