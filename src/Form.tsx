import React, { Component, forwardRef, useImperativeHandle, useRef } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { validate } from 'tcomb-validation';

import List from './components/List';
import Struct from './components/Struct';
import Checkbox from './fields/Checkbox';
import DatePicker from './fields/DatePicker';
import Select from './fields/Select';
import Textbox from './fields/Textbox';

import {
  TextboxTemplateProps,
  CheckboxTemplateProps,
  SelectTemplateProps,
  DatePickerTemplateProps,
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
  if (!type) return Textbox.ReactComponent as FieldComponentType<T>;

  const typeInfo = getTypeInfo(type);

  // For unions, default to the first variant; runtime dispatch still works via `dispatch`.
  if ((typeInfo as unknown as { isUnion?: boolean }).isUnion) {
    const variants = ((type.meta as unknown as { types?: TypeWithMeta[] })?.types || []) as
      | TypeWithMeta[]
      | undefined;
    const first = variants && variants.length > 0 ? variants[0] : null;
    return defaultGetComponent(first as TypeWithMeta | null, options);
  }

  if (typeInfo.isEnum) return Select.ReactComponent as FieldComponentType<T>;
  if (typeInfo.isMaybe || typeInfo.isSubtype) {
    if (typeInfo.type === type) return Textbox.ReactComponent as FieldComponentType<T>;
    return defaultGetComponent(typeInfo.type, options);
  }
  switch (typeInfo.kind) {
    case 'struct':
      return Struct as unknown as FieldComponentType<T>;
    case 'list':
      return List.ReactComponent as FieldComponentType<T>;
    case 'irreducible':
      switch (typeInfo.type.name) {
        case 'Boolean':
          return Checkbox.ReactComponent as FieldComponentType<T>;
        case 'Date':
          return DatePicker.ReactComponent as FieldComponentType<T>;
        case 'Number':
        case 'String':
        default:
          return Textbox.ReactComponent as FieldComponentType<T>;
      }
    default:
      return Textbox.ReactComponent as FieldComponentType<T>;
  }
};

// Heuristic: some legacy apps keep date fields as String but expect a DatePicker UI.
// We detect likely date/time fields and coerce the component to DatePicker.
function shouldCoerceToDatePicker(args: {
  dispatchedType: TypeWithMeta | null | undefined;
  fieldName: string | number;
  resolvedOptions?: unknown;
  value?: unknown;
}): boolean {
  const { dispatchedType, fieldName, resolvedOptions, value } = args;
  try {
    const ti = dispatchedType ? getTypeInfo(dispatchedType) : null;
    const isStringType = ti?.kind === 'irreducible' && ti?.type?.name === 'String';
    const isIrreducibleType = ti?.kind === 'irreducible';
    const isMaybeType = ti?.isMaybe === true;

    // Check if options indicate this should be a date picker
    const opts = (resolvedOptions as { mode?: string; template?: unknown } | undefined) || {};
    const looksLikeDateByOptions =
      opts && typeof opts.mode === 'string' && ['date', 'time', 'datetime'].includes(opts.mode);

    // Check if field name suggests it's a date field
    const name = String(fieldName).toLowerCase();
    const looksLikeDateByName = /(date|datum|dob|birth|zeit|time|from|start|until|end)$/i.test(
      name,
    );

    // Check if value looks like a date
    const looksLikeDateByValue =
      value instanceof Date ||
      (typeof value === 'string' && !Number.isNaN(Date.parse(value as string)));

    // Coerce if any of these conditions are met AND the type is coercible
    const shouldCoerce = Boolean(
      looksLikeDateByName || looksLikeDateByOptions || looksLikeDateByValue,
    );
    const isCoercibleType = isStringType || isIrreducibleType || isMaybeType;
    const decision = shouldCoerce && isCoercibleType;

    return decision;
  } catch (_) {
    return false;
  }
}

