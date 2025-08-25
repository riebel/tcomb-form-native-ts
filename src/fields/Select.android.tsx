import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import HelpBlock from '../templates/shared/HelpBlock';
import ErrorBlock from '../templates/shared/ErrorBlock';
import { useSelectCommon } from './hooks/useSelectCommon';
import { renderSafeReactNodeForPlatform } from '../utils/renderSafeReactNode';

import type { SelectTemplateProps } from '../types/field.types';

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
  showRequiredIndicator,
  required,
  ...rest
}: SelectTemplateProps<T>) => {
  const renderSafeReactNode = renderSafeReactNodeForPlatform('android');
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

  // Resolve common select logic and styles
  const {
    selectOptions,
    displayValue,
    formGroupStyle: sgFormGroup,
    controlLabelStyle: sgControlLabel,
    helpBlockStyle: sgHelpBlock,
    errorBlockStyle: sgErrorBlock,
    valueContainerStyle: sgValueContainer,
    valueTextStyle: sgValueText,
  } = useSelectCommon<T>({
    options,
    nullOption: nullOption || undefined,
    selectedValue,
    stylesheet,
    hasError,
    disabled,
  });

  // Merge base styles with hook styles
  const formGroupStyle = StyleSheet.flatten([styles.formGroup, sgFormGroup]);
  const controlLabelStyle = StyleSheet.flatten([styles.controlLabel, sgControlLabel]);
  const helpBlockStyle = StyleSheet.flatten([styles.helpBlock, sgHelpBlock]);
  const errorBlockStyle = StyleSheet.flatten([styles.errorBlock, sgErrorBlock]);
  const valueContainerStyle = StyleSheet.flatten([styles.valueContainer, sgValueContainer]);
  const valueTextStyle = StyleSheet.flatten([styles.valueText, sgValueText]);

  if (hidden) {
    return null;
  }

  // selectOptions and displayValue from hook

  return (
    <View style={formGroupStyle}>
      {label && (
        <View style={styles.inlineLabelRow}>
          {renderSafeReactNode(label, controlLabelStyle)}
          {showRequiredIndicator && required ? <Text style={controlLabelStyle}> *</Text> : null}
        </View>
      )}

      <TouchableOpacity onPress={togglePicker} disabled={disabled}>
        <View style={valueContainerStyle}>
          {typeof displayValue === 'string' || typeof displayValue === 'number' ? (
            <Text style={valueTextStyle}>{displayValue || 'Select an option...'}</Text>
          ) : React.isValidElement(displayValue) ? (
            displayValue
          ) : (
            <Text style={valueTextStyle}>Select an option...</Text>
          )}
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
            {...rest}
          >
            {selectOptions.map(option => {
              const labelValue =
                typeof option?.text === 'string' || typeof option?.text === 'number'
                  ? String(option?.text)
                  : '';
              return (
                <Picker.Item
                  key={option ? `option-${option.value}` : 'option-null'}
                  label={labelValue}
                  value={option?.value}
                />
              );
            })}
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
  inlineLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
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
