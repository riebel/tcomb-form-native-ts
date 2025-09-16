import React from 'react';
import { Component } from './Component';
import {
  ComponentOptions,
  ComponentProps,
  StructLocals,
  StructOptions,
  TcombType,
  ValidationError,
} from './types';
import {
  getComponentOptions,
  getTypeFromUnion,
  humanize,
  inferTypeFromFieldOptions,
  isTcombType,
} from './util';
import { t } from './tcomb';
import { ValidationUtils } from './validation/utils';

export class Struct extends Component<StructLocals> {
  getTemplate(): React.ComponentType<StructLocals> {
    const options = this.props.options as StructOptions;
    return (options.template ??
      this.props.ctx.templates.struct) as React.ComponentType<StructLocals>;
  }

  getOrder(): string[] {
    const options = this.props.options as StructOptions;

    if (isTcombType(this.props.type) && this.props.type.meta?.props) {
      const props = this.props.type.meta.props;
      return options.order ?? Object.keys(props);
    }

    if (ValidationUtils.isNonNullObject(this.props.type)) {
      const plainObject = this.props.type as Record<string, unknown>;
      if (plainObject.properties && typeof plainObject.properties === 'object') {
        const schemaProps = plainObject.properties as Record<string, unknown>;
        return options.order ?? Object.keys(schemaProps);
      }
    }

    const fieldsOptions = options.fields ?? {};
    if (Object.keys(fieldsOptions).length > 0) {
      return options.order ?? Object.keys(fieldsOptions);
    }

    return options.order ?? [];
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
        // Prevent untouched fields from showing validation errors
        setTimeout(() => {
          this.updateValidationState();
        }, 0);
      }
    });
  };

  updateValidationState(): void {
    let hasError = false;

    Object.keys(this.inputRefs).forEach(ref => {
      const child = this.inputRefs[ref];
      if (child && child.hasError()) {
        hasError = true;
      }
    });

    this.setState({ hasError });
  }

  getInputs(): Record<string, React.ReactElement> {
    const { ctx, options } = this.props;
    const value = (this.state.value as Record<string, unknown>) ?? {};

    let props: Record<string, unknown>;
    const fieldsOptions = (options as StructOptions).fields ?? {};

    if (isTcombType(this.props.type) && this.props.type.meta.props) {
      props = this.props.type.meta.props;

      const modifiedProps: Record<string, unknown> = {};
      for (const [propName, propType] of Object.entries(props)) {
        if (propType && typeof propType === 'object' && 'meta' in propType) {
          const meta = (propType as { meta: { kind: string; isRequired?: boolean } }).meta;

          // Preserve isRequired metadata for tcomb struct fields
          if (meta.isRequired) {
            modifiedProps[propName] = propType;
          } else if (meta.kind === 'struct') {
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

        const requiredFields = Array.isArray(plainObject.required) ? plainObject.required : [];

        for (const [key, schemaProp] of Object.entries(schemaProps)) {
          if (ValidationUtils.isNonNullObject(schemaProp)) {
            const propDef = schemaProp;

            if (propDef.options && typeof propDef.options === 'object') {
              fieldsOptions[key] = {
                ...fieldsOptions[key],
                ...(propDef.options as Record<string, unknown>),
              };
            }

            const isFieldRequired = requiredFields.includes(key);

            if (propDef.type === 'string') {
              props[key] = {
                meta: { kind: 'irreducible', isRequired: isFieldRequired },
                displayName: 'String',
              };
            } else if (propDef.type === 'number') {
              props[key] = {
                meta: { kind: 'irreducible', isRequired: isFieldRequired },
                displayName: 'Number',
              };
            } else if (propDef.type === 'boolean') {
              props[key] = {
                meta: { kind: 'irreducible', isRequired: isFieldRequired },
                displayName: 'Boolean',
              };
            } else if (propDef.type === 'object' && propDef.properties) {
              props[key] = { ...propDef, isRequired: isFieldRequired };
            } else {
              props[key] = {
                meta: { kind: 'irreducible', isRequired: isFieldRequired },
                displayName: 'String',
              };
            }
          }
        }
      } else {
        props = this.processFieldsOptions(fieldsOptions);
      }
    } else {
      props = this.processFieldsOptions(fieldsOptions);
    }

    const inputs: Record<string, React.ReactElement> = {};

    for (const prop in props) {
      if (Object.prototype.hasOwnProperty.call(props, prop)) {
        const type = props[prop];
        const propValue = value[prop];

        const propType = getTypeFromUnion(type as TcombType | Record<string, unknown>, propValue);

        const baseFieldOptions = fieldsOptions[prop] ?? {};
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

        // Pass required field information to child components
        let contextWithRequired = ctx.context;

        // For nested objects, extract and pass their required array
        if (finalPropType && typeof finalPropType === 'object' && 'required' in finalPropType) {
          const nestedObject = finalPropType as Record<string, unknown>;
          if (Array.isArray(nestedObject.required)) {
            contextWithRequired = {
              ...ctx.context,
              required: nestedObject.required,
            };
          }
        } else if (props[prop] && typeof props[prop] === 'object' && 'required' in props[prop]) {
          const originalNestedObject = props[prop] as Record<string, unknown>;
          if (Array.isArray(originalNestedObject.required)) {
            contextWithRequired = {
              ...ctx.context,
              required: originalNestedObject.required,
            };
          }
        } else {
          // Look up required array from original schema attached to root type
          const rootType = this.props.type;
          if (rootType && typeof rootType === 'object' && '_originalSchema' in rootType) {
            const originalSchema = (
              rootType as Record<string, unknown> & { _originalSchema: Record<string, unknown> }
            )._originalSchema;
            if (
              originalSchema &&
              originalSchema.properties &&
              typeof originalSchema.properties === 'object'
            ) {
              const properties = originalSchema.properties as Record<string, unknown>;
              if (properties[prop] && typeof properties[prop] === 'object') {
                const propSchema = properties[prop] as Record<string, unknown>;
                if (propSchema && propSchema.required && Array.isArray(propSchema.required)) {
                  contextWithRequired = {
                    ...ctx.context,
                    required: propSchema.required,
                  };
                }
              }
            }
          }
        }

        if (
          typeof this.props.type === 'object' &&
          this.props.type !== null &&
          !Array.isArray(this.props.type)
        ) {
          const plainObject = this.props.type as Record<string, unknown>;
          if (plainObject.required && Array.isArray(plainObject.required)) {
            contextWithRequired = {
              ...ctx.context,
              required: plainObject.required,
            };
          }
        }

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
            context: contextWithRequired,
            uidGenerator: ctx.uidGenerator,
            auto: this.getAuto(),
            config: this.getConfig(),
            label: propOptions.label || fieldLabel,
            i18n: this.getI18n(),
            stylesheet: this.getStylesheet(),
            templates: ctx.templates,
            path: ctx.path.concat(prop),
            validationAttempted: ctx.validationAttempted,
          },
          context: contextWithRequired,
        } as ComponentProps);
      }
    }

    return inputs;
  }

  private processFieldsOptions(fieldsOptions: Record<string, unknown>): Record<string, TcombType> {
    const props: Record<string, TcombType> = {};

    for (const [fieldName, fieldOptions] of Object.entries(fieldsOptions)) {
      if (fieldOptions && typeof fieldOptions === 'object' && 'fields' in fieldOptions) {
        const isStructRequired = false;

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

    return props;
  }

  private getFieldComponent(
    type: TcombType | Record<string, unknown> | object | Function,
    options: ComponentOptions,
  ): React.ComponentType<ComponentProps> {
    return Component.resolveComponent(type, options, 'Struct');
  }

  getLocals(): StructLocals {
    const locals = super.getLocals();
    const inputs = this.getInputs();
    const order = this.getOrder();

    return {
      ...locals,
      order: order,
      inputs: inputs,
    };
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
    let value: Record<string, unknown> = {};
    let errors: unknown[] = [];
    let hasError = false;

    const newFieldErrors: Record<string, string> = { ...this.fieldErrors };

    if (this.typeInfo.isMaybe && this.isValueNully()) {
      this.removeErrors();
      return ValidationUtils.createSuccessResult(null);
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
              const errorMessage = ValidationUtils.normalizeErrorMessage(
                fieldErrors[0].message || 'Validation error',
              );
              newFieldErrors[ref] = errorMessage;
            } else {
              delete newFieldErrors[ref];
            }
          } else {
            delete newFieldErrors[ref];
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Validation error';
          const normalizedMessage = ValidationUtils.normalizeErrorMessage(errorMessage);
          newFieldErrors[ref] = normalizedMessage;

          errors.push(
            ValidationUtils.createValidationError(
              normalizedMessage,
              [ref],
              child.getValue?.() || null,
              'valid value',
            ),
          );
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
                const normalizedMessage = ValidationUtils.normalizeErrorMessage(
                  error.message || 'Validation error',
                );

                if (!newFieldErrors[fieldName]) {
                  newFieldErrors[fieldName] = normalizedMessage;
                }

                if (error.path.length > 1) {
                  const nestedFieldName = error.path[error.path.length - 1];
                  const nestedFieldKey = `${fieldName}.${nestedFieldName}`;

                  if (!newFieldErrors[nestedFieldKey]) {
                    newFieldErrors[nestedFieldKey] = normalizedMessage;
                  }
                  // Also map directly to the nested field name for child struct components
                  if (!newFieldErrors[nestedFieldName]) {
                    newFieldErrors[nestedFieldName] = normalizedMessage;
                  }
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
    return ValidationUtils.createValidationResult(
      errors.length === 0,
      value,
      errors as ValidationError[],
    );
  }
}
