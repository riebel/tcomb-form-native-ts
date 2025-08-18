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
const react_native_1 = require("react-native");
const Struct = (_a) => {
    var _b, _c;
    var { children, hidden, stylesheet, hasError, label, error } = _a, rest = __rest(_a, ["children", "hidden", "stylesheet", "hasError", "label", "error"]);
    // Resolve styles based on component state
    const fieldsetStyle = react_native_1.StyleSheet.flatten([styles.fieldset, stylesheet.fieldset]);
    const controlLabelStyle = react_native_1.StyleSheet.flatten([
        styles.controlLabel,
        (_b = stylesheet.controlLabel) === null || _b === void 0 ? void 0 : _b.normal,
        hasError && ((_c = stylesheet.controlLabel) === null || _c === void 0 ? void 0 : _c.error),
    ]);
    const errorBlockStyle = react_native_1.StyleSheet.flatten([styles.errorBlock, stylesheet.errorBlock]);
    if (hidden) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: fieldsetStyle }, rest, { children: [label && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: controlLabelStyle }, { children: label })), hasError && error && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: errorBlockStyle, accessibilityLiveRegion: "polite" }, { children: error }))), children] })));
};
const styles = react_native_1.StyleSheet.create({
    controlLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    errorBlock: {
        color: '#a94442',
        fontSize: 12,
        marginBottom: 8,
        marginTop: 5,
    },
    fieldset: {
        borderWidth: 0,
        marginBottom: 16,
        padding: 0,
    },
});
exports.default = Struct;
