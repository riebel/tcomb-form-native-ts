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

  if (Component === Textbox.ReactComponent) {
    return React.createElement(Textbox.ReactComponent, {
      key,
      ...(baseProps as TextboxTemplateProps),
      onChangeText: (text: string) => onChange(text),
    });
  }

  if (Component === Checkbox.ReactComponent) {
    return React.createElement(Checkbox.ReactComponent, {
      key,
      ...(baseProps as CheckboxTemplateProps),
      value: !!value,
      onChange: (v: boolean) => onChange(v),
    });
  }

  if (Component === Select.ReactComponent) {
    const enumOptions = getEnumOptions(baseProps.type as TypeWithMeta | null);
    const selectOptions = isSelectOptions(resolvedOptions) ? resolvedOptions : {};

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

  if (Component === DatePicker.ReactComponent) {
    const dateOptions = isDatePickerOptions(resolvedOptions) ? resolvedOptions : {};

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
  return React.createElement(Component as React.ComponentType<Record<string, unknown>>, {
    key,
    ...baseProps,
  });
}

const SUPPORTED_COMPONENTS = [
  Textbox.ReactComponent,
  Checkbox.ReactComponent,
  Select.ReactComponent,
  DatePicker.ReactComponent,
] as const;

export function canUseCentralizedRenderer(Component: unknown): Component is SupportedComponent {
  return SUPPORTED_COMPONENTS.includes(Component as never);
}
