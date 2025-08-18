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
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const datetimepicker_1 = __importDefault(require("@react-native-community/datetimepicker"));
const react_1 = require("react");
const react_native_1 = require("react-native");
const DatePickerAndroid = (_a) => {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var { value, onChange, mode = 'date', minimumDate, maximumDate, disabled = false, hidden, stylesheet, hasError, label, help, error } = _a, rest = __rest(_a, ["value", "onChange", "mode", "minimumDate", "maximumDate", "disabled", "hidden", "stylesheet", "hasError", "label", "help", "error"]);
    const [show, setShow] = (0, react_1.useState)(false);
    const [date, setDate] = (0, react_1.useState)(value || new Date());
    const handleDateChange = (0, react_1.useCallback)((_event, selectedDate) => {
        setShow(react_native_1.Platform.OS === 'android');
        if (selectedDate) {
            setDate(selectedDate);
            if (onChange) {
                onChange(selectedDate);
            }
        }
    }, [onChange]);
    const showDatepicker = (0, react_1.useCallback)(() => {
        if (!disabled) {
            setShow(true);
        }
    }, [disabled]);
    // Resolve styles based on component state
    const formGroupStyle = react_native_1.StyleSheet.flatten([
        styles.formGroup,
        (_b = stylesheet.formGroup) === null || _b === void 0 ? void 0 : _b.normal,
        hasError && ((_c = stylesheet.formGroup) === null || _c === void 0 ? void 0 : _c.error),
    ]);
    const controlLabelStyle = react_native_1.StyleSheet.flatten([
        styles.controlLabel,
        (_d = stylesheet.controlLabel) === null || _d === void 0 ? void 0 : _d.normal,
        hasError && ((_e = stylesheet.controlLabel) === null || _e === void 0 ? void 0 : _e.error),
    ]);
    const helpBlockStyle = react_native_1.StyleSheet.flatten([
        styles.helpBlock,
        (_f = stylesheet.helpBlock) === null || _f === void 0 ? void 0 : _f.normal,
        hasError && ((_g = stylesheet.helpBlock) === null || _g === void 0 ? void 0 : _g.error),
    ]);
    const errorBlockStyle = react_native_1.StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);
    const valueContainerStyle = react_native_1.StyleSheet.flatten([
        styles.valueContainer,
        (_h = stylesheet.valueContainer) === null || _h === void 0 ? void 0 : _h.normal,
        hasError && ((_j = stylesheet.valueContainer) === null || _j === void 0 ? void 0 : _j.error),
        disabled && ((_k = stylesheet.valueContainer) === null || _k === void 0 ? void 0 : _k.disabled),
    ]);
    const valueTextStyle = react_native_1.StyleSheet.flatten([
        styles.valueText,
        (_l = stylesheet.valueText) === null || _l === void 0 ? void 0 : _l.normal,
        hasError && ((_m = stylesheet.valueText) === null || _m === void 0 ? void 0 : _m.error),
        disabled && ((_o = stylesheet.valueText) === null || _o === void 0 ? void 0 : _o.disabled),
    ]);
    if (hidden) {
        return null;
    }
    const formattedValue = value ? value.toLocaleDateString() : '';
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: formGroupStyle }, { children: [label && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: controlLabelStyle }, { children: label })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, Object.assign({ onPress: showDatepicker, disabled: disabled }, { children: (0, jsx_runtime_1.jsx)(react_native_1.View, Object.assign({ style: valueContainerStyle }, { children: (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: valueTextStyle }, { children: formattedValue || 'Select a date...' })) })) })), show && ((0, jsx_runtime_1.jsx)(datetimepicker_1.default, Object.assign({ value: date, mode: mode, display: "default", onChange: handleDateChange, minimumDate: minimumDate, maximumDate: maximumDate }, rest)))] }), help && !hasError && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: helpBlockStyle }, { children: help })), hasError && error && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: errorBlockStyle, accessibilityLiveRegion: "polite" }, { children: error })))] })));
};
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
    valueContainer: {
        backgroundColor: 'white',
        borderColor: '#ccc',
        borderRadius: 4,
        borderWidth: 1,
        height: 40,
        justifyContent: 'center',
        padding: 10,
    },
    valueText: {
        color: '#333',
        fontSize: 16,
    },
});
exports.default = DatePickerAndroid;
