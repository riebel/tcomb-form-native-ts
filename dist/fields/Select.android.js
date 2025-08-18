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
const picker_1 = require("@react-native-picker/picker");
const react_1 = require("react");
const react_native_1 = require("react-native");
const SelectAndroid = (_a) => {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var { options = [], value, onChange, nullOption, disabled = false, hidden, stylesheet = {
        formGroup: {},
        controlLabel: {},
        valueContainer: {},
        valueText: {},
        helpBlock: {},
        errorBlock: {},
    }, hasError, label, help, error } = _a, rest = __rest(_a, ["options", "value", "onChange", "nullOption", "disabled", "hidden", "stylesheet", "hasError", "label", "help", "error"]);
    const [selectedValue, setSelectedValue] = (0, react_1.useState)(value);
    const [showPicker, setShowPicker] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setSelectedValue(value);
    }, [value]);
    const handleValueChange = (0, react_1.useCallback)((itemValue) => {
        setSelectedValue(itemValue);
        if (onChange) {
            onChange(itemValue);
        }
        setShowPicker(false);
    }, [onChange]);
    const togglePicker = (0, react_1.useCallback)(() => {
        if (!disabled) {
            setShowPicker(!showPicker);
        }
    }, [disabled, showPicker]);
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
    // Prepare options including null option if provided
    const selectOptions = [
        ...(nullOption ? [nullOption] : []),
        ...options,
    ];
    const selectedOption = selectOptions.find(opt => (opt === null || opt === void 0 ? void 0 : opt.value) === selectedValue) || null;
    const displayValue = (selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.text) || '';
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: formGroupStyle }, { children: [label && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: controlLabelStyle }, { children: label })), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, Object.assign({ onPress: togglePicker, disabled: disabled }, { children: (0, jsx_runtime_1.jsx)(react_native_1.View, Object.assign({ style: valueContainerStyle }, { children: (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: valueTextStyle }, { children: displayValue || 'Select an option...' })) })) })), showPicker && ((0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ style: styles.pickerContainer }, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, Object.assign({ style: styles.pickerHeader }, { children: (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, Object.assign({ onPress: togglePicker }, { children: (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: styles.doneButton }, { children: "Done" })) })) })), (0, jsx_runtime_1.jsx)(picker_1.Picker, Object.assign({ selectedValue: selectedValue, onValueChange: handleValueChange, style: styles.picker, dropdownIconColor: "#000000", mode: "dropdown" }, rest, { children: selectOptions.map(option => ((0, jsx_runtime_1.jsx)(picker_1.Picker.Item, { label: (option === null || option === void 0 ? void 0 : option.text) || '', value: option === null || option === void 0 ? void 0 : option.value }, option ? `option-${option.value}` : 'option-null'))) }))] }))), help && !hasError && (0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: helpBlockStyle }, { children: help })), hasError && error && ((0, jsx_runtime_1.jsx)(react_native_1.Text, Object.assign({ style: errorBlockStyle, accessibilityLiveRegion: "polite" }, { children: error })))] })));
};
const styles = react_native_1.StyleSheet.create({
    controlLabel: {
        fontSize: 16,
        marginBottom: 5,
    },
    doneButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        padding: 8,
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
    picker: {
        backgroundColor: 'white',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderTopColor: '#E9ECEF',
        borderTopWidth: 1,
    },
    pickerHeader: {
        borderBottomColor: '#E9ECEF',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
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
exports.default = SelectAndroid;
