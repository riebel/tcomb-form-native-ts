import React, { Component } from 'react';
import { TextboxTemplateProps, CheckboxTemplateProps, SelectTemplateProps, DatePickerTemplateProps, ListTemplateProps, StructTemplateProps, TypeWithMeta, UIDGenerator, FormTemplates } from './types/template.types';
export type AnyTemplateProps<T> = TextboxTemplateProps | CheckboxTemplateProps | SelectTemplateProps<T> | DatePickerTemplateProps | ListTemplateProps<T> | StructTemplateProps;
type FieldComponentType<T> = React.ComponentType<TextboxTemplateProps | CheckboxTemplateProps | SelectTemplateProps<T> | DatePickerTemplateProps | ListTemplateProps<T> | StructTemplateProps>;
export interface FormProps<T> {
    type: TypeWithMeta;
    value?: T;
    options?: {
        getComponent?: (type: TypeWithMeta | null, options: Record<string, unknown>) => FieldComponentType<T>;
        uidGenerator?: UIDGenerator;
        [key: string]: unknown;
    };
    onChange?: (value: T) => void;
    context?: unknown;
    stylesheet?: Record<string, unknown>;
    templates?: FormTemplates;
    i18n?: Record<string, unknown>;
}
interface FormState {
    hasError: boolean;
}
interface FormInputComponent<T> {
    getValue(): T;
    getComponent?(path: string[]): React.Component | null;
    setState(state: {
        hasError: boolean;
    }): void;
}
export declare class Form<T> extends Component<FormProps<T>, FormState> {
    static defaultProps: Partial<FormProps<unknown>>;
    private uidGenerator;
    private input;
    constructor(props: FormProps<T>);
    pureValidate(): import("tcomb-validation").ValidationResult;
    validate(): import("tcomb-validation").ValidationResult;
    getValue(): T | undefined;
    getComponent(path?: string[]): React.Component<{}, {}, any> | FormInputComponent<T> | null | undefined;
    getSeed(): string;
    getUIDGenerator(): UIDGenerator;
    private getValidationOptions;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export default Form;
