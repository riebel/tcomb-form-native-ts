import { View, Text, StyleSheet } from 'react-native';

import type { StructTemplateProps } from '../types/template.types';

const Struct = ({
  children,
  hidden,
  stylesheet,
  hasError,
  label,
  error,
  ...rest
}: StructTemplateProps) => {
  // Resolve styles based on component state
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
      {label && <Text style={controlLabelStyle}>{label}</Text>}

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
});

export default Struct;
