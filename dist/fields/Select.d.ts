import React from 'react';
import type { SelectTemplateProps, SelectOption } from '../types/template.types';
type EnumLike = {
    meta?: {
        kind?: string;
        map?: Record<string, string>;
        optional?: boolean;
    };
};
type SelectProps<T> = {
    type?: EnumLike;
    options?: {
        label?: string;
        help?: string;
        template?: unknown;
        hasError?: boolean;
        error?: string | ((value: unknown) => string);
        transformer?: {
            format: (value: unknown) => string;
            parse: (value: string) => unknown;
        };
        options?: Array<SelectOption<T>>;
        nullOption?: SelectOption<null> | false;
        order?: 'asc' | 'desc';
        isCollapsed?: boolean;
        onCollapseChange?: (collapsed: boolean) => void;
    };
    ctx?: {
        auto: string;
        label?: string;
        i18n?: {
            optional?: string;
            required?: string;
        };
        templates?: {
            select?: unknown;
        };
    };
    value?: T | null | string;
};
export declare class Select<T = unknown> {
    props: SelectProps<T>;
    private _hasError;
    private _error;
    constructor(props: SelectProps<T>);
    getLocals(): {
        readonly type: EnumLike | undefined;
        readonly value: unknown;
        readonly label: string | undefined;
        readonly help: string | undefined;
        readonly options: (SelectOption<null> | SelectOption<T>)[];
        readonly isCollapsed: boolean | undefined;
        readonly onCollapseChange: ((collapsed: boolean) => void) | undefined;
        readonly error: string | undefined;
        readonly hasError: boolean;
        readonly ctx: {
            auto: string;
            label?: string | undefined;
            i18n?: {
                optional?: string | undefined;
                required?: string | undefined;
            } | undefined;
            templates?: {
                select?: unknown;
            } | undefined;
        } | undefined;
    };
    pureValidate(): {
        readonly value: unknown;
        readonly hasError: boolean;
        readonly error: string | undefined;
    };
    getTemplate(): unknown;
    static ReactComponent: {
        new (props: SelectTemplateProps<unknown>): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<SelectTemplateProps<unknown>>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<SelectTemplateProps<unknown>>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<SelectTemplateProps<unknown>>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<SelectTemplateProps<unknown>>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
        };
        new (props: SelectTemplateProps<unknown>, context: any): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<SelectTemplateProps<unknown>>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<SelectTemplateProps<unknown>>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<SelectTemplateProps<unknown>>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<SelectTemplateProps<unknown>>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<SelectTemplateProps<unknown>>, nextState: Readonly<{}>, nextContext: any): void;
        };
        displayName: string;
        contextType?: React.Context<any> | undefined;
        propTypes?: any;
    };
}
export default Select;
