import { StyleProp, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { ComponentType, ReactNode } from 'react';
import type React from 'react';
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

// Reusable generic transformer type
export type Transformer<I, O> = {
  format: (value: I) => O;
  parse: (value: O) => I;
};

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

export type TextboxOptions = BaseFieldOptions<
  TextboxTemplateProps,
  Transformer<unknown, string>
> & {
  placeholder?: string;
  editable?: boolean;
};

/* --------------------
 * Shared option/ctx/props generics (for component-level props)
 * ------------------- */
export type BaseFieldOptions<TTemplateProps, TTransformer = unknown> = {
  label?: string;
  help?: string;
  template?: ComponentType<TTemplateProps>;
  hasError?: boolean;
  error?: string | ((value: unknown) => string);
  transformer?: TTransformer;
};

export type BaseCtx<TTemplates extends Record<string, unknown> = Record<string, unknown>> = {
  auto: string;
  label?: string;
  i18n?: { optional?: string; required?: string } | I18n;
  templates?: TTemplates;
};

export type FieldProps<TValue, TOptions, TCtx, TTypeLike = unknown> = {
  type?: TTypeLike;
  value?: TValue;
  options?: TOptions;
  ctx?: TCtx;
  // BaseTemplateProps.required surfaced for implementation-level validation
  required?: boolean;
};

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
    // UI hint: when true and `required`, templates may render an asterisk next to the label
    showRequiredIndicator?: boolean;
    // Legacy tcomb-form-native props expected on Textbox instances
    type?: {
      meta?: { optional?: boolean; kind?: string };
      (value: unknown): unknown;
    };
    options?: TextboxOptions;
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

/* --------------------
 * Centralized Field Component Prop Types (non-template)
 * ------------------- */
// Textbox component props with localized ctx template typing
export type TextboxProps = TextboxTemplateProps & {
  ctx?: { templates?: { textbox?: ComponentType<TextboxTemplateProps> } };
};

// Select
export type EnumLike = {
  meta?: {
    kind?: string;
    map?: Record<string, string>;
    optional?: boolean;
  };
};

export type SelectOptions<T> = BaseFieldOptions<
  SelectTemplateProps<T>,
  Transformer<unknown, string>
> & {
  options?: Array<SelectOption<T>>;
  nullOption?: SelectOption<null> | false;
  order?: 'asc' | 'desc';
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
};

export type SelectCtx = BaseCtx<{
  select?: ComponentType<SelectTemplateProps<unknown>>;
}>;

export type SelectProps<T> = FieldProps<T | null | string, SelectOptions<T>, SelectCtx, EnumLike>;

// DatePicker
export type DatePickerTypeLike = { meta?: { kind?: string; optional?: boolean } };
export type DatePickerOptions = BaseFieldOptions<
  DatePickerTemplateProps,
  Transformer<unknown, unknown>
>;
export type DatePickerCtx = BaseCtx<{
  datepicker?: ComponentType<DatePickerTemplateProps>;
}>;
export type DatePickerProps = FieldProps<
  Date | unknown,
  DatePickerOptions,
  DatePickerCtx,
  DatePickerTypeLike
>;

// Checkbox
export type CheckboxTypeLike = { meta?: { kind?: string; optional?: boolean } };
export type CheckboxCtxLike = BaseCtx<{
  checkbox?: ComponentType<CheckboxTemplateProps>;
}>;
export type CheckboxTransformerLike = Transformer<unknown, string>;
export type CheckboxOptionsLike = BaseFieldOptions<CheckboxTemplateProps, CheckboxTransformerLike>;
export type CheckboxProps = FieldProps<
  boolean,
  CheckboxOptionsLike,
  CheckboxCtxLike,
  CheckboxTypeLike
> &
  CheckboxTemplateProps & { transformer?: CheckboxTransformerLike };

// Backward-compat alias to avoid breaking imports
export type CheckboxInternalProps = CheckboxProps;

// Struct component props with localized ctx template typing
export type StructProps = StructTemplateProps & {
  ctx?: { templates?: { struct?: ComponentType<StructTemplateProps> } };
};

// List (component-level props used by implementation)
export type Dispatchable = {
  dispatch?: (value: unknown) => unknown;
  meta?: { kind?: string };
};

export type ListTypeLike = {
  meta?: {
    kind?: string; // 'list'
    type?: Dispatchable; // inner type for list
    of?: Dispatchable; // compatibility alias
  };
};

export type ListProps<T = unknown> = FieldProps<
  T[],
  Record<string, unknown>,
  { templates?: { list?: ComponentType<ListTemplateProps<unknown>> } },
  ListTypeLike & Dispatchable
>;

export type CheckboxTemplateProps = BaseTemplateProps<
  boolean,
  CheckboxStylesheet,
  {
    // UI hint: when true and `required`, templates may render an asterisk next to the label
    showRequiredIndicator?: boolean;
    onTintColor?: string;
    thumbTintColor?: string;
    tintColor?: string;
  }
>;

export interface SelectOption<TValue> {
  value: TValue;
  text: string;
}

export type SelectTemplateProps<TValue> = BaseTemplateProps<
  TValue | null,
  SelectStylesheet,
  {
    // UI hint: when true and `required`, templates may render an asterisk next to the label
    showRequiredIndicator?: boolean;
    options: SelectOption<TValue>[];
    nullOption?: SelectOption<null> | false;
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
    // UI hint: when true and `required`, templates may render an asterisk next to the label
    showRequiredIndicator?: boolean;
    mode?: 'date' | 'time' | 'datetime';
    format?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    minuteInterval?: number;
    timeZoneOffsetInMinutes?: number;
    config?: {
      animation?: boolean;
      animationConfig?: Record<string, unknown>;
      format?: (date: Date) => string;
      defaultValueText?: string;
      dialogMode?: 'default' | 'spinner' | 'calendar';
    };
    onOpen?: () => void;
    onClose?: () => void;
  }
>;

export interface ListItem<T> {
  key: string;
  input: ReactNode;
  item: T;
  index: number;
}

export type ListTemplateProps<T> = BaseTemplateProps<
  T[],
  ListStylesheet,
  {
    // UI hint: when true and `required`, templates may render an asterisk next to the label
    showRequiredIndicator?: boolean;
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
 * I18n & Templates
 * ------------------- */
// Centralized i18n translations interface
export interface I18nTranslations {
  optional: string;
  required: string;
  add: string;
  remove: string;
  up: string;
  down: string;
}

export type I18n = I18nTranslations | Record<string, string>;
export interface FormTemplates {
  textbox?: ComponentType<TextboxTemplateProps>;
  checkbox?: ComponentType<CheckboxTemplateProps>;
  select?: ComponentType<SelectTemplateProps<unknown>>;
  datePicker?: ComponentType<DatePickerTemplateProps>;
  list?: ComponentType<ListTemplateProps<unknown>>;
  struct?: ComponentType<StructTemplateProps>;
  [key: string]: unknown;
}

export type TypeKind =
  | 'irreducible'
  | 'struct'
  | 'list'
  | 'dict'
  | 'maybe'
  | 'subtype'
  | 'enums'
  | 'enum'
  | 'union'
  | 'refinement';

export interface TypeMeta {
  kind: TypeKind;
  name: string;
  identity: boolean;
  types?: TypeWithMeta[];
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

/* --------------------
 * Shared utils/types used across files (moved from scattered modules)
 * ------------------- */
export type TypeLikeMeta = {
  meta?: { kind?: string; optional?: boolean };
};

export type AutoLabelCtx = { auto: string; label?: string } | undefined;
export type I18nCtx = { i18n?: { optional?: string } } | undefined;

// Field/utils hook types (from hooks/useSelectCommon)
export type UseSelectCommonArgs<T> = {
  options: Array<SelectOption<T>>;
  nullOption?: SelectOption<null>;
  selectedValue: T | null;
  stylesheet: SelectStylesheet;
  hasError?: boolean;
  disabled?: boolean;
};

export type UseSelectCommonResult<T> = {
  selectOptions: Array<SelectOption<T> | SelectOption<null>>;
  displayValue: string;
  formGroupStyle: StyleProp<ViewStyle>;
  controlLabelStyle: StyleProp<TextStyle>;
  helpBlockStyle: StyleProp<TextStyle>;
  errorBlockStyle: StyleProp<TextStyle>;
  valueContainerStyle: StyleProp<ViewStyle>;
  valueTextStyle: StyleProp<TextStyle>;
};

// Template component callable types
export type SelectComponent = {
  <T>(props: SelectTemplateProps<T>): React.ReactElement | null;
  displayName?: string;
};

// Legacy transformer helper used by Textbox
export type LegacyNumberTransformer =
  | {
      format: (value: string | number) => string | null;
      parse: (value: string) => number | null | undefined;
    }
  | undefined;

// Form-level types moved from Form.tsx and index.ts
export type AnyTemplateProps<T> =
  | TextboxTemplateProps
  | CheckboxTemplateProps
  | SelectTemplateProps<T>
  | DatePickerTemplateProps
  | ListTemplateProps<T>
  | StructTemplateProps;

export type FieldComponentType<T> = React.ComponentType<
  | TextboxTemplateProps
  | CheckboxTemplateProps
  | SelectTemplateProps<T>
  | DatePickerTemplateProps
  | ListTemplateProps<T>
  | StructTemplateProps
>;

export interface FormProps<T, TContext = unknown> {
  type?: unknown;
  value?: T;
  options?: {
    getComponent?: (
      type: TypeWithMeta | null,
      options: Record<string, unknown>,
    ) => FieldComponentType<T>;
    uidGenerator?: import('../util').UIDGenerator;
    [key: string]: unknown;
  };
  onChange?: (value: T) => void;
  context?: TContext;
  stylesheet?: Partial<typeof import('../stylesheets/bootstrap').default>;
  templates?: FormTemplates;
  i18n?: I18n;
}

export interface FormState {
  hasError: boolean;
}

export interface FormInputComponent<T> {
  getValue(): T;
  setState(state: { hasError: boolean }): void;
}

export interface MinimalFormRef<T = unknown> {
  getValue(): T | undefined;
  validate(): ReturnType<typeof import('tcomb-validation').validate>;
  pureValidate(): ReturnType<typeof import('tcomb-validation').validate>;
}

export type FormStatics = {
  i18n: I18n;
  stylesheet: typeof import('../stylesheets/bootstrap').default;
  templates: FormTemplates;
};

export type FormComponent = {
  <T>(props: FormProps<T> & React.RefAttributes<MinimalFormRef<T>>): React.ReactElement | null;
} & FormStatics;

export type LegacyFormNamespace = {
  Form: FormComponent;
  Textbox: typeof import('../fields/Textbox').default;
  Checkbox: typeof import('../fields/Checkbox').default;
  Select: typeof import('../fields/Select').default;
  DatePicker: typeof import('../fields/DatePicker').default;
  List: typeof import('../components/List').default;
  Struct: typeof import('../components/Struct').default;
};

export type LegacyT = typeof import('tcomb-validation') & { form: LegacyFormNamespace };

// Type info used in util.ts
export interface TypeInfo {
  kind: 'irreducible' | 'struct' | 'list';
  type: TypeWithMeta;
  isMaybe: boolean;
  isSubtype: boolean;
  isEnum: boolean;
  isList: boolean;
  isDict: boolean;
  isPrimitive: boolean;
  isObject: boolean;
  isUnion: boolean;
  isRefinement: boolean;
}

// Shared small component prop types
export type ErrorBlockProps = {
  hasError?: boolean;
  error?: string;
  style?: StyleProp<TextStyle>;
};

export type HelpBlockProps = {
  help?: string;
  hasError?: boolean;
  style?: StyleProp<TextStyle>;
};
