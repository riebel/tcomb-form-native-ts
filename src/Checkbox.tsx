import React from 'react';
import { Component } from './Component';
import { CheckboxLocals, CheckboxOptions, Transformer } from './types';
import { Nil } from './tcomb';
import { TransformerFactory } from './transformers/factory';

export class Checkbox extends Component<CheckboxLocals> {
  static transformer: Transformer;

  getTransformer(): Transformer {
    return this.props.options.transformer ?? Checkbox.transformer;
  }

  getTemplate(): React.ComponentType<CheckboxLocals> {
    const options = this.props.options as CheckboxOptions;
    return options.template ?? this.props.ctx.templates.checkbox;
  }

  getLabel(): string | undefined {
    let label = this.props.options.label ?? this.props.options.legend;

    if (Nil.is(label)) {
      const autoMode = this.getAuto();
      if (autoMode === 'none') {
        label = undefined;
      } else if (autoMode === 'labels') {
        label = this.getDefaultLabel();
      }
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
}

Checkbox.transformer = TransformerFactory.createBooleanTransformer();
