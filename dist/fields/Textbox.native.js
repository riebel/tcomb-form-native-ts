"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocals = exports.Textbox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const bootstrap_1 = __importDefault(require("../stylesheets/bootstrap"));
let getStaticNumberTransformer = () => undefined;
// Keep getLocals as a standalone function
const getLocals = (props) => {
    var _a, _b, _c, _d;
    const { type, options = {}, value, error, hasError, stylesheet = {}, ctx } = props, rest = __rest(props, ["type", "options", "value", "error", "hasError", "stylesheet", "ctx"]);
    let label = options === null || options === void 0 ? void 0 : options.label;
    if (!label && (ctx === null || ctx === void 0 ? void 0 : ctx.auto) === 'labels' && (ctx === null || ctx === void 0 ? void 0 : ctx.label)) {
        label = ctx.label;
    }
    let placeholder = options === null || options === void 0 ? void 0 : options.placeholder;
    if (!placeholder && (ctx === null || ctx === void 0 ? void 0 : ctx.auto) === 'placeholders' && (ctx === null || ctx === void 0 ? void 0 : ctx.label)) {
        placeholder = ctx.label;
    }
    const isOptional = ((_a = type === null || type === void 0 ? void 0 : type.meta) === null || _a === void 0 ? void 0 : _a.optional) || ((_b = type === null || type === void 0 ? void 0 : type.meta) === null || _b === void 0 ? void 0 : _b.kind) === 'maybe';
    if (isOptional) {
        if (label && ((_c = ctx === null || ctx === void 0 ? void 0 : ctx.i18n) === null || _c === void 0 ? void 0 : _c.optional)) {
            label = `${label}${ctx.i18n.optional}`;
        }
        if (placeholder && ((_d = ctx === null || ctx === void 0 ? void 0 : ctx.i18n) === null || _d === void 0 ? void 0 : _d.optional)) {
            placeholder = `${placeholder}${ctx.i18n.optional}`;
        }
    }
    // Handle value transformation (with legacy fallback to Textbox.numberTransformer)
    let displayValue = value;
    const legacyTransformer = getStaticNumberTransformer();
    const transformer = (options === null || options === void 0 ? void 0 : options.transformer) || legacyTransformer;
    if ((transformer === null || transformer === void 0 ? void 0 : transformer.format) && value !== undefined) {
        displayValue = transformer.format(value);
    }
    else if (value === null || value === undefined) {
        displayValue = '';
    }
    else if (typeof value === 'number') {
        displayValue = String(value);
    }
    return Object.assign({ type,
        options, value: displayValue, error, hasError: Boolean(hasError), help: options.help, label,
        placeholder, editable: options.editable, stylesheet,
        ctx }, rest);
};
exports.getLocals = getLocals;
// Create a plain class that can be instantiated with new
class Textbox {
    constructor(props) {
        this._hasError = false;
        this.props = props;
    }
    getLocals() {
        const { options = {}, error, hasError, value } = this.props;
        const locals = getLocals(this.props);
        // Handle error state
        if (options.error) {
            locals.error = typeof options.error === 'function' ? options.error(value) : options.error;
            locals.hasError = true;
        }
        else {
            locals.error = this._error;
            locals.hasError = this._hasError;
        }
        // Override with direct props if provided
        if (error !== undefined)
            locals.error = error;
        if (hasError !== undefined) {
            locals.hasError = hasError;
        }
        else if (options.hasError !== undefined && options.hasError !== null) {
            locals.hasError = Boolean(options.hasError);
        }
        return locals;
    }
    pureValidate() {
        const { type, value, options = {} } = this.props;
        let validatedValue = value;
        let isValid = true;
        try {
            // Apply transformer if available (fallback to static numberTransformer)
            const legacyTransformer = this.constructor.numberTransformer;
            const transformer = options.transformer || legacyTransformer;
            if (transformer === null || transformer === void 0 ? void 0 : transformer.parse) {
                if (value === undefined || value === null) {
                    validatedValue = value;
                }
                else if (Array.isArray(value)) {
                    // Pass array values directly to parse
                    validatedValue = transformer.parse(value.join(' '));
                }
                else {
                    // Convert non-array values to string before parsing
                    validatedValue = transformer.parse(String(value));
                }
            }
            // Basic type validation
            if (type &&
                validatedValue !== undefined &&
                validatedValue !== null &&
                validatedValue !== '') {
                const stringValue = validatedValue !== undefined ? String(validatedValue) : '';
                if (stringValue) {
                    type(stringValue);
                }
            }
        }
        catch (e) {
            this._hasError = true;
            this._error = e instanceof Error ? e.message : 'An unknown error occurred';
            isValid = false;
        }
        if (isValid) {
            this._hasError = false;
            this._error = undefined;
        }
        return {
            value: validatedValue,
            hasError: this._hasError,
            error: this._error,
        };
    }
    getTemplate() {
        var _a;
        const { options = {}, ctx } = this.props;
        return options.template || ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.templates) === null || _a === void 0 ? void 0 : _a.textbox) || bootstrap_1.default.textboxViewNotEditable;
    }
}
exports.Textbox = Textbox;
// Keep the React component as a static property
Textbox.ReactComponent = (_a = class extends react_1.default.Component {
        render() {
            return (0, jsx_runtime_1.jsx)(TextboxTemplate, Object.assign({}, this.props));
        }
    },
    _a.displayName = 'Textbox',
    _a);
