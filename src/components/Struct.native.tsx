import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { StructTemplateProps } from '../types/field.types';

const Struct = ({
  children,
  hidden,
  stylesheet,
  hasError,
  label,
  error,
  showRequiredIndicator,
  required,
  ...rest
}: StructTemplateProps) => {
  // Resolve styles
  const fieldsetStyle = StyleSheet.flatten([styles.fieldset, stylesheet.fieldset]);

  const controlLabelStyle = StyleSheet.flatten([
    styles.controlLabel,
    stylesheet.controlLabel?.normal,
    hasError && stylesheet.controlLabel?.error,
  ]);

  const errorBlockStyle = StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);

  if (hidden) {
    return null;
  }

  return (
    <View style={fieldsetStyle} {...rest}>
      {label && (typeof label === 'string' || typeof label === 'number') ? (
        <Text style={controlLabelStyle}>
          {label}
          {showRequiredIndicator && required ? ' *' : ''}
        </Text>
      ) : label && React.isValidElement(label) ? (
        <View style={styles.inlineLabelRow}>
          {label}
          {showRequiredIndicator && required ? <Text style={controlLabelStyle}> *</Text> : null}
        </View>
      ) : null}

      {hasError && error && (
        <Text style={errorBlockStyle} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorBlock: {
    color: '#a94442',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 5,
  },
  fieldset: {
    borderWidth: 0,
    marginBottom: 16,
    padding: 0,
  },
  inlineLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default Struct;
