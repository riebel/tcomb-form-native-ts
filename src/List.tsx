import React from 'react';
import { TextStyle } from 'react-native';
import { Component } from './Component';
import {
  ListLocals,
  ListOptions,
  ListItem,
  Button,
  ComponentProps,
  Transformer,
  TcombType,
  ComponentOptions,
} from './types';
import {
  getTypeFromUnion,
  move,
  getFormComponentName,
  getComponentOptions,
  isTcombType,
} from './util';
import { Textbox } from './Textbox';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { Struct } from './Struct';

const t = require('tcomb-validation');
const Nil = t.Nil;

export class List extends Component<ListLocals> {
  static transformer: Transformer;

  getTemplate(): React.ComponentType<ListLocals> {
    const options = this.props.options as ListOptions;
    return (options.template || this.props.ctx.templates.list) as React.ComponentType<ListLocals>;
  }

  getItemType(): TcombType | null {
    const type = this.props.type as TcombType;
    if (!type || !type.meta || !type.meta.type) {
      return null;
    }
    return type.meta.type;
  }

  private keys: string[];
  private readonly itemRefs: Record<number, Component | null> = {};

  constructor(props: ComponentProps) {
    super(props);

    const initialValue = this.state.value as unknown[];
    this.keys = (Array.isArray(initialValue) ? initialValue : []).map(() =>
      props.ctx.uidGenerator.next(),
    );
  }

  hasError(): boolean {
    if (this.props.options.hasError) {
      return true;
    }

    const baseHasError = super.hasError();
    if (baseHasError) {
      return true;
    }

    const currentValue = this.state.value as unknown[];
    const isEmpty = !Array.isArray(currentValue) || currentValue.length === 0;
    const isRequired = !this.typeInfo.isMaybe;
    const hasBeenTouched = this.hasBeenTouched();
    const validationAttempted = this.hasValidationBeenAttempted();

    if (!isRequired) {
      return false;
    }

    const isNullyValues =
      Array.isArray(currentValue) &&
      currentValue.every(item => item === null || item === undefined);
    const isCurrentlyInvalid = isEmpty || isNullyValues;

    return isCurrentlyInvalid && (hasBeenTouched || validationAttempted);
  }

  componentDidUpdate(prevProps: ComponentProps): void {
    super.componentDidUpdate(prevProps);

    if (prevProps.options.hasError !== this.props.options.hasError) {
      if (this.props.options.hasError === false && this.state.hasError) {
        this.setState({ hasError: false });
      }
    }

    if (this.props.value !== prevProps.value) {
      const formattedValue = this.getTransformer().format(this.props.value) as unknown[];
      this.keys = toSameLength(formattedValue, this.keys, this.props.ctx.uidGenerator);
    }
  }

  private emitChange(value: unknown[], keys: string[], path: string[], kind?: string): void {
    this.keys = keys;
    this.setState({ value }, () => {
      if (this.props.onChange) {
        this.props.onChange(value, path);
      }

      const itemErrorStates: Record<number, boolean | undefined> = {};
      Object.keys(this.itemRefs).forEach(key => {
        const index = parseInt(key, 10);
        const ref = this.itemRefs[index];
        itemErrorStates[index] = ref?.state?.hasError;
      });

      if (this.state) {
        this.validate();
      }

      Object.keys(this.itemRefs).forEach(key => {
        const index = parseInt(key, 10);
        const ref = this.itemRefs[index];
        if (ref && ref.setState) {
          const previousHasError = itemErrorStates[index];
          if (typeof previousHasError === 'boolean') {
            ref.setState({ hasError: previousHasError });
          }
        }
      });

      if (kind === 'itemChange' && Array.isArray(value)) {
        value.forEach((itemValue, index) => {
          const itemRef = this.itemRefs[index];
          if (itemRef && typeof itemRef.validate === 'function') {
            if (itemRef.state && itemRef.state.value !== itemValue) {
              itemRef.setState({ value: itemValue });
            }
          }
        });
      }
    });
  }

  add = (): void => {
    const value = this.state.value as unknown[];
    const currentArray = Array.isArray(value) ? value : [];
    const newValue = [...currentArray, null];
    const newKeys = [...this.keys, this.props.ctx.uidGenerator.next()];
    this.emitChange(
      newValue,
      newKeys,
      this.props.ctx.path.concat(String(newValue.length - 1)),
      'add',
    );
  };

