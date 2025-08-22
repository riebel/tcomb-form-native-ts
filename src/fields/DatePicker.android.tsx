import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { handleDateChangeCore } from './utils/dateChangeCore';
import HelpBlock from '../templates/shared/HelpBlock';
import ErrorBlock from '../templates/shared/ErrorBlock';

import type { DatePickerTemplateProps } from '../types/field.types';

const DatePickerAndroid = ({
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
  onOpen,
  onClose,
  showRequiredIndicator,
  required,
  ...rest
}: DatePickerTemplateProps & { ctx?: { config?: Record<string, unknown> } }) => {
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState<'date' | 'time' | null>(null);
  const [date, setDate] = useState<Date>(value || new Date());

  const handleDateChange = useCallback(
    (_event: unknown, selectedDate?: Date) => {
      if (!show) return;
      handleDateChangeCore({
        mode,
        stage,
        date,
        selectedDate,
        onMerged: d => onChange?.(d),
        setDate,
        setStage,
        close: () => {
          setShow(false);
          setStage(null);
          onClose?.();
        },
      });
    },
    [show, mode, stage, date, onChange, onClose],
  );

  const showDatepicker = useCallback(() => {
    if (!disabled) {
      // Call onPress before opening
      (rest as { onPress?: () => void } | undefined)?.onPress?.();
      setShow(true);
      setStage(mode === 'datetime' ? 'date' : (mode as 'date' | 'time'));
      onOpen?.();
    }
  }, [disabled, mode, onOpen, rest]);

  // Resolve styles
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

  // Legacy style keys: datepicker/dateValue
  type LegacyStyles = {
    datepicker?: { normal?: StyleProp<ViewStyle>; error?: StyleProp<ViewStyle> };
    dateValue?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
      disabled?: StyleProp<TextStyle>;
    };
  };
  const legacy = stylesheet as unknown as LegacyStyles;
  const valueContainerNormal = stylesheet.valueContainer?.normal || legacy?.datepicker?.normal;
  const valueContainerError = stylesheet.valueContainer?.error || legacy?.datepicker?.error;
  const valueContainerDisabled = stylesheet.valueContainer?.disabled;

  const valueContainerStyle = StyleSheet.flatten([
    styles.valueContainer,
    valueContainerNormal,
    hasError && valueContainerError,
    disabled && valueContainerDisabled,
  ]);

  const valueTextNormal = stylesheet.valueText?.normal || legacy?.dateValue?.normal;
  const valueTextError = stylesheet.valueText?.error || legacy?.dateValue?.error;
  const valueTextDisabled = stylesheet.valueText?.disabled;

  const valueTextStyle = StyleSheet.flatten([
    styles.valueText,
    valueTextNormal,
    hasError && valueTextError,
    disabled && valueTextDisabled,
  ]);

  if (hidden) {
    return null;
  }

  // Prefer format from options/ctx config
  const cfg = (rest?.config ||
    (rest as { ctx?: { config?: Record<string, unknown> } })?.ctx?.config ||
    {}) as {
    format?: (d: Date) => string;
    defaultValueText?: string;
    dialogMode?: 'default' | 'spinner' | 'calendar';
  };
  const formattedValue = value
    ? (cfg?.format?.(value as Date) ??
      (mode === 'time'
        ? (value as Date).toLocaleTimeString()
        : mode === 'datetime'
          ? (value as Date).toLocaleString()
          : (value as Date).toLocaleDateString()))
    : (cfg?.defaultValueText ?? '');
  const displayMode = cfg?.dialogMode ?? 'default';

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

      <View>
        <TouchableOpacity onPress={showDatepicker} disabled={disabled}>
          <View style={valueContainerStyle}>
            <Text style={valueTextStyle}>{formattedValue || 'Select a date...'}</Text>
          </View>
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            value={date}
            mode={mode === 'datetime' ? (stage ?? 'date') : mode}
            display={displayMode}
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            {...rest}
          />
        )}
      </View>

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

export default DatePickerAndroid;
