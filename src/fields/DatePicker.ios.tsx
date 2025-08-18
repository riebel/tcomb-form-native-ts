import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';

import type { DatePickerTemplateProps } from '../types/template.types';

const DatePickerIOS = ({
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  disabled = false,
  hidden,
  stylesheet,
  hasError,
  label,
  help,
  error,
  ...rest
}: DatePickerTemplateProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [date, setDate] = useState<Date>(value || new Date());

  const togglePicker = useCallback(() => {
    if (!disabled) {
      setIsCollapsed(!isCollapsed);
    }
  }, [disabled, isCollapsed]);

  const handleDateChange = useCallback(
    (_event: unknown, selectedDate?: Date) => {
      if (selectedDate) {
        setDate(selectedDate);
        if (onChange) {
          onChange(selectedDate);
        }
      }
      setIsCollapsed(true);
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
  ]);

  const helpBlockStyle = StyleSheet.flatten([
    styles.helpBlock,
    stylesheet.helpBlock?.normal,
    hasError && stylesheet.helpBlock?.error,
  ]);

  const errorBlockStyle = StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);

  const valueContainerStyle = StyleSheet.flatten([
    styles.valueContainer,
    stylesheet.valueContainer?.normal,
    hasError && stylesheet.valueContainer?.error,
    disabled && stylesheet.valueContainer?.disabled,
  ]);

  const valueTextStyle = StyleSheet.flatten([
    styles.valueText,
    stylesheet.valueText?.normal,
    hasError && stylesheet.valueText?.error,
    disabled && stylesheet.valueText?.disabled,
  ]);

  if (hidden) {
    return null;
  }

  const formattedValue = value ? value.toLocaleDateString() : '';

  return (
    <View style={formGroupStyle}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}

      <TouchableOpacity onPress={togglePicker} disabled={disabled}>
        <View style={valueContainerStyle}>
          <Text style={valueTextStyle}>{formattedValue || 'Select a date...'}</Text>
        </View>
      </TouchableOpacity>

      {!isCollapsed && (
        <DateTimePicker
          value={date}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          {...rest}
        />
      )}

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
  valueContainer: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderRadius: 4,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    padding: 10,
  },
  valueText: {
    color: '#333',
    fontSize: 16,
  },
});

export default DatePickerIOS;
