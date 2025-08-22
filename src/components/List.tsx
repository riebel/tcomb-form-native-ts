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
      return <Comp {...(this.props as unknown as ListTemplateProps<unknown>)} />;
    }
  } as unknown as {
    <U>(props: ListTemplateProps<U>): React.ReactElement | null;
    displayName?: string;
  };
}

export default List;
