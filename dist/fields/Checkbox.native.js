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
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const Checkbox = (_a) => {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var { value = false, onChange, disabled = false, hidden, stylesheet, hasError, label, help, error } = _a, rest = __rest(_a, ["value", "onChange", "disabled", "hidden", "stylesheet", "hasError", "label", "help", "error"]);
    const handleValueChange = (0, react_1.useCallback)((newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    }, [onChange]);
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
        disabled && ((_f = stylesheet.controlLabel) === null || _f === void 0 ? void 0 : _f.disabled),
    ]);
    const checkboxStyle = react_native_1.StyleSheet.flatten([
        styles.checkbox,
        (_g = stylesheet.checkbox) === null || _g === void 0 ? void 0 : _g.normal,
        hasError && ((_h = stylesheet.checkbox) === null || _h === void 0 ? void 0 : _h.error),
        disabled && ((_j = stylesheet.checkbox) === null || _j === void 0 ? void 0 : _j.disabled),
    ]);
    const helpBlockStyle = react_native_1.StyleSheet.flatten([
        styles.helpBlock,
        (_k = stylesheet.helpBlock) === null || _k === void 0 ? void 0 : _k.normal,
        hasError && ((_l = stylesheet.helpBlock) === null || _l === void 0 ? void 0 : _l.error),
    ]);
    const errorBlockStyle = react_native_1.StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);
    const containerStyle = react_native_1.StyleSheet.flatten([
        styles.container,
        (_m = stylesheet.container) === null || _m === void 0 ? void 0 : _m.normal,
        disabled && ((_o = stylesheet.container) === null || _o === void 0 ? void 0 : _o.disabled),
    ]);
    if (hidden) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ testID: "checkbox-container", style: formGroupStyle }, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: containerStyle }, { children: [label && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ testID: "checkbox-label", style: controlLabelStyle }, { children: label }))), (0, jsx_runtime_1.jsx)(react_native_1.Switch, Object.assign({ testID: "checkbox-switch", value: value, onValueChange: handleValueChange, disabled: disabled, style: checkboxStyle, trackColor: {
                            false: '#767577',
                            true: '#81b0ff',
                        }, thumbColor: value ? '#f5dd4b' : '#f4f3f4', ios_backgroundColor: "#3e3e3e" }, rest))] })), help && !hasError && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: helpBlockStyle }, { children: help })), hasError && error && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: errorBlockStyle, accessibilityLiveRegion: "polite" }, { children: error })))] })));
};
const styles = react_native_1.StyleSheet.create({
    checkbox: {
        marginLeft: 8,
    },
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    controlLabel: {
        flex: 1,
        fontSize: 16,
        marginRight: 8,
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
});
exports.default = Checkbox;
