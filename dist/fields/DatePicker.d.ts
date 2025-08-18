import React from 'react';
import type { DatePickerTemplateProps } from '../types/template.types';
type TypeLike = {
    meta?: {
        kind?: string;
        optional?: boolean;
    };
};
type DatePickerProps = {
    type?: TypeLike;
    value?: Date | unknown;
    options?: {
        label?: string;
        help?: string;
        template?: unknown;
        hasError?: boolean;
        error?: string | ((value: unknown) => string);
        transformer?: {
            format: (value: unknown) => unknown;
            parse: (value: unknown) => unknown;
        };
    };
    ctx?: {
        auto: string;
        label?: string;
        i18n?: {
            optional?: string;
        };
        templates?: {
            datepicker?: unknown;
        };
    };
};
export declare class DatePicker {
    props: DatePickerProps;
    private _hasError;
    private _error;
    constructor(props: DatePickerProps);
    getLocals(): {
        readonly type: TypeLike | undefined;
        readonly options: {
            label?: string | undefined;
            help?: string | undefined;
            template?: unknown;
            hasError?: boolean | undefined;
            error?: string | ((value: unknown) => string) | undefined;
            transformer?: {
                format: (value: unknown) => unknown;
                parse: (value: unknown) => unknown;
            } | undefined;
        };
        readonly value: unknown;
        readonly label: string | null | undefined;
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
                datepicker?: unknown;
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
        new (props: DatePickerTemplateProps): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<DatePickerTemplateProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<DatePickerTemplateProps>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<DatePickerTemplateProps>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<DatePickerTemplateProps>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<DatePickerTemplateProps>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<DatePickerTemplateProps>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<DatePickerTemplateProps>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<DatePickerTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<DatePickerTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
        };
        new (props: DatePickerTemplateProps, context: any): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<DatePickerTemplateProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<DatePickerTemplateProps>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<DatePickerTemplateProps>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<DatePickerTemplateProps>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<DatePickerTemplateProps>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<DatePickerTemplateProps>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<DatePickerTemplateProps>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<DatePickerTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<DatePickerTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
        };
        displayName: string;
        contextType?: React.Context<any> | undefined;
        propTypes?: any;
    };
}
export default DatePicker;
