import { useMemo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import type {
  SelectOption,
  UseSelectCommonArgs,
  UseSelectCommonResult,
} from '../../types/field.types';

export function useSelectCommon<T>({
  options = [],
  nullOption,
  selectedValue,
  stylesheet,
  hasError,
  disabled,
}: UseSelectCommonArgs<T>): UseSelectCommonResult<T> {
  const selectOptions = useMemo(
    () =>
      [...(nullOption ? [nullOption] : []), ...options] as Array<
        SelectOption<T> | SelectOption<null>
      >,
    [nullOption, options],
  );

  const displayValue = useMemo(() => {
    const selectedOption = selectOptions.find(opt => opt?.value === selectedValue) || null;
    return selectedOption?.text ?? '';
  }, [selectOptions, selectedValue]);

  const formGroupStyle = StyleSheet.flatten([
    stylesheet.formGroup?.normal,
    hasError && stylesheet.formGroup?.error,
  ]);

  const controlLabelStyle = StyleSheet.flatten([
    stylesheet.controlLabel?.normal,
    hasError && stylesheet.controlLabel?.error,
  ]);

  const helpBlockStyle = StyleSheet.flatten([
    stylesheet.helpBlock?.normal,
    hasError && stylesheet.helpBlock?.error,
  ]);

  const errorBlockStyle = StyleSheet.flatten([stylesheet.errorBlock]);

  // Fallback to legacy select styles when valueContainer not provided
  type LegacyStyles = {
    pickerTouchable?: {
      normal?: StyleProp<ViewStyle>;
      error?: StyleProp<ViewStyle>;
      notEditable?: StyleProp<ViewStyle>;
    };
    select?: { normal?: StyleProp<ViewStyle> };
    pickerValue?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
      notEditable?: StyleProp<TextStyle>;
    };
  };
  const legacy = stylesheet as unknown as LegacyStyles;
  const valueContainerNormal =
    stylesheet.valueContainer?.normal || legacy?.pickerTouchable?.normal || legacy?.select?.normal;
  const valueContainerError = stylesheet.valueContainer?.error || legacy?.pickerTouchable?.error;
  const valueContainerDisabled =
    stylesheet.valueContainer?.disabled || legacy?.pickerTouchable?.notEditable;

  const valueContainerStyle = StyleSheet.flatten([
    valueContainerNormal,
    hasError && valueContainerError,
    disabled && valueContainerDisabled,
  ]);

  const valueTextNormal = stylesheet.valueText?.normal || legacy?.pickerValue?.normal;
  const valueTextError = stylesheet.valueText?.error || legacy?.pickerValue?.error;
  const valueTextDisabled = stylesheet.valueText?.disabled || legacy?.pickerValue?.notEditable;

  const valueTextStyle = StyleSheet.flatten([
    valueTextNormal,
    hasError && valueTextError,
    disabled && valueTextDisabled,
  ]);

  return {
    selectOptions,
    displayValue,
    formGroupStyle,
    controlLabelStyle,
    helpBlockStyle,
    errorBlockStyle,
    valueContainerStyle,
    valueTextStyle,
  };
}
