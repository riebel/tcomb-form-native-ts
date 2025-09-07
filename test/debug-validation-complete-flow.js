const test = require('tape');
const t = require('tcomb-validation');

const { Textbox } = require('../dist/Textbox');
const { Struct } = require('../dist/Struct');

// Test complete validation flow: creation -> no errors, interaction -> errors, explicit validation -> errors
test('Complete validation flow should work correctly', function (assert) {
  console.log('🧪 Testing complete validation flow...');

  // Create a struct type with required fields
  const PersonType = t.struct({
    name: t.String,
    email: t.String,
  });

  // Create a Struct component with empty values (simulating form creation)
  const structInstance = new Struct({
    type: PersonType,
    options: {},
    value: { name: '', email: '' }, // Empty values for required fields
    ctx: {
      auto: 'labels',
      templates: { struct: () => null, textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  console.log('📋 Step 1: Form creation - should not show errors immediately');
  
  // Should not show error immediately on creation
  assert.equal(
    structInstance.hasError(),
    false,
    'Struct should not show error on creation with empty required fields'
  );

  console.log('✅ Step 1 passed: No errors on form creation');

  console.log('📋 Step 2: Explicit validation - should show errors after validate() call');

  // Call validate() explicitly (simulating form save)
  const validationResult = structInstance.validate();
  
  // Validation should fail
  assert.equal(
    validationResult.isValid(),
    false,
    'Validation should fail for empty required fields'
  );

  // Should have validation errors
  assert.ok(
    validationResult.errors.length > 0,
    'Should have validation errors for empty required fields'
  );

  // Struct should now show error state
  assert.equal(
    structInstance.hasError(),
    true,
    'Struct should show error after explicit validation fails'
  );

  // Check that field errors are properly stored
  assert.ok(
    structInstance.getFieldError('name') !== undefined || structInstance.getFieldError('email') !== undefined,
    'Should have field-specific errors stored'
  );

  console.log('✅ Step 2 passed: Errors show after explicit validation');

  console.log('📋 Step 3: Test individual field behavior');

  // Test individual Textbox component
  const RequiredString = t.refinement(t.String, function (s) {
    return s.length > 0;
  });

  const textboxInstance = new Textbox({
    type: RequiredString,
    options: {},
    value: '', // Empty value for required field
    ctx: {
      auto: 'labels',
      templates: { textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Should not show error on creation
  assert.equal(
    textboxInstance.hasError(),
    false,
    'Textbox should not show error on creation'
  );

  // Test with hasError prop set (simulating parent Struct setting error)
  const textboxWithError = new Textbox({
    type: RequiredString,
    options: { hasError: true }, // Parent component sets this
    value: '',
    ctx: {
      auto: 'labels',
      templates: { textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Should show error when hasError prop is set
  assert.equal(
    textboxWithError.hasError(),
    true,
    'Textbox should show error when hasError prop is set by parent'
  );

  console.log('✅ Step 3 passed: Individual field behavior works correctly');

  console.log('📋 Step 4: Test user interaction behavior');

  // Simulate user interaction
  textboxInstance.onChange('test');
  textboxInstance.onChange(''); // Make it empty again after interaction

  // Should show error after user interaction
  assert.equal(
    textboxInstance.hasError(),
    true,
    'Textbox should show error after user interaction with empty required field'
  );

  console.log('✅ Step 4 passed: Errors show after user interaction');

  console.log('🎉 All validation flow tests passed!');
  
  assert.end();
});

// Test that validation errors are properly propagated through the component hierarchy
test('Validation error propagation should work correctly', function (assert) {
  console.log('🧪 Testing validation error propagation...');

  const PersonType = t.struct({
    name: t.String,
    age: t.Number,
  });

  const structInstance = new Struct({
    type: PersonType,
    options: {},
    value: { name: '', age: null },
    ctx: {
      auto: 'labels',
      templates: { struct: () => null, textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Before validation - no errors
  assert.equal(
    structInstance.hasError(),
    false,
    'Struct should not have errors before validation'
  );

  assert.equal(
    structInstance.getFieldError('name'),
    undefined,
    'Should not have field error for name before validation'
  );

  // After validation - should have errors
  const result = structInstance.validate();
  
  assert.equal(
    result.isValid(),
    false,
    'Validation should fail'
  );

  assert.equal(
    structInstance.hasError(),
    true,
    'Struct should have errors after validation'
  );

  // Should have field-specific errors
  const hasFieldErrors = structInstance.getFieldError('name') !== undefined || 
                         structInstance.getFieldError('age') !== undefined;
  
  assert.ok(
    hasFieldErrors,
    'Should have field-specific errors after validation'
  );

  console.log('✅ Validation error propagation test passed!');
  
  assert.end();
});
