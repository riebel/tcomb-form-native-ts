import React from 'react';
import CheckboxNative from './Checkbox.native';
import { applyAutoLabel, appendOptionalSuffix, resolveError } from '../utils/field';
import { CheckboxTemplateProps } from '../types/template.types';

// Interne Typen für alte API
type TypeLike = { meta?: { kind?: string; optional?: boolean } };
type CtxLike = {
  auto: string;
  label?: string;
  i18n?: { optional?: string };
  templates?: { checkbox?: unknown };
};
type TransformerLike = { format: (value: unknown) => string; parse: (value: string) => unknown };

type OptionsLike = {
  label?: string;
  help?: string;
  error?: string | ((value: unknown) => string);
  hasError?: boolean;
  transformer?: TransformerLike;
  template?: unknown;
};

type CheckboxInternalProps = CheckboxTemplateProps & {
  type?: TypeLike;
  ctx?: CtxLike;
  transformer?: TransformerLike;
  options?: OptionsLike;
};

export class Checkbox {
  props: CheckboxInternalProps;
  private _hasError = false;
  private _error: string | undefined;

  constructor(props: CheckboxInternalProps) {
    this.props = props;
  }

  getLocals() {
    const { value, required, type, ctx } = this.props;
    const options = this.props.options || {};
    const transformer = this.props.transformer || options.transformer;

    // Label handling
    let finalLabel: string | null | undefined = options.label ?? this.props.label ?? undefined;
    if (ctx?.auto === 'none') {
      finalLabel = null;
    } else {
      finalLabel = applyAutoLabel(finalLabel, ctx);
      finalLabel = appendOptionalSuffix(finalLabel, type, ctx);
    }

    // Value formatting
    let displayValue: boolean | string | number = value ?? false;
    if (transformer?.format) {
      displayValue = transformer.format(value);
    }

    // Error handling
    let { error, hasError } = resolveError(this._hasError, this._error, this.props, value);
    // Legacy options.error + options.hasError take precedence if provided
    if (options.hasError) {
      hasError = true;
      error = typeof options.error === 'function' ? options.error(value) : options.error;
    }

    return {
      value: displayValue,
      label: finalLabel ?? null,
      help: options.help ?? this.props.help,
      error,
      hasError: Boolean(hasError),
      required,
    } as const;
  }

  pureValidate() {
    const { value, required } = this.props;
    const transformer = this.props.transformer || this.props.options?.transformer;
    let validatedValue: boolean = Boolean(value);
    let isValid = true;

    try {
      if (transformer?.parse && value !== undefined && value !== null) {
        const formatted = transformer.format ? transformer.format(value) : value;
        const parsed = transformer.parse(String(formatted));
        validatedValue = Boolean(parsed); // <-- explicit conversion to boolean
      }

      if (required && !validatedValue) {
        throw new Error('This field is required');
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
    return this.props.options?.template || this.props.ctx?.templates?.checkbox;
  }

  static ReactComponent = class extends React.Component<CheckboxTemplateProps> {
    static displayName = 'Checkbox';
    render() {
      return <CheckboxNative {...this.props} />;
    }
  };
}

export default Checkbox;
