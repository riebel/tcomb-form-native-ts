import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import bootstrapStyles from '../stylesheets/bootstrap';

import type { TextboxTemplateProps } from '../types/template.types';

// Provide a typed way to access the static numberTransformer without using 'any'
type LegacyNumberTransformer =
  | {
      // Match classic signature to allow user code like (value: string | number) => string | null
      format: (value: string | number | null | undefined) => string | null;
      // Classic parse returns number|null; we also allow undefined for symmetry
      parse: (value: string) => number | null | undefined;
    }
  | undefined;

let getStaticNumberTransformer: () => LegacyNumberTransformer = () => undefined;

// Keep getLocals as a standalone function
const getLocals = (props: TextboxTemplateProps) => {
  const { type, options = {}, value, error, hasError, stylesheet = {}, ctx, ...rest } = props;

  let label = options?.label;
  if (!label && ctx?.auto === 'labels' && ctx?.label) {
    label = ctx.label;
  }

  let placeholder = options?.placeholder;
  if (!placeholder && ctx?.auto === 'placeholders' && ctx?.label) {
    placeholder = ctx.label;
  }

  const isOptional = type?.meta?.optional || type?.meta?.kind === 'maybe';
  if (isOptional) {
    if (label && ctx?.i18n?.optional) {
      label = `${label}${ctx.i18n.optional}`;
    }
    if (placeholder && ctx?.i18n?.optional) {
      placeholder = `${placeholder}${ctx.i18n.optional}`;
    }
  }

  // Handle value transformation (with legacy fallback to Textbox.numberTransformer)
  let displayValue = value;
  const legacyTransformer = getStaticNumberTransformer();
  const transformer = options?.transformer || legacyTransformer;
  if (transformer?.format && value !== undefined) {
    displayValue = transformer.format(value);
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
    ctx,
    ...rest,
  };
};

// Create a plain class that can be instantiated with new
export class Textbox {
  props: TextboxTemplateProps;
  private _hasError: boolean = false;
  private _error: string | undefined;

  // Legacy-compatible static transformer holder (e.g., t.form.Textbox.numberTransformer)
  static numberTransformer?: {
    format: (value: string | number | null | undefined) => string | null;
    parse: (value: string) => number | null | undefined;
  };

  constructor(props: TextboxTemplateProps) {
    this.props = props;
  }

  getLocals() {
    const { options = {}, error, hasError, value } = this.props;
    const locals = getLocals(this.props);

    // Handle error state
    if (options.error) {
      locals.error = typeof options.error === 'function' ? options.error(value) : options.error;
      locals.hasError = true;
    } else {
      locals.error = this._error;
      locals.hasError = this._hasError;
    }

    // Override with direct props if provided
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

    try {
      // Apply transformer if available (fallback to static numberTransformer)
      const legacyTransformer = (this.constructor as typeof Textbox).numberTransformer;
      const transformer = options.transformer || legacyTransformer;
      if (transformer?.parse) {
        if (value === undefined || value === null) {
          validatedValue = value;
        } else if (Array.isArray(value)) {
          // Pass array values directly to parse
          validatedValue = transformer.parse(value.join(' ')) as unknown as
            | string
            | number
            | null
            | undefined;
        } else {
          // Convert non-array values to string before parsing
          validatedValue = transformer.parse(String(value)) as unknown as
            | string
            | number
            | null
            | undefined;
        }
      }

      // Basic type validation
      if (
        type &&
        validatedValue !== undefined &&
        validatedValue !== null &&
        validatedValue !== ''
      ) {
        const stringValue = validatedValue !== undefined ? String(validatedValue) : '';
        if (stringValue) {
          type(stringValue);
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
    };
  }

  getTemplate() {
    const { options = {}, ctx } = this.props;
    return options.template || ctx?.templates?.textbox || bootstrapStyles.textboxViewNotEditable;
  }

  // Keep the React component as a static property
  static ReactComponent = class extends React.Component<TextboxTemplateProps> {
    static displayName = 'Textbox';
    render() {
      return <TextboxTemplate {...this.props} />;
    }
  };
}

// Export getLocals as a named export
export { getLocals };

// Now that Textbox is defined, wire the static getter without using 'any'
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
      value,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      autoFocus,
      onBlur,
      onFocus,
      onSubmitEditing,
      returnKeyType,
      selectTextOnFocus,
      ...rest
    } = this.props;

    void _omitOnChange;

    if (hidden) {
      return null;
    }

    // Resolve styles based on component state
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

    return (
      <View style={formGroupStyle} testID="textbox-container">
        {label && (
          <Text style={controlLabelStyle} testID="textbox-label">
            {label}
          </Text>
        )}
        <View style={textboxViewStyle} testID="textbox-input-container">
          <TextInput
            testID="text-input"
            style={textboxStyle}
            onChangeText={onChangeText}
            placeholder={placeholder}
            value={value != null ? String(value) : undefined}
            editable={isEditable}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            autoFocus={autoFocus}
            onBlur={onBlur}
            onFocus={onFocus}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            selectTextOnFocus={selectTextOnFocus}
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
