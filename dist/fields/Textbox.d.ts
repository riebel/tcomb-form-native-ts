/// <reference types="react" />
import NativeTextbox from './Textbox.native';
export { getLocals } from './Textbox.native';
declare class Textbox extends NativeTextbox {
    static ReactComponent: {
        new (props: import(".").TextboxTemplateProps): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<import(".").TextboxTemplateProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<import(".").TextboxTemplateProps>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<import(".").TextboxTemplateProps>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<import(".").TextboxTemplateProps>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
        };
        new (props: import(".").TextboxTemplateProps, context: any): {
            render(): import("react/jsx-runtime").JSX.Element;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<import(".").TextboxTemplateProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<import(".").TextboxTemplateProps>;
            state: Readonly<{}>;
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<import(".").TextboxTemplateProps>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<import(".").TextboxTemplateProps>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<import(".").TextboxTemplateProps>, nextState: Readonly<{}>, nextContext: any): void;
        };
        displayName: string;
        contextType?: import("react").Context<any> | undefined;
        propTypes?: any;
    };
}
export default Textbox;
