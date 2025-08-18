"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const tcomb_validation_1 = require("tcomb-validation");
const List_1 = __importDefault(require("./components/List"));
const Struct_1 = __importDefault(require("./components/Struct"));
const Checkbox_1 = __importDefault(require("./fields/Checkbox"));
const DatePicker_1 = __importDefault(require("./fields/DatePicker"));
const Select_1 = __importDefault(require("./fields/Select"));
const Textbox_1 = __importDefault(require("./fields/Textbox"));
const util_1 = require("./util");
// Default Component Factory
const defaultGetComponent = (type, options = {}) => {
    if (!type)
        return Textbox_1.default.ReactComponent;
    const typeInfo = (0, util_1.getTypeInfo)(type);
    if (typeInfo.isEnum)
        return Select_1.default.ReactComponent;
    if (typeInfo.isMaybe || typeInfo.isSubtype) {
        if (typeInfo.type === type)
            return Textbox_1.default.ReactComponent;
        return defaultGetComponent(typeInfo.type, options);
    }
    switch (typeInfo.kind) {
        case 'struct':
            return Struct_1.default;
        case 'list':
            return List_1.default.ReactComponent;
        case 'irreducible':
            switch (typeInfo.type.name) {
                case 'Boolean':
                    return Checkbox_1.default.ReactComponent;
                case 'Date':
                    return DatePicker_1.default.ReactComponent;
                case 'Number':
                case 'String':
                default:
                    return Textbox_1.default.ReactComponent;
            }
        default:
            return Textbox_1.default.ReactComponent;
    }
};
class Form extends react_1.Component {
    constructor(props) {
        var _a;
        super(props);
        this.input = react_1.default.createRef();
        this.uidGenerator = ((_a = props.options) === null || _a === void 0 ? void 0 : _a.uidGenerator) || {
            next: (prefix) => `${prefix !== null && prefix !== void 0 ? prefix : 'uid'}-${Date.now()}`,
        };
    }
    pureValidate() {
        const { type } = this.props;
        const value = this.getValue();
        return (0, tcomb_validation_1.validate)(value, type, this.getValidationOptions());
    }
    validate() {
        var _a;
        const result = this.pureValidate();
        (_a = this.input.current) === null || _a === void 0 ? void 0 : _a.setState({ hasError: !result.isValid() });
        return result;
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this.input.current) === null || _a === void 0 ? void 0 : _a.getValue()) !== null && _b !== void 0 ? _b : this.props.value;
    }
    getComponent(path = []) {
        var _a, _b;
        if (!this.input.current)
            return null;
        return path.length ? (_b = (_a = this.input.current).getComponent) === null || _b === void 0 ? void 0 : _b.call(_a, path) : this.input.current;
    }
    getSeed() {
        return this.uidGenerator.next();
    }
    getUIDGenerator() {
        return this.uidGenerator;
    }
    getValidationOptions() {
        return {};
    }
    render() {
        var _a, _b;
        const _c = this.props, { type, options = {}, value, onChange, context, stylesheet = {}, templates = {}, i18n } = _c, otherProps = __rest(_c, ["type", "options", "value", "onChange", "context", "stylesheet", "templates", "i18n"]);
        const getComponent = options.getComponent || defaultGetComponent;
        const Component = getComponent(type, options);
        if (!Component) {
            console.error(`No component found for type: ${type}`);
            return null;
        }
        const baseProps = Object.assign({ ref: this.input, type,
            value,
            onChange,
            context,
            stylesheet,
            templates,
            i18n }, otherProps);
        // Default props for field type
        if (Component === Textbox_1.default.ReactComponent) {
            return ((0, jsx_runtime_1.jsx)(Textbox_1.default.ReactComponent, Object.assign({}, baseProps, { onChangeText: (text) => onChange === null || onChange === void 0 ? void 0 : onChange(text) })));
        }
        if (Component === Checkbox_1.default.ReactComponent) {
            return ((0, jsx_runtime_1.jsx)(Checkbox_1.default.ReactComponent, Object.assign({}, baseProps, { value: !!value, onChange: onChange })));
        }
        if (Component === Select_1.default.ReactComponent) {
            // Get options from enum type if it's an enum
            const typeInfo = type ? (0, util_1.getTypeInfo)(type) : null;
            const options = (typeInfo === null || typeInfo === void 0 ? void 0 : typeInfo.isEnum) && ((_a = type === null || type === void 0 ? void 0 : type.meta) === null || _a === void 0 ? void 0 : _a.map)
                ? Object.entries(type.meta.map).map(([value, text]) => ({
                    value,
                    text: String(text),
                }))
                : [];
            return ((0, jsx_runtime_1.jsx)(Select_1.default.ReactComponent, Object.assign({}, baseProps, { options: options, value: (value !== undefined ? String(value) : null), onChange: onChange })));
        }
        if (Component === DatePicker_1.default.ReactComponent) {
            return ((0, jsx_runtime_1.jsx)(DatePicker_1.default.ReactComponent, Object.assign({}, baseProps, { value: (_b = value) !== null && _b !== void 0 ? _b : null, onChange: onChange })));
        }
        if (Component === List_1.default.ReactComponent) {
            return ((0, jsx_runtime_1.jsx)(List_1.default.ReactComponent, Object.assign({}, baseProps, { items: Array.isArray(value) ? value : [], onAdd: () => { }, onRemove: () => { }, renderItem: () => null })));
        }
        if (Component === Struct_1.default) {
            return (0, jsx_runtime_1.jsx)(Struct_1.default, Object.assign({}, baseProps, { children: null }));
        }
        return (0, jsx_runtime_1.jsx)(Component, Object.assign({}, baseProps));
    }
}
exports.Form = Form;
Form.defaultProps = {
    value: undefined,
    options: {},
    context: {},
    stylesheet: {},
    templates: {},
    i18n: {},
};
exports.default = Form;