  remove = (index: number): void => {
    const value = this.state.value as unknown[];
    const currentArray = Array.isArray(value) ? value : [];
    const newValue = [...currentArray];
    newValue.splice(index, 1);
    const newKeys = [...this.keys];
    newKeys.splice(index, 1);
    this.emitChange(newValue, newKeys, this.props.ctx.path.concat(String(index)), 'remove');
  };

  moveUp = (index: number): void => {
    if (index > 0) {
      const value = this.state.value as unknown[];
      const currentArray = Array.isArray(value) ? value : [];
      const newValue = [...currentArray];
      move(newValue, index, index - 1);
      const newKeys = move([...this.keys], index, index - 1);
      this.emitChange(newValue, newKeys, this.props.ctx.path.concat(String(index)), 'moveUp');
    }
  };

  moveDown = (index: number): void => {
    const value = this.state.value as unknown[];
    const currentArray = Array.isArray(value) ? value : [];
    if (index < currentArray.length - 1) {
      const newValue = [...currentArray];
      move(newValue, index, index + 1);
      const newKeys = move([...this.keys], index, index + 1);
      this.emitChange(newValue, newKeys, this.props.ctx.path.concat(String(index)), 'moveDown');
    }
  };

  onItemChange =
    (index: number) =>
    (itemValue: unknown): void => {
      const value = this.state.value as unknown[];
      const currentArray = Array.isArray(value) ? value : [];
      const newValue = [...currentArray];
      newValue[index] = itemValue;
      this.emitChange(newValue, this.keys, this.props.ctx.path.concat(String(index)), 'itemChange');
    };

  getItems(): ListItem[] {
    const { options, ctx } = this.props;

    const value = this.state.value as unknown[];

    if (!value || !Array.isArray(value)) {
      return [];
    }

    const itemType = this.getItemType();
    if (!itemType) {
      return [];
    }

    return value.map((itemValue, i) => {
      const type = itemType;
      const actualItemType = getTypeFromUnion(
        type as TcombType | Record<string, unknown>,
        itemValue,
      );
      const itemOptions = getComponentOptions(
        (options as ListOptions).item,
        {},
        itemValue,
        type as TcombType | Record<string, unknown>,
      );

      const ItemComponent = this.getItemComponent(
        actualItemType as TcombType | Record<string, unknown>,
        itemOptions,
      );
      const i18n = this.getI18n();
      const buttons: Button[] = [];

      if (!(options as ListOptions).disableRemove) {
        buttons.push({
          type: 'remove',
          label: i18n.remove ?? 'Remove',
          click: () => this.remove(i),
          disabled: false,
        });
      }

      if (!(options as ListOptions).disableOrder) {
        buttons.push(
          {
            type: 'moveUp',
            label: i18n.up ?? 'Up',
            click: () => this.moveUp(i),
            disabled: false,
          },
          {
            type: 'moveDown',
            label: i18n.down ?? 'Down',
            click: () => this.moveDown(i),
            disabled: false,
          },
        );
      }

      return {
        input: React.createElement(ItemComponent, {
          ref: (ref: unknown) => {
            this.itemRefs[i] = ref as Component | null;
          },
          type: actualItemType,
          options: {
            ...itemOptions,
            hasError: undefined,
          },
          value: itemValue,
          onChange: (val: unknown, path?: string[], kind?: string) => this.onItemChange(i)(val),
          ctx: {
            context: ctx.context,
            uidGenerator: ctx.uidGenerator,
            auto: this.getAuto(),
            config: this.getConfig(),
            label: undefined,
            i18n: this.getI18n(),
            stylesheet: this.getStylesheet(),
            templates: ctx.templates,
            path: ctx.path.concat(String(i)),
          },
          context: this.props.context,
        } as ComponentProps),
        key: this.keys[i],
        buttons: buttons,
      };
    });
  }

  private getItemComponent(
    type: TcombType | Record<string, unknown>,
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
      throw new Error(`[tcomb-form-native] Component ${componentName} not found in List`);
    }

