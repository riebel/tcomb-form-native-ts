import React from 'react';
import { Platform } from 'react-native';

import SelectAndroid from './Select.android';
import SelectIOS from './Select.ios';

import type { SelectTemplateProps, SelectOption } from '../types/template.types';
import { applyAutoLabel, appendOptionalSuffix, resolveError } from '../utils/field';

type EnumLike = {
  meta?: {
    kind?: string;
    map?: Record<string, string>;
    optional?: boolean;
  };
};

// Public generic component type to preserve TValue for consumers
type SelectComponent = {
  <T>(props: SelectTemplateProps<T>): React.ReactElement | null;
  displayName?: string;
};

type SelectProps<T> = {
  type?: EnumLike;
  options?: {
    label?: string;
    help?: string;
    template?: unknown;
    hasError?: boolean;
    error?: string | ((value: unknown) => string);
    transformer?: {
      format: (value: unknown) => string;
      parse: (value: string) => unknown;
    };
    options?: Array<SelectOption<T>>;
    nullOption?: SelectOption<null> | false;
    order?: 'asc' | 'desc';
    isCollapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
  };
  ctx?: {
    auto: string;
    label?: string;
    i18n?: { optional?: string; required?: string };
    templates?: { select?: unknown };
  };
  value?: T | null | string;
};

const buildOptions = <T,>(
  type: EnumLike | undefined,
  opts: SelectProps<T>['options'],
): Array<SelectOption<T> | SelectOption<null>> => {
  // Use provided options first
  const provided = opts?.options as Array<SelectOption<T>> | undefined;
  let built: Array<SelectOption<T>>;
  if (provided && provided.length) {
    built = provided;
  } else {
    const kind = type?.meta?.kind;
    const map: Record<string, string> | undefined = type?.meta?.map;
    if (map && (kind === 'enums' || kind === 'enum')) {
      // Build from tcomb enums in declaration order
      built = Object.keys(map).map(key => ({
        value: key as unknown as T,
        text: map[key],
      }));
    } else {
      built = [];
    }
  }

  // Apply ordering if requested
  const order = opts?.order;
  if (order === 'asc' || order === 'desc') {
    built = [...built].sort((a, b) => {
      const at = a.text.toLowerCase();
      const bt = b.text.toLowerCase();
      if (at < bt) return order === 'asc' ? -1 : 1;
      if (at > bt) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Prepend nullOption unless explicitly false
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

// optional logic provided via utils helpers

export class Select<T = unknown> {
  props: SelectProps<T>;
  private _hasError = false;
  private _error: string | undefined;

  constructor(props: SelectProps<T>) {
    this.props = props;
  }

  getLocals() {
    const { type, options = {}, value, ctx } = this.props;

    // Label handling
    let label: string | null | undefined = options.label ?? undefined;
    label = applyAutoLabel(label, ctx);
    label = appendOptionalSuffix(label, type, ctx);

    // Value formatting
    let displayValue: unknown = value;
    if (options.transformer?.format && value !== undefined) {
      displayValue = options.transformer.format(value);
    } else if (displayValue == null) {
      displayValue = '';
    }

    // Build options list
    const builtOptions = buildOptions<T>(type, options);

    // Error handling
    const { error, hasError } = resolveError(this._hasError, this._error, options, value);

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
      ctx,
    } as const;
  }

  pureValidate() {
    const { type, value, options = {} } = this.props;
    let validatedValue: unknown = value;
    let isValid = true;

    try {
      if (options.transformer?.parse && value !== undefined && value !== null) {
        const formatted = options.transformer.format
          ? options.transformer.format(value)
          : (value as unknown);
        validatedValue = options.transformer.parse(String(formatted as unknown));
      }

      // Basic enum validation: if enum provided and non-empty value, ensure it's one of the allowed values
      if (
        type?.meta?.map &&
        validatedValue !== undefined &&
        validatedValue !== null &&
        String(validatedValue) !== ''
      ) {
        const allowed = new Set(Object.keys(type.meta.map));
        if (!allowed.has(String(validatedValue))) {
          throw new Error('Invalid enum value');
        }
      }
    } catch (e) {
      this._hasError = true;
      this._error = e instanceof Error ? e.message : 'An unknown error occurred';
      isValid = false;
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

  // Platform React component for rendering (cast to a generic callable component type)
  static ReactComponent = class extends React.Component<SelectTemplateProps<unknown>> {
    static displayName = 'Select';
    render() {
      const Comp = Platform.OS === 'ios' ? SelectIOS : SelectAndroid;
      return <Comp {...(this.props as SelectTemplateProps<unknown>)} />;
    }
  } as unknown as SelectComponent;
}

export default Select;
