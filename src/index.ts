// Re-export components and fields
export * from './components';
export * from './fields';

import React from 'react';
import BaseForm from './Form';
import type { MinimalFormRef, FormProps as CoreFormProps } from './types/field.types';
import i18n from './i18n/en';
import stylesheet from './stylesheets/bootstrap';
import templates from './templates/bootstrap';

const ForwardedForm = React.forwardRef<MinimalFormRef, CoreFormProps>(
  function FormForwarded(props, ref) {
    const withDefaults = {
      i18n,
      stylesheet,
      templates,
      ...props,
    };
    return React.createElement(BaseForm, { ref, ...withDefaults });
  },
);

export const Form = ForwardedForm as unknown as import('./types/field.types').FormComponent;

ForwardedForm.displayName = 'Form';

Form.i18n = i18n;
Form.stylesheet = stylesheet;
Form.templates = templates;

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
