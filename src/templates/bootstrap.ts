import type {
  FormTemplates,
  TextboxTemplateProps,
  CheckboxTemplateProps,
  SelectTemplateProps,
  DatePickerTemplateProps,
  StructTemplateProps,
} from '../types/field.types';
import type { ComponentType } from 'react';
import Textbox from '../fields/Textbox';
import Checkbox from '../fields/Checkbox';
import Select from '../fields/Select';
import DatePicker from '../fields/DatePicker';
import List from '../components/List';
import Struct from '../components/Struct';

// Bootstrap-like templates mapping to built-in components
const templates: FormTemplates = {
  textbox: Textbox.ReactComponent as ComponentType<TextboxTemplateProps>,
  checkbox: Checkbox.ReactComponent as ComponentType<CheckboxTemplateProps>,
  select: Select.ReactComponent as ComponentType<SelectTemplateProps<unknown>>,
  datePicker: (DatePicker.ReactComponent ||
    Textbox.ReactComponent) as ComponentType<DatePickerTemplateProps>,
  list: List.ReactComponent,
  struct: Struct as ComponentType<StructTemplateProps>,
};

export default templates;
