import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

export type ErrorBlockProps = {
  hasError?: boolean;
  error?: string;
  style?: StyleProp<TextStyle>;
};

export default function ErrorBlock({ hasError, error, style }: ErrorBlockProps) {
  if (!hasError || !error) return null;
  return (
    <Text style={style} accessibilityLiveRegion="polite">
      {error}
    </Text>
  );
}
