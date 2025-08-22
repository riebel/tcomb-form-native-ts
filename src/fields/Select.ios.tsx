import { Picker } from '@react-native-picker/picker';
import { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import HelpBlock from '../templates/shared/HelpBlock';
import ErrorBlock from '../templates/shared/ErrorBlock';
import { useSelectCommon } from './hooks/useSelectCommon';

import type { SelectTemplateProps } from '../types/field.types';

const UIPICKER_HEIGHT = 216;

const SelectIOS = <T,>({
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
  const [isCollapsedState, setIsCollapsedState] = useState(true);
  const [selectedValue, setSelectedValue] = useState<T | null>((value ?? null) as T | null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isCollapsed = isCollapsedProp ?? isCollapsedState;

  useEffect(() => {
    setSelectedValue((value ?? null) as T | null);
  }, [value]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isCollapsed ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isCollapsed, slideAnim]);

  const togglePicker = useCallback(() => {
    if (disabled) return;
    const next = !isCollapsed;
    onCollapseChange?.(next);
    if (next) onClose?.();
    else onOpen?.();
    if (isCollapsedProp === undefined) {
      setIsCollapsedState(next);
    }
  }, [disabled, isCollapsed, isCollapsedProp, onCollapseChange, onOpen, onClose]);

  const handleValueChange = useCallback(
    (itemValue: T | null) => {
      setSelectedValue(itemValue);
      if (onChange) {
        onChange(itemValue);
      }
    },
    [onChange],
  );

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
      {label && (typeof label === 'string' || typeof label === 'number') ? (
        <Text style={controlLabelStyle}>
          {label}
          {showRequiredIndicator && required ? ' *' : ''}
        </Text>
      ) : label ? (
        <View style={styles.inlineLabelRow}>
          {label}
          {showRequiredIndicator && required ? <Text style={controlLabelStyle}> *</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity onPress={togglePicker} disabled={disabled}>
        <View style={valueContainerStyle}>
          <Text style={valueTextStyle}>{displayValue || 'Select an option...'}</Text>
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.pickerContainer,
          {
            height: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, UIPICKER_HEIGHT],
            }),
            opacity: slideAnim,
          },
        ]}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleValueChange}
          enabled={!disabled}
          style={styles.picker}
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
      </Animated.View>

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
    backgroundColor: '#f5f5f5',
  },
  pickerContainer: {
    overflow: 'hidden',
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

export default SelectIOS;
