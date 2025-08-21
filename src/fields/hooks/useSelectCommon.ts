import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
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
    return selectedOption?.text || '';
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

  const valueContainerStyle = StyleSheet.flatten([
    stylesheet.valueContainer?.normal,
    hasError && stylesheet.valueContainer?.error,
    disabled && stylesheet.valueContainer?.disabled,
  ]);

  const valueTextStyle = StyleSheet.flatten([
    stylesheet.valueText?.normal,
    hasError && stylesheet.valueText?.error,
    disabled && stylesheet.valueText?.disabled,
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
