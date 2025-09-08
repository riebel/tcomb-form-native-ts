import { Stylesheet } from '../types';

export const stylesheet: Stylesheet = {
  fieldset: {
    marginBottom: 10,
    padding: 10,
  },

  controlLabel: {
    normal: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
    },
    error: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#d9534f',
    },
  },

  helpBlock: {
    normal: {
      fontSize: 12,
      color: '#737373',
      marginTop: 5,
    },
    error: {
      fontSize: 12,
      color: '#d9534f',
      marginTop: 5,
    },
  },

  errorBlock: {
    fontSize: 12,
    color: '#d9534f',
    marginTop: 5,
    fontWeight: 'bold',
  },

  textbox: {
    normal: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      padding: 10,
      fontSize: 16,
      backgroundColor: '#fff',
    },
    error: {
      borderWidth: 1,
      borderColor: '#d9534f',
      borderRadius: 4,
      padding: 10,
      fontSize: 16,
      backgroundColor: '#fff',
    },
  },

  checkbox: {
    normal: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
    },
    error: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
    },
  },

  select: {
    normal: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    error: {
      borderWidth: 1,
      borderColor: '#d9534f',
      borderRadius: 4,
      backgroundColor: '#fff',
    },
  },

  datepicker: {
    normal: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      padding: 10,
      backgroundColor: '#fff',
    },
    error: {
      borderWidth: 1,
      borderColor: '#d9534f',
      borderRadius: 4,
      padding: 10,
      backgroundColor: '#fff',
    },
  },

  pickerContainer: {
    normal: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    error: {
      borderWidth: 1,
      borderColor: '#d9534f',
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    open: {
      borderWidth: 1,
      borderColor: '#337ab7',
      borderRadius: 4,
      backgroundColor: '#fff',
    },
  },

  pickerValue: {
    normal: {
      fontSize: 16,
      color: '#333',
      padding: 10,
    },
    error: {
      fontSize: 16,
      color: '#d9534f',
      padding: 10,
    },
  },

  pickerTouchable: {
    normal: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    error: {
      borderWidth: 1,
      borderColor: '#d9534f',
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    active: {
      borderWidth: 1,
      borderColor: '#337ab7',
      borderRadius: 4,
      backgroundColor: '#f5f5f5',
    },
  },

  list: {
    marginBottom: 10,
  },

  formGroup: {
    normal: {
      marginBottom: 15,
    },
    error: {
      marginBottom: 15,
    },
  },

  buttonText: {
    color: '#337ab7',
    fontSize: 16,
    fontWeight: 'bold',
  },

  button: {
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#337ab7',
    borderRadius: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
