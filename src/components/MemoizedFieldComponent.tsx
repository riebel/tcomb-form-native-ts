import React, { memo, useMemo, useCallback } from 'react';
import {
  renderFieldComponent,
  canUseCentralizedRenderer,
  ComponentRenderProps,
} from '../utils/componentRenderer';
import { MemoizedFieldComponentProps } from '../types/utility.types';

const MemoizedFieldComponentInner = <T,>(props: MemoizedFieldComponentProps<T>) => {
  const {
    Component,
    baseProps,
    resolvedOptions,
    value,
    onChange,
    componentKey,
    disabled,
    hasError,
  } = props;

  // Memoize the component render props to prevent object recreation
  const renderProps = useMemo(
    (): ComponentRenderProps<T> => ({
      Component,
      baseProps: {
        ...baseProps,
        disabled,
        hasError,
      },
      resolvedOptions,
      value,
      onChange,
      key: componentKey,
    }),
    [Component, baseProps, resolvedOptions, value, onChange, componentKey, disabled, hasError],
  );

  // Memoize the change handler to prevent function recreation
  const memoizedOnChange = useCallback(
    (newValue: unknown) => {
      onChange(newValue);
    },
    [onChange],
  );

  // Update the render props with the memoized change handler
  const finalRenderProps = useMemo(
    (): ComponentRenderProps<T> => ({
      ...renderProps,
      onChange: memoizedOnChange,
    }),
    [renderProps, memoizedOnChange],
  );

  // Use centralized renderer if supported, otherwise fall back to generic rendering
  if (canUseCentralizedRenderer(Component)) {
    return renderFieldComponent(finalRenderProps);
  }

  // Generic fallback for unsupported components
  const GenericComponent = Component as React.ComponentType<Record<string, unknown>>;
  return (
    <GenericComponent
      key={componentKey}
      {...baseProps}
      value={value}
      onChange={memoizedOnChange}
      disabled={disabled}
      hasError={hasError}
    />
  );
};

const arePropsEqual = <T,>(
  prevProps: MemoizedFieldComponentProps<T>,
  nextProps: MemoizedFieldComponentProps<T>,
): boolean => {
  // Quick reference equality checks first
  if (
    prevProps.Component !== nextProps.Component ||
    prevProps.value !== nextProps.value ||
    prevProps.onChange !== nextProps.onChange ||
    prevProps.componentKey !== nextProps.componentKey ||
    prevProps.disabled !== nextProps.disabled ||
    prevProps.hasError !== nextProps.hasError
  ) {
    return false;
  }

  // Deep comparison for baseProps (shallow comparison for performance)
  const prevBaseKeys = Object.keys(prevProps.baseProps);
  const nextBaseKeys = Object.keys(nextProps.baseProps);

  if (prevBaseKeys.length !== nextBaseKeys.length) {
    return false;
  }

  for (const key of prevBaseKeys) {
    if (prevProps.baseProps[key] !== nextProps.baseProps[key]) {
      return false;
    }
  }

  // Deep comparison for resolvedOptions (shallow comparison for performance)
  if (prevProps.resolvedOptions !== nextProps.resolvedOptions) {
    if (!prevProps.resolvedOptions || !nextProps.resolvedOptions) {
      return false;
    }

    const prevOptionsKeys = Object.keys(prevProps.resolvedOptions);
    const nextOptionsKeys = Object.keys(nextProps.resolvedOptions);

    if (prevOptionsKeys.length !== nextOptionsKeys.length) {
      return false;
    }

    for (const key of prevOptionsKeys) {
      if (prevProps.resolvedOptions[key] !== nextProps.resolvedOptions[key]) {
        return false;
      }
    }
  }

  return true;
};

export const MemoizedFieldComponent = memo(MemoizedFieldComponentInner, arePropsEqual) as <T>(
  props: MemoizedFieldComponentProps<T>,
) => React.ReactElement | null;

export const useMemoizedFieldProps = <T,>(
  props: MemoizedFieldComponentProps<T>,
): MemoizedFieldComponentProps<T> => {
  return useMemo(
    () => ({
      Component: props.Component,
      baseProps: props.baseProps,
      resolvedOptions: props.resolvedOptions,
      value: props.value,
      onChange: props.onChange,
      componentKey: props.componentKey,
      disabled: props.disabled,
      hasError: props.hasError,
    }),
    [
      props.Component,
      props.baseProps,
      props.resolvedOptions,
      props.value,
      props.onChange,
      props.componentKey,
      props.disabled,
      props.hasError,
    ],
  );
};

export default MemoizedFieldComponent;
