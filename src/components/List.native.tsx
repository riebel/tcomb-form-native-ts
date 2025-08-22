import { useCallback, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

import type { ListTemplateProps } from '../types/field.types';

const List = <T,>({
  items: itemsProp = [] as T[],
  value,
  onAdd,
  onRemove,
  renderItem: renderItemProp,
  addLabel = 'Add',
  removeLabel = 'Remove',
  // ordering controls
  onMoveUp,
  onMoveDown,
  disableAdd,
  disableRemove,
  disableOrder,
  upLabel,
  downLabel,
  disabled = false,
  hidden,
  stylesheet,
  hasError,
  label,
  help,
  error,
  showRequiredIndicator,
  required,
  ctx,
  ...rest
}: ListTemplateProps<T>) => {
  const keyMap = useRef(new Map<unknown, string>());
  const items = (itemsProp ?? (value as T[] | undefined) ?? []) as T[];
  // Resolve styles
  const formGroupStyle = StyleSheet.flatten([
    styles.formGroup,
    stylesheet.formGroup?.normal,
    hasError && stylesheet.formGroup?.error,
  ]);

  const controlLabelStyle = StyleSheet.flatten([
    styles.controlLabel,
    stylesheet.controlLabel?.normal,
    hasError && stylesheet.controlLabel?.error,
  ]);

  const helpBlockStyle = StyleSheet.flatten([
    styles.helpBlock,
    stylesheet.helpBlock?.normal,
    hasError && stylesheet.helpBlock?.error,
  ]);

  const errorBlockStyle = StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);

  const buttonStyle = StyleSheet.flatten([
    styles.button,
    stylesheet.button?.normal,
    disabled && stylesheet.button?.disabled,
  ]);

  const buttonTextStyle = StyleSheet.flatten([
    styles.buttonText,
    stylesheet.buttonText?.normal,
    disabled && stylesheet.buttonText?.disabled,
  ]);

  const itemContainerStyle = StyleSheet.flatten([
    styles.itemContainer,
    stylesheet.itemContainer?.normal,
  ]);

  const renderItemWithButtons = useCallback(
    (item: T, index: number) => {
      // Allow removing to empty list
      const canRemove = !disabled && !disableRemove && items.length >= 1;
      const canMoveUp = !disabled && !disableOrder && typeof onMoveUp === 'function' && index > 0;
      const canMoveDown =
        !disabled && !disableOrder && typeof onMoveDown === 'function' && index < items.length - 1;
      const buttons = disableRemove
        ? []
        : [
            {
              type: 'remove',
              label: removeLabel,
              click: () => onRemove && onRemove(index),
              disabled: !canRemove,
            },
          ];

      let itemKey = (item as unknown as { key?: string })?.key;
      if (!itemKey) {
        const existing = keyMap.current.get(item as unknown as object);
        if (existing) {
          itemKey = existing;
        } else {
          const generated = ctx?.uidGenerator?.next?.() ?? `item-${index}`;
          keyMap.current.set(item as unknown as object, generated);
          itemKey = generated;
        }
      }
      return (
        <View key={itemKey} style={itemContainerStyle}>
          <View style={styles.itemContent}>{renderItemProp(item, index)}</View>
          {!disabled && (
            <View style={styles.buttonGroup}>
              {buttons.map(button => (
                <TouchableOpacity
                  key={button.type}
                  style={[buttonStyle, button.disabled && styles.disabledButton]}
                  onPress={button.click}
                  disabled={button.disabled}
                >
                  <Text style={buttonTextStyle}>{button.label}</Text>
                </TouchableOpacity>
              ))}
              {!disableOrder && (
                <>
                  {typeof onMoveUp === 'function' && (
                    <TouchableOpacity
                      key="move-up"
                      style={[buttonStyle, !canMoveUp && styles.disabledButton]}
                      onPress={() => onMoveUp(index)}
                      disabled={!canMoveUp}
                    >
                      <Text style={buttonTextStyle}>{upLabel ?? '↑'}</Text>
                    </TouchableOpacity>
                  )}
                  {typeof onMoveDown === 'function' && (
                    <TouchableOpacity
                      key="move-down"
                      style={[buttonStyle, !canMoveDown && styles.disabledButton]}
                      onPress={() => onMoveDown(index)}
                      disabled={!canMoveDown}
                    >
                      <Text style={buttonTextStyle}>{downLabel ?? '↓'}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      );
    },
    [
      onRemove,
      removeLabel,
      disableRemove,
      disabled,
      items.length,
      itemContainerStyle,
      buttonStyle,
      buttonTextStyle,
      renderItemProp,
      disableOrder,
      onMoveUp,
      onMoveDown,
      upLabel,
      downLabel,
      ctx,
    ],
  );

  if (hidden) {
    return null;
  }

  return (
    <View style={formGroupStyle} {...rest}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}
      {label && showRequiredIndicator && required && <Text style={controlLabelStyle}> *</Text>}

      {items.map((item: T, index: number) => renderItemWithButtons(item, index))}

      {!disabled && !disableAdd && onAdd && (
        <TouchableOpacity
          style={[buttonStyle, styles.addButton]}
          onPress={onAdd}
          disabled={disabled}
        >
          <Text style={buttonTextStyle}>+ {addLabel}</Text>
        </TouchableOpacity>
      )}

      {help && !hasError && <Text style={helpBlockStyle}>{help}</Text>}
      {hasError && error && (
        <Text style={errorBlockStyle} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#e9f5ff',
    borderColor: '#b8dfff',
    borderWidth: 1,
    marginTop: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 60,
    padding: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorBlock: {
    color: '#a94442',
    fontSize: 12,
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 10,
  },
  helpBlock: {
    color: '#737373',
    fontSize: 12,
    marginTop: 5,
  },
  itemContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
});

export default List;
