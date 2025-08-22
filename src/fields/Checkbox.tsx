import React from 'react';
import CheckboxNative from './Checkbox.native';
import { applyAutoLabel, appendOptionalSuffix, resolveError } from '../utils/field';
import type { CheckboxTemplateProps, CheckboxInternalProps } from '../types/field.types';

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

    // Label
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

    // Error handling (pass type for legacy getValidationErrorMessage)
    let { error, hasError } = resolveError(
      this._hasError,
      this._error,
      this.props,
      value,
      type as unknown as { getValidationErrorMessage?: (v: unknown) => string },
    );
    // options.error + options.hasError take precedence if provided
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

    // Parse/transform (catch parse errors)
    try {
      if (transformer?.parse && value !== undefined && value !== null) {
        const formatted = transformer.format ? transformer.format(value) : value;
        const parsed = transformer.parse(String(formatted));
        validatedValue = Boolean(parsed); // explicit conversion to boolean
      }
    } catch (e) {
      this._hasError = true;
      this._error = e instanceof Error ? e.message : 'An unknown error occurred';
      isValid = false;
    }

    // Required validation
    if (isValid && required && !validatedValue) {
      this._hasError = true;
      const i18n = (
        this.props as { ctx?: { i18n?: { required?: string } | Record<string, string> } }
      ).ctx?.i18n;
      this._error =
        (i18n && typeof i18n === 'object' && (i18n as { required?: string }).required) ||
        'This field is required';
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

  static ReactComponent = class extends React.Component<
    CheckboxTemplateProps & {
      ctx?: { templates?: { checkbox?: React.ComponentType<CheckboxTemplateProps> } };
      options?: { template?: React.ComponentType<CheckboxTemplateProps> };
    }
  > {
    static displayName = 'Checkbox';
    render() {
      const Template = this.props.options?.template || this.props.ctx?.templates?.checkbox;
      if (Template) return <Template {...this.props} />;
      return <CheckboxNative {...this.props} />;
    }
  };
}

export default Checkbox;
