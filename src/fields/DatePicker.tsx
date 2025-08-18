import React from 'react';
import { Platform } from 'react-native';

import DatePickerAndroid from './DatePicker.android';
import DatePickerIOS from './DatePicker.ios';
import type { DatePickerTemplateProps } from '../types/template.types';
import { applyAutoLabel, appendOptionalSuffix, resolveError } from '../utils/field';

type TypeLike = {
  meta?: { kind?: string; optional?: boolean };
};

type DatePickerProps = {
  type?: TypeLike;
  value?: Date | unknown;
  options?: {
    label?: string;
    help?: string;
    template?: unknown;
    hasError?: boolean;
    error?: string | ((value: unknown) => string);
    transformer?: {
      format: (value: unknown) => unknown;
      parse: (value: unknown) => unknown;
    };
  };
  ctx?: {
    auto: string;
    label?: string;
    i18n?: { optional?: string };
    templates?: { datepicker?: unknown };
  };
};

// optional logic provided via utils helpers

export class DatePicker {
  props: DatePickerProps;
  private _hasError = false;
  private _error: string | undefined;

  constructor(props: DatePickerProps) {
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
    }

    // Error handling
    const { error, hasError } = resolveError(this._hasError, this._error, options, value);

    return {
      type,
      options,
      value: displayValue,
      label,
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
        validatedValue = options.transformer.parse(formatted);
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
    return options.template || ctx?.templates?.datepicker;
  }

  static ReactComponent = class extends React.Component<DatePickerTemplateProps> {
    static displayName = 'DatePicker';
    render() {
      const Comp = Platform.OS === 'ios' ? DatePickerIOS : DatePickerAndroid;
      return <Comp {...(this.props as DatePickerTemplateProps)} />;
    }
  };
}

export default DatePicker;
