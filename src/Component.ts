import React, { PureComponent } from 'react';
import {
  ComponentLocals,
  ComponentOptions,
  ComponentProps,
  ComponentState,
  TcombType,
  Transformer,
  TypeInfo,
  ValidationOptions,
  ValidationResult,
} from './types';
import { getTypeInfo, isNil, merge, getFormComponentName, isTcombType } from './util';
import { t, Nil, SOURCE } from './tcomb';
import { ValidationUtils } from './validation/utils';

export abstract class Component<
  TLocals extends ComponentLocals = ComponentLocals,
> extends PureComponent<ComponentProps, ComponentState> {
  protected typeInfo: TypeInfo;

  constructor(props: ComponentProps) {
    super(props);

    this.typeInfo = getTypeInfo(props.type);
    this.state = {
      hasError: false,
      value: this.getTransformer().format(props.value),
      hasBeenTouched: false,
      validationAttempted: false,
    } as const;
  }

  getTransformer(): Transformer {
    return this.props.options.transformer || Component.transformer;
  }

  static transformer: Transformer;

  static getComponentRegistry(): Record<string, React.ComponentType<ComponentProps>> {
    // Use dynamic imports to avoid circular dependencies
    const { Textbox } = require('./Textbox');
    const { Select } = require('./Select');
    const { Checkbox } = require('./Checkbox');
    const { DatePicker } = require('./DatePicker');
    const { List } = require('./List');
    const { Struct } = require('./Struct');

    return {
      Textbox,
      Select,
      Checkbox,
      DatePicker,
      List,
      Struct,
    };
  }

  static resolveComponent(
    type: TcombType | Record<string, unknown> | object | Function,
    options: ComponentOptions,
    containerName: string = 'Component',
  ): React.ComponentType<ComponentProps> {
    if (options.factory) {
      return options.factory as React.ComponentType<ComponentProps>;
    }

    if (isTcombType(type) && 'getTcombFormFactory' in type) {
      return type.getTcombFormFactory!(options);
    }

    const componentName = getFormComponentName(type, options);
    const componentRegistry = Component.getComponentRegistry();
    const ComponentClass = componentRegistry[componentName as keyof typeof componentRegistry];

    if (!ComponentClass) {
      throw new Error(
        `[tcomb-form-native] Component ${componentName} not found in ${containerName}`,
      );
    }

    return ComponentClass;
  }

  componentDidUpdate(prevProps: ComponentProps): void {
    const stateUpdates: Partial<ComponentState> = {};
    let needsUpdate = false;

    if (this.props.type !== prevProps.type) {
      this.typeInfo = getTypeInfo(this.props.type);
    }

    if (this.props.value !== prevProps.value) {
      stateUpdates.value = this.getTransformer().format(this.props.value);
      needsUpdate = true;
    }

    if (this.props.ctx.validationAttempted && !this.state.validationAttempted) {
      stateUpdates.validationAttempted = true;
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.setState(stateUpdates as Pick<ComponentState, keyof ComponentState>);
    }

    if (prevProps.options.hasError !== this.props.options.hasError) {
      this.forceUpdate();
    }
  }

  onChange = (value: unknown): void => {
    this.setState({ value, hasBeenTouched: true }, () => {
      this.props.onChange?.(value, this.props.ctx.path);
    });
  };

  onBlur = (): void => {
    this.setState({ hasBeenTouched: true });
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

  hasBeenTouched(): boolean {
    return this.state.hasBeenTouched;
  }

  pureValidate(): ValidationResult {
    if (
      typeof this.props.type !== 'object' ||
      this.props.type === null ||
      !('meta' in this.props.type) ||
      !('is' in this.props.type)
    ) {
      return ValidationUtils.createSuccessResult(this.getValue());
    }
    return t.validate(this.getValue(), this.props.type, this.getValidationOptions());
  }

  validate(): ValidationResult {
    const result = this.pureValidate();
    this.setState({ hasError: !result.isValid(), validationAttempted: true });
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
      const isExplicitlyRequired = this.isFieldRequired();
      const suffix =
        this.typeInfo.isMaybe && !isExplicitlyRequired
          ? i18n?.optional || ''
          : i18n?.required || '';
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
        const isExplicitlyRequired = this.isFieldRequired();

        const suffix =
          this.typeInfo.isMaybe && !isExplicitlyRequired
            ? i18n?.optional || ''
            : i18n?.required || '';

        label = label + suffix;
      }
    }

    return label;
  }

  private isListItem(): boolean {
    const path = this.props.ctx.path;
    return path && path.length > 0 && /^\d+$/.test(path[path.length - 1]);
  }

  private isFieldRequired(): boolean {
    const path = this.props.ctx.path;

    if (this.props.type && typeof this.props.type === 'object' && 'meta' in this.props.type) {
      const meta = (this.props.type as { meta: { isRequired?: boolean } }).meta;
      if (meta && meta.isRequired === true) {
        return true;
      }
    }

    const context = this.props.context || this.props.ctx.context;
    if (
      context &&
      typeof context === 'object' &&
      'required' in context &&
      Array.isArray(context.required)
    ) {
      const fieldName = path && path.length > 0 ? path[path.length - 1] : '';
      const isRequired = context.required.includes(fieldName);

      if (isRequired) {
        return true;
      }
    }

    // Navigate through original JSON schema to find required fields for nested paths
    if (context && typeof context === 'object' && 'originalSchema' in context) {
      const originalSchema = context.originalSchema as Record<string, unknown>;
      if (originalSchema && typeof originalSchema === 'object') {
        let currentSchemaLevel = originalSchema;

        for (let i = 0; i < (path?.length || 0) - 1; i++) {
          const pathSegment = path![i];
          if (currentSchemaLevel.properties && typeof currentSchemaLevel.properties === 'object') {
            const properties = currentSchemaLevel.properties as Record<string, unknown>;
            if (properties[pathSegment] && typeof properties[pathSegment] === 'object') {
              currentSchemaLevel = properties[pathSegment] as Record<string, unknown>;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        if (
          currentSchemaLevel.required &&
          Array.isArray(currentSchemaLevel.required) &&
          path &&
          path.length > 0
        ) {
          const fieldName = path[path.length - 1];
          const isRequired = currentSchemaLevel.required.includes(fieldName);

          if (isRequired) {
            return true;
          }
        }
      }
    }

    return !this.typeInfo.isMaybe;
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
    if (this.props.options.hasError || this.state.hasError) {
      return true;
    }

    const isRequired = this.isFieldRequired();
    const isEmpty = this.isValueEmpty();
    const validationAttempted =
      this.state.validationAttempted || this.props.ctx.validationAttempted;
    const hasBeenTouched = this.hasBeenTouched();

    return !!(isRequired && isEmpty && (hasBeenTouched || validationAttempted));
  }

  protected isValueEmpty(): boolean {
    return this.state.value === null || this.state.value === undefined || this.state.value === '';
  }

  getConfig(): Record<string, unknown> {
    const ctxConfig = this.props.ctx.config ?? {};
    const optionsConfig = this.props.options.config ?? {};
    return merge(ctxConfig, optionsConfig);
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
      stylesheet: stylesheet ?? {},
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
  format: (value: unknown) => (isNil(value) ? '' : value),
  parse: (value: unknown) => value,
};
