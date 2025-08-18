import { StyleProp, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { ComponentType } from 'react';
import { Type } from 'tcomb';

/**
 * Props for the Textbox component
 * Extends React Native's TextInputProps but overrides the style prop with a more specific type
 */
export interface TextboxTemplateProps
  extends Omit<TextInputProps, 'style' | 'onChangeText' | 'value'> {
  hidden?: boolean;
  type?: TypeWithMeta;
  /** The input value */
  value?: string | number | null;
  /** Callback that is called when the text input's text changes */
  onChangeText?: (text: string) => void;
  /** Additional options for the textbox */
  options?: {
    /** Label text for the input */
    label?: string;
    /** Placeholder text for the input */
    placeholder?: string;
    /** Transformer for formatting/parsing the input value */
    transformer?: {
      format: <T = unknown>(value: T) => string;
      parse: <T = unknown>(value: string) => T;
    };
    [key: string]: unknown;
  };
  /** Context object for internationalization and auto-labeling */
  ctx?: {
    auto: string;
    label?: string;
    i18n: {
      optional: string;
      required: string;
    };
    templates?: FormTemplates;
  };
  stylesheet: {
    formGroup?: {
      normal?: StyleProp<ViewStyle>;
      error?: StyleProp<ViewStyle>;
    };
    controlLabel?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
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
    helpBlock?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    errorBlock?: StyleProp<TextStyle>;
  };
  hasError?: boolean;
  editable?: boolean;
  label?: string;
  help?: string;
  error?: string;
  /** Callback when the text changes */
  onChange?: (event: { nativeEvent: { text: string } }) => void;
}

// Common props for all form field templates
export interface BaseTemplateProps {
  /** Whether the field is hidden */
  hidden?: boolean;
  /** Styles for the field components */
  stylesheet: {
    formGroup?: {
      normal?: StyleProp<ViewStyle>;
      error?: StyleProp<ViewStyle>;
    };
    controlLabel?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    helpBlock?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    errorBlock?: StyleProp<TextStyle>;
  };
  /** Indicates if the field has an error */
  hasError?: boolean;
  /** Label text for the field */
  label?: string;
  /** Help text displayed below the field */
  help?: string;
  /** Error message to display when hasError is true */
  error?: string;
  /** Additional test ID for testing purposes */
  testID?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

// Form Component Types
export interface I18n {
  [key: string]: string | I18n;
}

export interface FormState {
  hasError: boolean;
}

export interface FormTemplates {
  textbox?: ComponentType<TextboxTemplateProps>;
  checkbox?: ComponentType<CheckboxTemplateProps>;
  select?: ComponentType<SelectTemplateProps<unknown>>;
  datePicker?: ComponentType<DatePickerTemplateProps>;
  list?: ComponentType<ListTemplateProps>;
  struct?: ComponentType<StructTemplateProps>;
  [key: string]: unknown;
}

// Common Types
export type UIDGenerator = {
  next: (prefix?: string) => string;
};

// Add more specific template prop types as needed
/**
 * Props for the Checkbox component
 */
export interface CheckboxTemplateProps extends Omit<BaseTemplateProps, 'stylesheet'> {
  /** Current value of the checkbox */
  value: boolean;
  /** Callback when the checkbox value changes */
  onChange: (value: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Label text for the checkbox */
  label?: string;
  /** Help text displayed below the checkbox */
  help?: string;
  /** Error message to display when hasError is true */
  error?: string;
  /** Indicates if the checkbox has an error */
  hasError?: boolean;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Styles for the checkbox component */
  stylesheet: {
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
    helpBlock?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    errorBlock?: StyleProp<TextStyle>;
  };
}

/**
 * Represents an option in a select/dropdown component
 */
export interface SelectOption<T = unknown> {
  value: T;
  text: string;
}

/**
 * Props for the Select component
 */
export interface SelectTemplateProps<T = unknown> extends Omit<BaseTemplateProps, 'stylesheet'> {
  /** Array of options to display in the select */
  options: Array<SelectOption<T>>;
  /** Currently selected value */
  value: T | null;
  /** Callback when the selected value changes */
  onChange: (value: T | null) => void;
  /** Optional null/placeholder option */
  nullOption?: SelectOption<null>;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** For backward compatibility */
  text?: string;
  /** Additional styles for the select component */
  styles?: {
    picker?: StyleProp<ViewStyle>;
    pickerItem?: StyleProp<TextStyle>;
    pickerContainer?: StyleProp<ViewStyle>;
  };
  /** Styles for the select component */
  stylesheet: {
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
    helpBlock?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    errorBlock?: StyleProp<TextStyle>;
  };
  /** Callback when the picker is opened */
  onOpen?: () => void;
  /** Callback when the picker is closed */
  onClose?: () => void;
}

/**
 * Props for the DatePicker component
 */
export interface DatePickerTemplateProps extends Omit<BaseTemplateProps, 'stylesheet'> {
  /** Currently selected date */
  value: Date | null;
  /** Callback when the date changes */
  onChange: (date: Date | null) => void;
  /** Picker mode: date, time, or datetime */
  mode?: 'date' | 'time' | 'datetime';
  /** Format string for the displayed date */
  format?: string;
  /** Minimum selectable date */
  minimumDate?: Date;
  /** Maximum selectable date */
  maximumDate?: Date;
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Additional styles for the date picker component */
  styles?: {
    datePicker?: StyleProp<ViewStyle>;
    dateText?: StyleProp<TextStyle>;
    dateTouchBody?: StyleProp<ViewStyle>;
  };
  /** Styles for the date picker component */
  stylesheet: {
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
    helpBlock?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    errorBlock?: StyleProp<TextStyle>;
  };
  /** Callback when the picker is opened */
  onOpen?: () => void;
  /** Callback when the picker is closed */
  onClose?: () => void;
}

/**
 * Represents an action that can be performed on a list item
 */
export interface ListItemAction {
  type: string;
  label: string;
  click: () => void;
  disabled?: boolean;
}

/**
 * Represents an item in a list component
 */
export interface ListItem<T = unknown> {
  key: string;
  input: React.ReactNode;
  buttons?: ListItemAction[];
  item: T;
  index: number;
}

/**
 * Props for the List component
 */
export interface ListTemplateProps<T = unknown> extends Omit<BaseTemplateProps, 'stylesheet'> {
  /** Array of items to render in the list */
  items: T[];
  /** Callback when the add button is pressed */
  onAdd: () => void;
  /** Callback when an item is removed */
  onRemove: (index: number) => void;
  /** Function to render each list item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Label for the add button */
  addLabel?: string;
  /** Label for the remove button */
  removeLabel?: string;
  /** Whether the list is disabled */
  disabled?: boolean;
  /** Styles for the list component */
  stylesheet: {
    formGroup?: {
      normal?: StyleProp<ViewStyle>;
      error?: StyleProp<ViewStyle>;
    };
    controlLabel?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    itemContainer?: {
      normal?: StyleProp<ViewStyle>;
      error?: StyleProp<ViewStyle>;
      disabled?: StyleProp<ViewStyle>;
    };
    helpBlock?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    errorBlock?: StyleProp<TextStyle>;
    button?: {
      normal?: StyleProp<ViewStyle>;
      disabled?: StyleProp<ViewStyle>;
    };
    buttonText?: {
      normal?: StyleProp<TextStyle>;
      disabled?: StyleProp<TextStyle>;
    };
  };
  /** For backward compatibility */
  label?: string;
  /** For backward compatibility */
  help?: string;
  /** For backward compatibility */
  error?: string;
  /** For backward compatibility */
  hasError?: boolean;
}

/**
 * Props for the Struct component
 */
export interface StructTemplateProps extends Omit<BaseTemplateProps, 'stylesheet'> {
  /** Child components */
  children?: React.ReactNode;
  /** Styles for the struct component */
  stylesheet: {
    fieldset?: StyleProp<ViewStyle>;
    controlLabel?: {
      normal?: StyleProp<TextStyle>;
      error?: StyleProp<TextStyle>;
    };
    errorBlock?: StyleProp<TextStyle>;
  };
  /** For backward compatibility */
  fieldset?: StyleProp<ViewStyle>;
  /** For backward compatibility */
  controlLabel?: {
    normal?: StyleProp<TextStyle>;
    error?: StyleProp<TextStyle>;
  };
  /** For backward compatibility */
  errorBlock?: StyleProp<TextStyle>;
  /** For backward compatibility */
  label?: string;
  /** For backward compatibility */
  error?: string;
  /** For backward compatibility */
  hasError?: boolean;
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
