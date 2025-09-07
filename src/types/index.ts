import React, { ReactNode, ComponentType } from 'react';
import { TextInputProps, ViewStyle, TextStyle } from 'react-native';

export type BivariantOnChange<T> = {
  bivarianceHack(value: T, path?: string[], kind?: string): void;
}['bivarianceHack'];
export interface TcombType {
  meta: {
    kind: 'irreducible' | 'struct' | 'list' | 'enums' | 'maybe' | 'subtype' | 'union';
    type?: TcombType;
    types?: TcombType[];
    map?: Record<string, string>;
    name?: string;
    predicate?: (value: unknown) => boolean;
    props?: Record<string, TcombType>;
  };
  getTcombFormFactory?: (options: ComponentOptions) => ComponentType<ComponentProps>;
  dispatch?: (value: unknown) => TcombType;
  getValidationErrorMessage?: (
    value: unknown,
    path: string[],
    context: ValidationContext,
  ) => string;
  is: (value: unknown) => boolean;
}
export interface ValidationResult {
  isValid(): boolean;
  value: unknown;
  errors: ValidationError[];
}

export interface ValidationError {
  message: string;
  path: string[];
  expected: TcombType;
  actual: unknown;
}

export interface ValidationContext {
  options?: ComponentOptions;
  [key: string]: unknown;
}

export interface ValidationOptions {
  path: string[];
  context: ValidationContext;
}

export type Transformer<ValueType = unknown, FormattedType = unknown> = {
  format: (value: ValueType) => FormattedType;
  parse: (value: FormattedType) => ValueType;
};

export type NumberTransformer = {
  format: (value: string | number) => string | null;
  parse: (value: string) => number | null;
};
export interface ComponentContext {
  auto: 'labels' | 'placeholders' | 'none';
  label?: string;
  templates: Templates;
  i18n: I18nConfig;
  uidGenerator: UIDGenerator;
  path: string[];
  stylesheet?: Stylesheet;
  config?: Record<string, unknown>;
  context?: ValidationContext;
}

export interface ComponentOptions {
  factory?: ComponentType<ComponentProps>;
  template?: ComponentType<ComponentLocals>;
  transformer?: Transformer;
  label?: string;
  legend?: string;
  placeholder?: string;
  help?: ReactNode;
  error?: string | ((value: unknown, path: string[], context: ValidationContext) => string);
  hasError?: boolean;
  fieldErrors?: Record<string, string>;
  hidden?: boolean;
  auto?: 'labels' | 'placeholders' | 'none';
  i18n?: I18nConfig;
  stylesheet?: Stylesheet;
  config?: Record<string, unknown>;
  onChange?: (value: unknown) => void;
  [key: string]: unknown;
}

export interface ComponentLocals {
  path: string[];
  error?: string;
  hasError: boolean;
  label?: ReactNode;
  onChange: (value: unknown) => void;
  config: Record<string, unknown>;
  value: unknown;
  hidden?: boolean;
  stylesheet: Stylesheet;
  [key: string]: unknown;
}

