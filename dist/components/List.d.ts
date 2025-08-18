import React from 'react';
import type { ListTemplateProps, ListItem } from '../types/template.types';
type Dispatchable = {
    dispatch?: (value: unknown) => unknown;
    meta?: {
        kind?: string;
    };
};
type ListTypeLike = {
    meta?: {
        kind?: string;
        type?: Dispatchable;
        of?: Dispatchable;
    };
};
type ListProps<T = unknown> = {
    type?: ListTypeLike & Dispatchable;
    value?: T[];
    options?: Record<string, unknown>;
    ctx?: {
        templates?: {
            list?: unknown;
        };
    };
};
export declare class List<T = unknown> {
    props: ListProps<T>;
    constructor(props: ListProps<T>);
    private getItemType;
    getItems(): Array<ListItem<T>>;
    getTemplate(): unknown;
    static ReactComponent: {
        new (props: ListTemplateProps<unknown>): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<ListTemplateProps<unknown>>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<ListTemplateProps<unknown>>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<ListTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<ListTemplateProps<unknown>>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<ListTemplateProps<unknown>>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<ListTemplateProps<unknown>>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<ListTemplateProps<unknown>>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<ListTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<ListTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
        };
        new (props: ListTemplateProps<unknown>, context: any): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<ListTemplateProps<unknown>>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<ListTemplateProps<unknown>>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<ListTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<ListTemplateProps<unknown>>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<ListTemplateProps<unknown>>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<ListTemplateProps<unknown>>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<ListTemplateProps<unknown>>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<ListTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<ListTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
        };
        displayName: string;
        contextType?: React.Context<any> | undefined;
        propTypes?: any;
    };
}
export default List;
