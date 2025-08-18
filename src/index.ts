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
