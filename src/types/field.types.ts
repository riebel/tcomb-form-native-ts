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
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  value?: TValue;
  onChange?: (value: TValue) => void;
  stylesheet: TStylesheet;
} & TExtraProps;

// Transformer
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

// Legacy list item shape from the original tcomb-form-native templates
export interface LegacyListItem {
  key: string;
  input: ReactNode;
  buttons: LegacyActionButton[];
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
  label?: ReactNode;
  help?: ReactNode;
  template?: ComponentType<TTemplateProps>;
  hasError?: boolean;
  error?: ReactNode | ((value: unknown) => ReactNode);
  transformer?: TTransformer;
  // Per-field overrides
  auto?: string;
  i18n?: I18n;
  hidden?: boolean;
  disabled?: boolean;
  // Per-field stylesheet override (merged over form-level)
  stylesheet?: Partial<typeof import('../stylesheets/bootstrap').default>;
};

export type BaseCtx<TTemplates extends Record<string, unknown> = Record<string, unknown>> = {
  auto: string;
  label?: string;
  i18n?: { optional?: string; required?: string } | I18n;
  templates?: TTemplates;
  // Arbitrary config merged from ctx.config and options.config
  config?: Record<string, unknown>;
};

export type FieldProps<TValue, TOptions, TCtx, TTypeLike = unknown> = {
  type?: TTypeLike;
  value?: TValue;
  options?: TOptions;
  ctx?: TCtx;
  // required exposed for validation
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
    // Optional asterisk hint when `required`
    showRequiredIndicator?: boolean;
    // Legacy-compatible Textbox props
    type?: {
      meta?: { optional?: boolean; kind?: string };
      (value: unknown): unknown;
    };
    options?: TextboxOptions;
    ctx?: { auto?: string; label?: string; i18n?: I18n; templates?: FormTemplates };
    // RN TextInput props passthrough
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
    blurOnSubmit?: boolean;
    selectTextOnFocus?: boolean;
    // Additional RN TextInput props
    allowFontScaling?: boolean;
    placeholderTextColor?: TextInputProps['placeholderTextColor'];
    underlineColorAndroid?: TextInputProps['underlineColorAndroid'];
    selectionColor?: TextInputProps['selectionColor'];
    maxLength?: number;
    onEndEditing?: TextInputProps['onEndEditing'];
    onLayout?: TextInputProps['onLayout'];
    onSelectionChange?: TextInputProps['onSelectionChange'];
    onContentSizeChange?: TextInputProps['onContentSizeChange'];
    numberOfLines?: number;
    multiline?: boolean;
    clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
    clearTextOnFocus?: boolean;
    enablesReturnKeyAutomatically?: boolean;
    keyboardAppearance?: 'default' | 'light' | 'dark';
    onKeyPress?: TextInputProps['onKeyPress'];
    selectionState?: TextInputProps['selectionState'];
    textContentType?: TextInputProps['textContentType'];
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
  // Android Picker options
  mode?: 'dialog' | 'dropdown';
  prompt?: string;
  itemStyle?: StyleProp<TextStyle>;
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
> & {
  // DatePicker options
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: number;
  timeZoneOffsetInMinutes?: number;
  onPress?: () => void;
  config?: {
    animation?: boolean;
    animationConfig?: Record<string, unknown>;
    format?: (date: Date) => string;
    defaultValueText?: string;
    dialogMode?: 'default' | 'spinner' | 'calendar';
  };
};
export type DatePickerCtx = BaseCtx<{
  datePicker?: ComponentType<DatePickerTemplateProps>;
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
    kind?: string;
    type?: Dispatchable;
    of?: Dispatchable;
  };
};

export type ListProps<T = unknown> = FieldProps<
  T[],
  Record<string, unknown>,
  {
    templates?: { list?: ComponentType<ListTemplateProps<unknown>> };
    uidGenerator?: { next: () => string };
  },
  ListTypeLike & Dispatchable
>;

export type CheckboxTemplateProps = BaseTemplateProps<
  boolean,
  CheckboxStylesheet,
  {
    // Optional asterisk hint when `required`
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
    // Optional asterisk hint when `required`
    showRequiredIndicator?: boolean;
    options: SelectOption<TValue>[];
    nullOption?: SelectOption<null> | false;
    text?: string;
    order?: 'asc' | 'desc';
    isCollapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
    onOpen?: () => void;
    onClose?: () => void;
    // Android Picker props
    mode?: 'dialog' | 'dropdown';
    prompt?: string;
    itemStyle?: StyleProp<TextStyle>;
  }
>;

