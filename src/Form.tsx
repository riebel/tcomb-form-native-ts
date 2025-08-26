import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { View } from 'react-native';
import { FormProps, FormRef, ComponentContext, ValidationResult, ComponentProps } from './types';
import { UIDGenerator, getFormComponentName, getComponentOptions, isTcombType } from './util';
import { templates } from './templates/bootstrap';
import { stylesheet } from './stylesheets/bootstrap';
import { i18n } from './i18n/en';
import { Textbox } from './Textbox';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { List } from './List';
import { Struct } from './Struct';

const t = require('tcomb-validation');

const componentRegistry = {
  Textbox,
  Select,
  Checkbox,
  DatePicker,
  List,
  Struct,
};

function InnerForm<T>(props: FormProps<T>, ref: React.Ref<FormRef>) {
  const {
    type,
    options = {},
    value,
    onChange,
    context,
    templates: customTemplates,
    i18n: customI18n,
    stylesheet: customStylesheet,
  } = props;

  const [formValue, setFormValue] = useState(value);

  useEffect(() => {
    setFormValue(value);
  }, [value]);

  const [, setHasError] = useState(false);

  const uidGenerator = useMemo(() => new UIDGenerator('form'), []);

  const mergedTemplates = useMemo(() => ({ ...templates, ...customTemplates }), [customTemplates]);
  const mergedI18n = useMemo(() => ({ ...i18n, ...customI18n }), [customI18n]);
  const mergedStylesheet = useMemo(
    () => ({ ...stylesheet, ...customStylesheet }),
    [customStylesheet],
  );

  const ctx: ComponentContext = useMemo(
    () => ({
      auto: options.auto || 'labels',
      label: options.label,
      templates: mergedTemplates,
      i18n: mergedI18n,
      uidGenerator,
      path: [],
      stylesheet: mergedStylesheet,
      config: options.config,
      context,
    }),
    [
      options.auto,
      options.label,
      options.config,
      mergedTemplates,
      mergedI18n,
      mergedStylesheet,
      uidGenerator,
      context,
    ],
  );

  const handleChange = useCallback(
    (newValue: T, _path?: string[]) => {
      setFormValue(newValue);
      if (onChange) {
        onChange(newValue, _path);
      }
    },
    [onChange],
  );

  const getValue = useCallback((): unknown => {
    return formValue;
  }, [formValue]);

  const validate = useCallback((): ValidationResult => {
    // Handle non-tcomb types (basic validation)
    if (typeof type !== 'object' || type === null || !('meta' in type) || !('is' in type)) {
      const basicResult = {
        isValid: () => true,
        value: formValue,
        errors: [],
      };
      setHasError(false);
      return basicResult;
    }
    const result = t.validate(formValue, type, { path: [], context });
    setHasError(!result.isValid());
    return result;
  }, [formValue, type, context]);

  const pureValidate = useCallback((): ValidationResult => {
    // Validation without side effects (no state updates)
    if (typeof type !== 'object' || type === null || !('meta' in type) || !('is' in type)) {
      return {
        isValid: () => true,
        value: formValue,
        errors: [],
      };
    }
    return t.validate(formValue, type, { path: [], context });
  }, [formValue, type, context]);

  const getComponent = useCallback((path: string[]): React.ComponentType<unknown> | null => {
    // TODO: Implement component retrieval by path if needed
    return null;
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      getValue,
      validate,
      getComponent,
      pureValidate,
    }),
    [getValue, validate, getComponent, pureValidate],
  );

  const actualType = type;
  const componentOptions = getComponentOptions(options, {}, formValue, actualType);

  // Determine which component to render based on type and options
  let ComponentClass: React.ComponentType<ComponentProps>;
  if (componentOptions.factory) {
    ComponentClass = componentOptions.factory;
  } else if (
    isTcombType(actualType) &&
    'getTcombFormFactory' in actualType &&
    typeof actualType.getTcombFormFactory === 'function'
  ) {
    ComponentClass = actualType.getTcombFormFactory(componentOptions);
  } else {
    const componentName = getFormComponentName(actualType, componentOptions);
    ComponentClass = componentRegistry[
      componentName as keyof typeof componentRegistry
    ] as React.ComponentType<ComponentProps>;
  }

  if (!ComponentClass) {
    const componentName = getFormComponentName(actualType, componentOptions);
    throw new Error(`[tcomb-form-native] Component ${componentName} not found`);
  }

  const componentProps = {
    type: actualType,
    options: componentOptions,
    value: formValue,
    ctx,
    onChange: (value: unknown, path: string[]) => handleChange(value as T, path),
    context,
  };
  const rootComponent = React.createElement(
    ComponentClass as React.ComponentType<ComponentProps>,
    componentProps,
  );

  return <View>{rootComponent}</View>;
}

const FormComponent = forwardRef(InnerForm) as <T = Record<string, unknown>>(
  props: FormProps<T> & { ref?: React.Ref<FormRef> },
) => React.ReactElement | null;

export const Form = Object.assign(FormComponent, {
  displayName: 'Form',
  templates,
  stylesheet,
  i18n,
}) as typeof FormComponent & {
  templates: typeof templates;
  stylesheet: typeof stylesheet;
  i18n: typeof i18n;
};

Object.assign(Form, {
  defaultProps: {
    options: {},
    templates,
    stylesheet,
    i18n,
  },
});
