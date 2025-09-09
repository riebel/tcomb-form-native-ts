import React from 'react';
import { View, Text, TouchableOpacity, Platform, GestureResponderEvent } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Component } from './Component';
import { DatePickerLocals, DatePickerOptions, Transformer } from './types';

const t = require('tcomb-validation');
const Nil = t.Nil;

export function NativeDatePickerTemplate(locals: DatePickerLocals): React.ReactElement {
  const {
    stylesheet,
    hasError,
    value,
    onChange,
    mode = 'date',
    minimumDate,
    maximumDate,
    minuteInterval,
    timeZoneOffsetInMinutes,
    locale,
    label,
    help,
    error,
    hidden,
    disabled,
    onPress,
  } = locals;

  const [showPicker, setShowPicker] = React.useState(false);

  if (hidden) {
    return <View style={{ display: 'none' }} />;
  }

  const formGroupStyle = hasError ? stylesheet.formGroup?.error : stylesheet.formGroup?.normal;
  const controlLabelStyle = hasError
    ? stylesheet.controlLabel?.error
    : stylesheet.controlLabel?.normal;
  const datePickerStyle = hasError ? stylesheet.datepicker?.error : stylesheet.datepicker?.normal;
  const helpBlockStyle = hasError ? stylesheet.helpBlock?.error : stylesheet.helpBlock?.normal;

  const dateValue = value instanceof Date ? value : new Date();

  const formatDate = (date: Date): string => {
    if (mode === 'time') {
      return date.toLocaleTimeString();
    } else if (mode === 'datetime') {
      return date.toLocaleString();
    } else {
      return date.toLocaleDateString();
    }
  };

  const isAndroid = Platform.OS === 'android';
  const isWeb = Platform.OS === 'web';

  const handlePress = () => {
    if (isAndroid) {
      setShowPicker(true);
    }
  };

  const handleTouchablePress = (event: GestureResponderEvent) => {
    if (disabled) {
      return;
    }
    if (onPress) {
      (onPress as () => void)();
    } else {
      handlePress();
    }
  };

  const handleDateChange = (event: unknown, selectedDate?: Date) => {
    if (isAndroid) {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleWebDateChange = (event: { target: { value: string } }) => {
    const inputValue = event.target.value;
    if (inputValue) {
      const selectedDate = new Date(inputValue);
      if (!isNaN(selectedDate.getTime())) {
        onChange(selectedDate);
      }
    } else {
      // Handle clearing the date
      onChange(null);
    }
  };

  const getWebInputType = (): string => {
    switch (mode) {
      case 'time':
        return 'time';
      case 'datetime':
        return 'datetime-local';
      case 'date':
      default:
        return 'date';
    }
  };

  const getWebInputValue = (): string => {
    if (!value) {
      return '';
    }

    // Convert value to Date object if it's a string
    const dateValue = value instanceof Date ? value : new Date(String(value));

    // Check if the date is valid
    if (isNaN(dateValue.getTime())) {
      return '';
    }

    // Format in local timezone instead of UTC to avoid timezone offset issues
    switch (mode) {
      case 'time':
        // Format as HH:MM in local time
        return dateValue.toTimeString().substring(0, 5);
      case 'date': {
        // Format as YYYY-MM-DD in local time
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      case 'datetime': {
        // Format as YYYY-MM-DDTHH:MM in local time
        const yearDT = dateValue.getFullYear();
        const monthDT = String(dateValue.getMonth() + 1).padStart(2, '0');
        const dayDT = String(dateValue.getDate()).padStart(2, '0');
        const hours = String(dateValue.getHours()).padStart(2, '0');
        const minutes = String(dateValue.getMinutes()).padStart(2, '0');
        return `${yearDT}-${monthDT}-${dayDT}T${hours}:${minutes}`;
      }
      default:
        return '';
    }
  };

  const pickerProps = Platform.select({
    android: {
      display: 'default' as const,
    },
    ios: {
      display: 'compact' as const,
      style: { alignSelf: 'flex-start' as const },
    },
    default: {
      display: 'default' as const,
    },
  });

  if (isWeb) {
    // Web version using HTML input
    return (
      <View style={formGroupStyle}>
        {label && <Text style={controlLabelStyle}>{label}</Text>}

        {!disabled ? (
          <input
            type={getWebInputType()}
            value={getWebInputValue()}
            onChange={handleWebDateChange}
            min={minimumDate ? minimumDate.toISOString().substring(0, 10) : undefined}
            max={maximumDate ? maximumDate.toISOString().substring(0, 10) : undefined}
            style={{
              padding: 7,
              height: 36,
              width: '100%',
              borderWidth: 0,
              backgroundColor: String(datePickerStyle?.backgroundColor || '#fff'),
              color: String(controlLabelStyle?.color || '#000'),
              fontFamily: controlLabelStyle?.fontFamily,
              fontSize: controlLabelStyle?.fontSize,
            }}
          />
        ) : (
          <Text style={controlLabelStyle}>
            {value ? formatDate(dateValue) : 'No date selected'}
          </Text>
        )}

        {help ? <Text style={helpBlockStyle}>{String(help)}</Text> : null}
        {error ? <Text style={stylesheet.errorBlock}>{String(error)}</Text> : null}
      </View>
    );
  }

  return (
    <View style={formGroupStyle}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}

      {isAndroid ? (
        <>
          <TouchableOpacity
            style={datePickerStyle}
            onPress={handleTouchablePress}
            disabled={Boolean(disabled)}
          >
            <Text>{value ? formatDate(dateValue) : 'Select date'}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={dateValue}
              mode={mode}
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              minuteInterval={
                minuteInterval as 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30 | undefined
              }
              timeZoneOffsetInMinutes={timeZoneOffsetInMinutes}
              locale={locale}
              {...pickerProps}
            />
          )}
        </>
      ) : (
        <View style={datePickerStyle}>
          <DateTimePicker
            value={dateValue}
            mode={mode}
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            minuteInterval={
              minuteInterval as 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30 | undefined
            }
            timeZoneOffsetInMinutes={timeZoneOffsetInMinutes}
            locale={locale}
            {...pickerProps}
          />
        </View>
      )}

      {help ? <Text style={helpBlockStyle}>{String(help)}</Text> : null}
      {error ? <Text style={stylesheet.errorBlock}>{String(error)}</Text> : null}
    </View>
  );
}