export type DatePickerTemplateProps = BaseTemplateProps<
  Date | null,
  DatePickerStylesheet,
  {
    // Optional asterisk hint when `required`
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
    // Hook before opening the picker
    onPress?: () => void;
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

// Legacy button object shape some apps pass for list controls
// Legacy action button used by some older list templates
export interface LegacyActionButton {
  // Legacy fields observed in older list templates
  type: string; // e.g. 'add', 'remove', 'up', 'down'
  click: () => void;
  // Friendly fields for RN templates (optional)
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export type ListTemplateProps<T> = Omit<
  BaseTemplateProps<T[], ListStylesheet>,
  'error' | 'label' | 'hasError' | 'hidden'
> & {
  // Force legacy-compatible error to be a required string
  error: string;
  // Legacy templates expect hasError to be boolean (not optional)
  hasError: boolean;
  // Legacy templates expect hidden to be boolean (not optional)
  hidden: boolean;
  // Legacy templates generally used string label
  label?: string | null;
  // UI hint: when true and `required`, templates may render an asterisk next to the label
  showRequiredIndicator?: boolean;
  // Legacy templates expect framework-provided items array with key/input/buttons
  items: LegacyListItem[];
  // Legacy list locals included a className string on locals
  className?: string;
  // New API callbacks
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  // Legacy aliases (kept for backward compatibility)
  // NOTE: Some apps declare these as required in their component types. We include them here
  // so user components remain assignable to our template slot without code changes.
  /** @deprecated Use onAdd */
  add: LegacyActionButton;
  /** @deprecated Use onRemove */
  remove?: LegacyActionButton;
  /** @deprecated Use onMoveUp */
  moveUp?: LegacyActionButton;
  /** @deprecated Use onMoveDown */
  moveDown?: LegacyActionButton;
  renderItem: (item: T, index: number) => ReactNode;
  addLabel?: string;
  removeLabel?: string;
  upLabel?: string;
  downLabel?: string;
  disableAdd?: boolean;
  disableRemove?: boolean;
  disableOrder?: boolean;
  // Legacy-like context for templates that need UID keys and path
  ctx?: { uidGenerator?: { next: () => string }; path?: Array<string | number> };
};

export type StructTemplateProps = BaseTemplateProps<
  never,
  StructStylesheet,
  {
    children?: ReactNode;
    fieldset?: StyleProp<ViewStyle>;
    controlLabel?: { normal?: StyleProp<TextStyle>; error?: StyleProp<TextStyle> };
    errorBlock?: StyleProp<TextStyle>;
    // UI hint: when true and `required`, templates may render an asterisk next to the label
    showRequiredIndicator?: boolean;
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
  // Custom list templates
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

export type FormProps<T = unknown, TContext = Record<string, unknown>> = {
  type?: unknown;
  value?: T;
  options?:
    | (Record<string, unknown> & {
        getComponent?: (
          type: TypeWithMeta | null,
          options: Record<string, unknown>,
        ) => FieldComponentType<T>;
        uidGenerator?: import('../util').UIDGenerator;
      })
    | undefined;
  onChange?: (value: T, path?: Array<string | number>) => void;
  context?: TContext;
  stylesheet?: Partial<typeof import('../stylesheets/bootstrap').default>;
  templates?: FormTemplates;
  i18n?: I18n;
};

export interface FormState {
  hasError: boolean;
}

export interface FormInputComponent<T> {
  getValue(): T;
  setState(state: { hasError: boolean }): void;
}

export interface MinimalFormRef<T = unknown> {
  /**
   * Read the current valid value. Returns null when invalid per legacy contract.
   */
  getValue(): T | null;
  validate(): ReturnType<typeof import('tcomb-validation').validate>;
  pureValidate(): ReturnType<typeof import('tcomb-validation').validate>;
  // Minimal legacy helper: returns the root component when path is omitted or empty
  getComponent(path?: Array<string | number>): FormInputComponent<T> | undefined;
  // Legacy helper exposure for apps that used uid generator directly
  getUIDGenerator(): import('../util').UIDGenerator | undefined;
}

export type FormStatics = {
  i18n: I18n;
  stylesheet: typeof import('../stylesheets/bootstrap').default;
  templates: FormTemplates;
};

export type FormComponent = {
  <T>(
    props: FormProps<T> & React.RefAttributes<MinimalFormRef<T> | { getValue(): T | null }>,
  ): React.ReactElement | null;
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
  error?: ReactNode;
  style?: StyleProp<TextStyle>;
};

export type HelpBlockProps = {
  help?: ReactNode;
  hasError?: boolean;
  style?: StyleProp<TextStyle>;
};
