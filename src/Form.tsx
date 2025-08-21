import React, { Component, forwardRef, useImperativeHandle, useRef } from 'react';
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
  AnyTemplateProps,
  FieldComponentType,
  FormProps,
  MinimalFormRef,
  FormState,
  FormInputComponent,
} from './types/field.types';
import { getTypeInfo } from './util';

function isTypeWithMeta(x: unknown): x is TypeWithMeta {
  return (
    typeof x === 'function' ||
    (typeof x === 'object' && x !== null && 'meta' in (x as Record<string, unknown>))
  );
}

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

class FormImpl<T> extends Component<FormProps<T>, FormState> {
  static defaultProps: Partial<FormProps<unknown>> = {
    value: undefined,
    options: {},
    context: {},
    stylesheet: {},
    templates: {},
    i18n: {},
  };

  private input = React.createRef<FormInputComponent<T>>();

  constructor(props: FormProps<T>) {
    super(props);
  }

  pureValidate() {
    const { type } = this.props;
    const value = this.getValue();
    if (!isTypeWithMeta(type)) {
      return validate(value, null as unknown as TypeWithMeta, this.getValidationOptions());
    }
    return validate(value, type, this.getValidationOptions());
  }

  validate(): ReturnType<typeof validate> {
    const result = this.pureValidate();
    this.input.current?.setState({ hasError: !result.isValid() });
    return result;
  }

  getValue(): T | undefined {
    return this.input.current?.getValue() ?? this.props.value;
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

// Re-export MinimalFormRef type from central types for external consumers
export type { MinimalFormRef };

// ForwardRef wrapper to expose a relaxed ref shape `{ getValue(): T }`
const Form = forwardRef(<T,>(props: FormProps<T>, ref: React.Ref<MinimalFormRef<T>>) => {
  const innerRef = useRef<FormImpl<T>>(null);
  useImperativeHandle(
    ref,
    () => ({
      getValue: () => innerRef.current?.getValue(),
      validate: () => (innerRef.current?.validate() as ReturnType<typeof validate>)!,
      pureValidate: () => (innerRef.current?.pureValidate() as ReturnType<typeof validate>)!,
    }),
    [innerRef],
  );
  return <FormImpl ref={innerRef} {...props} />;
});

Form.displayName = 'Form';

export default Form;