class FormImpl<T> extends Component<FormProps<T>, FormState> {
  static defaultProps: Partial<FormProps> = {
    value: undefined,
    options: {},
    context: {},
    stylesheet: {},
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
    super(props);
    // Initialize per-instance seed for stable UID generation
    this.__instanceSeed = this.getSeed();
    this.uidGen = new UIDGenerator(this.__instanceSeed);
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
    // Allow overriding UID generator via props/options
    const providedGen = (options as { uidGenerator?: UIDGenerator } | undefined)?.uidGenerator;
    if (providedGen && this.uidGen !== providedGen) {
      this.uidGen = providedGen;
    }
    const tType = isTypeWithMeta(type) ? type : null;
    const Component = getComponent(tType, options);

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
    if (rootTypeInfo?.kind === 'struct') {
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
        const rawChildType = structMeta?.[fieldName] as TypeWithMeta | undefined;
        const dispatchedChildType =
          (
            rawChildType as unknown as { dispatch?: (v: unknown) => TypeWithMeta | undefined }
          )?.dispatch?.(structValue[fieldName]) ||
          rawChildType ||
          null;

        let ChildComponent = getComponent(dispatchedChildType, options);
        if (!ChildComponent) return null;

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

        // Apply legacy coercion after options are resolved
        if (
          ChildComponent === Textbox.ReactComponent &&
          shouldCoerceToDatePicker({
            dispatchedType: dispatchedChildType,
            fieldName,
            resolvedOptions: childResolvedOptions,
            value: structValue[fieldName],
          })
        ) {
          ChildComponent = DatePicker.ReactComponent as unknown as FieldComponentType<T>;
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

        if (ChildComponent === Textbox.ReactComponent) {
          return (
            <Textbox.ReactComponent
              key={fieldName}
              {...(childBaseProps as unknown as TextboxTemplateProps)}
              onChangeText={(text: string) => handleFieldChange(text)}
            />
          );
        }
        if (ChildComponent === Checkbox.ReactComponent) {
          return (
            <Checkbox.ReactComponent
              key={fieldName}
              {...(childBaseProps as unknown as CheckboxTemplateProps)}
              value={!!structValue[fieldName]}
              onChange={(v: boolean) => handleFieldChange(v)}
            />
          );
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
              InnerComponent = DatePicker.ReactComponent as unknown as FieldComponentType<T>;
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

            if (InnerComponent === Textbox.ReactComponent) {
              return (
                <Textbox.ReactComponent
                  key={innerName}
                  {...(innerBaseProps as unknown as TextboxTemplateProps)}
                  onChangeText={(text: string) => handleInnerChange(text)}
                />
              );
            }
            if (InnerComponent === Checkbox.ReactComponent) {
              return (
                <Checkbox.ReactComponent
                  key={innerName}
                  {...(innerBaseProps as unknown as CheckboxTemplateProps)}
                  value={!!innerValue[innerName]}
                  onChange={(v: boolean) => handleInnerChange(v)}
                />
              );
            }
            if (InnerComponent === Select.ReactComponent) {
              const ti = dispatchedInnerType ? getTypeInfo(dispatchedInnerType) : null;
              let enumOptions: { value: string; text: string }[] = [];
              if (ti?.isEnum && dispatchedInnerType) {
                const meta = (dispatchedInnerType as TypeWithMeta).meta as {
                  map?: Record<string, unknown>;
                };
                const map = meta?.map;
                if (map) {
                  enumOptions = Object.keys(map).map(value => ({
                    value,
                    text: String(map[value]),
                  }));
                }
              }
              return (
                <Select.ReactComponent
                  key={innerName}
                  {...(innerBaseProps as unknown as SelectTemplateProps<unknown>)}
                  options={enumOptions}
                  mode={
                    (innerResolvedOptions as { mode?: 'dialog' | 'dropdown' } | undefined)?.mode
                  }
                  prompt={(innerResolvedOptions as { prompt?: string } | undefined)?.prompt}
                  itemStyle={
                    (innerResolvedOptions as { itemStyle?: StyleProp<TextStyle> } | undefined)
                      ?.itemStyle
                  }
                  isCollapsed={
                    (innerResolvedOptions as { isCollapsed?: boolean } | undefined)?.isCollapsed
                  }
                  onCollapseChange={
                    (
                      innerResolvedOptions as
                        | { onCollapseChange?: (collapsed: boolean) => void }
                        | undefined
                    )?.onCollapseChange
                  }
                  value={
                    (innerValue[innerName] !== undefined
                      ? String(innerValue[innerName] as unknown)
                      : null) as unknown
                  }
                  onChange={(nv: unknown) => handleInnerChange(nv)}
                />
              );
            }
            if (InnerComponent === DatePicker.ReactComponent) {
              return (
                <DatePicker.ReactComponent
                  key={innerName}
                  {...(innerBaseProps as unknown as DatePickerTemplateProps)}
                  mode={
                    (innerResolvedOptions as { mode?: 'date' | 'time' | 'datetime' } | undefined)
                      ?.mode
                  }
                  minimumDate={
                    (innerResolvedOptions as { minimumDate?: Date } | undefined)?.minimumDate
                  }
                  maximumDate={
                    (innerResolvedOptions as { maximumDate?: Date } | undefined)?.maximumDate
                  }
                  minuteInterval={
                    (innerResolvedOptions as { minuteInterval?: number } | undefined)
                      ?.minuteInterval
                  }
                  timeZoneOffsetInMinutes={
                    (innerResolvedOptions as { timeZoneOffsetInMinutes?: number } | undefined)
                      ?.timeZoneOffsetInMinutes
                  }
                  onPress={(innerResolvedOptions as { onPress?: () => void } | undefined)?.onPress}
                  value={(innerValue[innerName] as unknown as Date) ?? null}
                  onChange={(d: Date | null) => handleInnerChange(d)}
                />
              );
            }
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
                    ItemComponent = DatePicker.ReactComponent as unknown as FieldComponentType<T>;
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

                  if (ItemComponent === Textbox.ReactComponent) {
                    return (
                      <Textbox.ReactComponent
                        key={keys[idx] ?? String(idx)}
                        {...(itemBaseProps as unknown as TextboxTemplateProps)}
                        onChangeText={(text: string) => handleItemChange(text)}
                      />
                    );
                  }
                  if (ItemComponent === Checkbox.ReactComponent) {
                    return (
                      <Checkbox.ReactComponent
                        key={keys[idx] ?? String(idx)}
                        {...(itemBaseProps as unknown as CheckboxTemplateProps)}
                        value={!!it}
                        onChange={(v: boolean) => handleItemChange(v)}
                      />
                    );
                  }
                  if (ItemComponent === Select.ReactComponent) {
                    const ti2 = dispatched ? getTypeInfo(dispatched) : null;
                    let enumOptions: { value: string; text: string }[] = [];
                    if (ti2?.isEnum && dispatched) {
                      const meta = (dispatched as TypeWithMeta).meta as {
                        map?: Record<string, unknown>;
                      };
                      const map = meta?.map;
                      if (map) {
                        enumOptions = Object.keys(map).map(k => ({
                          value: k,
                          text: String(map[k]),
                        }));
                      }
                    }
                    return (
                      <Select.ReactComponent
                        key={keys[idx] ?? String(idx)}
                        {...(itemBaseProps as unknown as SelectTemplateProps<unknown>)}
                        options={enumOptions}
                        value={(it !== undefined ? String(it as unknown) : null) as unknown}
                        onChange={(nv: unknown) => handleItemChange(nv)}
                      />
                    );
                  }
                  if (ItemComponent === DatePicker.ReactComponent) {
                    return (
                      <DatePicker.ReactComponent
                        key={keys[idx] ?? String(idx)}
                        {...(itemBaseProps as unknown as DatePickerTemplateProps)}
                        value={(it as Date) ?? null}
                        onChange={(d: Date | null) => handleItemChange(d)}
                      />
                    );
                  }

                  return (
                    <ItemComponent
                      key={keys[idx] ?? String(idx)}
                      {...(itemBaseProps as unknown as AnyTemplateProps<T>)}
                    />
                  );
                },
              } as ListTemplateProps<unknown>;

              return <List.ReactComponent key={innerName} {...listProps} />;
            }

            return (
              <InnerComponent
                key={innerName}
                {...(innerBaseProps as unknown as AnyTemplateProps<T>)}
              />
            );
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
        if (ChildComponent === Select.ReactComponent) {
          const ti = dispatchedChildType ? getTypeInfo(dispatchedChildType) : null;
          let enumOptions: { value: string; text: string }[] = [];
          if (ti?.isEnum && dispatchedChildType) {
            const meta = (dispatchedChildType as TypeWithMeta).meta as {
              map?: Record<string, unknown>;
            };
            const map = meta?.map;
            if (map) {
              enumOptions = Object.keys(map).map(value => ({ value, text: String(map[value]) }));
            }
          }
          return (
            <Select.ReactComponent
              key={fieldName}
              {...(childBaseProps as unknown as SelectTemplateProps<unknown>)}
              options={enumOptions}
              mode={(perFieldResolved as { mode?: 'dialog' | 'dropdown' } | undefined)?.mode}
              prompt={(perFieldResolved as { prompt?: string } | undefined)?.prompt}
              itemStyle={
                (perFieldResolved as { itemStyle?: StyleProp<TextStyle> } | undefined)?.itemStyle
              }
              isCollapsed={(perFieldResolved as { isCollapsed?: boolean } | undefined)?.isCollapsed}
              onCollapseChange={
                (
                  perFieldResolved as
                    | { onCollapseChange?: (collapsed: boolean) => void }
                    | undefined
                )?.onCollapseChange
              }
              value={
                (structValue[fieldName] !== undefined
                  ? String(structValue[fieldName] as unknown)
                  : null) as unknown
              }
              onChange={(nv: unknown) => handleFieldChange(nv)}
            />
          );
        }
        if (ChildComponent === DatePicker.ReactComponent) {
          return (
            <DatePicker.ReactComponent
              key={fieldName}
              {...(childBaseProps as unknown as DatePickerTemplateProps)}
              mode={(perFieldResolved as { mode?: 'date' | 'time' | 'datetime' } | undefined)?.mode}
              minimumDate={(perFieldResolved as { minimumDate?: Date } | undefined)?.minimumDate}
              maximumDate={(perFieldResolved as { maximumDate?: Date } | undefined)?.maximumDate}
              minuteInterval={
                (perFieldResolved as { minuteInterval?: number } | undefined)?.minuteInterval
              }
              timeZoneOffsetInMinutes={
                (perFieldResolved as { timeZoneOffsetInMinutes?: number } | undefined)
                  ?.timeZoneOffsetInMinutes
              }
              onPress={(perFieldResolved as { onPress?: () => void } | undefined)?.onPress}
              value={(structValue[fieldName] as unknown as Date) ?? null}
              onChange={(d: Date | null) => handleFieldChange(d)}
            />
          );
        }
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
          return <List.ReactComponent key={fieldName} {...listBaseProps} />;
        }

