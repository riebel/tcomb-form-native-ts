const mock = require('mock-require');

// __DEV__ für alle RN-Pakete
global.__DEV__ = false;

// React Native Minimal-Mock
mock('react-native', {
    View: () => {},
    Text: () => {},
    TextInput: () => {},
    StyleSheet: { create: (styles) => styles },
    Platform: { OS: 'ios', select: (obj) => obj.ios },
    Alert: { alert: () => {} },
});

// @react-native-picker/picker Mock (falls noch nicht)
mock('@react-native-picker/picker', { Picker: () => {} });

// @react-native-community/datetimepicker Mock
mock('@react-native-community/datetimepicker', {
    default: () => null,   // Default export
    DateTimePicker: () => null,  // falls spezifischer Export benötigt
});
