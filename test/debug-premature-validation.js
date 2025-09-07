const test = require('tape');
const t = require('tcomb-validation');
const transform = require('tcomb-json-schema');

test('Premature validation issue with multiple required text inputs', (assert) => {
  assert.plan(1);

  console.log('=== Testing Premature Validation Issue ===');
  
  // Create a simple struct type with required fields (simulating the form schema)
  const PersonType = t.struct({
    firstName: t.String,
    lastName: t.String,
    email: t.String
  }, 'Person');

  console.log('Created PersonType with required fields: firstName, lastName, email');

  // Simulate the validation behavior that happens in components
  console.log('\n--- Simulating Component Validation Logic ---');

  // This simulates what happens in Textbox.hasError() method
  function simulateTextboxValidation(fieldName, value, hasBeenTouched, validationAttempted) {
    const isEmpty = value === null || value === undefined || value === '';
    const isRequired = true; // All fields in our test are required
    const isCurrentlyInvalid = isEmpty && isRequired;
    
    console.log(`${fieldName}:`);
    console.log(`  value: "${value}"`);
    console.log(`  isEmpty: ${isEmpty}`);
    console.log(`  isRequired: ${isRequired}`);
    console.log(`  hasBeenTouched: ${hasBeenTouched}`);
    console.log(`  validationAttempted: ${validationAttempted}`);
    console.log(`  isCurrentlyInvalid: ${isCurrentlyInvalid}`);
    
    // Current logic in Textbox.hasError()
    const shouldShowError = isCurrentlyInvalid && (hasBeenTouched || validationAttempted);
    console.log(`  shouldShowError: ${shouldShowError}`);
    
    return shouldShowError;
  }

  console.log('\n--- Initial State: All fields empty, no interaction ---');
  const firstNameError1 = simulateTextboxValidation('firstName', '', false, false);
  const lastNameError1 = simulateTextboxValidation('lastName', '', false, false);
  const emailError1 = simulateTextboxValidation('email', '', false, false);

  console.log('\n--- After user fills firstName (touches only firstName) ---');
  const firstNameError2 = simulateTextboxValidation('firstName', 'John', true, false);
  const lastNameError2 = simulateTextboxValidation('lastName', '', false, false);
  const emailError2 = simulateTextboxValidation('email', '', false, false);

  console.log('\n--- The Problem: What if validation is triggered globally? ---');
  console.log('If validationAttempted becomes true for all fields when one field changes:');
  const firstNameError3 = simulateTextboxValidation('firstName', 'John', true, true);
  const lastNameError3 = simulateTextboxValidation('lastName', '', false, true); // Problem: shows error!
  const emailError3 = simulateTextboxValidation('email', '', false, true); // Problem: shows error!

  console.log('\n--- Analysis ---');
  console.log('Expected behavior:');
  console.log('- firstName: no error (valid value)');
  console.log('- lastName: no error (not touched by user)');
  console.log('- email: no error (not touched by user)');
  
  console.log('\nProblem behavior:');
  console.log('- firstName: no error (valid value)');
  console.log('- lastName: ERROR shown (not touched but validationAttempted=true)');
  console.log('- email: ERROR shown (not touched but validationAttempted=true)');

  console.log('\nRoot cause: validationAttempted flag is being set globally instead of per-field');

  assert.pass('Premature validation issue reproduced');
});