    return ComponentClass;
  }

  getLocals(): ListLocals {
    const locals = super.getLocals();
    const options = this.props.options as ListOptions;

    const i18n = this.getI18n();

    const listLocals: ListLocals = {
      ...locals,
      add: {
        disabled: Boolean(options.disableAdd),
        click: options.disableAdd ? () => {} : this.add,
        label: i18n.add ?? 'Add',
        type: 'add',
      },
      items: this.getItems(),
      error: locals.error || '',
      hidden: Boolean(locals.hidden),
      label: String(locals.label || ''),
      stylesheet: locals.stylesheet as { [index: string]: { [index: string]: TextStyle } },
    };

    return listLocals;
  }

  isValueNully(): boolean {
    const value = this.state.value as unknown[];
    if (!Array.isArray(value) || value.length === 0) {
      return true;
    }
    return value.every(item => item === null || item === undefined);
  }

  removeErrors(): void {
    this.setState({ hasError: false });
    Object.keys(this.itemRefs).forEach(idx => this.itemRefs[Number(idx)]?.removeErrors?.());
  }

  getValue(): unknown[] {
    const value: unknown[] = [];
    const stateValue = this.state.value as unknown[];

    if (!stateValue || !Array.isArray(stateValue)) {
      return this.getTransformer().parse([]) as unknown[];
    }

    for (let i = 0, len = stateValue.length; i < len; i++) {
      const ref = this.itemRefs[i];
      if (ref) {
        value.push(ref.getValue?.());
      }
    }
    return this.getTransformer().parse(value) as unknown[];
  }

  validate() {
    const result = this.pureValidate();
    const isValid = result.isValid();
    const wasInternalHasError = this.state.hasError;

    this.setState({ hasError: !isValid });

    // If validation state changed from error to valid, notify parent to re-validate
    if (wasInternalHasError && isValid) {
      // Trigger parent validation by emitting a change event
      setTimeout(() => {
        if (this.props.onChange) {
          // Emit the current value to trigger parent validation
          this.props.onChange(this.state.value, this.props.ctx.path, 'validationStateChange');
        }
      }, 0);
    }

    return result;
  }

  pureValidate() {
    const t = require('tcomb-validation');
    let value: unknown[] = [];
    let errors: unknown[] = [];

    const currentValue = this.getTransformer().format(this.state.value) as unknown[];
    const isEmptyArray = !currentValue || !Array.isArray(currentValue) || currentValue.length === 0;
    const isNullyValues =
      Array.isArray(currentValue) &&
      currentValue.every(item => item === null || item === undefined);

    // For non-required (maybe) lists, empty arrays or arrays with all null values are valid
    if (this.typeInfo.isMaybe && (isEmptyArray || isNullyValues)) {
      return new t.ValidationResult({ errors: [], value: null });
    }

    // For non-required lists with some values, validate individual items but don't fail the list
    if (
      this.typeInfo.isMaybe &&
      currentValue &&
      Array.isArray(currentValue) &&
      currentValue.length > 0
    ) {
      for (let i = 0, len = currentValue.length; i < len; i++) {
        const result = this.itemRefs[i]?.validate?.();
        if (result) {
          // For non-required lists, we collect item validation results but don't fail the list itself
          value.push(result.value);
        }
      }
      return new t.ValidationResult({ errors: [], value });
    }

    // For required lists, empty arrays or arrays with all null values are invalid
    if (!this.typeInfo.isMaybe && (isEmptyArray || isNullyValues)) {
      const errorMessage = this.getI18n()?.required || 'This field is required';
      return new t.ValidationResult({
        errors: [
          {
            message: errorMessage,
            path: this.props.ctx.path,
          },
        ],
        value: [],
      });
    }

    // For required lists with values, validate individual items
    if (currentValue && Array.isArray(currentValue)) {
      for (let i = 0, len = currentValue.length; i < len; i++) {
        const result = this.itemRefs[i]?.validate?.();
        if (result) {
          errors = errors.concat(result.errors);
          value.push(result.value);
        }
      }
    }

    if (this.typeInfo.isSubtype && errors.length === 0) {
      // Only validate with tcomb if we have actual values to validate
      // Empty arrays should not be passed to tcomb subtype validation as it causes errors
      if (value.length > 0) {
        const result = t.validate(value, this.props.type, this.getValidationOptions());
        errors = errors.concat(result.errors);
      }
    }

    return new t.ValidationResult({ errors, value });
  }
}

List.transformer = {
  format: (value: unknown) => {
    if (Nil.is(value)) {
      return [];
    }
    if (!Array.isArray(value)) {
      return [value];
    }
    return value;
  },
  parse: (value: unknown) => value,
};
function toSameLength(value: unknown[], keys: string[], uidGenerator: { next: () => string }) {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  if (value.length === keys.length) {
    return keys;
  }
  const ret: string[] = [];
  for (let i = 0, len = value.length; i < len; i++) {
    ret[i] = keys[i] || uidGenerator.next();
  }
  return ret;
}
