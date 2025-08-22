import React from 'react';
import { Text } from 'react-native';
import type { HelpBlockProps } from '../../types/field.types';

export default function HelpBlock({ help, hasError, style }: HelpBlockProps) {
  if (!help || hasError) return null;
  if (typeof help === 'string' || typeof help === 'number') {
    return <Text style={style}>{help}</Text>;
  }
  // If it's a valid React element, render directly; otherwise nothing
  return React.isValidElement(help) ? help : null;
}
