import { Picker } from '@react-native-picker/picker';
import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import type { SelectTemplateProps, SelectOption } from '../types/template.types';

const SelectAndroid = <T,>({
  options = [],
  value,
  onChange,
  nullOption,
  disabled = false,
  hidden,
  stylesheet = {
    formGroup: {},
    controlLabel: {},
    valueContainer: {},
    valueText: {},
    helpBlock: {},
    errorBlock: {},
  },
  hasError,
  label,
  help,
  error,
  ...rest
}: SelectTemplateProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<T | null>(value as T | null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleValueChange = useCallback(
    (itemValue: T | null) => {
      setSelectedValue(itemValue);
      if (onChange) {
        onChange(itemValue);
      }
      setShowPicker(false);
    },
    [onChange],
  );

  const togglePicker = useCallback(() => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  }, [disabled, showPicker]);

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

  // Prepare options including null option if provided
  const selectOptions: Array<SelectOption<T> | SelectOption<null>> = [
    ...(nullOption ? [nullOption] : []),
    ...options,
  ];
  const selectedOption = selectOptions.find(opt => opt?.value === selectedValue) || null;
  const displayValue = selectedOption?.text || '';

  return (
    <View style={formGroupStyle}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}

      <TouchableOpacity onPress={togglePicker} disabled={disabled}>
        <View style={valueContainerStyle}>
          <Text style={valueTextStyle}>{displayValue || 'Select an option...'}</Text>
        </View>
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={togglePicker}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={selectedValue}
            onValueChange={handleValueChange}
            style={styles.picker}
            dropdownIconColor="#000000"
            mode="dropdown"
            {...rest}
          >
            {selectOptions.map(option => (
              <Picker.Item
                key={option ? `option-${option.value}` : 'option-null'}
                label={option?.text || ''}
                value={option?.value}
              />
            ))}
          </Picker>
        </View>
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
  doneButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
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
  picker: {
    backgroundColor: 'white',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopColor: '#E9ECEF',
    borderTopWidth: 1,
  },
  pickerHeader: {
    borderBottomColor: '#E9ECEF',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
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

export default SelectAndroid;
