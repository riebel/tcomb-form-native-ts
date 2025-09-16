import React from 'react';
import { Platform, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Component } from './Component';
import { SelectLocals, SelectOption, SelectOptions, TcombType, Transformer } from './types';
import { getComparator, getOptionsOfEnum } from './util';
import { getErrorStyles, getElementErrorStyle, renderHiddenComponent } from './templates/utils';
import { TransformerFactory } from './transformers/factory';

export function NativeSelectTemplate(locals: SelectLocals): React.ReactElement {
  const { stylesheet, hasError, value, onChange, options, label, help, error, hidden } = locals;

  const hiddenComponent = renderHiddenComponent(hidden);
  if (hiddenComponent) return hiddenComponent;

  const { formGroupStyle, controlLabelStyle, helpBlockStyle } = getErrorStyles(
    hasError,
    stylesheet,
  );
  const selectStyle = getElementErrorStyle(hasError, stylesheet, 'select');

  const pickerProps = Platform.select({
    android: {
      mode: 'dropdown' as const,
    },
    ios: {
      itemStyle: { fontSize: 16 },
    },
    default: {},
  });

  return (
    <View style={formGroupStyle}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}
      <Picker style={selectStyle} selectedValue={value} onValueChange={onChange} {...pickerProps}>
        {options.map((option, index) => (
          <Picker.Item key={index} label={String(option.text || '')} value={option.value} />
        ))}
      </Picker>
      {help ? <Text style={helpBlockStyle}>{String(help)}</Text> : null}
      {error ? <Text style={stylesheet.errorBlock}>{String(error)}</Text> : null}
    </View>
  );
}

export class Select extends Component<SelectLocals> {
  static transformer: Transformer;

  getTemplate(): React.ComponentType<SelectLocals> {
    const options = this.props.options as SelectOptions;
    return (options.template ||
      this.props.ctx.templates.select) as React.ComponentType<SelectLocals>;
  }

  getLocals(): SelectLocals {
    const locals = super.getLocals();
    const options = this.props.options as SelectOptions;

    const transformer = this.getTransformer();
    const formattedValue = transformer.format(this.state.value);

    const legacyOptions = this.getOptions()
      .filter((opt): opt is SelectOption => opt != null && typeof opt.text !== 'undefined')
      .map(opt => ({
        value: String(opt.value ?? ''),
        text: String(opt.text ?? ''),
      }));

    return {
      ...locals,
      options: legacyOptions,
      isCollapsed: options.isCollapsed,
      onCollapseChange: options.onCollapseChange,
      value: String(formattedValue ?? ''),
    };
  }

  getOptions(): SelectOption[] {
    const options = this.props.options as SelectOptions;

    const items = options.options?.slice() ?? getOptionsOfEnum(this.props.type as TcombType);

    if (options.order) {
      const comparator = getComparator(options.order);
      items.sort(comparator);
    }

    const nullOption = this.getNullOption();

    if (options.nullOption !== false) {
      items.unshift(nullOption);
    }

    return items;
  }

  getNullOption(): SelectOption {
    const options = this.props.options as SelectOptions;
    return options.nullOption || { value: '', text: '-' };
  }

  getTransformer(): Transformer {
    const options = this.props.options as SelectOptions;
    if (options.transformer) {
      return options.transformer;
    }
    const nullOption = this.getNullOption();
    return TransformerFactory.createSelectTransformer(nullOption);
  }

  protected isValueEmpty(): boolean {
    const nullOption = this.getNullOption();
    return (
      this.state.value === null ||
      this.state.value === undefined ||
      this.state.value === '' ||
      this.state.value === nullOption.value
    );
  }
}

Select.transformer = TransformerFactory.createSelectTransformer();
