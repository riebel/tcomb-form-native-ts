import { StyleProp, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { ComponentType, ReactNode } from 'react';
import { Type } from 'tcomb';

/* --------------------
 * Base template props (generic)
 * ------------------- */
export type BaseTemplateProps<TValue, TStylesheet, TExtraProps = object> = {
  hidden?: boolean;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  label?: string;
  help?: string;
  error?: string;
  testID?: string;
  accessibilityLabel?: string;
  value?: TValue;
  onChange?: (value: TValue) => void;
  stylesheet: TStylesheet;
} & TExtraProps;

/* --------------------
 * Stylesheets
 * ------------------- */
export interface TextboxStylesheet {
  formGroup?: { normal?: StyleProp<ViewStyle>; error?: StyleProp<ViewStyle> };
  controlLabel?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
  helpBlock?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
  errorBlock?: StyleProp<TextStyle>;
  textbox?: {
    normal?: StyleProp<TextStyle>;
    error?: StyleProp<TextStyle>;
    notEditable?: StyleProp<TextStyle>;
  };
  textboxView?: {
    normal?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    notEditable?: StyleProp<ViewStyle>;
  };
}

export interface CheckboxStylesheet {
  container?: {
    normal?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
  };
  formGroup?: {
    normal?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
  };
  controlLabel?: {
    normal?: StyleProp<TextStyle>;
    error?: StyleProp<TextStyle>;
    disabled?: StyleProp<TextStyle>;
  };
  checkbox?: {
    normal?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
  };
  helpBlock?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
  errorBlock?: StyleProp<TextStyle>;
}

export interface SelectStylesheet {
  formGroup?: {
    normal?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
  };
  controlLabel?: {
    normal?: StyleProp<TextStyle>;
    error?: StyleProp<TextStyle>;
    disabled?: StyleProp<TextStyle>;
  };
  helpBlock?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
  errorBlock?: StyleProp<TextStyle>;
  valueContainer?: {
    normal?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
  };
  valueText?: {
    normal?: StyleProp<TextStyle>;
    error?: StyleProp<TextStyle>;
    disabled?: StyleProp<TextStyle>;
  };
}

export interface DatePickerStylesheet extends SelectStylesheet {}
export interface ListStylesheet {
  formGroup?: { normal?: StyleProp<ViewStyle>; error?: StyleProp<ViewStyle> };
  controlLabel?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
  helpBlock?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
  errorBlock?: StyleProp<TextStyle>;
  itemContainer?: {
    normal?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
  };
  button?: { normal?: StyleProp<ViewStyle>; disabled?: StyleProp<ViewStyle> };
  buttonText?: { normal?: StyleProp<TextStyle>; disabled?: StyleProp<TextStyle> };
}
export interface StructStylesheet {
  fieldset?: StyleProp<ViewStyle>;
  controlLabel?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
  errorBlock?: StyleProp<TextStyle>;
}

/* --------------------
 * Field props
 * ------------------- */
export type TextboxTemplateProps = BaseTemplateProps<
  string | number | null,
  TextboxStylesheet,
  {
    // Legacy tcomb-form-native props expected on Textbox instances
    type?: {
      meta?: { optional?: boolean; kind?: string };
      (value: unknown): unknown;
    };
    options?: {
      label?: string;
      placeholder?: string;
      help?: string;
      editable?: boolean;
      transformer?: {
        format: (value: unknown) => string;
        parse: (text: string) => unknown;
      };
      error?: string | ((value: unknown) => string);
      hasError?: boolean;
      template?: unknown;
    };
    ctx?: { auto?: string; label?: string; i18n?: I18n; templates?: FormTemplates };
    // Direct TextInput-like props used by our native template
    editable?: boolean;
    placeholder?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: TextInputProps['keyboardType'];
    autoCapitalize?: TextInputProps['autoCapitalize'];
    autoCorrect?: boolean;
    autoFocus?: boolean;
    onBlur?: TextInputProps['onBlur'];
    onFocus?: TextInputProps['onFocus'];
    onSubmitEditing?: TextInputProps['onSubmitEditing'];
    returnKeyType?: TextInputProps['returnKeyType'];
    selectTextOnFocus?: boolean;
  }
>;

export type CheckboxTemplateProps = BaseTemplateProps<
  boolean,
  CheckboxStylesheet,
  { onTintColor?: string; thumbTintColor?: string; tintColor?: string }
>;

export interface SelectOption<TValue> {
  value: TValue;
  text: string;
}

export type SelectTemplateProps<TValue> = BaseTemplateProps<
  TValue | null,
  SelectStylesheet,
  {
    options: SelectOption<TValue>[];
    nullOption?: SelectOption<null>;
    text?: string;
    order?: 'asc' | 'desc';
    isCollapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }
>;

export type DatePickerTemplateProps = BaseTemplateProps<
  Date | null,
  DatePickerStylesheet,
  {
    mode?: 'date' | 'time' | 'datetime';
    format?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    minuteInterval?: number;
    timeZoneOffsetInMinutes?: number;
    config?: {
      animation?: unknown;
      animationConfig?: object;
      format?: (date: Date) => string;
      defaultValueText?: string;
      dialogMode?: 'default' | 'spinner' | 'calendar';
    };
    onOpen?: () => void;
    onClose?: () => void;
  }
>;

export interface ListItemAction {
  type: string;
  label: string;
  click: () => void;
  disabled?: boolean;
}
export interface ListItem<T> {
  key: string;
  input: ReactNode;
  buttons?: ListItemAction[];
  item: T;
  index: number;
}

export type ListTemplateProps<T> = BaseTemplateProps<
  T[],
  ListStylesheet,
  {
    // Old API often passes an explicit items array separate from value
    items?: T[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    renderItem: (item: T, index: number) => ReactNode;
    addLabel?: string;
    removeLabel?: string;
    disableAdd?: boolean;
    disableRemove?: boolean;
    disableOrder?: boolean;
  }
>;

export type StructTemplateProps = BaseTemplateProps<
  never,
  StructStylesheet,
  {
    children?: ReactNode;
    fieldset?: StyleProp<ViewStyle>;
    controlLabel?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
    errorBlock?: StyleProp<TextStyle>;
  }
>;

/* --------------------
 * Form Props / State
 * ------------------- */
export interface FormOptions<T extends object> {
  i18n?: I18n;
  templates?: FormTemplates;
  stylesheet?: Record<string, unknown>;
  order?: Array<keyof T & string>;
  auto?: 'labels' | 'placeholders';
  fields?: { [K in keyof T]?: Partial<BaseTemplateProps<T[K], Record<string, unknown>>> };
}

export interface FormProps<T extends object> {
  type: TypeWithMeta;
  value?: T;
  onChange?: (value: T, path: Array<keyof T | number>) => void;
  options?: FormOptions<T>;
  label?: string;
  help?: string;
  error?: string;
  hasError?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export interface FormState<T extends object> {
  value?: T;
  errors?: { [K in keyof T]?: string };
  hasError: boolean;
}

/* --------------------
 * I18n & Templates
 * ------------------- */
export interface I18n {
  [key: string]: string | I18n;
}
export interface FormTemplates {
  textbox?: ComponentType<TextboxTemplateProps>;
  checkbox?: ComponentType<CheckboxTemplateProps>;
  select?: ComponentType<SelectTemplateProps<unknown>>;
  datePicker?: ComponentType<DatePickerTemplateProps>;
  list?: ComponentType<ListTemplateProps<unknown>>;
  struct?: ComponentType<StructTemplateProps>;
  [key: string]: unknown;
}

export interface TypeMeta {
  kind: string;
  name: string;
  identity: boolean;
  types?: unknown[];
  [key: string]: unknown;
}
export interface TypeWithMeta extends Type<unknown> {
  meta: TypeMeta;
  (value: unknown): unknown;
  is(value: unknown): value is unknown;
  displayName: string;
  t: Type<unknown>;
  getValidationErrorMessage: (value: unknown, path: string[], context: unknown) => string;
}
