import React from 'react';
import type { CheckboxTemplateProps } from '../types/template.types';
type TypeLike = {
    meta?: {
        kind?: string;
        optional?: boolean;
    };
};
type CheckboxProps = {
    type?: TypeLike;
    value?: boolean | string;
    options?: {
        label?: string | null;
        help?: string;
        template?: unknown;
        hasError?: boolean;
        error?: string | ((value: unknown) => string);
        transformer?: {
            format: (value: unknown) => string;
            parse: (value: string) => unknown;
        };
    };
    ctx?: {
        auto: string;
        label?: string;
        i18n?: {
            optional?: string;
        };
        templates?: {
            checkbox?: unknown;
        };
    };
};
export declare class Checkbox {
    props: CheckboxProps;
    private _hasError;
    private _error;
    constructor(props: CheckboxProps);
    getLocals(): {
        readonly type: TypeLike | undefined;
        readonly options: {
            label?: string | null | undefined;
            help?: string | undefined;
            template?: unknown;
            hasError?: boolean | undefined;
            error?: string | ((value: unknown) => string) | undefined;
            transformer?: {
                format: (value: unknown) => string;
                parse: (value: string) => unknown;
            } | undefined;
        };
        readonly value: unknown;
        readonly label: string | null;
        readonly help: string | undefined;
        readonly error: string | undefined;
        readonly hasError: boolean;
        readonly ctx: {
            auto: string;
            label?: string | undefined;
            i18n?: {
                optional?: string | undefined;
            } | undefined;
            templates?: {
                checkbox?: unknown;
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
        new (props: CheckboxTemplateProps): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<CheckboxTemplateProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<CheckboxTemplateProps>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<CheckboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<CheckboxTemplateProps>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<CheckboxTemplateProps>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<CheckboxTemplateProps>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<CheckboxTemplateProps>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<CheckboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<CheckboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
        };
        new (props: CheckboxTemplateProps, context: any): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<CheckboxTemplateProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<CheckboxTemplateProps>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<CheckboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<CheckboxTemplateProps>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<CheckboxTemplateProps>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<CheckboxTemplateProps>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<CheckboxTemplateProps>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<CheckboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<CheckboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
        };
        displayName: string;
        contextType?: React.Context<any> | undefined;
        propTypes?: any;
    };
}
export default Checkbox;
