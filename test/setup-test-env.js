// Setup global variables for React Native environment
global.__DEV__ = true;
global.window = global.window || {};
global.document = global.document || {};

// Mock React Native components and modules for testing
const mockReactNative = {
  View: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
  Text: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('span', props, children);
  },
  TextInput: (props) => {
    const React = require('react');
    return React.createElement('input', { 
      type: 'text', 
      value: props.value || '',
      onChange: (e) => props.onChangeText && props.onChangeText(e.target.value),
      ...props
    });
  },
  StyleSheet: {
    create: (styles) => styles
  },
  Platform: {
    OS: 'web',
    select: (obj) => obj.web || obj.default || obj.native
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667 })
  }
};

// Mock other React Native dependencies
const mockPicker = {
  Picker: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('select', props, children);
  }
};

// Override require for react-native and related modules
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'react-native') {
    return mockReactNative;
  }
  if (id === '@react-native-picker/picker') {
    return mockPicker;
  }
  if (id.includes('react-native-')) {
    // Mock any other react-native modules
    return {};
  }
  return originalRequire.apply(this, arguments);
};

console.log('Test environment setup complete - React Native and dependencies mocked');
