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
const List = (_a) => {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var { items = [], onAdd, onRemove, renderItem: renderItemProp, addLabel = 'Add', removeLabel = 'Remove', disabled = false, hidden, stylesheet, hasError, label, help, error } = _a, rest = __rest(_a, ["items", "onAdd", "onRemove", "renderItem", "addLabel", "removeLabel", "disabled", "hidden", "stylesheet", "hasError", "label", "help", "error"]);
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
    const buttonStyle = react_native_1.StyleSheet.flatten([
        styles.button,
        (_h = stylesheet.button) === null || _h === void 0 ? void 0 : _h.normal,
        disabled && ((_j = stylesheet.button) === null || _j === void 0 ? void 0 : _j.disabled),
    ]);
    const buttonTextStyle = react_native_1.StyleSheet.flatten([
        styles.buttonText,
        (_k = stylesheet.buttonText) === null || _k === void 0 ? void 0 : _k.normal,
        disabled && ((_l = stylesheet.buttonText) === null || _l === void 0 ? void 0 : _l.disabled),
    ]);
    const itemContainerStyle = react_native_1.StyleSheet.flatten([
        styles.itemContainer,
        (_m = stylesheet.itemContainer) === null || _m === void 0 ? void 0 : _m.normal,
    ]);
    const renderItemWithButtons = (0, react_1.useCallback)((item, index) => {
        var _a;
        const buttons = [
            {
                type: 'remove',
                label: removeLabel,
                click: () => onRemove && onRemove(index),
                disabled: disabled || items.length <= 1, // Prevent removing the last item
            },
        ];
        const itemKey = (_a = item === null || item === void 0 ? void 0 : item.key) !== null && _a !== void 0 ? _a : `item-${index}`;
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: itemContainerStyle }, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, Object.assign({ style: styles.itemContent }, { children: renderItemProp(item, index) })), !disabled && ((0, jsx_runtime_1.jsx)(react_native_1.View, Object.assign({ style: styles.buttonGroup }, { children: buttons.map(button => ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, Object.assign({ style: [buttonStyle, button.disabled && styles.disabledButton], onPress: button.click, disabled: button.disabled }, { children: (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: buttonTextStyle }, { children: button.label })) }), button.type))) })))] }), itemKey));
    }, [
        onRemove,
        removeLabel,
        disabled,
        items.length,
        itemContainerStyle,
        buttonStyle,
        buttonTextStyle,
        renderItemProp,
    ]);
    if (hidden) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: formGroupStyle }, rest, { children: [label && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: controlLabelStyle }, { children: label })), items.map((item, index) => renderItemWithButtons(item, index)), !disabled && onAdd && ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, Object.assign({ style: [buttonStyle, styles.addButton], onPress: onAdd, disabled: disabled }, { children: (0, jsx_runtime_1.jsxs)(react_native_1.Text, Object.assign({ style: buttonTextStyle }, { children: ["+ ", addLabel] })) }))), help && !hasError && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: helpBlockStyle }, { children: help })), hasError && error && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: errorBlockStyle, accessibilityLiveRegion: "polite" }, { children: error })))] })));
};
const styles = react_native_1.StyleSheet.create({
    addButton: {
        backgroundColor: '#e9f5ff',
        borderColor: '#b8dfff',
        borderWidth: 1,
        marginTop: 8,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        justifyContent: 'center',
        marginLeft: 8,
        minWidth: 60,
        padding: 8,
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    buttonText: {
        color: '#333',
        fontSize: 14,
    },
    controlLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    disabledButton: {
        opacity: 0.5,
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
    itemContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderRadius: 4,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: 8,
        padding: 8,
    },
    itemContent: {
        flex: 1,
        marginRight: 8,
    },
});
exports.default = List;
