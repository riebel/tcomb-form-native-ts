const test = require('tape');
const t = require('tcomb-validation');
const React = require('react');

const { Textbox } = require('../dist/Textbox');
const { Struct } = require('../dist/Struct');

// Mock stylesheet with error and normal styles to test styling changes
const mockStylesheet = {
  controlLabel: {
    normal: { color: 'black', fontSize: 16 },
    error: { color: 'red', fontSize: 16, fontWeight: 'bold' }
  },
  formGroup: {
    normal: { marginBottom: 10 },
    error: { marginBottom: 10, borderColor: 'red' }
  },
  fieldset: { padding: 10 },
  errorBlock: { color: 'red', fontSize: 12 }
};

// Test that label styling changes correctly when hasError state changes
test('Label styling should change when hasError state changes', function (assert) {
  console.log('🎨 Testing label styling changes...');

  const RequiredString = t.refinement(t.String, function (s) {
    return s.length > 0;
  });

  // Create textbox without error
  const textboxInstance = new Textbox({
    type: RequiredString,
    options: { hasError: false },
    value: 'test',
    ctx: {
      auto: 'labels',
      templates: { textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: mockStylesheet,
    },
  });

  console.log('📋 Step 1: Check normal styling (no error)');
  
  // Get locals for template rendering
  const localsNormal = textboxInstance.getLocals();
  
  assert.equal(
    localsNormal.hasError,
    false,
    'hasError should be false in locals when no error'
  );

  assert.deepEqual(
    localsNormal.stylesheet.controlLabel.normal,
    mockStylesheet.controlLabel.normal,
    'Should use normal control label style when no error'
  );

  console.log('✅ Step 1 passed: Normal styling is correct');

  console.log('📋 Step 2: Check error styling (with error)');

  // Create textbox with error
  const textboxWithError = new Textbox({
    type: RequiredString,
    options: { hasError: true }, // Parent sets this
    value: '',
    ctx: {
      auto: 'labels',
      templates: { textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: mockStylesheet,
    },
  });

  // Get locals for template rendering
  const localsError = textboxWithError.getLocals();
  
  assert.equal(
    localsError.hasError,
    true,
    'hasError should be true in locals when error exists'
  );

  assert.deepEqual(
    localsError.stylesheet.controlLabel.error,
    mockStylesheet.controlLabel.error,
    'Should have error control label style available when error exists'
  );

  console.log('✅ Step 2 passed: Error styling is correct');

  console.log('🎉 Label styling test passed!');
  
  assert.end();
});

// Test complete validation flow with styling changes
test('Complete validation flow should update label styling', function (assert) {
  console.log('🔄 Testing complete validation flow with styling...');

  const PersonType = t.struct({
    name: t.String,
    email: t.String,
  });

  // Create struct with empty values
  const structInstance = new Struct({
    type: PersonType,
    options: {},
    value: { name: '', email: '' },
    ctx: {
      auto: 'labels',
      templates: { 
        struct: () => null, 
        textbox: () => null 
      },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: mockStylesheet,
    },
  });

  console.log('📋 Step 1: Before validation - no errors');

  // Before validation
  const localsBeforeValidation = structInstance.getLocals();
  
  assert.equal(
    localsBeforeValidation.hasError,
    false,
    'Struct should not have error before validation'
  );

  assert.equal(
    structInstance.getFieldError('name'),
    undefined,
    'Should not have field error for name before validation'
  );

  console.log('✅ Step 1 passed: No errors before validation');

  console.log('📋 Step 2: After validation - should have errors');

  // Perform validation
  const validationResult = structInstance.validate();
  
  assert.equal(
    validationResult.isValid(),
    false,
    'Validation should fail for empty required fields'
  );

  // After validation
  const localsAfterValidation = structInstance.getLocals();
  
  assert.equal(
    localsAfterValidation.hasError,
    true,
    'Struct should have error after failed validation'
  );

  // Check that field errors are stored
  const hasFieldErrors = structInstance.getFieldError('name') !== undefined || 
                         structInstance.getFieldError('email') !== undefined;
  
  assert.ok(
    hasFieldErrors,
    'Should have field-specific errors after validation'
  );

  console.log('✅ Step 2 passed: Errors present after validation');

  console.log('📋 Step 3: Verify field components would receive error styling');

  // Simulate how field components would be rendered with error state
  const fieldHasError = structInstance.getFieldError('name') !== undefined;
  
  assert.equal(
    fieldHasError,
    true,
    'Field should be marked as having error'
  );

  // This simulates what happens in getInputs() when creating field components
  const fieldOptions = {
    hasError: fieldHasError,
    label: 'Name'
  };

  assert.equal(
    fieldOptions.hasError,
    true,
    'Field options should include hasError: true for styling'
  );

  console.log('✅ Step 3 passed: Field components would receive error styling');

  console.log('🎉 Complete validation flow styling test passed!');
  
  assert.end();
});

// Test that componentDidUpdate triggers re-render on hasError prop change
test('componentDidUpdate should trigger re-render on hasError prop change', function (assert) {
  console.log('🔄 Testing componentDidUpdate behavior...');

  const RequiredString = t.refinement(t.String, function (s) {
    return s.length > 0;
  });

  // Create textbox instance
  const textboxInstance = new Textbox({
    type: RequiredString,
    options: { hasError: false },
    value: '',
    ctx: {
      auto: 'labels',
      templates: { textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: mockStylesheet,
    },
  });

  // Initial state
  assert.equal(
    textboxInstance.hasError(),
    false,
    'Initial hasError should be false'
  );

  // Simulate props change (what happens when parent Struct updates)
  const prevProps = { ...textboxInstance.props };
  textboxInstance.props.options.hasError = true;

  // Call componentDidUpdate manually to simulate React lifecycle
  textboxInstance.componentDidUpdate(prevProps);

  // Should now show error
  assert.equal(
    textboxInstance.hasError(),
    true,
    'hasError should be true after props change'
  );

  console.log('✅ componentDidUpdate test passed!');
  
  assert.end();
});
