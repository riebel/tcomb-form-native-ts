// Debug test to simulate the exact Findus save scenario
const React = require('react');
const t = require('tcomb-validation');

// Import the actual Form component to test it
const { Form } = require('../dist/index.js');

// Simulate the exact Findus scenario
function debugFindusSaveScenario() {
  console.log('=== Debugging Findus Save Scenario ===');
  
  try {
    // Create the exact schema structure that Findus uses for user documents
    const UserSchema = t.struct({
      name: t.String,
      email: t.maybe(t.String),
      assignedUsers: t.list(t.String), // This is the required list
      disabled: t.maybe(t.Boolean),
      tenantAdmin: t.maybe(t.Boolean),
    });
    
    console.log('\n1. Testing EMPTY form (should fail and return null):');
    const emptyFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      assignedUsers: [], // Empty required list - should fail
      disabled: false,
      tenantAdmin: false,
    };
    
    console.log('  Form data:', JSON.stringify(emptyFormData, null, 2));
    
    // Test the Form component directly
    console.log('\n  Testing Form validation directly:');
    
    // Simulate what happens when Findus calls formRef.current.getValue()
    const formProps = {
      type: UserSchema,
      value: emptyFormData,
      options: {},
    };
    
    // Test the validation logic directly
    const formValidationResult = t.validate(emptyFormData, UserSchema);
    console.log('  Direct tcomb validation isValid:', formValidationResult.isValid());
    console.log('  Direct tcomb validation errors:', formValidationResult.errors);
    
    // Test our custom validation on the assignedUsers field specifically
    const assignedUsersType = t.list(t.String);
    const assignedUsersValue = emptyFormData.assignedUsers;
    
    console.log('\n  Testing assignedUsers field custom validation:');
    console.log('  assignedUsers value:', assignedUsersValue);
    console.log('  assignedUsers type meta:', assignedUsersType.meta);
    
    // Simulate our Form validation logic
    const typeInfo = { isMaybe: assignedUsersType.meta.kind === 'maybe' };
    const typeMeta = assignedUsersType.meta;
    
    console.log('  typeInfo.isMaybe:', typeInfo.isMaybe);
    console.log('  typeMeta.kind:', typeMeta.kind);
    console.log('  Is array empty?:', Array.isArray(assignedUsersValue) && assignedUsersValue.length === 0);
    
    const shouldFailCustomValidation = typeMeta?.kind === 'list' && !typeInfo.isMaybe && Array.isArray(assignedUsersValue) && assignedUsersValue.length === 0;
    console.log('  Should fail custom validation (should be true):', shouldFailCustomValidation);
    
    console.log('\n2. Testing FILLED form (should pass and return data):');
    const filledFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      assignedUsers: ['user1', 'user2'], // Filled required list - should pass
      disabled: false,
      tenantAdmin: false,
    };
    
    console.log('  Form data:', JSON.stringify(filledFormData, null, 2));
    
    // Test the validation logic directly
    const filledValidationResult = t.validate(filledFormData, UserSchema);
    console.log('  Direct tcomb validation isValid:', filledValidationResult.isValid());
    console.log('  Direct tcomb validation errors:', filledValidationResult.errors);
    
    // Test our custom validation on the filled assignedUsers field
    const filledAssignedUsersValue = filledFormData.assignedUsers;
    
    console.log('\n  Testing filled assignedUsers field custom validation:');
    console.log('  assignedUsers value:', filledAssignedUsersValue);
    console.log('  Is array empty?:', Array.isArray(filledAssignedUsersValue) && filledAssignedUsersValue.length === 0);
    
    const shouldFailFilledCustomValidation = typeMeta?.kind === 'list' && !typeInfo.isMaybe && Array.isArray(filledAssignedUsersValue) && filledAssignedUsersValue.length === 0;
    console.log('  Should fail custom validation (should be false):', shouldFailFilledCustomValidation);
    
    if (!shouldFailFilledCustomValidation) {
      const filledFieldResult = t.validate(filledAssignedUsersValue, assignedUsersType);
      console.log('  Final field validation isValid:', filledFieldResult.isValid());
      console.log('  Final field validation errors:', filledFieldResult.errors);
    }
    
    console.log('\n3. Testing potential edge cases:');
    
    // Test with null values in array
    const arrayWithNulls = [null, 'user1'];
    console.log('  Array with nulls:', arrayWithNulls);
    const nullArrayResult = t.validate(arrayWithNulls, assignedUsersType);
    console.log('  Null array validation isValid:', nullArrayResult.isValid());
    
    // Test with empty strings in array
    const arrayWithEmptyStrings = ['', 'user1'];
    console.log('  Array with empty strings:', arrayWithEmptyStrings);
    const emptyStringArrayResult = t.validate(arrayWithEmptyStrings, assignedUsersType);
    console.log('  Empty string array validation isValid:', emptyStringArrayResult.isValid());
    
    // Test with undefined
    const undefinedValue = undefined;
    console.log('  Undefined value:', undefinedValue);
    const undefinedResult = t.validate(undefinedValue, assignedUsersType);
    console.log('  Undefined validation isValid:', undefinedResult.isValid());
    
  } catch (error) {
    console.log('Error in test:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('\n=== Summary ===');
  console.log('This test simulates the exact Findus scenario to identify why filled forms are not saving.');
}

// Run the debug
if (require.main === module) {
  debugFindusSaveScenario();
}

module.exports = { debugFindusSaveScenario };
