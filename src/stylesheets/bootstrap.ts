import { Platform, StyleSheet, TextStyle } from 'react-native';

// Color constants
const COLORS = {
  label: '#000000',
  input: '#000000',
  error: '#a94442',
  help: '#999999',
  border: '#cccccc',
  disabled: '#777777',
  disabledBackground: '#eeeeee',
} as const;

// Font constants
const FONT = {
  size: 17,
  weight: '500' as const,
} as const;

// Common styles
const baseTextStyle: TextStyle = {
  fontSize: FONT.size,
  marginBottom: 5,
};

const baseInputStyle: TextStyle = {
  ...baseTextStyle,
  borderColor: COLORS.border,
  borderRadius: 4,
  borderWidth: 1,
  color: COLORS.input,
  height: 36,
  paddingHorizontal: 7,
  paddingVertical: Platform.OS === 'ios' ? 7 : 0,
};

// Main stylesheet
export const bootstrapStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#5cb85c',
    borderRadius: 4,
    marginTop: 10,
    padding: 10,
  },
  buttonDisabled: {
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    borderRadius: 4,
    marginTop: 10,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: FONT.size,
    fontWeight: FONT.weight as '500',
  },
  buttonTextDisabled: {
    color: COLORS.disabled,
    fontSize: FONT.size,
    fontWeight: FONT.weight as '500',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 2,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
    width: 20,
  },
  checkboxError: {
    marginBottom: 10,
  },
  checkboxNormal: {
    marginBottom: 10,
  },
  checkboxText: {
    color: COLORS.input,
    fontSize: 16,
  },
  checkboxTextbox: {
    ...baseTextStyle,
  },
  checkboxView: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  controlLabelError: {
    color: COLORS.error,
    fontSize: FONT.size,
    fontWeight: FONT.weight,
    marginBottom: 7,
  },
  controlLabelNormal: {
    color: COLORS.label,
    fontSize: FONT.size,
    fontWeight: FONT.weight,
    marginBottom: 7,
  },
  datePicker: {
    flex: 1,
  },
  datePickerError: {
    marginBottom: 10,
  },
  datePickerNormal: {
    marginBottom: 10,
  },
  datePickerNotEditable: {
    opacity: 0.7,
  },
  datePickerText: {
    color: COLORS.input,
    fontSize: FONT.size,
  },
  datePickerTextbox: {
    ...baseInputStyle,
  },
  datePickerTextboxView: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  errorBlock: {
    color: COLORS.error,
    fontSize: FONT.size,
    marginBottom: 2,
  },
  fieldset: {},
  formGroupError: {
    marginBottom: 10,
  },
  formGroupNormal: {
    marginBottom: 10,
  },
  helpBlockError: {
    color: COLORS.error,
    fontSize: FONT.size,
    marginBottom: 2,
  },
  helpBlockNormal: {
    color: COLORS.help,
    fontSize: FONT.size,
    marginBottom: 2,
  },
  selectError: {
    marginBottom: 10,
  },
  selectNormal: {
    marginBottom: 10,
  },
  selectNotEditable: {
    opacity: 0.7,
  },
  selectPicker: {
    flex: 1,
  },
  selectPickerContainer: {
    flex: 1,
  },
  selectPickerItem: {
    color: COLORS.input,
    fontSize: FONT.size,
  },
  selectPickerItemSelected: {
    fontWeight: 'bold',
  },
  selectTextbox: {
    ...baseInputStyle,
  },
  selectTextboxView: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  textboxError: {
    ...baseInputStyle,
    borderColor: COLORS.error,
  },
  textboxNormal: {
    ...baseInputStyle,
  },
  textboxNotEditable: {
    ...baseInputStyle,
    backgroundColor: COLORS.disabledBackground,
    color: COLORS.disabled,
  },
  textboxViewError: {},
  textboxViewNormal: {},
  textboxViewNotEditable: {},
});

export default bootstrapStyles;
