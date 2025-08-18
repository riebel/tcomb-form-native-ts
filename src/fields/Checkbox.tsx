import React from 'react';
import CheckboxNative from './Checkbox.native';
import type { CheckboxTemplateProps } from '../types/template.types';
import { applyAutoLabel, appendOptionalSuffix, resolveError } from '../utils/field';

type TypeLike = {
  meta?: { kind?: string; optional?: boolean };
};

type CheckboxProps = {
  type?: TypeLike;
  value?: boolean | string;
  options?: {
    label?: string | null;
    help?: string;
    template?: unknown;
    hasError?: boolean;
    error?: string | ((value: unknown) => string);
    transformer?: {
      format: (value: unknown) => string;
      parse: (value: string) => unknown;
    };
  };
  ctx?: {
    auto: string;
    label?: string;
    i18n?: { optional?: string };
    templates?: { checkbox?: unknown };
  };
};

// optional check is provided by utils

export class Checkbox {
  props: CheckboxProps;
  private _hasError = false;
  private _error: string | undefined;

  constructor(props: CheckboxProps) {
    this.props = props;
  }

  getLocals() {
    const { type, options = {}, value, ctx } = this.props;

    // Label handling
    let label: string | null | undefined = options.label ?? undefined;
    if (ctx?.auto === 'none') {
      label = null; // tests expect null
    } else {
      label = applyAutoLabel(label, ctx);
      label = appendOptionalSuffix(label, type, ctx);
    }

    // Value formatting
    let displayValue: unknown = value;
    if (options.transformer?.format && value !== undefined) {
      displayValue = options.transformer.format(value);
    } else if (displayValue === undefined) {
      displayValue = false;
    }

    // Error handling
    const { error, hasError } = resolveError(this._hasError, this._error, options, value);

    return {
      type,
      options,
      value: displayValue,
      label: label ?? null,
      help: options.help,
      error,
      hasError: Boolean(hasError),
      ctx,
    } as const;
  }

  pureValidate() {
    const { value, options = {} } = this.props;
    let validatedValue: unknown = value;
    let isValid = true;

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
    return options.template || ctx?.templates?.checkbox;
  }

  static ReactComponent = class extends React.Component<CheckboxTemplateProps> {
    static displayName = 'Checkbox';
    render() {
      return <CheckboxNative {...(this.props as CheckboxTemplateProps)} />;
    }
  };
}

export default Checkbox;
