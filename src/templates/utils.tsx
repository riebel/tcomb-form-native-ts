import React from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { Stylesheet } from '../types';

export function getErrorStyles(hasError: boolean, stylesheet: Stylesheet) {
  return {
    formGroupStyle: hasError ? stylesheet.formGroup?.error : stylesheet.formGroup?.normal,
    controlLabelStyle: hasError ? stylesheet.controlLabel?.error : stylesheet.controlLabel?.normal,
    helpBlockStyle: hasError ? stylesheet.helpBlock?.error : stylesheet.helpBlock?.normal,
  };
}

export function getElementErrorStyle(
  hasError: boolean,
  stylesheet: Stylesheet,
  elementType: keyof Stylesheet,
): ViewStyle | TextStyle | undefined {
  const elementStyles = stylesheet[elementType];
  if (!elementStyles || typeof elementStyles !== 'object') {
    return undefined;
  }
  const styles = elementStyles as { error?: ViewStyle | TextStyle; normal?: ViewStyle | TextStyle };
  return hasError ? styles.error : styles.normal;
}

export function renderHiddenComponent(hidden?: boolean): React.ReactElement | null {
  if (hidden) {
    return <View style={{ display: 'none' }} />;
  }
  return null;
}
