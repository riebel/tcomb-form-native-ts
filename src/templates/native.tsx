import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { TextboxLocals, CheckboxLocals, ListLocals } from '../types';

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
    blurOnSubmit,
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

  if (hidden) {
    return <View style={{ display: 'none' }} />;
  }

  const formGroupStyle = hasError ? stylesheet.formGroup?.error : stylesheet.formGroup?.normal;
  const controlLabelStyle = hasError
    ? stylesheet.controlLabel?.error
    : stylesheet.controlLabel?.normal;
  const textboxStyle = hasError ? stylesheet.textbox?.error : stylesheet.textbox?.normal;
  const helpBlockStyle = hasError ? stylesheet.helpBlock?.error : stylesheet.helpBlock?.normal;

  return (
    <View style={formGroupStyle}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}
      <TextInput
        style={[textboxStyle, style]}
        value={value as string}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        underlineColorAndroid={underlineColorAndroid}
        allowFontScaling={allowFontScaling}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        blurOnSubmit={blurOnSubmit}
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

  if (hidden) {
    return <View style={{ display: 'none' }} />;
  }

  const formGroupStyle = hasError ? stylesheet.formGroup?.error : stylesheet.formGroup?.normal;
  const controlLabelStyle = hasError
    ? stylesheet.controlLabel?.error
    : stylesheet.controlLabel?.normal;
  const checkboxStyle = hasError ? stylesheet.checkbox?.error : stylesheet.checkbox?.normal;
  const helpBlockStyle = hasError ? stylesheet.helpBlock?.error : stylesheet.helpBlock?.normal;

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

  if (hidden) {
    return <View style={{ display: 'none' }} />;
  }

  const formGroupStyle = hasError ? stylesheet.formGroup?.error : stylesheet.formGroup?.normal;
  const controlLabelStyle = hasError
    ? stylesheet.controlLabel?.error
    : stylesheet.controlLabel?.normal;
  const helpBlockStyle = hasError ? stylesheet.helpBlock?.error : stylesheet.helpBlock?.normal;

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
