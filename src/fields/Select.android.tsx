import { Picker } from '@react-native-picker/picker';
import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import HelpBlock from '../templates/shared/HelpBlock';
import ErrorBlock from '../templates/shared/ErrorBlock';

import type { SelectTemplateProps, SelectOption } from '../types/template.types';

const SelectAndroid = <T,>({
  options = [],
  value,
  onChange,
  nullOption,
  isCollapsed: isCollapsedProp,
  onCollapseChange,
  onOpen,
  onClose,
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
  const [selectedValue, setSelectedValue] = useState<T | null>((value ?? null) as T | null);
  const [showPickerState, setShowPickerState] = useState(false);
  const showPicker = isCollapsedProp !== undefined ? !isCollapsedProp : showPickerState;

  useEffect(() => {
    setSelectedValue((value ?? null) as T | null);
  }, [value]);

  const handleValueChange = useCallback(
    (itemValue: T | null) => {
      setSelectedValue(itemValue);
      if (onChange) {
        onChange(itemValue);
      }
      // Collapse after selection
      onCollapseChange?.(true);
      onClose?.();
      if (isCollapsedProp === undefined) {
        setShowPickerState(false);
      }
    },
    [onChange, isCollapsedProp, onCollapseChange, onClose],
  );

  const togglePicker = useCallback(() => {
    if (disabled) return;
    const nextShow = !showPicker;
    const nextCollapsed = !nextShow; // collapsed is inverse of show
    onCollapseChange?.(nextCollapsed);
    if (nextShow) onOpen?.();
    else onClose?.();
    if (isCollapsedProp === undefined) {
      setShowPickerState(nextShow);
    }
  }, [disabled, showPicker, isCollapsedProp, onCollapseChange, onOpen, onClose]);

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

      <HelpBlock help={help} hasError={hasError} style={helpBlockStyle} />
      <ErrorBlock hasError={hasError} error={error} style={errorBlockStyle} />
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
