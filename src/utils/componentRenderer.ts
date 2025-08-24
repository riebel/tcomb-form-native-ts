import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import {
  TextboxTemplateProps,
  CheckboxTemplateProps,
  SelectTemplateProps,
  DatePickerTemplateProps,
  FieldComponentType,
  TypeWithMeta,
} from '../types/field.types';
import { getTypeInfo } from '../util';
import Textbox from '../fields/Textbox';
import Checkbox from '../fields/Checkbox';
import Select from '../fields/Select';
import DatePicker from '../fields/DatePicker';

// Helper types for component rendering
export type ComponentRenderProps<T = unknown> = {
  Component: FieldComponentType<T>;
  baseProps: Record<string, unknown>;
  resolvedOptions: Record<string, unknown> | undefined;
  value: unknown;
  onChange: (v: unknown) => void;
  key: string;
};

export type EnumOptions = { value: string; text: string }[];

// Helper to extract enum options from a type
export function getEnumOptions(type: TypeWithMeta | null): EnumOptions {
  if (!type) return [];

  const typeInfo = getTypeInfo(type);
  if (!typeInfo?.isEnum) return [];

  const meta = type.meta as { map?: Record<string, unknown> } | undefined;
  const map = meta?.map;
  if (!map) return [];

  return Object.keys(map).map(value => ({ value, text: String(map[value]) }));
}

// Centralized component renderer to eliminate duplication
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
    return React.createElement(Select.ReactComponent, {
      key,
      ...(baseProps as SelectTemplateProps<unknown>),
      options: enumOptions,
      mode: (resolvedOptions as { mode?: 'dialog' | 'dropdown' })?.mode,
      prompt: (resolvedOptions as { prompt?: string })?.prompt,
      itemStyle: (resolvedOptions as { itemStyle?: StyleProp<TextStyle> })?.itemStyle,
      isCollapsed: (resolvedOptions as { isCollapsed?: boolean })?.isCollapsed,
      onCollapseChange: (resolvedOptions as { onCollapseChange?: (collapsed: boolean) => void })
        ?.onCollapseChange,
      value: value !== undefined ? String(value) : null,
      onChange,
    });
  }

  if (Component === DatePicker.ReactComponent) {
    return React.createElement(DatePicker.ReactComponent, {
      key,
      ...(baseProps as DatePickerTemplateProps),
      mode: (resolvedOptions as { mode?: 'date' | 'time' | 'datetime' })?.mode,
      minimumDate: (resolvedOptions as { minimumDate?: Date })?.minimumDate,
      maximumDate: (resolvedOptions as { maximumDate?: Date })?.maximumDate,
      minuteInterval: (resolvedOptions as { minuteInterval?: number })?.minuteInterval,
      timeZoneOffsetInMinutes: (resolvedOptions as { timeZoneOffsetInMinutes?: number })
        ?.timeZoneOffsetInMinutes,
      onPress: (resolvedOptions as { onPress?: () => void })?.onPress,
      value: (value as Date) ?? null,
      onChange: (d: Date | null) => onChange(d),
    });
  }

  // Generic fallback
  return React.createElement(Component as React.ComponentType<unknown>, {
    key,
    ...baseProps,
  });
}

// Check if component can be rendered with the centralized renderer
export function canUseCentralizedRenderer(Component: unknown): boolean {
  return [
    Textbox.ReactComponent,
    Checkbox.ReactComponent,
    Select.ReactComponent,
    DatePicker.ReactComponent,
  ].includes(Component as never);
}
