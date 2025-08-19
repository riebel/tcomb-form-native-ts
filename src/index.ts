// Main library entry point

// Re-export all components
export * from './components';
export * from './fields';

// Export the main form component with convenience defaults
import BaseForm from './Form';
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
type FormWithStatics = typeof BaseForm & FormStatics;

// Create a value with attached statics for named export consumers
export const Form = BaseForm as unknown as FormWithStatics;
Form.i18n = i18n as unknown as Record<string, unknown>;
Form.stylesheet = stylesheet as unknown as Record<string, unknown>;
Form.templates = templates as unknown as Record<string, unknown>;

BaseForm.defaultProps = {
  ...BaseForm.defaultProps,
  i18n: Form.i18n,
  stylesheet: Form.stylesheet,
  templates: Form.templates,
};

export { templates };

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
  // Expose the enhanced Form with statics for legacy namespace, without using 'any'
  Form: FormWithStatics;
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
