import React, { Component } from 'react';
import { validate } from 'tcomb-validation';

import List from './components/List';
import Struct from './components/Struct';
import Checkbox from './fields/Checkbox';
import DatePicker from './fields/DatePicker';
import Select from './fields/Select';
import Textbox from './fields/Textbox';

import {
  TextboxTemplateProps,
  CheckboxTemplateProps,
  SelectTemplateProps,
  DatePickerTemplateProps,
  ListTemplateProps,
  StructTemplateProps,
  TypeWithMeta,
  FormTemplates,
} from './types/template.types';
import { UIDGenerator } from './util';
import { getTypeInfo } from './util';

// Union type for all possible template props
export type AnyTemplateProps<T> =
  | TextboxTemplateProps
  | CheckboxTemplateProps
  | SelectTemplateProps<T>
  | DatePickerTemplateProps
  | ListTemplateProps<T>
  | StructTemplateProps;

type FieldComponentType<T> = React.ComponentType<
  | TextboxTemplateProps
  | CheckboxTemplateProps
  | SelectTemplateProps<T>
  | DatePickerTemplateProps
  | ListTemplateProps<T>
  | StructTemplateProps
>;

export interface FormProps<T> {
  // Accept unknown for legacy callers; we guard at runtime
  type?: unknown;
  value?: T;
  options?: {
    getComponent?: (
      type: TypeWithMeta | null,
      options: Record<string, unknown>,
    ) => FieldComponentType<T>;
    uidGenerator?: UIDGenerator;
    [key: string]: unknown;
  };
  onChange?: (value: T) => void;
  context?: unknown;
  stylesheet?: Record<string, unknown>;
  templates?: FormTemplates;
  i18n?: Record<string, unknown>;
}

interface FormState {
  hasError: boolean;
}

interface FormInputComponent<T> {
  getValue(): T;
  getComponent?(path: string[]): React.Component | null;
  setState(state: { hasError: boolean }): void;
}

// Narrow unknown to TypeWithMeta when possible
function isTypeWithMeta(x: unknown): x is TypeWithMeta {
  return (
    typeof x === 'function' ||
    (typeof x === 'object' && x !== null && 'meta' in (x as Record<string, unknown>))
  );
}

// Default Component Factory
const defaultGetComponent = <T,>(
  type: TypeWithMeta | null,
  options: Record<string, unknown> = {},
): FieldComponentType<T> => {
  if (!type) return Textbox.ReactComponent as FieldComponentType<T>;

  const typeInfo = getTypeInfo(type);

  if (typeInfo.isEnum) return Select.ReactComponent as FieldComponentType<T>;
  if (typeInfo.isMaybe || typeInfo.isSubtype) {
    if (typeInfo.type === type) return Textbox.ReactComponent as FieldComponentType<T>;
    return defaultGetComponent(typeInfo.type, options);
  }
  switch (typeInfo.kind) {
    case 'struct':
      return Struct as unknown as FieldComponentType<T>;
    case 'list':
      return List.ReactComponent as FieldComponentType<T>;
    case 'irreducible':
      switch (typeInfo.type.name) {
        case 'Boolean':
          return Checkbox.ReactComponent as FieldComponentType<T>;
        case 'Date':
          return DatePicker.ReactComponent as FieldComponentType<T>;
        case 'Number':
        case 'String':
        default:
          return Textbox.ReactComponent as FieldComponentType<T>;
      }
    default:
      return Textbox.ReactComponent as FieldComponentType<T>;
  }
};

export class Form<T> extends Component<FormProps<T>, FormState> {
  static defaultProps: Partial<FormProps<unknown>> = {
    value: undefined,
    options: {},
    context: {},
    stylesheet: {},
    templates: {},
    i18n: {},
  };

  private uidGenerator: UIDGenerator;
  private input = React.createRef<FormInputComponent<T>>();

  constructor(props: FormProps<T>) {
    super(props);
    this.uidGenerator = props.options?.uidGenerator || new UIDGenerator();
  }

