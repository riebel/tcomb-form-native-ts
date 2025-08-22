import React, { ComponentType } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import type { TextboxTemplateProps, LegacyNumberTransformer } from '../types/field.types';

let getStaticNumberTransformer: () => LegacyNumberTransformer = () => undefined;

const getLocals = (props: TextboxTemplateProps) => {
  const { type, options = {}, value, error, hasError, stylesheet = {}, ctx, ...rest } = props;

  let label = options?.label;
  if (!label && ctx?.auto === 'labels' && ctx?.label) label = ctx.label;

  let placeholder = options?.placeholder;
  if (!placeholder && ctx?.auto === 'placeholders' && ctx?.label) placeholder = ctx.label;

  const isOptional = type?.meta?.optional || type?.meta?.kind === 'maybe';
  if (isOptional) {
    if (label && ctx?.i18n?.optional) label += ctx.i18n.optional;
    if (placeholder && ctx?.i18n?.optional) placeholder += ctx.i18n.optional;
  }

  // Value transform (fallback to static numberTransformer)
  let displayValue = value;
  const legacyTransformer = getStaticNumberTransformer();
  const transformer = options?.transformer || legacyTransformer;
  if (transformer?.format && value !== null && value !== undefined) {
    displayValue = transformer.format(value as unknown as string | number);
  } else if (value === null || value === undefined) {
    displayValue = '';
  } else if (typeof value === 'number') {
    displayValue = String(value);
  }

  return {
    type,
    options,
    value: displayValue,
    error,
    hasError: Boolean(hasError),
    help: options.help,
    label,
    placeholder,
    editable: options.editable,
    stylesheet,
    required: Boolean((props as { required?: boolean }).required),
    ctx,
    ...rest,
  };
};

export class Textbox {
  props: TextboxTemplateProps & {
    ctx?: { templates?: { textbox?: ComponentType<TextboxTemplateProps> } };
  };
  private _hasError: boolean = false;
  private _error: string | undefined;

  // Legacy static numberTransformer
  static numberTransformer?: {
    format: (value: string | number) => string | null;
    parse: (value: string) => number | null | undefined;
  };

  constructor(props: TextboxTemplateProps) {
    this.props = props;
  }

  getLocals() {
    const { options = {}, error, hasError, value } = this.props;
    const locals = getLocals(this.props);

    // Error state
    if (options.error) {
      locals.error = typeof options.error === 'function' ? options.error(value) : options.error;
      locals.hasError = true;
    } else {
      locals.error = this._error;
      locals.hasError = this._hasError;
    }

    // Override via props
    if (error !== undefined) locals.error = error;
    if (hasError !== undefined) {
      locals.hasError = hasError;
    } else if (options.hasError !== undefined && options.hasError !== null) {
      locals.hasError = Boolean(options.hasError);
    }

    return locals;
  }

