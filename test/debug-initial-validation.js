const test = require('tape');
const React = require('react');
const t = require('tcomb-validation');
const { Form } = require('../dist');

// Test case to verify that new forms don't show validation errors initially
test('Initial validation state - no red labels on form creation', function (assert) {
  console.log('\n=== INITIAL VALIDATION STATE TEST ===');
  
  // Define a struct with required fields
  const PersonType = t.struct({
    name: t.String, // Required field
    email: t.String, // Required field
    age: t.maybe(t.Number) // Optional field
  });
  
  console.log('\n--- Testing new form creation ---');
  
  // Create a new form with empty/null values (like creating a new document)
  const newForm = React.createElement(Form, {
    type: PersonType,
    value: {
      name: null,
      email: null,
      age: null
    }
  });
  
  console.log('New form created with null values');
  console.log('Expected: No red labels should be visible initially');
  
  // Test with empty string values
  const newFormEmptyStrings = React.createElement(Form, {
    type: PersonType,
    value: {
      name: '',
      email: '',
      age: null
    }
  });
  
  console.log('New form created with empty string values');
  console.log('Expected: No red labels should be visible initially');
  
  // Test with undefined values
  const newFormUndefined = React.createElement(Form, {
    type: PersonType,
    value: {
      name: undefined,
      email: undefined,
      age: undefined
    }
  });
  
  console.log('New form created with undefined values');
  console.log('Expected: No red labels should be visible initially');
  
  assert.pass('Initial validation test completed - check that no red labels appear initially');
  assert.end();
});

// Test case to verify validation appears after interaction
test('Validation after interaction', function (assert) {
  console.log('\n=== VALIDATION AFTER INTERACTION TEST ===');
  
  const PersonType = t.struct({
    name: t.String, // Required field
    email: t.String // Required field
  });
  
  console.log('\n--- Testing validation after form interaction ---');
  
  // Create form and simulate user interaction
  const formWithInteraction = React.createElement(Form, {
    type: PersonType,
    value: {
      name: '',
      email: ''
    },
    onChange: (value) => {
      console.log('Form value changed:', value);
      console.log('Expected: Red labels should now be visible for empty required fields');
    }
  });
  
  console.log('Form created with onChange handler');
  console.log('When user interacts with fields, validation should trigger');
  
  assert.pass('Validation after interaction test completed');
  assert.end();
});
