import React from 'react';
import { Component } from './Component';
import {
  StructLocals,
  StructOptions,
  ComponentProps,
  TcombType,
  ComponentOptions,
  ValidationError,
} from './types';
import {
  getTypeFromUnion,
  getComponentOptions,
  getFormComponentName,
  isTcombType,
  humanize,
  inferTypeFromFieldOptions,
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

    if (
      typeof this.props.type === 'object' &&
      this.props.type !== null &&
      !Array.isArray(this.props.type)
    ) {
      const plainObject = this.props.type as Record<string, unknown>;
      if (plainObject.properties && typeof plainObject.properties === 'object') {
        const schemaProps = plainObject.properties as Record<string, unknown>;
        if (options.order) {
          return options.order;
        }
        return Object.keys(schemaProps);
      }
    }
    const fieldsOptions = options.fields || {};
    if (Object.keys(fieldsOptions).length > 0) {
      if (options.order) {
        return options.order;
      }
      return Object.keys(fieldsOptions);
    }

    if (options.order) {
      return options.order;
    }
    return [];
  }

  onFieldChange = (
    fieldName: string,
    fieldValue: unknown,
    path?: string[],
    kind?: string,
  ): void => {
    const value = { ...(this.state.value as Record<string, unknown>) };
    value[fieldName] = fieldValue;
    this.setState({ value }, () => {
      if (this.props.onChange) {
        this.props.onChange(value, path || this.props.ctx.path.concat(fieldName));
      }

      if (kind === 'validationStateChange') {
        // Don't trigger full validation on all fields when one field changes
        // This prevents untouched fields from showing validation errors
        // Individual fields will validate themselves when touched or when form is submitted
        setTimeout(() => {
          this.updateValidationState();
        }, 0);
      }
    });
  };

  updateValidationState(): void {
    let hasError = false;

    // Check if any child components currently have errors
    Object.keys(this.inputRefs).forEach(ref => {
      const child = this.inputRefs[ref];
      if (child && typeof child.hasError === 'function' && child.hasError()) {
        hasError = true;
      }
    });

    // Update our own error state based on child states, but don't force validation
    this.setState({ hasError });
  }

  getInputs(): Record<string, React.ReactElement> {
    const { ctx, options } = this.props;
    const value = (this.state.value as Record<string, unknown>) || {};

    let props: Record<string, unknown>;
    const fieldsOptions = (options as StructOptions).fields || {};

    if (isTcombType(this.props.type) && this.props.type.meta.props) {
      props = this.props.type.meta.props;

      const t = require('tcomb-validation');
      const modifiedProps: Record<string, unknown> = {};
      for (const [propName, propType] of Object.entries(props)) {
        if (propType && typeof propType === 'object' && 'meta' in propType) {
          const meta = (propType as { meta: { kind: string } }).meta;

          if (meta.kind === 'struct') {
            modifiedProps[propName] = t.maybe(propType as TcombType);
          } else {
            modifiedProps[propName] = propType;
          }
        } else {
          modifiedProps[propName] = propType;
        }
      }
      props = modifiedProps;
    } else if (
      typeof this.props.type === 'object' &&
      this.props.type !== null &&
      !Array.isArray(this.props.type)
    ) {
      const plainObject = this.props.type as Record<string, unknown>;
      if (plainObject.properties && typeof plainObject.properties === 'object') {
        const schemaProps = plainObject.properties as Record<string, unknown>;
        props = {};

        for (const [key, schemaProp] of Object.entries(schemaProps)) {
          if (typeof schemaProp === 'object' && schemaProp !== null) {
            const propDef = schemaProp as Record<string, unknown>;

            if (propDef.options && typeof propDef.options === 'object') {
              fieldsOptions[key] = {
                ...fieldsOptions[key],
                ...(propDef.options as Record<string, unknown>),
              };
            }

            if (propDef.type === 'string') {
              props[key] = { meta: { kind: 'irreducible' }, displayName: 'String' };
            } else if (propDef.type === 'number') {
              props[key] = { meta: { kind: 'irreducible' }, displayName: 'Number' };
            } else if (propDef.type === 'boolean') {
              props[key] = { meta: { kind: 'irreducible' }, displayName: 'Boolean' };
            } else if (propDef.type === 'object' && propDef.properties) {
              props[key] = propDef;
            } else {
              props[key] = { meta: { kind: 'irreducible' }, displayName: 'String' };
            }
          }
        }
      } else {
        props = {};
        for (const [fieldName, fieldOptions] of Object.entries(fieldsOptions)) {
          if (fieldOptions && typeof fieldOptions === 'object' && 'fields' in fieldOptions) {
            const isStructRequired = false;

            const t = require('tcomb-validation');
            let resultType: TcombType;
            if (isStructRequired) {
              resultType = t.struct({}, 'Struct');
              props[fieldName] = resultType;
            } else {
              const baseStructType = t.struct({}, 'Struct');
              resultType = t.maybe(baseStructType);
              props[fieldName] = resultType;
            }
          } else if (fieldOptions && typeof fieldOptions === 'object') {
            props[fieldName] = inferTypeFromFieldOptions(fieldOptions as Record<string, unknown>);
          }
        }
      }
    } else {
      props = {};
      for (const [fieldName, fieldOptions] of Object.entries(fieldsOptions)) {
        if (fieldOptions && typeof fieldOptions === 'object' && 'fields' in fieldOptions) {
          const isStructRequired = false;

          const t = require('tcomb-validation');
          let resultType: TcombType;
          if (isStructRequired) {
            resultType = t.struct({}, 'Struct');
            props[fieldName] = resultType;
          } else {
            const baseStructType = t.struct({}, 'Struct');
            resultType = t.maybe(baseStructType);
            props[fieldName] = resultType;
          }
        } else if (fieldOptions && typeof fieldOptions === 'object') {
          props[fieldName] = inferTypeFromFieldOptions(fieldOptions as Record<string, unknown>);
        }
      }
    }

    const inputs: Record<string, React.ReactElement> = {};

    for (const prop in props) {
      if (Object.prototype.hasOwnProperty.call(props, prop)) {
        const type = props[prop];
        const propValue = value[prop];

        const propType = getTypeFromUnion(type as TcombType | Record<string, unknown>, propValue);

        const baseFieldOptions = fieldsOptions[prop] || {};
        let fieldLabel = baseFieldOptions.label;

        if (!fieldLabel) {
          fieldLabel = humanize(prop);
        }

        const fieldHasError = this.getFieldError(prop) !== undefined;

        let finalPropType = propType;
        let finalPropOptions = { ...baseFieldOptions, hasError: fieldHasError, label: fieldLabel };

        if (
          baseFieldOptions &&
          typeof baseFieldOptions === 'object' &&
          'fields' in baseFieldOptions
        ) {
          const isStructRequired = false;

          const t = require('tcomb-validation');
          if (isStructRequired) {
            finalPropType = t.struct({}, 'Struct');
          } else {
            const baseStructType = t.struct({}, 'Struct');
            finalPropType = t.maybe(baseStructType);
          }

          finalPropOptions = {
            ...baseFieldOptions,
            hasError: fieldHasError,
            label: fieldLabel,
          };
        }

        const propOptions = getComponentOptions(
          finalPropOptions,
          {},
          propValue,
          finalPropType as TcombType | Record<string, unknown>,
        );

        const FieldComponent = this.getFieldComponent(finalPropType, propOptions);

        inputs[prop] = React.createElement(FieldComponent, {
          key: prop,
          ref: (ref: unknown) => {
            this.inputRefs[prop] = ref as Component | null;
          },
          type: finalPropType,
          options: propOptions,
          value: propValue,
          onChange: (value: unknown, path: string[], kind?: string) =>
            this.onFieldChange(prop, value, path, kind),
          ctx: {
            context: ctx.context,
            uidGenerator: ctx.uidGenerator,
            auto: this.getAuto(),
            config: this.getConfig(),
            label: propOptions.label || fieldLabel,
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
  private fieldErrors: Record<string, string> = {};

  getFieldError(fieldName: string): string | undefined {
    return this.fieldErrors[fieldName];
  }

  isValueNully(): boolean {
    return Object.keys(this.inputRefs).every(ref => this.inputRefs[ref]?.isValueNully?.() === true);
  }

  removeErrors(): void {
    this.setState({ hasError: false });
    this.fieldErrors = {};
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

    const newFieldErrors: Record<string, string> = { ...this.fieldErrors };

    if (this.typeInfo.isMaybe && this.isValueNully()) {
      this.removeErrors();
      return new t.ValidationResult({ errors: [], value: null });
    }

    Object.keys(this.inputRefs).forEach(ref => {
      const child = this.inputRefs[ref];
      if (child && typeof child.validate === 'function') {
        try {
          const result = child.validate();

          errors = errors.concat(result.errors);
          value[ref] = result.value;

          if (result.errors && result.errors.length > 0) {
            const fieldErrors = result.errors.filter((error: ValidationError) => {
              return !error.path || error.path.length === 0 || error.path[0] === ref;
            });

            if (fieldErrors.length > 0) {
              const errorMessage = fieldErrors[0].message || 'Validation error';
              if (
                errorMessage.includes('Invalid value null') &&
                errorMessage.includes('expected one of')
              ) {
                newFieldErrors[ref] = 'Please select a value';
              } else {
                newFieldErrors[ref] = errorMessage;
              }
            } else {
              delete newFieldErrors[ref];
            }
          } else {
            delete newFieldErrors[ref];
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Validation error';
          if (
            errorMessage.includes('Invalid value null') &&
            errorMessage.includes('expected one of')
          ) {
            newFieldErrors[ref] = 'Please select a value';
          } else {
            newFieldErrors[ref] = 'Validation error';
          }
          errors.push({
            message: newFieldErrors[ref],
            path: [ref],
            actual: child.getValue?.() || null,
            expected: 'valid value',
          });
        }
      } else {
        delete newFieldErrors[ref];
      }
    });

    if (errors.length === 0) {
      const InnerType = this.typeInfo.innerType;
      if (typeof InnerType === 'function') {
        try {
          value = new (InnerType as new (v: unknown) => Record<string, unknown>)(value);
        } catch {
          // Ignore constructor errors
        }
      }

      if (this.typeInfo.isSubtype) {
        try {
          const result = t.validate(value, this.props.type, this.getValidationOptions());
          hasError = !result.isValid();
          errors = errors.concat(result.errors);

          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((error: ValidationError) => {
              if (error.path && error.path.length > 0) {
                const fieldName = error.path[0];
                if (!newFieldErrors[fieldName]) {
                  newFieldErrors[fieldName] = error.message || 'Validation error';
                }
              }
            });
          }
        } catch {
          // Ignore validation errors
        }
      }
    }

    this.fieldErrors = newFieldErrors;
    this.setState({ hasError });
    this.forceUpdate();
    return new t.ValidationResult({ errors, value });
  }
}
