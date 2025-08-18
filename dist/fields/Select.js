"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const Select_android_1 = __importDefault(require("./Select.android"));
const Select_ios_1 = __importDefault(require("./Select.ios"));
const field_1 = require("../utils/field");
const buildOptions = (type, opts) => {
    var _a, _b;
    // Use provided options first
    const provided = opts === null || opts === void 0 ? void 0 : opts.options;
    let built;
    if (provided && provided.length) {
        built = provided;
    }
    else {
        const kind = (_a = type === null || type === void 0 ? void 0 : type.meta) === null || _a === void 0 ? void 0 : _a.kind;
        const map = (_b = type === null || type === void 0 ? void 0 : type.meta) === null || _b === void 0 ? void 0 : _b.map;
        if (map && (kind === 'enums' || kind === 'enum')) {
            // Build from tcomb enums in declaration order
            built = Object.keys(map).map(key => ({
                value: key,
                text: map[key],
            }));
        }
        else {
            built = [];
        }
    }
    // Apply ordering if requested
    const order = opts === null || opts === void 0 ? void 0 : opts.order;
    if (order === 'asc' || order === 'desc') {
        built = [...built].sort((a, b) => {
            const at = a.text.toLowerCase();
            const bt = b.text.toLowerCase();
            if (at < bt)
                return order === 'asc' ? -1 : 1;
            if (at > bt)
                return order === 'asc' ? 1 : -1;
            return 0;
        });
    }
    // Prepend nullOption unless explicitly false
    const nullOpt = opts === null || opts === void 0 ? void 0 : opts.nullOption;
    const includeNull = nullOpt !== false;
    const nullOption = nullOpt !== undefined && nullOpt !== false
        ? nullOpt
        : { text: '-', value: '' };
    return includeNull
        ? [nullOption, ...built]
        : built;
};
// optional logic provided via utils helpers
class Select {
    constructor(props) {
        this._hasError = false;
        this.props = props;
    }
    getLocals() {
        var _a, _b;
        const { type, options = {}, value, ctx } = this.props;
        // Label handling
        let label = (_a = options.label) !== null && _a !== void 0 ? _a : undefined;
        label = (0, field_1.applyAutoLabel)(label, ctx);
        label = (0, field_1.appendOptionalSuffix)(label, type, ctx);
        // Value formatting
        let displayValue = value;
        if (((_b = options.transformer) === null || _b === void 0 ? void 0 : _b.format) && value !== undefined) {
            displayValue = options.transformer.format(value);
        }
        else if (displayValue == null) {
            displayValue = '';
        }
        // Build options list
        const builtOptions = buildOptions(type, options);
        // Error handling
        const { error, hasError } = (0, field_1.resolveError)(this._hasError, this._error, options, value);
        return {
            type,
            value: displayValue,
            label: label !== null && label !== void 0 ? label : undefined,
            help: options.help,
            options: builtOptions,
            isCollapsed: options.isCollapsed,
            onCollapseChange: options.onCollapseChange,
            error,
            hasError: Boolean(hasError),
            ctx,
        };
    }
    pureValidate() {
        var _a, _b;
        const { type, value, options = {} } = this.props;
        let validatedValue = value;
        let isValid = true;
        try {
            if (((_a = options.transformer) === null || _a === void 0 ? void 0 : _a.parse) && value !== undefined && value !== null) {
                const formatted = options.transformer.format
                    ? options.transformer.format(value)
                    : value;
                validatedValue = options.transformer.parse(String(formatted));
            }
            // Basic enum validation: if enum provided and non-empty value, ensure it's one of the allowed values
            if (((_b = type === null || type === void 0 ? void 0 : type.meta) === null || _b === void 0 ? void 0 : _b.map) &&
                validatedValue !== undefined &&
                validatedValue !== null &&
                String(validatedValue) !== '') {
                const allowed = new Set(Object.keys(type.meta.map));
                if (!allowed.has(String(validatedValue))) {
                    throw new Error('Invalid enum value');
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
        return options.template || ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.templates) === null || _a === void 0 ? void 0 : _a.select);
    }
}
exports.Select = Select;
// Platform React component for rendering
Select.ReactComponent = (_a = class extends react_1.default.Component {
        render() {
            const Comp = react_native_1.Platform.OS === 'ios' ? Select_ios_1.default : Select_android_1.default;
            return (0, jsx_runtime_1.jsx)(Comp, Object.assign({}, this.props));
        }
    },
    _a.displayName = 'Select',
    _a);
exports.default = Select;
