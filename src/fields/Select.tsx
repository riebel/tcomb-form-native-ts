import React from 'react';
import { Platform } from 'react-native';

import SelectAndroid from './Select.android';
import SelectIOS from './Select.ios';

import type {
  SelectTemplateProps,
  SelectOption,
  SelectProps,
  EnumLike,
  SelectComponent,
} from '../types/field.types';
import { applyAutoLabel, appendOptionalSuffix, resolveError } from '../utils/field';

const buildOptions = <T,>(
  type: EnumLike | undefined,
  opts: SelectProps<T>['options'],
): Array<SelectOption<T> | SelectOption<null>> => {
  // Use provided options
  const provided = opts?.options as Array<SelectOption<T>> | undefined;
  let built: Array<SelectOption<T>>;
  if (provided && provided.length) {
    built = provided;
  } else {
    const kind = type?.meta?.kind;
    const map: Record<string, string> | undefined = type?.meta?.map;
    if (map && (kind === 'enums' || kind === 'enum')) {
      // Build from enums
      built = Object.keys(map).map(key => ({
        value: key as unknown as T,
        text: map[key],
      }));
    } else {
      built = [];
    }
  }

  // Apply ordering
  const order = opts?.order;
  if (order === 'asc' || order === 'desc') {
    built = [...built].sort((a, b) => {
      const at = (a?.text ?? '').toLowerCase();
      const bt = (b?.text ?? '').toLowerCase();
      if (at < bt) return order === 'asc' ? -1 : 1;
      if (at > bt) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Prepend nullOption unless false
  const nullOpt = opts?.nullOption;
  const includeNull = nullOpt !== false;
  const nullOption: SelectOption<null> =
    nullOpt !== undefined && nullOpt !== false
      ? (nullOpt as SelectOption<null>)
      : ({ text: '-', value: '' as unknown as null } as SelectOption<null>);

  return includeNull
    ? ([nullOption, ...built] as Array<SelectOption<T> | SelectOption<null>>)
    : built;
};

export class Select<T = unknown> {
  props: SelectProps<T>;
  private _hasError = false;
  private _error: React.ReactNode | undefined;

  constructor(props: SelectProps<T>) {
    this.props = props;
  }

  getLocals() {
    const { type, options = {}, value, ctx } = this.props;

    // Label
    let label: React.ReactNode | null | undefined = options.label ?? undefined;
    label = applyAutoLabel(label, ctx);
    label = appendOptionalSuffix(label, type, ctx);

    // Value formatting
    let displayValue: unknown = value;
    if (options.transformer?.format && value !== undefined) {
      displayValue = options.transformer.format(value);
    } else if (displayValue == null) {
      displayValue = '';
    }

    // Build options
    const builtOptions = buildOptions<T>(type, options);

    // Error handling (pass type for legacy getValidationErrorMessage)
    const { error, hasError } = resolveError(
      this._hasError,
      this._error,
      options,
      value,
      type as unknown as { getValidationErrorMessage?: (v: unknown) => string },
    );

    return {
      type,
      value: displayValue as unknown,
      label: label ?? undefined,
      help: options.help,
      options: builtOptions, // for test expectations
      isCollapsed: options.isCollapsed,
      onCollapseChange: options.onCollapseChange,
      error,
      hasError: Boolean(hasError),
      required: Boolean((this.props as { required?: boolean }).required),
      ctx,
    } as const;
  }

  pureValidate() {
    const {
      type,
      value,
      options = {},
      required,
    } = this.props as SelectProps<unknown> & {
      required?: boolean;
    };
    let validatedValue: unknown = value;
    let isValid = true;

    // Parse (catch errors)
    try {
      if (options.transformer?.parse && value !== undefined && value !== null) {
        const formatted = options.transformer.format
          ? options.transformer.format(value)
          : (value as unknown);
        validatedValue = options.transformer.parse(String(formatted as unknown));
      }
    } catch (e) {
      this._hasError = true;
      this._error = e instanceof Error ? e.message : 'An unknown error occurred';
      isValid = false;
    }

    // Required check
    if (isValid && required && options.nullOption !== false) {
      const isEmpty =
        validatedValue === undefined ||
        validatedValue === null ||
        (typeof validatedValue === 'string' && validatedValue === '') ||
        (Array.isArray(validatedValue) && validatedValue.length === 0);
      if (isEmpty) {
        this._hasError = true;
        // Prefer i18n.required if available in context
        const i18n = (
          this.props as { ctx?: { i18n?: { required?: string } | Record<string, string> } }
        ).ctx?.i18n;
        this._error =
          (i18n && typeof i18n === 'object' && (i18n as { required?: string }).required) ||
          'This field is required';
        isValid = false;
      }
    }

    // Enum validation
    if (
      isValid &&
      type?.meta?.map &&
      validatedValue !== undefined &&
      validatedValue !== null &&
      String(validatedValue) !== ''
    ) {
      const allowed = new Set(Object.keys(type.meta.map));
      if (!allowed.has(String(validatedValue))) {
        this._hasError = true;
        this._error = 'Invalid enum value';
        isValid = false;
      }
    }

    if (isValid) {
      this._hasError = false;
      this._error = undefined;
    }

    return {
      value: validatedValue,
      hasError: this._hasError,
      error: this._error,
    } as const;
  }

  getTemplate() {
    const { options = {}, ctx } = this.props;
    return options.template || ctx?.templates?.select;
  }

  // Platform component
  static ReactComponent = class extends React.Component<
    SelectTemplateProps<unknown> & {
      ctx?: { templates?: { select?: React.ComponentType<SelectTemplateProps<unknown>> } };
      options?: { template?: React.ComponentType<SelectTemplateProps<unknown>> };
    }
  > {
    static displayName = 'Select';
    render() {
      const override = this.props.options?.template || this.props.ctx?.templates?.select;
      const Comp = override ? override : Platform.OS === 'ios' ? SelectIOS : SelectAndroid;
      return <Comp {...this.props} />;
    }
  } as unknown as SelectComponent;
}

export default Select;
