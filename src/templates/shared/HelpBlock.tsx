import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

export type HelpBlockProps = {
  help?: string;
  hasError?: boolean;
  style?: StyleProp<TextStyle>;
};

export default function HelpBlock({ help, hasError, style }: HelpBlockProps) {
  if (!help || hasError) return null;
  return <Text style={style}>{help}</Text>;
}
