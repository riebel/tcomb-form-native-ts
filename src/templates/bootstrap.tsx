import React from 'react';
import { View, Text } from 'react-native';
import { Templates, StructLocals } from '../types';
import { NativeTextboxTemplate, NativeCheckboxTemplate, NativeListTemplate } from './native';
import { NativeSelectTemplate } from '../Select';
import { NativeDatePickerTemplate } from '../DatePicker';
import { getErrorStyles, renderHiddenComponent } from './utils';

function StructTemplate(locals: StructLocals): React.ReactElement {
  const { stylesheet, hasError, order, inputs, label, help, error, hidden } = locals;

  const hiddenComponent = renderHiddenComponent(hidden);
  if (hiddenComponent) return hiddenComponent;

  const { formGroupStyle, controlLabelStyle, helpBlockStyle } = getErrorStyles(
    hasError,
    stylesheet,
  );

  return (
    <View style={[stylesheet.fieldset, formGroupStyle]}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}
      {order.map(fieldName => (
        <View key={fieldName}>{inputs[fieldName]}</View>
      ))}
      {help ? <Text style={helpBlockStyle}>{String(help)}</Text> : null}
      {error ? <Text style={stylesheet.errorBlock}>{String(error)}</Text> : null}
    </View>
  );
}

export const templates: Templates = {
  textbox: NativeTextboxTemplate,
  checkbox: NativeCheckboxTemplate,
  select: NativeSelectTemplate,
  datepicker: NativeDatePickerTemplate,
  struct: StructTemplate,
  list: NativeListTemplate,
};
