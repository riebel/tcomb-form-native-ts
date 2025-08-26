import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Component } from './Component';
import { SelectLocals, SelectOptions, SelectOption, Transformer, TcombType } from './types';
import { getOptionsOfEnum, getComparator } from './util';

const t = require('tcomb-validation');
const Nil = t.Nil;

export function NativeSelectTemplate(locals: SelectLocals): React.ReactElement {
  const { stylesheet, hasError, value, onChange, options, label, help, error, hidden } = locals;

  if (hidden) {
    return <View style={{ display: 'none' }} />;
  }

  const formGroupStyle = hasError ? stylesheet.formGroup?.error : stylesheet.formGroup?.normal;
  const controlLabelStyle = hasError
    ? stylesheet.controlLabel?.error
    : stylesheet.controlLabel?.normal;
  const selectStyle = hasError ? stylesheet.select?.error : stylesheet.select?.normal;
  const helpBlockStyle = hasError ? stylesheet.helpBlock?.error : stylesheet.helpBlock?.normal;

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
      .filter(opt => opt && typeof opt.text !== 'undefined')
      .map(opt => ({
        value: String(opt.value ?? ''),
        text: String(opt.text ?? ''),
      }));

    const selectLocals: SelectLocals = {
      ...locals,
      options: legacyOptions,
      isCollapsed: options.isCollapsed,
      onCollapseChange: options.onCollapseChange,
      value: String(formattedValue ?? ''),
    };

    return selectLocals;
  }

  getOptions(): SelectOption[] {
    const options = this.props.options as SelectOptions;

    const items = options.options
      ? options.options.slice()
      : getOptionsOfEnum(this.props.type as TcombType);

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
    return SelectClass.transformer(nullOption);
  }
}

const SelectClass = Select as typeof Select & {
  transformer: (nullOption?: { value: unknown; text: string }) => Transformer;
};

Object.assign(SelectClass, {
  transformer: (nullOption?: { value: unknown; text: string }) => ({
    format: (value: unknown) => (Nil.is(value) && nullOption ? nullOption.value : String(value)),
    parse: (value: unknown) => (nullOption && nullOption.value === value ? null : value),
  }),
});
