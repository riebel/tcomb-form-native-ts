import React from 'react';
import { Text } from 'react-native';
import type { HelpBlockProps } from '../../types/field.types';

export default function HelpBlock({ help, hasError, style }: HelpBlockProps) {
  if (!help || hasError) return null;
  return <Text style={style}>{help}</Text>;
}