export interface TextboxOptions extends ComponentOptions {
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  underlineColorAndroid?: string;
  allowFontScaling?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  onBlur?: TextInputProps['onBlur'];
  onEndEditing?: TextInputProps['onEndEditing'];
  onFocus?: TextInputProps['onFocus'];
  onLayout?: TextInputProps['onLayout'];
  onSelectionChange?: TextInputProps['onSelectionChange'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  onContentSizeChange?: TextInputProps['onContentSizeChange'];
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  selectTextOnFocus?: boolean;
  selectionColor?: string;
  textAlign?: TextInputProps['textAlign'];
  textAlignVertical?: TextInputProps['textAlignVertical'];
  returnKeyType?: TextInputProps['returnKeyType'];
  clearButtonMode?: TextInputProps['clearButtonMode'];
  clearTextOnFocus?: boolean;
  enablesReturnKeyAutomatically?: boolean;
  keyboardAppearance?: TextInputProps['keyboardAppearance'];
  onKeyPress?: TextInputProps['onKeyPress'];
  selectionState?: TextInputProps['selectionState'];
  spellCheck?: boolean;
  style?: TextInputProps['style'];
}

export interface TextboxLocals extends ComponentLocals {
  placeholder?: string;
  onChangeNative?: (value: unknown) => void;
  keyboardType?: TextInputProps['keyboardType'];
  underlineColorAndroid?: string;
  allowFontScaling?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  onBlur?: TextInputProps['onBlur'];
  onEndEditing?: TextInputProps['onEndEditing'];
  onFocus?: TextInputProps['onFocus'];
  onLayout?: TextInputProps['onLayout'];
  onSelectionChange?: TextInputProps['onSelectionChange'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  onContentSizeChange?: TextInputProps['onContentSizeChange'];
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  selectTextOnFocus?: boolean;
  selectionColor?: string;
  textAlign?: TextInputProps['textAlign'];
  textAlignVertical?: TextInputProps['textAlignVertical'];
  returnKeyType?: TextInputProps['returnKeyType'];
  clearButtonMode?: TextInputProps['clearButtonMode'];
  clearTextOnFocus?: boolean;
  enablesReturnKeyAutomatically?: boolean;
  keyboardAppearance?: TextInputProps['keyboardAppearance'];
  onKeyPress?: TextInputProps['onKeyPress'];
  selectionState?: TextInputProps['selectionState'];
  spellCheck?: boolean;
  style?: TextInputProps['style'];
}

export interface SelectOption {
  value: string | null;
  text: string;
}

export interface SelectOptions extends ComponentOptions {
  options?: SelectOption[];
  order?: 'asc' | 'desc';
  nullOption?: SelectOption | false;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export interface SelectLocals extends ComponentLocals {
  options: SelectOption[];
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export interface CheckboxOptions extends ComponentOptions {}

export interface CheckboxLocals extends ComponentLocals {
  label?: ReactNode | null;
}

export interface DatePickerOptions extends ComponentOptions {
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: number;
  timeZoneOffsetInMinutes?: number;
  locale?: string;
}

export interface DatePickerLocals extends ComponentLocals {
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: number;
  timeZoneOffsetInMinutes?: number;
  locale?: string;
  disabled?: boolean;
  onPress?: () => void;
}

export interface ListOptions extends ComponentOptions {
  disableAdd?: boolean;
  disableRemove?: boolean;
  disableOrder?: boolean;
  item?: ComponentOptions;
}

export interface ListItem {
  input: React.ReactElement;
  key: string;
  buttons: Button[];
}

export interface Button {
  disabled: boolean;
  click: () => void;
  label: string;
  type: string;
}

export type ListLocals = ComponentLocals & {
  add: Button;
  items: ListItem[];
  error: string;
  hidden: boolean;
  label: string;
  stylesheet: { [index: string]: { [index: string]: TextStyle } };
};

export interface StructOptions extends ComponentOptions {
  order?: string[];
  fields?: Record<string, ComponentOptions>;
  fieldErrors?: Record<string, string>;
}

export interface StructLocals extends ComponentLocals {
  order: string[];
  inputs: Record<string, React.ReactElement>;
}

export interface FormProps<T = Record<string, unknown>> {
  type: TcombType | Record<string, unknown> | object | Function;
  options?: ComponentOptions;
  value?: T;
  onChange?: BivariantOnChange<T>;
  context?: ValidationContext;
  templates?: Templates;
  i18n?: I18nConfig;
  stylesheet?: Stylesheet;
}

export interface FormRef<T = unknown> {
  getValue(): T;
  validate?: () => ValidationResult;
  getComponent?: (path: string[]) => ComponentType<unknown> | null;
  pureValidate?: () => ValidationResult;
}

export interface Templates {
  textbox: ComponentType<TextboxLocals>;
  checkbox: ComponentType<CheckboxLocals>;
  select: ComponentType<SelectLocals>;
  datepicker: ComponentType<DatePickerLocals>;
  struct: ComponentType<StructLocals>;
  list: ComponentType<ListLocals>;
}

export interface I18nConfig {
  optional: string;
  required: string;
  add?: string;
  remove?: string;
  up?: string;
  down?: string;
}

export interface Stylesheet {
  fieldset?: ViewStyle;
  controlLabel?: {
    normal?: TextStyle;
    error?: TextStyle;
  };
  helpBlock?: {
    normal?: TextStyle;
    error?: TextStyle;
  };
  errorBlock?: TextStyle;
  textbox?: {
    normal?: TextInputProps['style'];
    error?: TextInputProps['style'];
  };
  checkbox?: {
    normal?: ViewStyle;
    error?: ViewStyle;
  };
  select?: {
    normal?: ViewStyle;
    error?: ViewStyle;
  };
  datepicker?: {
    normal?: ViewStyle;
    error?: ViewStyle;
  };
  pickerContainer?: {
    normal?: ViewStyle;
    error?: ViewStyle;
    open?: ViewStyle;
  };
  pickerValue?: {
    normal?: TextStyle;
    error?: TextStyle;
  };
  pickerTouchable?: {
    normal?: ViewStyle;
    error?: ViewStyle;
    active?: ViewStyle;
  };
  list?: ViewStyle;
  formGroup?: {
    normal?: ViewStyle;
    error?: ViewStyle;
  };
  buttonText?: TextStyle;
  button?: ViewStyle;
  [index: string]:
    | ViewStyle
    | TextStyle
    | TextInputProps['style']
    | { [key: string]: ViewStyle | TextStyle | TextInputProps['style'] }
    | undefined;
}

export interface TypeInfo {
  type: TcombType;
  isMaybe: boolean;
  isSubtype: boolean;
  innerType: TcombType;
  getValidationErrorMessage?: (
    _value: unknown,
    _path: string[],
    _context: ValidationContext,
  ) => string;
}

export interface ComponentProps {
  type: TcombType | Record<string, unknown> | object | Function;
  options: ComponentOptions;
  value?: unknown;
  ctx: ComponentContext;
  onChange?: BivariantOnChange<unknown>;
  context?: ValidationContext;
}

export interface UIDGenerator {
  next(): string;
}

export interface TcombValidation {
  validate(value: unknown, type: TcombType): ValidationResult;

  String: TcombType;
  Number: TcombType;
  Boolean: TcombType;
  Date: TcombType;
  Object: TcombType;
  Array: TcombType;
  Function: TcombType;
  Nil: TcombType;

  maybe(type: TcombType): TcombType;
  list(type: TcombType): TcombType;
  struct(props: Record<string, TcombType>): TcombType;
  enums(map: Record<string, string>): TcombType;
  union(types: TcombType[]): TcombType;
  subtype(type: TcombType, predicate: (value: unknown) => boolean): TcombType;
  refinement(type: TcombType, predicate: (value: unknown) => boolean): TcombType;

  is(value: unknown, type: TcombType): boolean;
  getTypeName(type: TcombType): string;
  getDefaultProps(type: TcombType): Record<string, unknown>;

  [key: string]: unknown;
}

export interface TextboxInstance {
  getTransformer(): Transformer;
  getTemplate(): React.ComponentType<TextboxLocals>;
  getLocals(): TextboxLocals;
  getValue(): unknown;
  validate(): ValidationResult;
  onChange(value: unknown): void;
}

export interface SelectInstance {
  getTemplate(): React.ComponentType<SelectLocals>;
  getLocals(): SelectLocals;
  getValue(): unknown;
  validate(): ValidationResult;
  onChange(value: unknown): void;
  getNullOption(): { value: unknown; text: string };
  getOptions(): Array<{ value: unknown; text: string }>;
}

export interface CheckboxInstance {
  getTemplate(): React.ComponentType<CheckboxLocals>;
  getLocals(): CheckboxLocals;
  getValue(): boolean;
  validate(): ValidationResult;
  onChange(value: boolean): void;
}

export interface DatePickerInstance {
  getTemplate(): React.ComponentType<DatePickerLocals>;
  getLocals(): DatePickerLocals;
  getValue(): Date | null;
  validate(): ValidationResult;
  onChange(value: Date | null): void;
}

export interface ListInstance {
  getTemplate(): React.ComponentType<ListLocals>;
  getLocals(): ListLocals;
  getValue(): unknown[];
  validate(): ValidationResult;
  onChange(value: unknown[]): void;
  add(): void;
  removeItem(index: number): void;
  moveUp(index: number): void;
  moveDown(index: number): void;
  getItems(): Array<{
    key: string;
    input: React.ReactElement;
    buttons: Array<{ click: () => void; label: string; type: string }>;
  }>;
}

export interface StructInstance {
  getTemplate(): React.ComponentType<StructLocals>;
  getLocals(): StructLocals;
  getValue(): Record<string, unknown>;
  validate(): ValidationResult;
  onChange(value: Record<string, unknown>): void;
}

export interface TextboxComponent {
  new (props: ComponentProps): TextboxInstance;
  numberTransformer?: NumberTransformer;
  transformer?: Transformer;
}

export interface SelectComponent {
  new (props: ComponentProps): SelectInstance;
  transformer?: Transformer;
}

export interface CheckboxComponent {
  new (props: ComponentProps): CheckboxInstance;
  transformer?: Transformer;
}

export interface DatePickerComponent {
  new (props: ComponentProps): DatePickerInstance;
  transformer?: Transformer;
}

export interface ListComponent {
  new (props: ComponentProps): ListInstance;
  transformer?: Transformer;
}

export interface StructComponent {
  new (props: ComponentProps): StructInstance;
}

export interface FormTemplates {
  textbox: React.ComponentType<TextboxLocals>;
  select: React.ComponentType<SelectLocals>;
  checkbox: React.ComponentType<CheckboxLocals>;
  datepicker: React.ComponentType<DatePickerLocals>;
  list: React.ComponentType<ListLocals>;
  struct: React.ComponentType<StructLocals>;
}

export interface FormStylesheet {
  [key: string]: unknown;
}

export interface FormI18n {
  optional: string;
  required: string;
  add: string;
  remove: string;
  up: string;
  down: string;
}

export interface UIDGeneratorClass {
  new (prefix?: string): {
    next(): string;
  };
}

export interface FormComponentWithExtras {
  <T = Record<string, unknown>>(
    props: FormProps<T> & { ref?: React.Ref<FormRef> },
  ): React.ReactElement | null;
  templates: FormTemplates;
  stylesheet: FormStylesheet;
  i18n: FormI18n;
}

export interface TcombFormNative {
  Nil: {
    is(value: unknown): boolean;
  };
  String: TcombType;
  Number: TcombType;
  Boolean: TcombType;
  Date: TcombType;
  Function: TcombType;
  Object: TcombType;
  Array: TcombType;

  form: {
    Form: FormComponentWithExtras;
    Textbox: TextboxComponent;
    Select: SelectComponent;
    Checkbox: CheckboxComponent;
    DatePicker: DatePickerComponent;
    List: ListComponent;
    Struct: StructComponent;
  };

  Form: FormComponentWithExtras;
  Textbox: TextboxComponent;
  Select: SelectComponent;
  Checkbox: CheckboxComponent;
  DatePicker: DatePickerComponent;
  List: ListComponent;
  Struct: StructComponent;

  UIDGenerator: UIDGeneratorClass;
  templates: FormTemplates;
  stylesheet: FormStylesheet;
  i18n: FormI18n;

  validate(value: unknown, type: TcombType, options?: ValidationOptions): ValidationResult;
  assert(condition: boolean, message?: string): void;
}
