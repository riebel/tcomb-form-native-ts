import React from 'react';
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
      // Provide legacy aliases expected by older templates
      const p = this.props as unknown as ListTemplateProps<unknown> & {
        add?: () => void;
        remove?: (index: number) => void;
        moveUp?: (index: number) => void;
        moveDown?: (index: number) => void;
      };
      const merged = {
        ...p,
        // Ensure legacy Button object shape for compatibility
        add:
          p.add && typeof p.add === 'object'
            ? (p.add as ListTemplateProps<unknown>['add'])
            : {
                type: 'add',
                click: p.onAdd as () => void,
                label: p.addLabel ?? 'Add',
                onPress: p.onAdd as () => void,
                disabled: Boolean(p.disabled || p.disableAdd),
              },
        remove: p.remove && typeof p.remove === 'object' ? p.remove : undefined,
        moveUp: p.moveUp && typeof p.moveUp === 'object' ? p.moveUp : undefined,
        moveDown: p.moveDown && typeof p.moveDown === 'object' ? p.moveDown : undefined,
      } as ListTemplateProps<unknown>;
      return <Comp {...merged} />;
    }
  } as unknown as {
    <U>(props: ListTemplateProps<U>): React.ReactElement | null;
    displayName?: string;
  };
}

export default List;
