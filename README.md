# @riebel/tcomb-form-native-ts (TypeScript Edition)

[![npm version](https://img.shields.io/npm/v/@riebel/tcomb-form-native-ts.svg?style=flat-square)](https://www.npmjs.com/package/@riebel/tcomb-form-native-ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Compatible-green.svg?style=flat-square)](https://reactnative.dev/)

A modern TypeScript implementation of tcomb-form-native with React 18+ support, functional components, and 100% API compatibility with the original library.

## Contents

- [Setup](#setup)
- [Supported React Native Versions](#supported-react-native-versions)
- [Example](#example)
- [API](#api)
- [Types](#types)
- [Rendering Options](#rendering-options)
- [Unions](#unions)
- [Lists](#lists)
- [Customizations](#customizations)
- [Migration Guide](#migration-guide)
- [Tests](#tests)
- [License](#license)

## Setup

```bash
npm install @riebel/tcomb-form-native-ts
```

### For React Native projects with Expo:

```bash
npx expo install @react-native-picker/picker
```

### For bare React Native projects:

```bash
npm install @react-native-picker/picker
npx react-native link @react-native-picker/picker
```

## Supported React Native Versions

| Version | React Native Support | TypeScript | React |
|---------|---------------------|------------|-------|
| 1.1.x   | 0.60.0+            | 4.5+       | 18.0+ |

*This library uses modern React patterns including hooks and functional components.*

### Domain Driven Forms

The [tcomb library](https://github.com/gcanti/tcomb) provides a concise but expressive way to define domain models in JavaScript/TypeScript.

The [tcomb-validation library](https://github.com/gcanti/tcomb-validation) builds on tcomb, providing validation functions for tcomb domain models.

This library builds on those two and React Native, providing a modern TypeScript implementation with full backward compatibility.

### Benefits

With **tcomb-form-native** you simply call `<Form type={Model} />` to generate a form based on that domain model. What does this get you?

1. Write a lot less code
2. Usability and accessibility for free (automatic labels, inline validation, etc)
3. No need to update forms when domain model changes
4. Full TypeScript support with type safety
5. Modern React patterns (hooks, functional components)

### JSON Schema Support

JSON Schemas are also supported via the [tcomb-json-schema library](https://github.com/gcanti/tcomb-json-schema).

**Note**: Please use tcomb-json-schema ^0.2.5.

### Pluggable Look and Feel

The look and feel is customizable via React Native stylesheets and *templates* (see documentation).

## Example

```tsx
// App.tsx
import React, { useRef, useState } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, Alert } from 'react-native';
import t from '@riebel/tcomb-form-native-ts';

const Form = t.form.Form;

// Define your domain model
const Person = t.struct({
  name: t.String,              // a required string
  surname: t.maybe(t.String),  // an optional string
  age: t.Number,               // a required number
  rememberMe: t.Boolean        // a boolean
});

const options = {}; // optional rendering options (see documentation)

export default function App() {
  const formRef = useRef<t.form.Form>(null);

  const handlePress = () => {
    // call getValue() to get the values of the form
    const value = formRef.current?.getValue();
    if (value) { // if validation fails, value will be null
      console.log(value); // value here is an instance of Person
      Alert.alert('Success', `Hello ${value.name}!`);
    }
  };

  return (
    <View style={styles.container}>
      <Form
        ref={formRef}
        type={Person}
        options={options}
      />
      <TouchableHighlight 
        style={styles.button} 
        onPress={handlePress} 
        underlayColor="#99d9f4"
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  }
});
```

**Output:**

(Labels are automatically generated)

**Output after a validation error:**

The form will highlight validation errors automatically.

## API

### `getValue()`

Returns `null` if the validation failed, an instance of your model otherwise.

> **Note**: Calling `getValue` will cause the validation of all the fields of the form, including some side effects like highlighting the errors.

### `validate()`

Returns a `ValidationResult` (see [tcomb-validation](https://github.com/gcanti/tcomb-validation) for reference documentation).

### Adding a Default Value and Listen to Changes

The `Form` component behaves like a [controlled component](https://reactjs.org/docs/forms.html):

```tsx
import React, { useRef, useState } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import t from '@riebel/tcomb-form-native-ts';

const Person = t.struct({
  name: t.String,
  surname: t.maybe(t.String)
});

export default function App() {
  const formRef = useRef<t.form.Form>(null);
  const [value, setValue] = useState({
    name: 'Giulio',
    surname: 'Canti'
  });

  const handleChange = (newValue: unknown) => {
    setValue(newValue);
  };

  const handlePress = () => {
    const formValue = formRef.current?.getValue();
    if (formValue) {
      console.log(formValue);
    }
  };

  return (
    <View style={styles.container}>
      <t.form.Form
        ref={formRef}
        type={Person}
        value={value}
        onChange={handleChange}
      />
      <TouchableHighlight 
        style={styles.button} 
        onPress={handlePress} 
        underlayColor="#99d9f4"
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableHighlight>
    </View>
  );
}
```

The `onChange` handler has the following signature:

```typescript
(raw: unknown, path: Array<string | number>) => void
```

where:
- `raw` contains the current raw value of the form (can be an invalid value for your model)
- `path` is the path to the field triggering the change

### Disable a Field Based on Another Field's Value

```tsx
import React, { useRef, useState } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import t from '@riebel/tcomb-form-native-ts';

const Type = t.struct({
  disable: t.Boolean, // if true, name field will be disabled
  name: t.String
});

export default function App() {
  const formRef = useRef<t.form.Form>(null);
  const [value, setValue] = useState(null);
  const [options, setOptions] = useState({
    fields: {
      name: {}
    }
  });

  const handleChange = (newValue: unknown) => {
    // Update options based on form value
    const newOptions = {
      ...options,
      fields: {
        ...options.fields,
        name: {
          ...options.fields.name,
          editable: !newValue?.disable
        }
      }
    };
    setOptions(newOptions);
    setValue(newValue);
  };

  const handlePress = () => {
    const formValue = formRef.current?.getValue();
    if (formValue) {
      console.log(formValue);
    }
  };

  return (
    <View style={styles.container}>
      <t.form.Form
        ref={formRef}
        type={Type}
        options={options}
        value={value}
        onChange={handleChange}
      />
      <TouchableHighlight 
        style={styles.button} 
        onPress={handlePress} 
        underlayColor="#99d9f4"
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableHighlight>
    </View>
  );
}
```

### How to Clear Form After Submit

```tsx
import React, { useRef, useState } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import t from '@riebel/tcomb-form-native-ts';

const Person = t.struct({
  name: t.String,
  surname: t.maybe(t.String),
  age: t.Number,
  rememberMe: t.Boolean
});

export default function App() {
  const formRef = useRef<t.form.Form>(null);
  const [value, setValue] = useState(null);

  const handleChange = (newValue: unknown) => {
    setValue(newValue);
  };

  const clearForm = () => {
    // clear content from all fields
    setValue(null);
  };

  const handlePress = () => {
    const formValue = formRef.current?.getValue();
    if (formValue) {
      console.log(formValue);
      // clear all fields after submit
      clearForm();
    }
  };

  return (
    <View style={styles.container}>
      <t.form.Form
        ref={formRef}
        type={Person}
        value={value}
        onChange={handleChange}
      />
      <TouchableHighlight 
        style={styles.button} 
        onPress={handlePress} 
        underlayColor="#99d9f4"
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableHighlight>
    </View>
  );
}
```

### Dynamic Forms: Change Form Based on Selection

```tsx
import React, { useRef, useState, useMemo } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import t from '@riebel/tcomb-form-native-ts';

const Country = t.enums({
  'IT': 'Italy',
  'US': 'United States'
}, 'Country');

export default function App() {
  const formRef = useRef<t.form.Form>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});

  // Returns the suitable type based on the form value
  const getType = (formValue: Record<string, unknown>) => {
    if (formValue.country === 'IT') {
      return t.struct({
        country: Country,
        rememberMe: t.Boolean
      });
    } else if (formValue.country === 'US') {
      return t.struct({
        country: Country,
        name: t.String
      });
    } else {
      return t.struct({
        country: Country
      });
    }
  };

  const type = useMemo(() => getType(value), [value]);

  const handleChange = (newValue: Record<string, unknown>) => {
    setValue(newValue);
  };

  const handlePress = () => {
    const formValue = formRef.current?.getValue();
    if (formValue) {
      console.log(formValue);
    }
  };

  return (
    <View style={styles.container}>
      <t.form.Form
        ref={formRef}
        type={type}
        value={value}
        onChange={handleChange}
      />
      <TouchableHighlight 
        style={styles.button} 
        onPress={handlePress} 
        underlayColor="#99d9f4"
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableHighlight>
    </View>
  );
}
```

## Types

### Required Field

By default fields are required:

```typescript
const Person = t.struct({
  name: t.String,    // a required string
  surname: t.String  // a required string
});
```

### Optional Field

In order to create an optional field, wrap the field type with the `t.maybe` combinator:

```typescript
const Person = t.struct({
  name: t.String,
  surname: t.String,
  email: t.maybe(t.String) // an optional string
});
```

The postfix `" (optional)"` is automatically added to optional fields.

You can customize the postfix value or set a postfix for required fields:

```typescript
t.form.Form.i18n = {
  optional: '',
  required: ' (required)' // inverting the behavior: adding a postfix to required fields
};
```

### Numbers

In order to create a numeric field, use the `t.Number` type:

```typescript
const Person = t.struct({
  name: t.String,
  surname: t.String,
  email: t.maybe(t.String),
  age: t.Number // a numeric field
});
```

tcomb-form-native will convert automatically numbers to/from strings.

### Booleans

In order to create a boolean field, use the `t.Boolean` type:

```typescript
const Person = t.struct({
  name: t.String,
  surname: t.String,
  email: t.maybe(t.String),
  age: t.Number,
  rememberMe: t.Boolean // a boolean field
});
```

Booleans are displayed as checkboxes.

### Dates

In order to create a date field, use the `t.Date` type:

```typescript
const Person = t.struct({
  name: t.String,
  surname: t.String,
  email: t.maybe(t.String),
  age: t.Number,
  birthDate: t.Date // a date field
});
```

Dates are displayed as date pickers on both iOS and Android.

### Enums

In order to create an enum field, use the `t.enums` combinator:

```typescript
const Gender = t.enums({
  M: 'Male',
  F: 'Female'
});

const Person = t.struct({
  name: t.String,
  surname: t.String,
  email: t.maybe(t.String),
  age: t.Number,
  rememberMe: t.Boolean,
  gender: Gender // enum
});
```

Enums are displayed as `Picker` components.

### Refinements

A *predicate* is a function with the following signature:

```typescript
(x: unknown) => boolean
```

You can refine a type with the `t.refinement(type, predicate)` combinator:

```typescript
// a type representing positive numbers
const Positive = t.refinement(t.Number, (n: number) => {
  return n >= 0;
});

const Person = t.struct({
  name: t.String,
  surname: t.String,
  email: t.maybe(t.String),
  age: Positive, // refinement
  rememberMe: t.Boolean,
  gender: Gender
});
```

Subtypes allow you to express custom validation with a simple predicate.

## Rendering Options

In order to customize the look and feel, use an `options` prop:

```tsx
<Form type={Model} options={options} />
```

### Form Component

#### Labels and Placeholders

By default labels are automatically generated. You can turn off this behavior or override the default labels on a field basis.

```typescript
const options = {
  label: 'My struct label' // <= form legend, displayed before the fields
};

const options = {
  fields: {
    name: {
      label: 'My name label' // <= label for the name field
    }
  }
};
```

In order to automatically generate default placeholders, use the option `auto: 'placeholders'`:

```typescript
const options = {
  auto: 'placeholders'
};
```

Set `auto: 'none'` if you don't want neither labels nor placeholders.

```typescript
const options = {
  auto: 'none'
};
```

#### Fields Order

You can sort the fields with the `order` option:

```typescript
const options = {
  order: ['name', 'surname', 'rememberMe', 'gender', 'age', 'email']
};
```

#### Default Values

You can set the default values by passing a `value` prop to the `Form` component:

```typescript
const value = {
  name: 'Giulio',
  surname: 'Canti',
  age: 41,
  gender: 'M'
};

<Form type={Model} value={value} />
```

#### Fields Configuration

You can configure each field with the `fields` option:

```typescript
const options = {
  fields: {
    name: {
      // name field configuration here..
    },
    surname: {
      // surname field configuration here..
    }
  }
};
```

### Textbox Component

Implementation: `TextInput`

**Tech note**: Values containing only white spaces are converted to `null`.

#### Placeholder

```typescript
const options = {
  fields: {
    name: {
      placeholder: 'Your placeholder here'
    }
  }
};
```

#### Label

```typescript
const options = {
  fields: {
    name: {
      label: 'Insert your name'
    }
  }
};
```

#### Help Message

```typescript
const options = {
  fields: {
    name: {
      help: 'Your help message here'
    }
  }
};
```

#### Error Messages

```typescript
const options = {
  fields: {
    email: {
      error: 'Insert a valid email'
    }
  }
};
```

`error` can also be a function:

```typescript
(value: unknown, path: string[], context: Record<string, unknown>) => string | null
```

#### Standard TextInput Options

The following standard options are available:

- `allowFontScaling`
- `autoCapitalize`
- `autoCorrect`
- `autoFocus`
- `clearButtonMode`
- `editable`
- `enablesReturnKeyAutomatically`
- `keyboardType`
- `maxLength`
- `multiline`
- `onBlur`
- `onEndEditing`
- `onFocus`
- `onSubmitEditing`
- `onContentSizeChange`
- `placeholderTextColor`
- `returnKeyType`
- `selectTextOnFocus`
- `secureTextEntry`
- `selectionState`
- `textAlign`
- `textAlignVertical`

### Select Component

Implementation: `Picker` from `@react-native-picker/picker`

#### nullOption

```typescript
const options = {
  fields: {
    gender: {
      nullOption: {value: '', text: 'Choose your gender'}
    }
  }
};
```

You can remove the null option by setting `nullOption` to `false`.

#### Options Order

```typescript
const options = {
  fields: {
    gender: {
      order: 'asc' // or 'desc'
    }
  }
};
```

### DatePicker Component

Implementation: Platform-specific date picker

```typescript
const Person = t.struct({
  name: t.String,
  birthDate: t.Date
});
```

### Hidden Component

For every component, you can set the field with the `hidden` option:

```typescript
const options = {
  fields: {
    name: {
      hidden: true
    }
  }
};
```

## Lists

You can handle a list with the `t.list` combinator:

```typescript
const Person = t.struct({
  name: t.String,
  tags: t.list(t.String) // a list of strings
});
```

### Items Configuration

To configure all the items in a list, set the `item` option:

```typescript
const Person = t.struct({
  name: t.String,
  tags: t.list(t.String)
});

const options = {
  fields: {
    tags: {
      item: {
        label: 'My tag'
      }
    }
  }
};
```

### Nested Structures

```typescript
const Person = t.struct({
  name: t.String,
  surname: t.String
});

const Persons = t.list(Person);
```

### Internationalization

```typescript
const options = {
  i18n: {
    optional: ' (optional)',
    required: '',
    add: 'Add',   // add button
    remove: '✘',  // remove button
    up: '↑',      // move up button
    down: '↓'     // move down button
  }
};
```

### Buttons Configuration

```typescript
const options = {
  disableAdd: false,     // prevents adding new items
  disableRemove: false,  // prevents removing existing items
  disableOrder: false    // prevents sorting existing items
};
```

## Unions

```typescript
const AccountType = t.enums({
  'type1': 'Type 1',
  'type2': 'Type 2',
  'other': 'Other'
}, 'AccountType');

const KnownAccount = t.struct({
  type: AccountType
}, 'KnownAccount');

const UnknownAccount = KnownAccount.extend({
  label: t.String,
}, 'UnknownAccount');

const Account = t.union([KnownAccount, UnknownAccount], 'Account');

// Dispatch function to select the correct type
Account.dispatch = (value: Record<string, unknown>) => 
  value && value.type === 'other' ? UnknownAccount : KnownAccount;

const Type = t.list(Account);

const options = {
  item: [
    { label: 'KnownAccount' },
    { label: 'UnknownAccount' }
  ]
};
```

## Customizations

### Stylesheets

You can customize the look and feel by setting a custom stylesheet:

```typescript
import t from '@riebel/tcomb-form-native-ts';

// Define a custom stylesheet
const customStylesheet = {
  // ... your styles here
};

// Override globally
t.form.Form.stylesheet = customStylesheet;
```

You can also override the stylesheet locally:

```typescript
const options = {
  stylesheet: myCustomStylesheet
};
```

Or per field:

```typescript
const options = {
  fields: {
    name: {
      stylesheet: myCustomStylesheet
    }
  }
};
```

### Templates

You can customize the layout by setting custom templates:

```typescript
import t from '@riebel/tcomb-form-native-ts';

const customTemplates = {
  // ... your templates here
};

// Override globally
t.form.Form.templates = customTemplates;
```

Local template override:

```typescript
function myCustomTemplate(locals: Record<string, unknown>) {
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{locals.label}</Text>
      <TextInput style={textboxStyle} />
    </View>
  );
}

const options = {
  fields: {
    name: {
      template: myCustomTemplate
    }
  }
};
```

### Transformers

Transformers handle serialization/deserialization of data:

```typescript
interface Transformer {
  format: (value: unknown) => unknown;  // from value to string
  parse: (value: unknown) => unknown;   // from string to value
}
```

Example for a search field that accepts space-separated keywords:

```typescript
const listTransformer = {
  format: (value: string[]) => {
    return Array.isArray(value) ? value.join(' ') : value;
  },
  parse: (str: string) => {
    return str ? str.split(' ') : [];
  }
};

const options = {
  fields: {
    search: {
      factory: t.form.Textbox,
      transformer: listTransformer,
      help: 'Keywords are separated by spaces'
    }
  }
};
```

## Migration from tcomb-form-native

This package is a **100% drop-in replacement** for the original `tcomb-form-native`. No code changes are required!

### Step 1: Uninstall the old package

```bash
npm uninstall tcomb-form-native
# or
yarn remove tcomb-form-native
```

### Step 2: Install the new TypeScript package

```bash
npm install @riebel/tcomb-form-native-ts
# or
yarn add @riebel/tcomb-form-native-ts
```

### Step 3: Zero-code migration via package.json (Recommended)

For the smoothest migration with **absolutely no code changes**, use npm package aliasing in your `package.json`:

```json
{
  "dependencies": {
    "tcomb-form-native": "npm:@riebel/tcomb-form-native-ts@^1.1.6"
  }
}
```

That's it! Now all your existing imports work without any changes:

```javascript
// This continues to work exactly the same - no code changes needed!
import t from 'tcomb-form-native';
const Form = t.form.Form;
```

The `npm:` prefix tells npm/yarn to install `@riebel/tcomb-form-native-ts` but make it available as `tcomb-form-native` in your project.

### Alternative: Update imports manually (optional)

If you prefer not to use aliases, you can update your imports:

```javascript
// Updated import
import t from '@riebel/tcomb-form-native-ts';
const Form = t.form.Form;
```

### Step 4: Install peer dependencies

Make sure you have the required peer dependencies:

```bash
# For Expo projects
npx expo install @react-native-picker/picker

# For bare React Native projects
npm install @react-native-picker/picker
npx react-native link @react-native-picker/picker
```

### That's it! 🎉

Your existing code will work without any changes. The new package provides:

- ✅ **100% API compatibility** - All existing code works unchanged
- ✅ **Modern TypeScript support** - Full type safety and IntelliSense
- ✅ **React 18+ compatibility** - Uses modern React patterns internally
- ✅ **Functional components** - Modernized implementation under the hood
- ✅ **Better performance** - Optimized with React.memo and hooks
- ✅ **Active maintenance** - Regular updates and bug fixes

### Optional: Modernize Your Code

While not required, you can gradually modernize your existing code:

- Convert class components to functional components with hooks
- Add TypeScript type annotations
- Use modern JavaScript syntax (`const`/`let` instead of `var`)
- Take advantage of improved TypeScript IntelliSense

## Tests

```bash
npm run test
```

## Credits

This TypeScript modernization is maintained by **Hagen Sommerkorn** ([@riebel](https://github.com/riebel)).

Original tcomb-form-native library created by **Giulio Canti** ([@gcanti](https://github.com/gcanti)).

Special thanks to all the contributors who made the original library possible.

## License

[MIT](LICENSE)
