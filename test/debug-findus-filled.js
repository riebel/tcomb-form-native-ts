// Debug test to simulate Findus scenario with filled forms
const t = require('tcomb-validation');

// Simulate the exact Findus scenario with filled data
function debugFindusFilledScenario() {
  console.log('=== Debugging Findus Filled Form Scenario ===');
  
  try {
    // Create the exact schema structure that Findus uses
    const UserType = t.struct({
      name: t.String,
      assignedUsers: t.list(t.String), // This is the required list that's causing issues
      email: t.maybe(t.String),
    });
    
    console.log('\n1. Testing filled form data (should pass):');
    const filledFormData = {
      name: 'John Doe',
      assignedUsers: ['user1', 'user2'], // Filled required list
      email: 'john@example.com'
    };
    
    console.log('  Form data:', JSON.stringify(filledFormData, null, 2));
    
    // Test tcomb validation on the whole struct
    const structResult = t.validate(filledFormData, UserType);
    console.log('  Struct validation isValid:', structResult.isValid());
    console.log('  Struct validation errors:', structResult.errors);
    
    // Test validation on just the assignedUsers field
    const assignedUsersType = t.list(t.String);
    const assignedUsersValue = filledFormData.assignedUsers;
    
    console.log('\n2. Testing assignedUsers field specifically:');
    console.log('  assignedUsers value:', assignedUsersValue);
    console.log('  assignedUsers type meta:', assignedUsersType.meta);
    
    const fieldResult = t.validate(assignedUsersValue, assignedUsersType);
    console.log('  Field validation isValid:', fieldResult.isValid());
    console.log('  Field validation errors:', fieldResult.errors);
    
    // Test our custom Form validation logic on this field
    console.log('\n3. Testing Form custom validation logic:');
    const typeInfo = { isMaybe: assignedUsersType.meta.kind === 'maybe' };
    const typeMeta = assignedUsersType.meta;
    
    console.log('  typeInfo.isMaybe:', typeInfo.isMaybe);
    console.log('  typeMeta.kind:', typeMeta.kind);
    console.log('  Is array?:', Array.isArray(assignedUsersValue));
    console.log('  Array length:', assignedUsersValue.length);
    
    // Check if our custom validation would trigger (it shouldn't for filled arrays)
    const shouldFailCustomValidation = typeMeta?.kind === 'list' && !typeInfo.isMaybe && Array.isArray(assignedUsersValue) && assignedUsersValue.length === 0;
    console.log('  Should fail custom validation (should be false):', shouldFailCustomValidation);
    
    if (!shouldFailCustomValidation) {
      // Should fall through to tcomb validation
      const finalResult = t.validate(assignedUsersValue, assignedUsersType);
      console.log('  Final tcomb validation isValid:', finalResult.isValid());
      console.log('  Final tcomb validation errors:', finalResult.errors);
    }
    
    console.log('\n4. Testing empty form data (should fail):');
    const emptyFormData = {
      name: 'John Doe',
      assignedUsers: [], // Empty required list - should fail
      email: 'john@example.com'
    };
    
    console.log('  Empty form data:', JSON.stringify(emptyFormData, null, 2));
    
    const emptyStructResult = t.validate(emptyFormData, UserType);
    console.log('  Empty struct validation isValid:', emptyStructResult.isValid());
    
    // Test our custom validation on empty array
    const emptyValue = emptyFormData.assignedUsers;
    const shouldFailEmpty = typeMeta?.kind === 'list' && !typeInfo.isMaybe && Array.isArray(emptyValue) && emptyValue.length === 0;
    console.log('  Should fail custom validation for empty (should be true):', shouldFailEmpty);
    
  } catch (error) {
    console.log('Error in test:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('\n=== Summary ===');
  console.log('This test should show that filled forms pass validation and empty forms fail.');
}

// Run the debug
if (require.main === module) {
  debugFindusFilledScenario();
}

module.exports = { debugFindusFilledScenario };