  pureValidate() {
    const { type } = this.props;
    const value = this.getValue();
    if (!isTypeWithMeta(type)) {
      // When an invalid type is provided, skip schema validation
      return validate(value, null as unknown as TypeWithMeta, this.getValidationOptions());
    }
    return validate(value, type, this.getValidationOptions());
  }

  validate() {
    const result = this.pureValidate();
    this.input.current?.setState({ hasError: !result.isValid() });
    return result;
  }

  getValue(): T | undefined {
    return this.input.current?.getValue() ?? this.props.value;
  }

  getComponent(path: string[] = []) {
    if (!this.input.current) return null;
    return path.length ? this.input.current.getComponent?.(path) : this.input.current;
  }

  getSeed() {
    return this.uidGenerator.next();
  }

  getUIDGenerator() {
    return this.uidGenerator;
  }

  private getValidationOptions() {
    return {};
  }

  render() {
    const {
      type,
      options = {},
      value,
      onChange,
      context,
      stylesheet = {},
      templates = {},
      i18n,
      ...otherProps
    } = this.props;

    const getComponent = options.getComponent || defaultGetComponent;
    const tType = isTypeWithMeta(type) ? type : null;
    const Component = getComponent(tType, options);

    if (!Component) {
      console.error(`No component found for type: ${type}`);
      return null;
    }

    const baseProps = {
      ref: this.input,
      type,
      value,
      onChange,
      context,
      stylesheet,
      templates,
      i18n,
      ...otherProps,
    };

    // Default props for field type
    if (Component === Textbox.ReactComponent) {
      return (
        <Textbox.ReactComponent
          {...(baseProps as unknown as TextboxTemplateProps)}
          onChangeText={(text: string) => onChange?.(text as unknown as T)}
        />
      );
    }
    if (Component === Checkbox.ReactComponent) {
      return (
        <Checkbox.ReactComponent
          {...(baseProps as unknown as CheckboxTemplateProps)}
          value={!!value}
          onChange={onChange as (v: boolean) => void}
        />
      );
    }
    if (Component === Select.ReactComponent) {
      // Get options from enum type if it's an enum
      const typeInfo = tType ? getTypeInfo(tType) : null;
      let enumOptions: { value: string; text: string }[] = [];
      if (typeInfo?.isEnum && tType) {
        const meta = (tType as TypeWithMeta).meta as { map?: Record<string, unknown> } | undefined;
        const map = meta?.map;
        if (map) {
          enumOptions = Object.keys(map).map(value => ({ value, text: String(map[value]) }));
        }
      }

      return (
        <Select.ReactComponent
          {...(baseProps as unknown as SelectTemplateProps<unknown>)}
          options={enumOptions}
          value={(value !== undefined ? String(value as unknown) : null) as unknown}
          onChange={onChange as unknown as (value: unknown) => void}
        />
      );
    }
    if (Component === DatePicker.ReactComponent) {
      return (
        <DatePicker.ReactComponent
          {...(baseProps as unknown as DatePickerTemplateProps)}
          value={(value as Date) ?? null}
          onChange={onChange as (v: Date | null) => void}
        />
      );
    }
    if (Component === List.ReactComponent) {
      const { onChange: _omitOnChange, ...restBase } = baseProps as Record<string, unknown> & {
        onChange?: unknown;
      };
      void _omitOnChange;
      return (
        <List.ReactComponent
          {...(restBase as unknown as ListTemplateProps<unknown>)}
          items={Array.isArray(value) ? (value as unknown[]) : []}
          onAdd={() => {}}
          onRemove={() => {}}
          renderItem={() => null}
        />
      );
    }
    if (Component === Struct) {
      return <Struct {...(baseProps as unknown as StructTemplateProps)}>{null}</Struct>;
    }

    return <Component {...(baseProps as unknown as AnyTemplateProps<T>)} />;
  }
}

export default Form;
