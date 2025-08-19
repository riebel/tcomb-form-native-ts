import React from 'react';
import ListNative from './List.native';

import type { ListTemplateProps, ListItem } from '../types/template.types';

// Minimal runtime type shape declarations to avoid any
type Dispatchable = {
  dispatch?: (value: unknown) => unknown;
  meta?: { kind?: string };
};

type ListTypeLike = {
  meta?: {
    kind?: string; // 'list'
    type?: Dispatchable; // inner type for list
    of?: Dispatchable; // compatibility
  };
};

type ListProps<T = unknown> = {
  type?: ListTypeLike & Dispatchable;
  value?: T[];
  options?: Record<string, unknown>;
  ctx?: {
    templates?: { list?: unknown };
  };
};

export class List<T = unknown> {
  props: ListProps<T>;

  constructor(props: ListProps<T>) {
    this.props = props;
  }

  private getItemType(): Dispatchable | undefined {
    const t = this.props.type;
    return (t?.meta?.type || t?.meta?.of) as Dispatchable | undefined;
  }

  // Builds a lightweight description of items for tests to introspect
  getItems(): Array<ListItem<T>> {
    const values = Array.isArray(this.props.value) ? this.props.value : [];
    const inner = this.getItemType();

    return values.map((item, index) => {
      // If inner type is a union with dispatch, select the concrete type for this item
      const concreteType = typeof inner?.dispatch === 'function' ? inner.dispatch(item) : inner;
      const input = {
        // Mimic a React element-like shape that tests access via `.input.props.type`
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

  static ReactComponent = class extends React.Component<ListTemplateProps<unknown>> {
    static displayName = 'List';
    render() {
      return <ListNative {...this.props} />;
    }
  };
}

export default List;
