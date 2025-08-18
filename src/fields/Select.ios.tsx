import { Picker } from '@react-native-picker/picker';
import { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';

import type { SelectTemplateProps, SelectOption } from '../types/template.types';

const UIPICKER_HEIGHT = 216;

const SelectIOS = <T,>({
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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedValue, setSelectedValue] = useState<T | null>(value as T | null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isCollapsed ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isCollapsed, slideAnim]);

  const togglePicker = useCallback(() => {
    if (!disabled) {
      setIsCollapsed(!isCollapsed);
    }
  }, [disabled, isCollapsed]);

  const handleValueChange = useCallback(
    (itemValue: T | null) => {
      setSelectedValue(itemValue);
      if (onChange) {
        onChange(itemValue);
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
