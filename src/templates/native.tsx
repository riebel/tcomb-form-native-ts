import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { TextboxLocals, CheckboxLocals, ListLocals } from '../types';
import { getErrorStyles, getElementErrorStyle, renderHiddenComponent } from './utils';

export function NativeTextboxTemplate(locals: TextboxLocals): React.ReactElement {
  const {
    stylesheet,
    hasError,
    value,
    onChange,
    placeholder,
    keyboardType,
    underlineColorAndroid,
    allowFontScaling,
    autoCapitalize,
    autoCorrect,
    autoFocus,
    editable,
    maxLength,
    multiline,
    onBlur,
    onEndEditing,
    onFocus,
    onLayout,
    onSelectionChange,
    onSubmitEditing,
    onContentSizeChange,
    placeholderTextColor,
    secureTextEntry,
    selectTextOnFocus,
    selectionColor,
    textAlign,
    returnKeyType,
    clearButtonMode,
    clearTextOnFocus,
    enablesReturnKeyAutomatically,
    keyboardAppearance,
    onKeyPress,
    selectionState,
    spellCheck,
    style,
    label,
    help,
    error,
    hidden,
  } = locals;

  const hiddenComponent = renderHiddenComponent(hidden);
  if (hiddenComponent) return hiddenComponent;

  const { formGroupStyle, controlLabelStyle, helpBlockStyle } = getErrorStyles(
    hasError,
    stylesheet,
  );
  const textboxStyle = getElementErrorStyle(hasError, stylesheet, 'textbox');
  const notEditableStyle = editable ? {} : stylesheet.notEditable;

  return (
    <View style={formGroupStyle}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}
      <TextInput
        style={[textboxStyle, notEditableStyle, style]}
        value={value == null ? '' : String(value)}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        underlineColorAndroid={underlineColorAndroid}
        allowFontScaling={allowFontScaling}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        editable={editable}
        maxLength={maxLength}
        multiline={multiline}
        onBlur={onBlur}
        onEndEditing={onEndEditing}
        onFocus={onFocus}
        onLayout={onLayout}
        onSelectionChange={onSelectionChange}
        onSubmitEditing={onSubmitEditing}
        onContentSizeChange={onContentSizeChange}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        selectTextOnFocus={selectTextOnFocus}
        selectionColor={selectionColor}
        textAlign={textAlign}
        textAlignVertical={multiline ? 'top' : 'center'}
        returnKeyType={returnKeyType}
        clearButtonMode={clearButtonMode}
        clearTextOnFocus={clearTextOnFocus}
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
        keyboardAppearance={keyboardAppearance}
        onKeyPress={onKeyPress}
        selectionState={selectionState}
        spellCheck={spellCheck}
      />
      {help ? <Text style={helpBlockStyle}>{String(help)}</Text> : null}
      {error ? <Text style={stylesheet.errorBlock}>{String(error)}</Text> : null}
    </View>
  );
}

export function NativeCheckboxTemplate(locals: CheckboxLocals): React.ReactElement {
  const { stylesheet, hasError, value, onChange, label, help, error, hidden } = locals;

  const hiddenComponent = renderHiddenComponent(hidden);
  if (hiddenComponent) return hiddenComponent;

  const { formGroupStyle, controlLabelStyle, helpBlockStyle } = getErrorStyles(
    hasError,
    stylesheet,
  );
  const checkboxStyle = getElementErrorStyle(hasError, stylesheet, 'checkbox');

  return (
    <View style={formGroupStyle}>
      <View style={stylesheet.checkboxContainer}>
        <Text style={[controlLabelStyle, checkboxStyle]} onPress={() => onChange(!value)}>
          {value ? '☑' : '☐'} {label}
        </Text>
      </View>
      {help ? <Text style={helpBlockStyle}>{String(help)}</Text> : null}
      {error ? <Text style={stylesheet.errorBlock}>{String(error)}</Text> : null}
    </View>
  );
}

export function NativeListTemplate(locals: ListLocals): React.ReactElement {
  const { stylesheet, hasError, items, add, label, help, error, hidden } = locals;

  const hiddenComponent = renderHiddenComponent(hidden);
  if (hiddenComponent) return hiddenComponent;

  const { formGroupStyle, controlLabelStyle, helpBlockStyle } = getErrorStyles(
    hasError,
    stylesheet,
  );

  return (
    <View style={[stylesheet.fieldset, formGroupStyle]}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}
      {items.map(item => (
        <View key={item.key} style={stylesheet.listItem}>
          {item.input}
          <View style={stylesheet.buttonGroup}>
            {item.buttons.map(button => (
              <Text
                key={button.type}
                style={[stylesheet.button, stylesheet.buttonText]}
                onPress={button.click}
              >
                {button.label}
              </Text>
            ))}
          </View>
        </View>
      ))}
      {!add.disabled && (
        <Text style={[stylesheet.button, stylesheet.buttonText]} onPress={add.click}>
          {add.label}
        </Text>
      )}
      {help ? <Text style={helpBlockStyle}>{String(help)}</Text> : null}
      {error ? <Text style={stylesheet.errorBlock}>{String(error)}</Text> : null}
    </View>
  );
}
