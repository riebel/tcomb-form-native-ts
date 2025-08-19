// Main library entry point

// Re-export all components
export * from './components';
export * from './fields';

// Export the main form component with convenience defaults
import Form from './Form';
import i18n from './i18n/en';
import stylesheet from './stylesheets/bootstrap';
import templates from './templates/bootstrap';

// Export the main form component with convenience defaults
// Also expose static properties for backward-compatible runtime mutation without using 'any'
type FormStatics = {
  i18n: Record<string, unknown>;
  stylesheet: Record<string, unknown>;
  templates: Record<string, unknown>;
};
type FormWithStatics = typeof Form & FormStatics;

const FormEx = Form as unknown as FormWithStatics;
FormEx.i18n = i18n as unknown as Record<string, unknown>;
FormEx.stylesheet = stylesheet as unknown as Record<string, unknown>;
FormEx.templates = templates as unknown as Record<string, unknown>;

Form.defaultProps = {
  ...Form.defaultProps,
  i18n: FormEx.i18n,
  stylesheet: FormEx.stylesheet,
  templates: FormEx.templates,
};

export { Form, templates };

// Explicit exports for convenience
export { default as stylesheet } from './stylesheets/bootstrap';
export { default as i18n } from './i18n/en';

// Legacy default export typing for TS consumers using `import t from 'tcomb-form-native'`.
// Mirrors the runtime shape provided by the CommonJS shim `index.js`.

// Importing type of tcomb-validation via typeof import for compatibility
import type Checkbox from './fields/Checkbox';
import type DatePicker from './fields/DatePicker';
import type Select from './fields/Select';
import type Textbox from './fields/Textbox';
import type List from './components/List';
import type Struct from './components/Struct';

type LegacyFormNamespace = {
  Form: typeof Form;
  Textbox: typeof Textbox;
  Checkbox: typeof Checkbox;
  Select: typeof Select;
  DatePicker: typeof DatePicker;
  List: typeof List;
  Struct: typeof Struct;
};

export type LegacyT = typeof import('tcomb-validation') & { form: LegacyFormNamespace };

// Runtime-safe placeholder to prevent ReferenceError when importing this TS entry in tests;
// real default export is provided by the CommonJS root shim `index.js`.
export default {} as unknown as LegacyT;
