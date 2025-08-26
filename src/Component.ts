import React from 'react';
import {
  ComponentProps,
  ComponentLocals,
  ValidationResult,
  ValidationOptions,
  TypeInfo,
  Transformer,
} from './types';
import { getTypeInfo, merge, isNil } from './util';

const t = require('tcomb-validation');
const SOURCE = 'tcomb-form-native';
const Nil = t.Nil;

export abstract class Component<
  TLocals extends ComponentLocals = ComponentLocals,
> extends React.Component<ComponentProps, { hasError: boolean; value: unknown }> {
  protected typeInfo: TypeInfo;

  constructor(props: ComponentProps) {
    super(props);

    this.typeInfo = getTypeInfo(props.type);
    this.state = {
      hasError: false,
      value: this.getTransformer().format(props.value),
    };
  }

  getTransformer(): Transformer {
    return this.props.options.transformer || Component.transformer;
  }

  static transformer: Transformer;

  shouldComponentUpdate(
    nextProps: ComponentProps,
    nextState: { hasError: boolean; value: unknown },
  ): boolean {
    const should =
      nextState.value !== this.state.value ||
      nextState.hasError !== this.state.hasError ||
      nextProps.options !== this.props.options ||
      nextProps.type !== this.props.type ||
      nextProps.value !== this.props.value;
    return should;
  }

  componentDidUpdate(prevProps: ComponentProps): void {
    if (this.props.type !== prevProps.type) {
      this.typeInfo = getTypeInfo(this.props.type);
    }
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.getTransformer().format(this.props.value) });
    }
  }

  onChange = (value: unknown): void => {
    this.setState({ value }, () => {
      if (this.props.onChange) {
        this.props.onChange(value, this.props.ctx.path);
      }
    });
  };

  getValidationOptions(): ValidationOptions {
    return {
      path: this.props.ctx.path,
      context: t.mixin(t.mixin({}, this.props.context || this.props.ctx.context), {
        options: this.props.options,
      }),
    };
  }

  getValue(): unknown {
    return this.getTransformer().parse(this.state.value);
  }

  isValueNully(): boolean {
    return Nil.is(this.getValue());
  }

  removeErrors(): void {
    this.setState({ hasError: false });
  }

  pureValidate(): ValidationResult {
    // Validation without side effects (no state updates)
    if (
      typeof this.props.type !== 'object' ||
      this.props.type === null ||
      !('meta' in this.props.type) ||
      !('is' in this.props.type)
    ) {
      return {
        isValid: () => true,
        value: this.getValue(),
        errors: [],
      };
    }
    return t.validate(this.getValue(), this.props.type, this.getValidationOptions());
  }

  validate(): ValidationResult {
    const result = this.pureValidate();
    this.setState({ hasError: !result.isValid() });
    return result;
  }

  getAuto(): 'labels' | 'placeholders' | 'none' {
    return this.props.options.auto || this.props.ctx.auto;
  }

  getI18n() {
    return this.props.options.i18n || this.props.ctx.i18n;
  }

  getDefaultLabel(): string | undefined {
    const ctx = this.props.ctx;
    if (ctx.label) {
      const i18n = this.getI18n();
      const suffix = this.typeInfo.isMaybe ? i18n?.optional || '' : i18n?.required || '';
      return ctx.label + suffix;
    }
  }

  getLabel(): string | undefined {
    let label = this.props.options.label || this.props.options.legend;
    if (Nil.is(label) && this.getAuto() === 'placeholders') {
      label = undefined;
    } else if (Nil.is(label) && this.getAuto() === 'labels') {
      label = this.getDefaultLabel();
    } else if (label) {
      const isListItem = this.isListItem();
      if (!isListItem) {
        const i18n = this.getI18n();
        const suffix = this.typeInfo.isMaybe ? i18n?.optional || '' : i18n?.required || '';
        label = label + suffix;
      }
    }
    return label;
  }

  private isListItem(): boolean {
    // Check if this component is an item within a list (path ends with numeric index)
    const path = this.props.ctx.path;
    return path && path.length > 0 && /^\d+$/.test(path[path.length - 1]);
  }

  getError(): string | undefined {
    if (this.hasError()) {
      const error = this.props.options.error || this.typeInfo.getValidationErrorMessage;
      if (t.Function.is(error)) {
        const validationOptions = this.getValidationOptions();
        return (error as Function)(
          this.props.value,
          validationOptions.path,
          validationOptions.context,
        );
      }
      return error as string;
    }
  }

  hasError(): boolean {
    return this.props.options.hasError || this.state.hasError;
  }

  getConfig(): Record<string, unknown> {
    return merge(this.props.ctx.config || {}, this.props.options.config || {});
  }

  getStylesheet() {
    return this.props.options.stylesheet || this.props.ctx.stylesheet;
  }

  getLocals(): TLocals {
    const stylesheet = this.getStylesheet();
    const baseLocals: ComponentLocals = {
      path: this.props.ctx.path,
      error: this.getError(),
      hasError: this.hasError(),
      label: this.getLabel(),
      help: this.props.options.help,
      onChange: this.onChange,
      config: this.getConfig(),
      value: this.state.value,
      hidden: this.props.options.hidden,
      stylesheet: stylesheet || {},
    };
    return baseLocals as TLocals;
  }

  abstract getTemplate(): React.ComponentType<TLocals>;

  render(): React.ReactElement {
    const locals = this.getLocals();
    t.assert(
      t.Function.is(this.getTemplate),
      `[${SOURCE}] missing getTemplate method of component ${this.constructor.name}`,
    );
    const template = this.getTemplate();
    return React.createElement(template, locals);
  }
}

Component.transformer = {
  format: (value: unknown) => (isNil(value) ? null : value),
  parse: (value: unknown) => value,
};
