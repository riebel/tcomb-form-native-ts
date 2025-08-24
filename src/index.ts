// Re-export components and fields
export * from './components';
export * from './fields';

import React from 'react';
import BaseForm from './Form';
import type { MinimalFormRef, FormProps as CoreFormProps } from './types/field.types';
import i18n from './i18n/en';
import stylesheet from './stylesheets/bootstrap';
import templates from './templates/bootstrap';

// Backing singletons that can be mutated via legacy static attachments
let __i18n = i18n;
let __stylesheet = stylesheet;
let __templates = templates;

const ForwardedForm = React.forwardRef<MinimalFormRef, CoreFormProps>(
  function FormForwarded(props, ref) {
    // Read current values to respect runtime mutations via legacy statics
    // IMPORTANT: Do NOT access props.ref or props.key; React adds warning getters for those.
    // Whitelist only known FormProps keys to avoid leaking exotic getters/proxies
    const safe: Partial<CoreFormProps> = {
      type: (props as CoreFormProps).type,
      value: (props as CoreFormProps).value,
      options: (props as CoreFormProps).options,
      onChange: (props as CoreFormProps).onChange,
      context: (props as CoreFormProps).context,
      stylesheet: (props as CoreFormProps).stylesheet,
      templates: (props as CoreFormProps).templates,
      i18n: (props as CoreFormProps).i18n,
    };
    const withDefaults = {
      i18n: __i18n,
      stylesheet: __stylesheet,
      templates: __templates,
      ...safe,
    } as CoreFormProps;
    return React.createElement(BaseForm, { ref, ...withDefaults });
  },
);

export const Form = ForwardedForm as unknown as import('./types/field.types').FormComponent;

ForwardedForm.displayName = 'Form';

// Legacy static attachments: define as NON-ENUMERABLE accessors to avoid being spread
Object.defineProperties(Form as unknown as object, {
  templates: {
    get: () => __templates,
    set: v => {
      __templates = v as typeof templates;
    },
    enumerable: false,
    configurable: true,
  },
  stylesheet: {
    get: () => __stylesheet,
    set: v => {
      __stylesheet = v as typeof stylesheet;
    },
    enumerable: false,
    configurable: true,
  },
  i18n: {
    get: () => __i18n,
    set: v => {
      __i18n = v as typeof i18n;
    },
    enumerable: false,
    configurable: true,
  },
});

export { templates };

export { default as stylesheet } from './stylesheets/bootstrap';
export { default as i18n } from './i18n/en';
export {
  UIDGenerator,
  humanize,
  merge,
  move,
  getTypeInfo,
  getOptionsOfEnum,
  getTypeFromUnion,
  getComponentOptions,
} from './util';

export type { FormProps } from './types/field.types';

export type {
  // Core
  I18n,
  FormTemplates,
  Transformer,
  // Field/component props (non-template)
  TextboxProps,
  SelectProps,
  EnumLike,
  DatePickerProps,
  CheckboxInternalProps,
  StructProps,
  Dispatchable,
  ListTypeLike,
  ListProps,
  // Template props and helpers
  TextboxTemplateProps,
  SelectTemplateProps,
  DatePickerTemplateProps,
  CheckboxTemplateProps,
  StructTemplateProps,
  ListTemplateProps,
  SelectOption,
  ListItem,
} from './types/field.types';

// Default export is a type-only placeholder; the actual runtime default export
// is provided by the CommonJS shim in the root `index.js`.
export default {} as unknown as import('./types/field.types').LegacyT;
