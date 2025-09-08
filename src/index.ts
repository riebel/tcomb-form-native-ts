import t from 'tcomb-validation';
import * as tcomb from 'tcomb';

import { Form } from './Form';
import { Textbox } from './Textbox';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { List } from './List';
import { Struct } from './Struct';

import { UIDGenerator } from './util';
import { templates } from './templates/bootstrap';
import { stylesheet } from './stylesheets/bootstrap';
import { i18n } from './i18n/en';
import type { TcombFormNative } from './types';

export * from './types';

Textbox.numberTransformer ??= {
  format: (value: string | number) => (tcomb.Nil.is(value) ? null : String(value)),
  parse: (value: string) => (value ? Number(value.replace(/,/g, '.')) || null : null),
};

Textbox.transformer ??= {
  format: (value: unknown) => (tcomb.Nil.is(value) ? '' : String(value)),
  parse: (value: unknown) => (value === '' || value === null || value === undefined ? null : value),
};

const formAPI = {
  Form,
  Textbox,
  Checkbox,
  Select,
  DatePicker,
  List,
  Struct,
};

Textbox.numberTransformer && (formAPI.Textbox.numberTransformer = Textbox.numberTransformer);
Textbox.transformer && (formAPI.Textbox.transformer = Textbox.transformer);

Object.assign(formAPI.Form, {
  templates: Form.templates,
  stylesheet: Form.stylesheet,
  i18n: Form.i18n,
});

Object.assign(t, {
  form: formAPI,
  Form,
  Textbox,
  Select,
  Checkbox,
  DatePicker,
  List,
  Struct,
  UIDGenerator,
  templates,
  stylesheet,
  i18n,
});

export default t as unknown as TcombFormNative;
export {
  Form,
  Textbox,
  Select,
  Checkbox,
  DatePicker,
  List,
  Struct,
  UIDGenerator,
  templates,
  stylesheet,
  i18n,
  formAPI as form,
};
