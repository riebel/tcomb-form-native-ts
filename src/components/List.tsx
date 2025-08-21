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

  // Public generic component type to preserve TValue for consumers
  static ReactComponent = class extends React.Component<
    ListTemplateProps<unknown> & {
      // Allow custom template injection similar to other fields
      ctx?: { templates?: { list?: React.ComponentType<ListTemplateProps<unknown>> } };
      templates?: { list?: React.ComponentType<ListTemplateProps<unknown>> };
    }
  > {
    static displayName = 'List';
    render() {
      // Prefer ctx template via instance API for parity with other fields
      const helper = new List<unknown>({
        // Only ctx is needed for template resolution here
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