export class DatePicker extends Component<DatePickerLocals> {
  static transformer: Transformer;

  getTemplate(): React.ComponentType<DatePickerLocals> {
    const options = this.props.options as DatePickerOptions;
    return options.template || this.props.ctx.templates.datepicker;
  }

  getLocals(): DatePickerLocals {
    const locals = super.getLocals();
    const options = this.props.options as DatePickerOptions;

    const datePickerLocals: DatePickerLocals = {
      ...locals,
      mode: options.mode,
      minimumDate: options.minimumDate,
      maximumDate: options.maximumDate,
      minuteInterval: options.minuteInterval,
      timeZoneOffsetInMinutes: options.timeZoneOffsetInMinutes,
      locale: options.locale,
      disabled: 'disabled' in options ? (options.disabled as boolean | undefined) : undefined,
      onPress: 'onPress' in options ? (options.onPress as (() => void) | undefined) : undefined,
    } as DatePickerLocals;

    return datePickerLocals;
  }

  hasError(): boolean {
    if (this.props.options.hasError) {
      return true;
    }

    const baseHasError = super.hasError();
    if (baseHasError) {
      return true;
    }

    const currentValue = this.state.value;
    const isEmpty = currentValue === null || currentValue === undefined;
    const isRequired = !this.typeInfo.isMaybe;
    const hasBeenTouched = this.hasBeenTouched();
    const validationAttempted = this.hasValidationBeenAttempted();
    const isCurrentlyInvalid = isEmpty && isRequired;

    return isCurrentlyInvalid && (hasBeenTouched || validationAttempted);
  }
}

DatePicker.transformer = {
  format: (value: unknown) => {
    if (Nil.is(value)) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return value;
  },
  parse: (value: unknown) => {
    if (Nil.is(value)) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return value;
  },
};
