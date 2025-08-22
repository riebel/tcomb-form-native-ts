import React, { useCallback } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import HelpBlock from '../templates/shared/HelpBlock';
import ErrorBlock from '../templates/shared/ErrorBlock';

import type { CheckboxTemplateProps } from '../types/field.types';

const Checkbox = ({
  value = false,
  onChange,
  disabled = false,
  hidden,
  stylesheet,
  hasError,
  label,
  help,
  error,
  showRequiredIndicator,
  required,
  ...rest
}: CheckboxTemplateProps) => {
  const handleValueChange = useCallback(
    (newValue: boolean) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange],
  );

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
    disabled && stylesheet.controlLabel?.disabled,
  ]);

  const checkboxStyle = StyleSheet.flatten([
    styles.checkbox,
    stylesheet.checkbox?.normal,
    hasError && stylesheet.checkbox?.error,
    disabled && stylesheet.checkbox?.disabled,
  ]);

  const helpBlockStyle = StyleSheet.flatten([
    styles.helpBlock,
    stylesheet.helpBlock?.normal,
    hasError && stylesheet.helpBlock?.error,
  ]);

  const errorBlockStyle = StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);

  const containerStyle = StyleSheet.flatten([
    styles.container,
    stylesheet.container?.normal,
    disabled && stylesheet.container?.disabled,
  ]);

  if (hidden) {
    return null;
  }

  // Derive Switch colors from legacy props if provided
  const trackColor = {
    false: (rest as { tintColor?: string }).tintColor || '#767577',
    true: (rest as { onTintColor?: string }).onTintColor || '#81b0ff',
  } as const;
  const thumbColor = (
    value
      ? (rest as { thumbTintColor?: string }).thumbTintColor || '#f5dd4b'
      : (rest as { thumbTintColor?: string }).thumbTintColor || '#f4f3f4'
  ) as string;

  return (
    <View testID="checkbox-container" style={formGroupStyle}>
      <View style={containerStyle}>
        {label && (typeof label === 'string' || typeof label === 'number') ? (
          <Text testID="checkbox-label" style={controlLabelStyle}>
            {label}
            {showRequiredIndicator && required ? ' *' : ''}
          </Text>
        ) : label && React.isValidElement(label) ? (
          <View style={styles.inlineLabelRow}>
            {label}
            {showRequiredIndicator && required ? <Text style={controlLabelStyle}> *</Text> : null}
          </View>
        ) : null}
        <Switch
          testID="checkbox-switch"
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          style={checkboxStyle}
          trackColor={trackColor}
          thumbColor={thumbColor}
          ios_backgroundColor="#3e3e3e"
          {...rest}
        />
      </View>

      <HelpBlock help={help} hasError={hasError} style={helpBlockStyle} />
      <ErrorBlock hasError={hasError} error={error} style={errorBlockStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    marginLeft: 8,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  controlLabel: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
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
  inlineLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default Checkbox;
