// Debug test to understand why filled forms are failing validation
const t = require('tcomb-validation');

// Test the actual validation logic with filled forms
function debugFilledForms() {
  console.log('=== Debugging Filled Form Validation ===');
  
  // Create test types
  const RequiredStringList = t.list(t.String);
  const RequiredEnum = t.enums({ option1: 'Option 1', option2: 'Option 2' });
  
  console.log('\n1. Testing filled required list:');
  const filledArray = ['item1', 'item2'];
  console.log('  Value:', filledArray);
  console.log('  Type meta:', RequiredStringList.meta);
  
  // Test tcomb validation directly
  const tcombResult = t.validate(filledArray, RequiredStringList);
  console.log('  tcomb.validate result:', tcombResult);
  console.log('  tcomb.validate isValid:', tcombResult.isValid());
  
  // Test our custom validation logic
  const typeInfo = { isMaybe: RequiredStringList.meta.kind === 'maybe' };
  const typeMeta = RequiredStringList.meta;
  
  console.log('  typeInfo.isMaybe:', typeInfo.isMaybe);
  console.log('  typeMeta.kind:', typeMeta.kind);
  console.log('  Array.isArray(value):', Array.isArray(filledArray));
  console.log('  value.length:', filledArray.length);
  console.log('  Custom condition (should be false):', typeMeta?.kind === 'list' && !typeInfo.isMaybe && Array.isArray(filledArray) && filledArray.length === 0);
  
  console.log('\n2. Testing filled required enum:');
  const filledEnum = 'option1';
  console.log('  Value:', filledEnum);
  console.log('  Type meta:', RequiredEnum.meta);
  
  // Test tcomb validation directly
  const enumTcombResult = t.validate(filledEnum, RequiredEnum);
  console.log('  tcomb.validate result:', enumTcombResult);
  console.log('  tcomb.validate isValid:', enumTcombResult.isValid());
  
  // Test our custom validation logic
  const enumTypeInfo = { isMaybe: RequiredEnum.meta.kind === 'maybe' };
  const enumTypeMeta = RequiredEnum.meta;
  
  console.log('  typeInfo.isMaybe:', enumTypeInfo.isMaybe);
  console.log('  typeMeta.kind:', enumTypeMeta.kind);
  console.log('  Custom condition (should be false):', enumTypeMeta?.kind === 'enums' && !enumTypeInfo.isMaybe && (filledEnum === '' || filledEnum === null || filledEnum === undefined));
  
  console.log('\n3. Testing edge case - array with empty strings:');
  const arrayWithEmptyStrings = ['', 'item2'];
  console.log('  Value:', arrayWithEmptyStrings);
  const emptyStringResult = t.validate(arrayWithEmptyStrings, RequiredStringList);
  console.log('  tcomb.validate result:', emptyStringResult);
  console.log('  tcomb.validate isValid:', emptyStringResult.isValid());
  
  console.log('\n=== Summary ===');
  console.log('This should help identify why filled forms are failing validation.');
}

// Run the debug
if (require.main === module) {
  debugFilledForms();
}

module.exports = { debugFilledForms };
