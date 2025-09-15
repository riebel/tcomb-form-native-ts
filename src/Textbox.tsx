import React from 'react';
import { TextInputProps } from 'react-native';
import { Component } from './Component';
import { TextboxLocals, TextboxOptions, Transformer, NumberTransformer } from './types';
import { toNull, parseNumber } from './util';

const t = require('tcomb-validation');
const Nil = t.Nil;

export class Textbox extends Component<TextboxLocals> {
  static numberTransformer: NumberTransformer;
  static transformer: Transformer;

  getTransformer(): Transformer {
    const options = this.props.options as TextboxOptions;
    if (options.transformer) {
      return options.transformer;
    }

    if (this.typeInfo.innerType === t.Number) {
      return {
        format: Textbox.numberTransformer.format as (value: unknown) => unknown,
        parse: (value: unknown) => {
          if (value === null || value === undefined) {
            return null;
          }
          return Textbox.numberTransformer.parse(String(value));
        },
      };
    }

    return Textbox.transformer;
  }

  getTemplate(): React.ComponentType<TextboxLocals> {
    const options = this.props.options as TextboxOptions;
    return options.template || this.props.ctx.templates.textbox;
  }

  getPlaceholder(): string | undefined {
    const options = this.props.options as TextboxOptions;
    let placeholder = options.placeholder;
    if (Nil.is(placeholder) && this.getAuto() === 'placeholders') {
      placeholder = this.getDefaultLabel();
    }
    return placeholder;
  }

  getKeyboardType(): TextInputProps['keyboardType'] {
    const options = this.props.options as TextboxOptions;
    const keyboardType = options.keyboardType;
    if (t.Nil.is(keyboardType) && this.typeInfo.innerType === t.Number) {
      return 'numeric';
    }
    return keyboardType;
  }

  getLocals(): TextboxLocals {
    const locals = super.getLocals();
    const options = this.props.options as TextboxOptions;

    const textboxLocals: TextboxLocals = {
      ...locals,
      placeholder: this.getPlaceholder(),
      onChangeNative: options.onChange,
      onBlur: this.onBlur,
      keyboardType: this.getKeyboardType(),
      underlineColorAndroid: options.underlineColorAndroid || 'transparent',
    };

    const textInputProps: Array<keyof TextboxOptions> = [
      'help',
      'allowFontScaling',
      'autoCapitalize',
      'autoCorrect',
      'autoFocus',
      'blurOnSubmit',
      'editable',
      'maxLength',
      'multiline',
      'onBlur',
      'onEndEditing',
      'onFocus',
      'onLayout',
      'onSelectionChange',
      'onSubmitEditing',
      'onContentSizeChange',
      'placeholderTextColor',
      'secureTextEntry',
      'selectTextOnFocus',
      'selectionColor',
      'textAlign',
      'textAlignVertical',
      'returnKeyType',
      'clearButtonMode',
      'clearTextOnFocus',
      'enablesReturnKeyAutomatically',
      'keyboardAppearance',
      'onKeyPress',
      'selectionState',
      'spellCheck',
      'style',
    ];

    textInputProps.forEach(prop => {
      if (options[prop] !== undefined) {
        (textboxLocals as Record<string, unknown>)[prop] = options[prop];
      }
    });

    return textboxLocals;
  }
}

Textbox.numberTransformer = {
  format: (value: string | number) => (Nil.is(value) ? '' : String(value)),
  parse: (value: string | null) => {
    if (value) {
      const normalizedValue = value.replace(/,/g, '.');
      return parseNumber(normalizedValue);
    }
    return parseNumber(value);
  },
};

Textbox.transformer = {
  format: (value: unknown) => (Nil.is(value) ? '' : String(value)),
  parse: (value: unknown) => toNull(value),
};
