// Test file to recreate the exact Findus scenario where validation should prevent saves
const t = require('tcomb-validation');

// Recreate the exact scenario from Findus
function testFindusScenario() {
  console.log('=== Testing Findus Scenario ===');
  
  // 1. Test tcomb validation directly first
  console.log('\n1. Testing tcomb validation directly:');
  
  const RequiredStringList = t.list(t.String);
  const emptyArray = [];
  
  const directValidation = t.validate(emptyArray, RequiredStringList);
  console.log('  Direct tcomb validation of empty array:');
  console.log('    isValid():', directValidation.isValid());
  console.log('    errors:', directValidation.errors);
  
  // 2. Test with maybe (optional) type
  const OptionalStringList = t.maybe(t.list(t.String));
  const optionalValidation = t.validate(emptyArray, OptionalStringList);
  console.log('\n  Direct tcomb validation of empty array (optional):');
  console.log('    isValid():', optionalValidation.isValid());
  console.log('    errors:', optionalValidation.errors);
  
  // 3. Test with null value
  const nullValidation = t.validate(null, RequiredStringList);
  console.log('\n  Direct tcomb validation of null (required):');
  console.log('    isValid():', nullValidation.isValid());
  console.log('    errors:', nullValidation.errors);
  
  const nullOptionalValidation = t.validate(null, OptionalStringList);
  console.log('\n  Direct tcomb validation of null (optional):');
  console.log('    isValid():', nullOptionalValidation.isValid());
  console.log('    errors:', nullOptionalValidation.errors);
  
  // 4. Test with required enum (empty should fail)
  console.log('\n4. Testing required enum validation:');
  
  const RequiredEnum = t.enums({
    option1: 'Option 1',
    option2: 'Option 2'
  });
  
  const emptyEnumValidation = t.validate('', RequiredEnum);
  console.log('  Direct tcomb validation of empty string enum:');
  console.log('    isValid():', emptyEnumValidation.isValid());
  console.log('    errors:', emptyEnumValidation.errors);
  
  const nullEnumValidation = t.validate(null, RequiredEnum);
  console.log('\n  Direct tcomb validation of null enum:');
  console.log('    isValid():', nullEnumValidation.isValid());
  console.log('    errors:', nullEnumValidation.errors);
  
  // 5. Test with valid values
  console.log('\n5. Testing valid values:');
  
  const validListValidation = t.validate(['item1'], RequiredStringList);
  console.log('  Valid list validation:');
  console.log('    isValid():', validListValidation.isValid());
  console.log('    errors:', validListValidation.errors);
  
  const validEnumValidation = t.validate('option1', RequiredEnum);
  console.log('\n  Valid enum validation:');
  console.log('    isValid():', validEnumValidation.isValid());
  console.log('    errors:', validEnumValidation.errors);
  
  console.log('\n=== End Findus Scenario Test ===');
}

// Run the test
if (require.main === module) {
  testFindusScenario();
}

module.exports = { testFindusScenario };
