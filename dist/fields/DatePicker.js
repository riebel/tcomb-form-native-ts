"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePicker = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DatePicker_android_1 = __importDefault(require("./DatePicker.android"));
const DatePicker_ios_1 = __importDefault(require("./DatePicker.ios"));
const field_1 = require("../utils/field");
// optional logic provided via utils helpers
class DatePicker {
    constructor(props) {
        this._hasError = false;
        this.props = props;
    }
    getLocals() {
        var _a, _b;
        const { type, options = {}, value, ctx } = this.props;
        // Label handling
        let label = (_a = options.label) !== null && _a !== void 0 ? _a : undefined;
        if ((ctx === null || ctx === void 0 ? void 0 : ctx.auto) === 'none') {
            label = null; // tests expect null
        }
        else {
            label = (0, field_1.applyAutoLabel)(label, ctx);
            label = (0, field_1.appendOptionalSuffix)(label, type, ctx);
        }
        // Value formatting
        let displayValue = value;
        if (((_b = options.transformer) === null || _b === void 0 ? void 0 : _b.format) && value !== undefined) {
            displayValue = options.transformer.format(value);
        }
        // Error handling
        const { error, hasError } = (0, field_1.resolveError)(this._hasError, this._error, options, value);
        return {
            type,
            options,
            value: displayValue,
            label,
            help: options.help,
            error,
            hasError: Boolean(hasError),
            ctx,
        };
    }
    pureValidate() {
        var _a;
        const { value, options = {} } = this.props;
        let validatedValue = value;
        let isValid = true;
        try {
            if (((_a = options.transformer) === null || _a === void 0 ? void 0 : _a.parse) && value !== undefined && value !== null) {
                const formatted = options.transformer.format
                    ? options.transformer.format(value)
                    : value;
                validatedValue = options.transformer.parse(formatted);
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
        return options.template || ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.templates) === null || _a === void 0 ? void 0 : _a.datepicker);
    }
}
exports.DatePicker = DatePicker;
DatePicker.ReactComponent = (_a = class extends react_1.default.Component {
        render() {
            const Comp = react_native_1.Platform.OS === 'ios' ? DatePicker_ios_1.default : DatePicker_android_1.default;
            return (0, jsx_runtime_1.jsx)(Comp, Object.assign({}, this.props));
        }
    },
    _a.displayName = 'DatePicker',
    _a);
exports.default = DatePicker;
