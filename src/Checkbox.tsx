import React from 'react';
import { Component } from './Component';
import { CheckboxLocals, CheckboxOptions, Transformer } from './types';

const t = require('tcomb-validation');
const Nil = t.Nil;

export class Checkbox extends Component<CheckboxLocals> {
  static transformer: Transformer;

  getTransformer(): Transformer {
    return this.props.options.transformer || Checkbox.transformer;
  }

  getTemplate(): React.ComponentType<CheckboxLocals> {
    const options = this.props.options as CheckboxOptions;
    return options.template || this.props.ctx.templates.checkbox;
  }

  getLabel(): string | undefined {
    let label = this.props.options.label || this.props.options.legend;
    if (Nil.is(label) && this.getAuto() === 'none') {
      label = undefined;
    } else if (Nil.is(label) && this.getAuto() === 'labels') {
      label = this.getDefaultLabel();
    }

    return label;
  }

  getLocals(): CheckboxLocals {
    const locals = super.getLocals();
    const options = this.props.options as CheckboxOptions;

    let checkboxLabel: string | undefined | null = this.getLabel();
    if (Nil.is(this.props.options.label) && this.getAuto() === 'none') {
      checkboxLabel = null;
    }

    const checkboxLocals: CheckboxLocals = {
      ...locals,
      label: checkboxLabel,
    };

    if (options.help !== undefined) {
      checkboxLocals.help = options.help;
    }

    return checkboxLocals;
  }

  hasError(): boolean {
    return super.hasError();
  }
}

Checkbox.transformer = {
  format: (value: unknown) => (Nil.is(value) ? false : value),
  parse: (value: unknown) => value,
};