  pureValidate() {
    const { type, value, options = {} } = this.props;
    let validatedValue = value;
    let isValid = true;

    // Parse (catch transformer errors)
    try {
      const legacyTransformer = (this.constructor as typeof Textbox).numberTransformer;
      const transformer = options.transformer || legacyTransformer;
      if (transformer?.parse) {
        if (value === undefined || value === null) {
          validatedValue = value;
        } else if (Array.isArray(value)) {
          validatedValue = transformer.parse(value.join(' ')) as unknown as
            | string
            | number
            | null
            | undefined;
        } else {
          validatedValue = transformer.parse(String(value)) as unknown as
            | string
            | number
            | null
            | undefined;
        }
      }
    } catch (e) {
      this._hasError = true;
      this._error = e instanceof Error ? e.message : 'An unknown error occurred';
      isValid = false;
    }

    // Required check
    if (isValid && this.props.required) {
      const isEmpty =
        validatedValue === undefined ||
        validatedValue === null ||
        (typeof validatedValue === 'string' && validatedValue === '');
      if (isEmpty) {
        this._hasError = true;
        const i18n = (
          this.props as { ctx?: { i18n?: { required?: string } | Record<string, string> } }
        ).ctx?.i18n;
        this._error =
          (i18n && typeof i18n === 'object' && (i18n as { required?: string }).required) ||
          'This field is required';
        isValid = false;
      }
    }

    // Type validation (catch errors)
    if (
      isValid &&
      type &&
      validatedValue !== undefined &&
      validatedValue !== null &&
      validatedValue !== ''
    ) {
      try {
        const stringValue = String(validatedValue);
        if (stringValue) {
          type(stringValue);
        }
      } catch (e) {
        this._hasError = true;
        this._error = e instanceof Error ? e.message : 'An unknown error occurred';
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
    };
  }

  getTemplate() {
    const { options = {}, ctx } = this.props;
    return options.template || ctx?.templates?.textbox || TextboxTemplate;
  }

  static ReactComponent = class extends React.Component<
    TextboxTemplateProps & {
      ctx?: { templates?: { textbox?: ComponentType<TextboxTemplateProps> } };
      options?: { template?: ComponentType<TextboxTemplateProps> };
    }
  > {
    static displayName = 'Textbox';
    render() {
      const Template =
        this.props.options?.template || this.props.ctx?.templates?.textbox || TextboxTemplate;
      return <Template {...this.props} />;
    }
  };
}

// Default number transformer helper
export const defaultNumberTransformer: LegacyNumberTransformer = {
  format: (value: string | number) => {
    if (value === null || value === undefined) return '';
    return String(value);
  },
  parse: (value: string) => {
    if (value === '') return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  },
};

Textbox.numberTransformer = defaultNumberTransformer || Textbox.numberTransformer;

getStaticNumberTransformer = () => Textbox.numberTransformer;

export { getLocals };

getStaticNumberTransformer = () => Textbox.numberTransformer;

class TextboxTemplate extends React.Component<TextboxTemplateProps> {
  render() {
    const {
      hidden,
      stylesheet,
      hasError,
      editable = true,
      disabled = false,
      label,
      help,
      error,
      onChange: _omitOnChange,
      onChangeText,
      placeholder,
      placeholderTextColor,
      value,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      autoFocus,
      onBlur,
      onEndEditing,
      onFocus,
      onSubmitEditing,
      returnKeyType,
      selectTextOnFocus,
      underlineColorAndroid,
      selectionColor,
      onSelectionChange,
      numberOfLines,
      multiline,
      clearButtonMode,
      clearTextOnFocus,
      enablesReturnKeyAutomatically,
      keyboardAppearance,
      onKeyPress,
      selectionState,
      allowFontScaling,
      textContentType,
      type,
      showRequiredIndicator,
      required,
      ...rest
    } = this.props;

    void _omitOnChange;

    if (hidden) {
      return null;
    }

    // Resolve styles
    const formGroupStyle = StyleSheet.flatten([
      styles.formGroup,
      stylesheet.formGroup?.normal,
      hasError && stylesheet.formGroup?.error,
    ]);

    const controlLabelStyle = StyleSheet.flatten([
      styles.controlLabel,
      stylesheet.controlLabel?.normal,
      hasError && stylesheet.controlLabel?.error,
    ]);

    const isEditable = editable && !disabled;

    const textboxStyle = StyleSheet.flatten([
      styles.textbox,
      stylesheet.textbox?.normal,
      hasError && stylesheet.textbox?.error,
      !isEditable && stylesheet.textbox?.notEditable,
    ]);

    const textboxViewStyle = StyleSheet.flatten([
      styles.textboxView,
      stylesheet.textboxView?.normal,
      hasError && stylesheet.textboxView?.error,
      !isEditable && stylesheet.textboxView?.notEditable,
    ]);

    const helpBlockStyle = StyleSheet.flatten([
      styles.helpBlock,
      stylesheet.helpBlock?.normal,
      hasError && stylesheet.helpBlock?.error,
    ]);

    const errorBlockStyle = StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);

    // Defaults
    const resolvedKeyboardType =
      keyboardType !== undefined
        ? keyboardType
        : type?.meta?.kind === 'irreducible' &&
            (type as { name?: string } | undefined)?.name === 'Number'
          ? 'numeric'
          : keyboardType;
    const resolvedUnderlineColorAndroid =
      underlineColorAndroid !== undefined ? underlineColorAndroid : 'transparent';

    return (
      <View style={formGroupStyle} testID="textbox-container">
        {label && (
          <Text style={controlLabelStyle} testID="textbox-label">
            {label}
          </Text>
        )}
        {label && showRequiredIndicator && required && <Text style={controlLabelStyle}> *</Text>}
        <View style={textboxViewStyle} testID="textbox-input-container">
          <TextInput
            testID="text-input"
            style={textboxStyle}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            value={value != null ? String(value) : undefined}
            editable={isEditable}
            secureTextEntry={secureTextEntry}
            keyboardType={resolvedKeyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            autoFocus={autoFocus}
            onBlur={onBlur}
            onEndEditing={onEndEditing}
            onFocus={onFocus}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            selectTextOnFocus={selectTextOnFocus}
            underlineColorAndroid={resolvedUnderlineColorAndroid}
            selectionColor={selectionColor}
            onSelectionChange={onSelectionChange}
            numberOfLines={numberOfLines}
            multiline={multiline}
            clearButtonMode={clearButtonMode}
            clearTextOnFocus={clearTextOnFocus}
            enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
            keyboardAppearance={keyboardAppearance}
            onKeyPress={onKeyPress}
            selectionState={selectionState}
            allowFontScaling={allowFontScaling}
            textContentType={textContentType}
            {...rest}
          />
        </View>
        {help && (
          <Text testID="textbox-help" style={helpBlockStyle}>
            {help}
          </Text>
        )}
        {hasError && error && (
          <Text testID="textbox-error" accessibilityLiveRegion="polite" style={errorBlockStyle}>
            {error}
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  controlLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorBlock: {
    color: '#a94442',
    fontSize: 12,
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 10,
  },
  helpBlock: {
    color: '#737373',
    fontSize: 12,
    marginTop: 5,
  },
  textbox: {
    fontSize: 16,
    height: 40,
    padding: 10,
  },
  textboxView: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderRadius: 4,
    borderWidth: 1,
  },
});

// Export the Textbox class as default
export default Textbox;
