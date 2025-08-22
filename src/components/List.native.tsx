import React, { useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import type { ListTemplateProps } from '../types/field.types';

const List = <T,>({
  // Items provided for legacy web templates; native computes items from value
  items: _legacyItems,
  value,
  // New API callbacks
  onAdd: onAddProp,
  onRemove: onRemoveProp,
  // Legacy aliases (if provided by user templates)
  add,
  remove,
  // ordering controls
  onMoveUp: onMoveUpProp,
  onMoveDown: onMoveDownProp,
  moveUp,
  moveDown,
  renderItem: renderItemProp,
  addLabel = 'Add',
  removeLabel = 'Remove',
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
  const asTextStyle = (s: unknown): StyleProp<TextStyle> => s as StyleProp<TextStyle>;
  const asViewStyle = (s: unknown): StyleProp<ViewStyle> => s as StyleProp<ViewStyle>;

  const renderMaybeText = (node: unknown, textStyle: StyleProp<TextStyle>) => {
    if (typeof node === 'string' || typeof node === 'number') {
      return <Text style={textStyle}>{node}</Text>;
    }
    return React.isValidElement(node) ? (node as React.ReactElement) : null;
  };
  // Support legacy Button object for add/remove/move controls
  const addBtn = add && typeof add === 'object' ? add : undefined;
  const onAdd = onAddProp ?? addBtn?.onPress ?? addBtn?.click;
  const effectiveAddLabel = addBtn?.label ?? addLabel;
  const onRemove = onRemoveProp ?? (typeof remove === 'object' ? undefined : remove);
  const onMoveUp = onMoveUpProp ?? (typeof moveUp === 'object' ? undefined : moveUp);
  const onMoveDown = onMoveDownProp ?? (typeof moveDown === 'object' ? undefined : moveDown);
  const keyMap = useRef(new Map<unknown, string>());
  const items = ((value as T[] | undefined) ?? []) as T[];
  // Resolve styles
  const formGroupStyle: ViewStyle = StyleSheet.flatten([
    styles.formGroup,
    asViewStyle(stylesheet.formGroup?.normal),
    hasError && asViewStyle(stylesheet.formGroup?.error),
  ]);

  const controlLabelStyle: TextStyle = StyleSheet.flatten([
    styles.controlLabel,
    asTextStyle(stylesheet.controlLabel?.normal),
    hasError && asTextStyle(stylesheet.controlLabel?.error),
  ]);

  const helpBlockStyle: TextStyle = StyleSheet.flatten([
    styles.helpBlock,
    asTextStyle(stylesheet.helpBlock?.normal),
    hasError && asTextStyle(stylesheet.helpBlock?.error),
  ]);

  const errorBlockStyle: TextStyle = StyleSheet.flatten([
    styles.errorBlock,
    asTextStyle(stylesheet.errorBlock),
  ]);

  const buttonStyle: ViewStyle = StyleSheet.flatten([
    styles.button,
    asViewStyle(stylesheet.button?.normal),
    disabled && asViewStyle(stylesheet.button?.disabled),
  ]);

  const buttonTextStyle: TextStyle = StyleSheet.flatten([
    styles.buttonText,
    asTextStyle(stylesheet.buttonText?.normal),
    disabled && asTextStyle(stylesheet.buttonText?.disabled),
  ]);

  const itemContainerStyle: ViewStyle = StyleSheet.flatten([
    styles.itemContainer,
    asViewStyle(stylesheet.itemContainer?.normal),
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
                  style={StyleSheet.flatten([
                    buttonStyle,
                    button.disabled && styles.disabledButton,
                  ])}
                  onPress={button.click}
                  disabled={button.disabled}
                >
                  {renderMaybeText(button.label, buttonTextStyle)}
                </TouchableOpacity>
              ))}
              {!disableOrder && (
                <>
                  {typeof onMoveUp === 'function' && (
                    <TouchableOpacity
                      key="move-up"
                      style={StyleSheet.flatten([buttonStyle, !canMoveUp && styles.disabledButton])}
                      onPress={() => onMoveUp(index)}
                      disabled={!canMoveUp}
                    >
                      {renderMaybeText(upLabel ?? '↑', buttonTextStyle)}
                    </TouchableOpacity>
                  )}
                  {typeof onMoveDown === 'function' && (
                    <TouchableOpacity
                      key="move-down"
                      style={StyleSheet.flatten([
                        buttonStyle,
                        !canMoveDown && styles.disabledButton,
                      ])}
                      onPress={() => onMoveDown(index)}
                      disabled={!canMoveDown}
                    >
                      {renderMaybeText(downLabel ?? '↓', buttonTextStyle)}
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
      {label && renderMaybeText(label, controlLabelStyle)}
      {label && showRequiredIndicator && required && <Text style={controlLabelStyle}> *</Text>}

      {items.map((item: T, index: number) => renderItemWithButtons(item, index))}

      {!disabled && !disableAdd && onAdd && (
        <TouchableOpacity
          style={StyleSheet.flatten([buttonStyle, styles.addButton])}
          onPress={onAdd}
          disabled={disabled || Boolean(addBtn?.disabled)}
        >
          {typeof effectiveAddLabel === 'string' || typeof effectiveAddLabel === 'number' ? (
            <Text style={buttonTextStyle}>+ {effectiveAddLabel}</Text>
          ) : React.isValidElement(effectiveAddLabel) ? (
            <View style={styles.inlineLabelRow}>
              <Text style={buttonTextStyle}>+</Text>
              {effectiveAddLabel}
            </View>
          ) : (
            <Text style={buttonTextStyle}>+</Text>
          )}
        </TouchableOpacity>
      )}

      {help && !hasError && renderMaybeText(help, helpBlockStyle)}
      {hasError && error && renderMaybeText(error, errorBlockStyle)}
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
  inlineLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
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
