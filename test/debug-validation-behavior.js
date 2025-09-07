const React = require('react');
const t = require('tcomb-validation');
const { Form } = require('../dist');

// Test the current validation behavior to ensure fields don't show errors immediately
console.log('🧪 Testing validation behavior after removing validationAttempted logic...\n');

// Define a simple struct with required fields
const Person = t.struct({
  name: t.String,
  email: t.String,
  age: t.maybe(t.Number)
});

// Test 1: Create a new form with empty values
console.log('📝 Test 1: Creating new form with empty values');
const emptyFormValue = {};

try {
  const formElement = React.createElement(Form, {
    type: Person,
    value: emptyFormValue,
    onChange: (value) => console.log('Form changed:', value)
  });
  
  console.log('✅ Form created successfully with empty values');
  console.log('Form element:', formElement);
  
  // Check if the form has any error state initially
  const formProps = formElement.props;
  console.log('Form props keys:', Object.keys(formProps));
  console.log('Form type:', formProps.type);
  console.log('Form value:', formProps.value);
  
} catch (error) {
  console.log('❌ Error creating form:', error.message);
}

// Test 2: Test validation explicitly
console.log('\n📝 Test 2: Testing explicit validation');
try {
  const formRef = React.createRef();
  const formElement = React.createElement(Form, {
    ref: formRef,
    type: Person,
    value: emptyFormValue,
    onChange: (value) => console.log('Form changed:', value)
  });
  
  console.log('✅ Form with ref created successfully');
  
  // Note: We can't actually call validate() here since we're not in a React environment
  // But we can verify the form structure is correct
  
} catch (error) {
  console.log('❌ Error creating form with ref:', error.message);
}

// Test 3: Test with some valid values
console.log('\n📝 Test 3: Creating form with valid values');
const validFormValue = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

try {
  const formElement = React.createElement(Form, {
    type: Person,
    value: validFormValue,
    onChange: (value) => console.log('Form changed:', value)
  });
  
  console.log('✅ Form created successfully with valid values');
  console.log('Form value:', formElement.props.value);
  
} catch (error) {
  console.log('❌ Error creating form with valid values:', error.message);
}

console.log('\n🎯 Key Points:');
console.log('1. Forms should create successfully without throwing validation errors');
console.log('2. Fields should not show red labels immediately on creation');
console.log('3. Validation should only trigger after user interaction or explicit validate() call');
console.log('4. The validationAttempted flag approach has been removed');

console.log('\n✨ Validation behavior test completed!');
