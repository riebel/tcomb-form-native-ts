import React from 'react';
import { Platform } from 'react-native';

import DatePickerAndroid from './DatePicker.android';
import DatePickerIOS from './DatePicker.ios';
import type {
  DatePickerTemplateProps,
  DatePickerProps,
  DatePickerCtx,
  DatePickerOptions,
} from '../types/field.types';
import { applyAutoLabel, appendOptionalSuffix, resolveError } from '../utils/field';

export class DatePicker {
  props: DatePickerProps;
  private _hasError = false;
  private _error: string | undefined;

  constructor(props: DatePickerProps) {
    this.props = props;
  }

  getLocals() {
    const { type, options = {}, value, ctx } = this.props;

    // Label
    let label: string | null | undefined = options.label ?? undefined;
    if (ctx?.auto === 'none') {
      label = null;
    } else {
      label = applyAutoLabel(label, ctx);
      label = appendOptionalSuffix(label, type, ctx);
    }

    // Value formatting
    let displayValue: unknown = value;
    if (options.transformer?.format && value !== undefined) {
      displayValue = options.transformer.format(value);
    }

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
      options,
      value: displayValue,
      label,
      help: options.help,
      error,
      hasError: Boolean(hasError),
      required: Boolean((this.props as { required?: boolean }).required),
      ctx,
    } as const;
  }

  pureValidate() {
    const {
      value,
      options = {},
      required,
    } = this.props as DatePickerProps & { required?: boolean };
    let validatedValue: unknown = value;
    let isValid = true;

    // Parse (catch errors)
    try {
      if (options.transformer?.parse && value !== undefined && value !== null) {
        const formatted = options.transformer.format
          ? options.transformer.format(value)
          : (value as unknown);
        validatedValue = options.transformer.parse(formatted);
      }
    } catch (e) {
      this._hasError = true;
      this._error = e instanceof Error ? e.message : 'An unknown error occurred';
      isValid = false;
    }

    // Required check
    if (isValid && required && (validatedValue === null || validatedValue === undefined)) {
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
    const { options = {}, ctx } = this.props;
    const templates = (ctx as DatePickerCtx | undefined)?.templates as
      | {
          datepicker?: React.ComponentType<DatePickerTemplateProps>;
          datePicker?: React.ComponentType<DatePickerTemplateProps>;
        }
      | undefined;
    return options.template || templates?.datepicker || templates?.datePicker;
  }

  static ReactComponent = class extends React.Component<
    DatePickerTemplateProps & { ctx?: DatePickerCtx; options?: DatePickerOptions }
  > {
    static displayName = 'DatePicker';
    render() {
      // Prefer explicit template, then ctx, else platform default
      const templateOverride =
        this.props.options?.template ||
        (
          this.props.ctx?.templates as
            | {
                datepicker?: React.ComponentType<DatePickerTemplateProps>;
                datePicker?: React.ComponentType<DatePickerTemplateProps>;
              }
            | undefined
        )?.datepicker ||
        (
          this.props.ctx?.templates as
            | {
                datepicker?: React.ComponentType<DatePickerTemplateProps>;
                datePicker?: React.ComponentType<DatePickerTemplateProps>;
              }
            | undefined
        )?.datePicker;
      const Comp = templateOverride
        ? templateOverride
        : Platform.OS === 'ios'
          ? DatePickerIOS
          : DatePickerAndroid;
      return <Comp {...this.props} />;
    }
  };
}

export default DatePicker;