// Now that Textbox is defined, wire the static getter without using 'any'
getStaticNumberTransformer = () => Textbox.numberTransformer;
class TextboxTemplate extends react_1.default.Component {
    render() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const _o = this.props, { hidden, stylesheet, hasError, editable = true, label, help, error, onChange, onChangeText, placeholder, value, secureTextEntry, keyboardType, autoCapitalize, autoCorrect, autoFocus, onBlur, onFocus, onSubmitEditing, returnKeyType, selectTextOnFocus } = _o, rest = __rest(_o, ["hidden", "stylesheet", "hasError", "editable", "label", "help", "error", "onChange", "onChangeText", "placeholder", "value", "secureTextEntry", "keyboardType", "autoCapitalize", "autoCorrect", "autoFocus", "onBlur", "onFocus", "onSubmitEditing", "returnKeyType", "selectTextOnFocus"]);
        if (hidden) {
            return null;
        }
        // Resolve styles based on component state
        const formGroupStyle = react_native_1.StyleSheet.flatten([
            styles.formGroup,
            (_a = stylesheet.formGroup) === null || _a === void 0 ? void 0 : _a.normal,
            hasError && ((_b = stylesheet.formGroup) === null || _b === void 0 ? void 0 : _b.error),
        ]);
        const controlLabelStyle = react_native_1.StyleSheet.flatten([
            styles.controlLabel,
            (_c = stylesheet.controlLabel) === null || _c === void 0 ? void 0 : _c.normal,
            hasError && ((_d = stylesheet.controlLabel) === null || _d === void 0 ? void 0 : _d.error),
        ]);
        const textboxStyle = react_native_1.StyleSheet.flatten([
            styles.textbox,
            (_e = stylesheet.textbox) === null || _e === void 0 ? void 0 : _e.normal,
            hasError && ((_f = stylesheet.textbox) === null || _f === void 0 ? void 0 : _f.error),
            !editable && ((_g = stylesheet.textbox) === null || _g === void 0 ? void 0 : _g.notEditable),
        ]);
        const textboxViewStyle = react_native_1.StyleSheet.flatten([
            styles.textboxView,
            (_h = stylesheet.textboxView) === null || _h === void 0 ? void 0 : _h.normal,
            hasError && ((_j = stylesheet.textboxView) === null || _j === void 0 ? void 0 : _j.error),
            !editable && ((_k = stylesheet.textboxView) === null || _k === void 0 ? void 0 : _k.notEditable),
        ]);
        const helpBlockStyle = react_native_1.StyleSheet.flatten([
            styles.helpBlock,
            (_l = stylesheet.helpBlock) === null || _l === void 0 ? void 0 : _l.normal,
            hasError && ((_m = stylesheet.helpBlock) === null || _m === void 0 ? void 0 : _m.error),
        ]);
        const errorBlockStyle = react_native_1.StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: formGroupStyle, testID: "textbox-container" }, { children: [label && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: controlLabelStyle, testID: "textbox-label" }, { children: label }))), (0, jsx_runtime_1.jsx)(react_native_1.View, Object.assign({ style: textboxViewStyle, testID: "textbox-input-container" }, { children: (0, jsx_runtime_1.jsx)(react_native_1.TextInput, Object.assign({ testID: "text-input", style: textboxStyle, onChange: onChange, onChangeText: onChangeText, placeholder: placeholder, value: value != null ? String(value) : undefined, editable: editable, secureTextEntry: secureTextEntry, keyboardType: keyboardType, autoCapitalize: autoCapitalize, autoCorrect: autoCorrect, autoFocus: autoFocus, onBlur: onBlur, onFocus: onFocus, onSubmitEditing: onSubmitEditing, returnKeyType: returnKeyType, selectTextOnFocus: selectTextOnFocus }, rest)) })), help && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ testID: "textbox-help", style: helpBlockStyle }, { children: help }))), hasError && error && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ testID: "textbox-error", accessibilityLiveRegion: "polite", style: errorBlockStyle }, { children: error })))] })));
    }
}
const styles = react_native_1.StyleSheet.create({
    controlLabel: {
        fontSize: 16,
        marginBottom: 5,
    },
    errorBlock: {
        color: '#a94442',
        fontSize: 12,
        marginTop: 5,
    },
    formGroup: {
        marginBottom: 10,
    },
    helpBlock: {
        color: '#737373',
        fontSize: 12,
        marginTop: 5,
    },
    textbox: {
        fontSize: 16,
        height: 40,
        padding: 10,
    },
    textboxView: {
        backgroundColor: 'white',
        borderColor: '#ccc',
        borderRadius: 4,
        borderWidth: 1,
    },
});
// Export the Textbox class as default
exports.default = Textbox;
