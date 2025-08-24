export type ExtractFieldValue<T> = T extends { value?: infer V } ? V : unknown;

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

export type FieldName = Branded<string, 'FieldName'>;

export type ComponentKey = Branded<string, 'ComponentKey'>;

export type ValidationError = Branded<string, 'ValidationError'>;

export interface StrictFieldConfig<TValue = unknown, TOptions = Record<string, unknown>> {
  readonly name: FieldName;
  readonly value: TValue;
  readonly options: TOptions;
  readonly required: boolean;
  readonly disabled: boolean;
  readonly hidden: boolean;
}

export interface EnhancedComponentProps<TValue = unknown, TProps = Record<string, unknown>> {
  readonly value: TValue;
  readonly onChange: (value: TValue) => void;
  readonly onBlur?: () => void;
  readonly onFocus?: () => void;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly hasError?: boolean;
  readonly errorMessage?: ValidationError;
  readonly key: ComponentKey;
  readonly additionalProps?: TProps;
}

export function isFieldName(value: unknown): value is FieldName {
  return typeof value === 'string' && value.length > 0 && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value);
}

export function isComponentKey(value: unknown): value is ComponentKey {
  return typeof value === 'string' && value.length > 0;
}

export function createFieldName(name: string): FieldName {
  if (!isFieldName(name)) {
    throw new Error(
      `Invalid field name: ${name}. Field names must start with a letter and contain only letters, numbers, and underscores.`,
    );
  }
  return name as FieldName;
}

export function createComponentKey(key: string): ComponentKey {
  if (!isComponentKey(key)) {
    throw new Error(`Invalid component key: ${key}. Component keys must be non-empty strings.`);
  }
  return key as ComponentKey;
}

export function createValidationError(message: string): ValidationError {
  return message as ValidationError;
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? DeepReadonlyArray<U>
    : T[P] extends Record<string, unknown>
      ? DeepReadonly<T[P]>
      : T[P];
};

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(array: T[]): array is NonEmptyArray<T> {
  return array.length > 0;
}

export type Exact<T> = T & Record<Exclude<PropertyKey, keyof T>, never>;

export type SupportedFieldType =
  | 'textbox'
  | 'checkbox'
  | 'select'
  | 'datepicker'
  | 'struct'
  | 'list';

export type FieldId<TPrefix extends string, TName extends string> = `${TPrefix}_${TName}`;

export function generateFieldId<TPrefix extends string, TName extends string>(
  prefix: TPrefix,
  name: TName,
): FieldId<TPrefix, TName> {
  return `${prefix}_${name}` as FieldId<TPrefix, TName>;
}

export interface SelectOptions {
  mode?: 'dialog' | 'dropdown';
  prompt?: string;
  itemStyle?: import('react-native').StyleProp<import('react-native').TextStyle>;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export interface DatePickerOptions {
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: number;
  timeZoneOffsetInMinutes?: number;
  onPress?: () => void;
}

export interface DateModeOptions {
  mode?: 'date' | 'time' | 'datetime' | string;
}

export interface ComponentRenderProps<T = unknown> {
  readonly Component: import('./field.types').FieldComponentType<T>;
  readonly baseProps: Record<string, unknown>;
  readonly resolvedOptions: Record<string, unknown> | undefined;
  readonly value: unknown;
  readonly onChange: (v: unknown) => void;
  readonly key: string;
}

export type EnumOptions = { value: string; text: string }[];

export type SupportedComponent =
  | typeof import('../fields/Textbox').default.ReactComponent
  | typeof import('../fields/Checkbox').default.ReactComponent
  | typeof import('../fields/Select').default.ReactComponent
  | typeof import('../fields/DatePicker').default.ReactComponent;

export interface ErrorBoundaryProps {
  children: import('react').ReactNode;
  fallback?: import('react').ReactNode;
  onError?: (error: Error, errorInfo: import('react').ErrorInfo) => void;
  showErrorDetails?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: import('react').ErrorInfo | null;
}

export interface MemoizedFieldComponentProps<T = unknown> {
  Component: import('./field.types').FieldComponentType<T>;
  baseProps: Record<string, unknown>;
  resolvedOptions?: Record<string, unknown>;
  value: unknown;
  onChange: (v: unknown) => void;
  componentKey: string;
  disabled?: boolean;
  hasError?: boolean;
}
