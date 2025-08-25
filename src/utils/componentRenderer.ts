import React from 'react';
import {
  TextboxTemplateProps,
  CheckboxTemplateProps,
  SelectTemplateProps,
  DatePickerTemplateProps,
  TypeWithMeta,
} from '../types/field.types';
import {
  SelectOptions,
  DatePickerOptions,
  ComponentRenderProps,
  EnumOptions,
  SupportedComponent,
} from '../types/utility.types';

export type { ComponentRenderProps, EnumOptions };
import { getTypeInfo } from '../util';
import Textbox from '../fields/Textbox';
import Checkbox from '../fields/Checkbox';
import Select from '../fields/Select';
import DatePicker from '../fields/DatePicker';

export function getEnumOptions(type: TypeWithMeta | null): EnumOptions {
  console.log('[componentRenderer] getEnumOptions called:', {
    hasType: !!type,
    typeName: type?.displayName || type?.name || 'unknown',
  });
  if (!type) return [];

  const typeInfo = getTypeInfo(type);
  if (!typeInfo?.isEnum) return [];

  const meta = type.meta as { map?: Record<string, unknown> } | undefined;
  const map = meta?.map;
  if (!map) return [];

  return Object.keys(map)
    .filter(key => key != null && map[key] != null)
    .map(value => ({
      value,
      text: String(map[value] ?? value),
    }));
}

function isSelectOptions(options: unknown): options is SelectOptions {
  return typeof options === 'object' && options !== null;
}

function isDatePickerOptions(options: unknown): options is DatePickerOptions {
  return typeof options === 'object' && options !== null;
}

export function renderFieldComponent<T>(props: ComponentRenderProps<T>): React.ReactElement | null {
  const { Component, baseProps, resolvedOptions, value, onChange, key } = props;
  console.log('[componentRenderer] renderFieldComponent called:', {
    componentName: Component?.displayName || Component?.name || 'anonymous',
    hasBaseProps: !!baseProps,
    hasResolvedOptions: !!resolvedOptions,
    valueType: typeof value,
    hasOnChange: !!onChange,
    key,
  });

  if (Component === Textbox.ReactComponent) {
    console.log('[componentRenderer] Rendering Textbox component');
    return React.createElement(Textbox.ReactComponent, {
      key,
      ...(baseProps as TextboxTemplateProps),
      onChangeText: (text: string) => onChange(text),
    });
  }

  if (Component === Checkbox.ReactComponent) {
    console.log('[componentRenderer] Rendering Checkbox component');
    return React.createElement(Checkbox.ReactComponent, {
      key,
      ...(baseProps as CheckboxTemplateProps),
      value: !!value,
      onChange: (v: boolean) => onChange(v),
    });
  }

  if (Component === Select.ReactComponent) {
    console.log('[componentRenderer] Rendering Select component');
    const enumOptions = getEnumOptions(baseProps.type as TypeWithMeta | null);
    const selectOptions = isSelectOptions(resolvedOptions) ? resolvedOptions : {};
    console.log('[componentRenderer] Select options:', {
      enumOptionsCount: enumOptions.length,
      hasSelectOptions: !!selectOptions,
    });

    return React.createElement(Select.ReactComponent, {
      key,
      ...(baseProps as SelectTemplateProps<unknown>),
      options: enumOptions,
      mode: selectOptions.mode,
      prompt: selectOptions.prompt,
      itemStyle: selectOptions.itemStyle,
      isCollapsed: selectOptions.isCollapsed,
      onCollapseChange: selectOptions.onCollapseChange,
      value: value !== undefined ? String(value) : null,
      onChange,
    });
  }

  if (DatePicker.ReactComponent && Component === DatePicker.ReactComponent) {
    console.log('[componentRenderer] Rendering DatePicker component');
    const dateOptions = isDatePickerOptions(resolvedOptions) ? resolvedOptions : {};
    console.log('[componentRenderer] DatePicker options:', {
      hasDateOptions: !!dateOptions,
      mode: dateOptions.mode,
    });

    return React.createElement(DatePicker.ReactComponent, {
      key,
      ...(baseProps as DatePickerTemplateProps),
      mode: dateOptions.mode,
      minimumDate: dateOptions.minimumDate,
      maximumDate: dateOptions.maximumDate,
      minuteInterval: dateOptions.minuteInterval,
      timeZoneOffsetInMinutes: dateOptions.timeZoneOffsetInMinutes,
      onPress: dateOptions.onPress,
      value: (value as Date) ?? null,
      onChange: (d: Date | null) => onChange(d),
    });
  }

  // Generic fallback
  console.log(
    '[componentRenderer] Using generic fallback for component:',
    Component?.displayName || Component?.name || 'anonymous',
  );
  return React.createElement(Component as React.ComponentType<Record<string, unknown>>, {
    key,
    ...baseProps,
  });
}

const SUPPORTED_COMPONENTS = [
  Textbox.ReactComponent,
  Checkbox.ReactComponent,
  Select.ReactComponent,
  ...(DatePicker.ReactComponent ? [DatePicker.ReactComponent] : []),
] as const;

export function canUseCentralizedRenderer(Component: unknown): Component is SupportedComponent {
  const canUse = SUPPORTED_COMPONENTS.includes(Component as never);
  const componentName =
    (Component as React.ComponentType)?.displayName ||
    (Component as React.ComponentType)?.name ||
    'anonymous';

  // CRITICAL FIX: If component is undefined or anonymous, do not use centralized renderer
  if (!Component || componentName === 'anonymous') {
    console.log(
      '[componentRenderer] canUseCentralizedRenderer: REJECTING undefined/anonymous component:',
      {
        componentName,
        isUndefined: Component === undefined,
        canUse: false,
      },
    );
    return false;
  }

  // Additional validation for DatePicker component specifically
  if (
    DatePicker.ReactComponent &&
    Component === DatePicker.ReactComponent &&
    !DatePicker.ReactComponent
  ) {
    console.error(
      '[componentRenderer] CRITICAL: DatePicker.ReactComponent is undefined during validation!',
      {
        datePickerModule: DatePicker,
        hasDatePicker: !!DatePicker,
        datePickerKeys: Object.keys(DatePicker || {}),
        componentName,
      },
    );
    return false;
  }

  console.log('[componentRenderer] canUseCentralizedRenderer:', {
    componentName,
    canUse,
    supportedCount: SUPPORTED_COMPONENTS.length,
    isDatePicker: Component === DatePicker.ReactComponent,
  });
  return canUse;
}