        return (
          <ChildComponent key={fieldName} {...(childBaseProps as unknown as AnyTemplateProps<T>)} />
        );
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
      // Ensure we never pass null entries to React children
      const safeChildren = (Array.isArray(children) ? children : []).filter(
        Boolean,
      ) as React.ReactNode[];
      return <RootStructTemplate {...structTemplateProps}>{safeChildren}</RootStructTemplate>;
    }
    if (Component === Textbox.ReactComponent) {
      return (
        <Textbox.ReactComponent
          {...(baseProps as unknown as TextboxTemplateProps)}
          onChangeText={(text: string) => onChange?.(text as unknown as T, undefined)}
        />
      );
    }
    if (Component === Checkbox.ReactComponent) {
      return (
        <Checkbox.ReactComponent
          {...(baseProps as unknown as CheckboxTemplateProps)}
          value={!!value}
          onChange={(v: boolean) =>
            (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(
              v as unknown as T,
              undefined,
            )
          }
        />
      );
    }
    if (Component === Select.ReactComponent) {
      // Get options from enum type if it's an enum
      const typeInfo = tType ? getTypeInfo(tType) : null;
      let enumOptions: { value: string; text: string }[] = [];
      if (typeInfo?.isEnum && tType) {
        const meta = (tType as TypeWithMeta).meta as { map?: Record<string, unknown> } | undefined;
        const map = meta?.map;
        if (map) {
          enumOptions = Object.keys(map).map(value => ({ value, text: String(map[value]) }));
        }
      }

      return (
        <Select.ReactComponent
          {...(baseProps as unknown as SelectTemplateProps<unknown>)}
          options={enumOptions}
          value={(value !== undefined ? String(value as unknown) : null) as unknown}
          onChange={(nv: unknown) =>
            (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(
              nv as unknown as T,
              undefined,
            )
          }
        />
      );
    }
    if (Component === DatePicker.ReactComponent) {
      return (
        <DatePicker.ReactComponent
          {...(baseProps as unknown as DatePickerTemplateProps)}
          value={(value as Date) ?? null}
          onChange={(d: Date | null) =>
            (onChange as ((v: unknown, path?: Array<string | number>) => void) | undefined)?.(
              d as unknown as T,
              undefined,
            )
          }
        />
      );
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

        if (ItemComponent === Textbox.ReactComponent) {
          return (
            <Textbox.ReactComponent
              key={this.listKeys[index]}
              {...(itemBaseProps as unknown as TextboxTemplateProps)}
              onChangeText={(text: string) => handleItemChange(text)}
            />
          );
        }
        if (ItemComponent === Checkbox.ReactComponent) {
          return (
            <Checkbox.ReactComponent
              key={this.listKeys[index]}
              {...(itemBaseProps as unknown as CheckboxTemplateProps)}
              value={!!item}
              onChange={(v: boolean) => handleItemChange(v)}
            />
          );
        }
        if (ItemComponent === Select.ReactComponent) {
          const ti = dispatched ? getTypeInfo(dispatched) : null;
          let enumOptions: { value: string; text: string }[] = [];
          if (ti?.isEnum && dispatched) {
            const meta = (dispatched as TypeWithMeta).meta as { map?: Record<string, unknown> };
            const map = meta?.map;
            if (map) {
              enumOptions = Object.keys(map).map(k => ({ value: k, text: String(map[k]) }));
            }
          }
          return (
            <Select.ReactComponent
              key={this.listKeys[index]}
              {...(itemBaseProps as unknown as SelectTemplateProps<unknown>)}
              options={enumOptions}
              value={(item !== undefined ? String(item as unknown) : null) as unknown}
              onChange={(nv: unknown) => handleItemChange(nv)}
            />
          );
        }
        if (ItemComponent === DatePicker.ReactComponent) {
          return (
            <DatePicker.ReactComponent
              key={this.listKeys[index]}
              {...(itemBaseProps as unknown as DatePickerTemplateProps)}
              value={(item as Date) ?? null}
              onChange={(d: Date | null) => handleItemChange(d)}
            />
          );
        }
        if (ItemComponent === List.ReactComponent) {
          // Nested lists: render recursively using the same mechanism
          return (
            <List.ReactComponent
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

        return (
          <ItemComponent
            key={this.listKeys[index]}
            {...(itemBaseProps as unknown as AnyTemplateProps<T>)}
          />
        );
      };

      const { onChange: _omitOnChange, ...restBase } = baseProps as Record<string, unknown> & {
        onChange?: unknown;
      };
      void _omitOnChange;

      return (
        <List.ReactComponent
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

    return <Component {...(baseProps as unknown as AnyTemplateProps<T>)} />;
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
