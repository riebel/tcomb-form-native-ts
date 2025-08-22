import { Platform } from 'react-native';

// Colors
const COLORS = {
  label: '#000000',
  input: '#000000',
  error: '#a94442',
  help: '#999999',
  border: '#cccccc',
  disabled: '#777777',
  disabledBackground: '#eeeeee',
} as const;

// Font
const FONT = {
  size: 17,
  weight: '500' as const,
} as const;

// Base values
const baseText = {
  fontSize: FONT.size,
  marginBottom: 5,
} as const;

const baseInput = {
  ...baseText,
  borderColor: COLORS.border,
  borderRadius: 4,
  borderWidth: 1,
  color: COLORS.input,
  height: 36,
  paddingHorizontal: 7,
  paddingVertical: Platform.OS === 'ios' ? 7 : 0,
} as const;

// Bootstrap-like stylesheet
export const bootstrapStyles = {
  // Shared
  formGroup: {
    normal: { marginBottom: 10 },
    error: { marginBottom: 10 },
  },
  controlLabel: {
    normal: { color: COLORS.label, fontSize: FONT.size, fontWeight: FONT.weight, marginBottom: 7 },
    error: { color: COLORS.error, fontSize: FONT.size, fontWeight: FONT.weight, marginBottom: 7 },
    disabled: {
      color: COLORS.disabled,
      fontSize: FONT.size,
      fontWeight: FONT.weight,
      marginBottom: 7,
    },
  },
  helpBlock: {
    normal: { color: COLORS.help, fontSize: FONT.size, marginBottom: 2 },
    error: { color: COLORS.error, fontSize: FONT.size, marginBottom: 2 },
  },
  errorBlock: { color: COLORS.error, fontSize: FONT.size, marginBottom: 2 },
  fieldset: { borderWidth: 0, marginBottom: 16, padding: 0 },

  // Textbox
  textbox: {
    normal: { ...baseInput },
    error: { ...baseInput, borderColor: COLORS.error },
    notEditable: {
      ...baseInput,
      backgroundColor: COLORS.disabledBackground,
      color: COLORS.disabled,
    },
  },
  textboxView: {
    normal: {},
    error: {},
    notEditable: {},
  },

  // Checkbox
  container: {
    normal: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    error: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    disabled: { opacity: 0.6 },
  },
  checkbox: {
    normal: { marginLeft: 8 },
    error: { marginLeft: 8 },
    disabled: { marginLeft: 8, opacity: 0.6 },
  },

  // Select/DatePicker
  valueContainer: {
    normal: {
      backgroundColor: 'white',
      borderColor: '#ccc',
      borderRadius: 4,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      padding: 10,
    },
    error: {
      backgroundColor: 'white',
      borderColor: COLORS.error,
      borderRadius: 4,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      padding: 10,
    },
    disabled: { backgroundColor: COLORS.disabledBackground },
  },
  valueText: {
    normal: { color: '#333', fontSize: 16 },
    error: { color: COLORS.error, fontSize: 16 },
    disabled: { color: COLORS.disabled, fontSize: 16 },
  },

  // List
  itemContainer: {
    normal: {
      alignItems: 'center',
      backgroundColor: '#fff',
      borderColor: '#ddd',
      borderRadius: 4,
      borderWidth: 1,
      flexDirection: 'row',
      marginBottom: 8,
      padding: 8,
    },
    error: {
      alignItems: 'center',
      backgroundColor: '#fff',
      borderColor: COLORS.error,
      borderRadius: 4,
      borderWidth: 1,
      flexDirection: 'row',
      marginBottom: 8,
      padding: 8,
    },
    disabled: { opacity: 0.6 },
  },
  button: {
    normal: {
      alignItems: 'center',
      backgroundColor: '#5cb85c',
      borderRadius: 4,
      marginTop: 10,
      padding: 10,
    },
    disabled: {
      alignItems: 'center',
      backgroundColor: '#d3d3d3',
      borderRadius: 4,
      marginTop: 10,
      padding: 10,
    },
  },
  buttonText: {
    normal: { color: 'white', fontSize: FONT.size, fontWeight: FONT.weight as '500' },
    disabled: { color: COLORS.disabled, fontSize: FONT.size, fontWeight: FONT.weight as '500' },
  },
} as const;

export default bootstrapStyles;
