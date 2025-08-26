import React from 'react';
import { Component } from './Component';
import { StructLocals, StructOptions, ComponentProps, TcombType, ComponentOptions } from './types';
import {
  getTypeFromUnion,
  getComponentOptions,
  getFormComponentName,
  isTcombType,
  humanize,
} from './util';
import { Textbox } from './Textbox';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { List } from './List';

export class Struct extends Component<StructLocals> {
  getTemplate(): React.ComponentType<StructLocals> {
    const options = this.props.options as StructOptions;
    return (options.template ||
      this.props.ctx.templates.struct) as React.ComponentType<StructLocals>;
  }

  getOrder(): string[] {
    const options = this.props.options as StructOptions;

    if (isTcombType(this.props.type) && this.props.type.meta.props) {
      const props = this.props.type.meta.props;
      if (options.order) {
        return options.order;
      }
      return Object.keys(props);
    }

    if (options.order) {
      return options.order;
    }
    return [];
  }

  onFieldChange = (fieldName: string, fieldValue: unknown, path?: string[]): void => {
    const value = { ...(this.state.value as Record<string, unknown>) };
    value[fieldName] = fieldValue;
    this.setState({ value }, () => {
      if (this.props.onChange) {
        this.props.onChange(value, path || this.props.ctx.path.concat(fieldName));
      }
    });
  };

  getInputs(): Record<string, React.ReactElement> {
    const { ctx, options } = this.props;
    const value = (this.state.value as Record<string, unknown>) || {};

    let props: Record<string, unknown>;
    if (isTcombType(this.props.type) && this.props.type.meta.props) {
      props = this.props.type.meta.props;
    } else {
      props = {};
    }

    const inputs: Record<string, React.ReactElement> = {};
    const fieldsOptions = (options as StructOptions).fields || {};

    for (const prop in props) {
      if (Object.prototype.hasOwnProperty.call(props, prop)) {
        const type = props[prop];
        const propValue = value[prop];
        const propType = getTypeFromUnion(type as TcombType | Record<string, unknown>, propValue);
        const propOptions = getComponentOptions(
          fieldsOptions[prop],
          {},
          propValue,
          type as TcombType | Record<string, unknown>,
        );

        const FieldComponent = this.getFieldComponent(propType, propOptions);
        inputs[prop] = React.createElement(FieldComponent, {
          key: prop,
          ref: (ref: unknown) => {
            this.inputRefs[prop] = ref as Component | null;
          },
          type: propType,
          options: propOptions,
          value: propValue,
          onChange: (value: unknown, path: string[]) => this.onFieldChange(prop, value, path),
          ctx: {
            context: ctx.context,
            uidGenerator: ctx.uidGenerator,
            auto: this.getAuto(),
            config: this.getConfig(),
            label: propOptions.label || humanize(prop),
            i18n: this.getI18n(),
            stylesheet: this.getStylesheet(),
            templates: ctx.templates,
            path: ctx.path.concat(prop),
          },
          context: this.props.context,
        } as ComponentProps);
      }
    }

    return inputs;
  }

  private getFieldComponent(
    type: TcombType | Record<string, unknown> | object | Function,
    options: ComponentOptions,
  ): React.ComponentType<ComponentProps> {
    const componentRegistry: Record<string, React.ComponentType<ComponentProps>> = {
      Textbox: Textbox as React.ComponentType<ComponentProps>,
      Select: Select as React.ComponentType<ComponentProps>,
      Checkbox: Checkbox as React.ComponentType<ComponentProps>,
      DatePicker: DatePicker as React.ComponentType<ComponentProps>,
      List: List as React.ComponentType<ComponentProps>,
      Struct: Struct as React.ComponentType<ComponentProps>,
    };

    if (options.factory) {
      return options.factory as React.ComponentType<ComponentProps>;
    }
    if (
      isTcombType(type) &&
      'getTcombFormFactory' in type &&
      typeof type.getTcombFormFactory === 'function'
    ) {
      return type.getTcombFormFactory(options);
    }

    const componentName = getFormComponentName(type, options);
    const ComponentClass = componentRegistry[componentName as keyof typeof componentRegistry];

    if (!ComponentClass) {
      throw new Error(`[tcomb-form-native] Component ${componentName} not found in Struct`);
    }

    return ComponentClass;
  }

  getLocals(): StructLocals {
    const locals = super.getLocals();
    const inputs = this.getInputs();
    const order = this.getOrder();

    const structLocals: StructLocals = {
      ...locals,
      order: order,
      inputs: inputs,
    };

    return structLocals;
  }

  private readonly inputRefs: Record<string, Component | null> = {};
  isValueNully(): boolean {
    return Object.keys(this.inputRefs).every(ref => this.inputRefs[ref]?.isValueNully?.() === true);
  }

  removeErrors(): void {
    this.setState({ hasError: false });
    Object.keys(this.inputRefs).forEach(ref => {
      this.inputRefs[ref]?.removeErrors?.();
    });
  }

  getValue(): Record<string, unknown> {
    const value: Record<string, unknown> = {};
    Object.keys(this.inputRefs).forEach(ref => {
      value[ref] = this.inputRefs[ref]?.getValue?.();
    });
    return this.getTransformer().parse(value) as Record<string, unknown>;
  }

  validate() {
    const t = require('tcomb-validation');
    let value: Record<string, unknown> = {};
    let errors: unknown[] = [];
    let hasError = false;

    if (this.typeInfo.isMaybe && this.isValueNully()) {
      this.removeErrors();
      return new t.ValidationResult({ errors: [], value: null });
    }

    Object.keys(this.inputRefs).forEach(ref => {
      const child = this.inputRefs[ref];
      if (child && typeof child.validate === 'function') {
        const result = child.validate();
        errors = errors.concat(result.errors);
        value[ref] = result.value;
      }
    });

    if (errors.length === 0) {
      const InnerType = this.typeInfo.innerType;
      if (typeof InnerType === 'function') {
        value = new (InnerType as new (v: unknown) => Record<string, unknown>)(value);
      }

      if (this.typeInfo.isSubtype) {
        const result = t.validate(value, this.props.type, this.getValidationOptions());
        hasError = !result.isValid();
        errors = errors.concat(result.errors);
      }
    }

    this.setState({ hasError });
    return new t.ValidationResult({ errors, value });
  }
}
