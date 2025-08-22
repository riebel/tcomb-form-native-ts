import React from 'react';
import type { LegacyActionButton } from '../types/field.types';
import ListNative from './List.native';

import type { ListTemplateProps, ListItem, Dispatchable, ListProps } from '../types/field.types';

export class List<T = unknown> {
  props: ListProps<T>;

  constructor(props: ListProps<T>) {
    this.props = props;
  }

  private getItemType(): Dispatchable | undefined {
    const t = this.props.type;
    return (t?.meta?.type || t?.meta?.of) as Dispatchable | undefined;
  }

  // Lightweight description for tests
  getItems(): Array<ListItem<T>> {
    const values = Array.isArray(this.props.value) ? this.props.value : [];
    const inner = this.getItemType();

    return values.map((item, index) => {
      // If inner is a union, dispatch to concrete type
      const concreteType = typeof inner?.dispatch === 'function' ? inner.dispatch(item) : inner;
      const input = {
        // Element-like shape for tests (`.input.props.type`)
        props: { type: concreteType },
      } as unknown as React.ReactNode;

      return {
        key: String(index),
        input,
        item,
        index,
      } as ListItem<T>;
    });
  }

  getTemplate() {
    const { ctx } = this.props;
    return ctx?.templates?.list;
  }

  // Generic React component to preserve TValue
  static ReactComponent = class extends React.Component<
    ListTemplateProps<unknown> & {
      // Allow custom template injection similar to other fields
      ctx?: { templates?: { list?: React.ComponentType<ListTemplateProps<unknown>> } };
      templates?: { list?: React.ComponentType<ListTemplateProps<unknown>> };
    }
  > {
    static displayName = 'List';
    render() {
      // Prefer ctx template for parity
      const helper = new List<unknown>({
        // Only ctx needed for template resolution
        ctx: this.props.ctx as ListProps['ctx'],
      } as ListProps);
      const Comp = helper.getTemplate() || this.props.templates?.list || ListNative;
      const isNativeTemplate = Comp === ListNative;
      const asText = (node: unknown): string | undefined =>
        typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;
      // Provide legacy-compatible view over props
      const p = this.props as unknown as ListTemplateProps<unknown>;
      // Build legacy items array expected by classic templates
      const legacyItems = helper.getItems().map(({ key }, index) => ({
        key,
        input: null,
        buttons: [
          // Minimal remove button; actual enable/disable handled in native template
          {
            type: 'remove',
            label: isNativeTemplate
              ? (p.removeLabel ?? 'Remove')
              : (asText(p.removeLabel) ?? 'Remove'),
            click: () => (p.onRemove as (i: number) => void)?.(index),
          },
        ],
      }));

      const merged = {
        ...p,
        // For custom/legacy templates, coerce textual props to strings to avoid rendering elements inside Text
        label: isNativeTemplate ? p.label : (asText(p.label) ?? ''),
        error: isNativeTemplate ? p.error : (asText(p.error) ?? ''),
        items: legacyItems,
        // Ensure legacy Button object shape for compatibility
        add: {
          type: 'add',
          click: p.onAdd as () => void,
          label: isNativeTemplate ? (p.addLabel ?? 'Add') : (asText(p.addLabel) ?? 'Add'),
          onPress: p.onAdd as () => void,
          disabled: Boolean(p.disabled || p.disableAdd),
        } as LegacyActionButton,
        remove: p.remove && typeof p.remove === 'object' ? p.remove : undefined,
        moveUp: p.moveUp && typeof p.moveUp === 'object' ? p.moveUp : undefined,
        moveDown: p.moveDown && typeof p.moveDown === 'object' ? p.moveDown : undefined,
        // For native template, keep ReactNode labels; for custom, coerce
        addLabel: isNativeTemplate ? p.addLabel : (asText(p.addLabel) ?? undefined),
        removeLabel: isNativeTemplate ? p.removeLabel : (asText(p.removeLabel) ?? undefined),
        upLabel: isNativeTemplate ? p.upLabel : (asText(p.upLabel) ?? undefined),
        downLabel: isNativeTemplate ? p.downLabel : (asText(p.downLabel) ?? undefined),
      } as ListTemplateProps<unknown>;
      return <Comp {...merged} />;
    }
  } as unknown as {
    <U>(props: ListTemplateProps<U>): React.ReactElement | null;
    displayName?: string;
  };
}

export default List;
