import { useCallback } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

import type { CheckboxTemplateProps } from '../types/template.types';

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

  return (
    <View testID="checkbox-container" style={formGroupStyle}>
      <View style={containerStyle}>
        {label && (
          <Text testID="checkbox-label" style={controlLabelStyle}>
            {label}
          </Text>
        )}
        <Switch
          testID="checkbox-switch"
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          style={checkboxStyle}
          trackColor={{
            false: '#767577',
            true: '#81b0ff',
          }}
          thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          {...rest}
        />
      </View>

      {help && !hasError && <Text style={helpBlockStyle}>{help}</Text>}
      {hasError && error && (
        <Text style={errorBlockStyle} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
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
});

export default Checkbox;
