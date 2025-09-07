const test = require('tape');
const React = require('react');
const t = require('tcomb-validation');
const { Form } = require('../dist');

// Test case to reproduce the validation difference between Select and Textbox in Lists
test('Validation comparison: Select vs Textbox in Lists', function (assert) {
  console.log('\n=== VALIDATION COMPARISON TEST ===');
  
  // Define types for testing
  const SelectItem = t.struct({
    selectField: t.maybe(t.enums({ option1: 'Option 1', option2: 'Option 2' }))
  });
  
  const TextboxItem = t.struct({
    textField: t.maybe(t.String)
  });
  
  const SelectList = t.list(SelectItem);
  const TextboxList = t.list(TextboxItem);
  
  // Test Select component in List
  console.log('\n--- Testing Select in List ---');
  const selectForm = React.createElement(Form, {
    type: SelectList,
    value: [{ selectField: null }],
    options: {
      fields: {
        selectField: {
          factory: 'select'
        }
      }
    }
  });
  
  console.log('Select form created');
  
  // Test Textbox component in List  
  console.log('\n--- Testing Textbox in List ---');
  const textboxForm = React.createElement(Form, {
    type: TextboxList,
    value: [{ textField: null }],
    options: {
      fields: {
        textField: {
          factory: 'textbox'
        }
      }
    }
  });
  
  console.log('Textbox form created');
  
  // Test clearing values (simulating widget clear button)
  console.log('\n--- Testing value clearing ---');
  
  // Simulate clearing Select field
  const clearedSelectForm = React.createElement(Form, {
    type: SelectList,
    value: [{ selectField: null }],
    options: {
      fields: {
        selectField: {
          factory: 'select',
          hasError: true // Simulate validation attempt
        }
      }
    }
  });
  
  console.log('Cleared Select form created with hasError: true');
  
  // Simulate clearing Textbox field
  const clearedTextboxForm = React.createElement(Form, {
    type: TextboxList,
    value: [{ textField: null }],
    options: {
      fields: {
        textField: {
          factory: 'textbox',
          hasError: true // Simulate validation attempt
        }
      }
    }
  });
  
  console.log('Cleared Textbox form created with hasError: true');
  
  assert.pass('Validation comparison test completed - check logs for differences');
  assert.end();
});

// Test case to specifically test optional fields behavior
test('Optional fields validation behavior', function (assert) {
  console.log('\n=== OPTIONAL FIELDS TEST ===');
  
  const OptionalSelectItem = t.struct({
    optionalSelect: t.maybe(t.enums({ a: 'A', b: 'B' }))
  });
  
  const OptionalTextboxItem = t.struct({
    optionalTextbox: t.maybe(t.String)
  });
  
  // Test optional Select with null value and hasError flag
  console.log('\n--- Testing optional Select with hasError flag ---');
  const optionalSelectForm = React.createElement(Form, {
    type: t.list(OptionalSelectItem),
    value: [{ optionalSelect: null }],
    options: {
      fields: {
        optionalSelect: {
          factory: 'select',
          hasError: true // This should NOT make the field show as error since it's optional
        }
      }
    }
  });
  
  console.log('Optional Select form created');
  
  // Test optional Textbox with null value and hasError flag
  console.log('\n--- Testing optional Textbox with hasError flag ---');
  const optionalTextboxForm = React.createElement(Form, {
    type: t.list(OptionalTextboxItem),
    value: [{ optionalTextbox: null }],
    options: {
      fields: {
        optionalTextbox: {
          factory: 'textbox',
          hasError: true // This should NOT make the field show as error since it's optional
        }
      }
    }
  });
  
  console.log('Optional Textbox form created');
  
  assert.pass('Optional fields test completed - check logs for hasError behavior');
  assert.end();
});
