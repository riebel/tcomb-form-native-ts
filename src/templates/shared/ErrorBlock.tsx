import React from 'react';
import { Text } from 'react-native';
import type { ErrorBlockProps } from '../../types/field.types';

export default function ErrorBlock({ hasError, error, style }: ErrorBlockProps) {
  if (!hasError || !error) return null;
  if (typeof error === 'string' || typeof error === 'number') {
    return (
      <Text style={style} accessibilityLiveRegion="polite">
        {error}
      </Text>
    );
  }
  return React.isValidElement(error) ? error : null;
}
