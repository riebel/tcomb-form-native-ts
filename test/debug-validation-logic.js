// Debug test to understand the exact validation logic issue
const t = require('tcomb-validation');

// Import getTypeInfo function simulation
function getTypeInfo(type) {
  return {
    isMaybe: type.meta && type.meta.kind === 'maybe',
    isSubtype: false,
    innerType: type,
    getValidationErrorMessage: undefined,
  };
}

// Simulate the exact validation logic from Form.tsx
function simulateFormValidation(formValue, type) {
  console.log('\n--- Starting Form Validation Simulation ---');
  console.log('formValue:', JSON.stringify(formValue));
  console.log('type:', type.displayName || type.name || 'Unknown');
  console.log('type.meta:', type.meta);
  
  // Step 1: Basic type check (this was the bug we fixed)
  if (!type || !('meta' in type) || !('is' in type)) {
    console.log('STEP 1: Failed basic type check - returning valid');
    return { isValid: () => true, value: formValue, errors: [] };
  }
  console.log('STEP 1: Passed basic type check');
  
  // Step 2: Get type info (using getTypeInfo function)
  const typeInfo = getTypeInfo(type);
  console.log('STEP 2: typeInfo.isMaybe =', typeInfo.isMaybe);
  
  // Step 3: Custom validation for required lists
  const typeMeta = type.meta;
  console.log('STEP 3: typeMeta.kind =', typeMeta.kind);
  
  if (typeMeta?.kind === 'list' && !typeInfo.isMaybe) {
    console.log('STEP 3a: Checking required list validation');
    console.log('  - Is array?:', Array.isArray(formValue));
    console.log('  - Array length:', Array.isArray(formValue) ? formValue.length : 'N/A');
    
    if (Array.isArray(formValue) && formValue.length === 0) {
      console.log('STEP 3a: FAILING - Empty required list');
      return {
        isValid: () => false,
        value: formValue,
        errors: [{ message: 'This field is required', path: [], actual: formValue, expected: type }],
      };
    }
    console.log('STEP 3a: PASSING - List has items or not empty');
  }
  
  // Step 4: Custom validation for required enums
  if (typeMeta?.kind === 'enums' && !typeInfo.isMaybe) {
    console.log('STEP 4: Checking required enum validation');
    console.log('  - Value:', formValue);
    console.log('  - Is empty?:', formValue === '' || formValue === null || formValue === undefined);
    
    if (formValue === '' || formValue === null || formValue === undefined) {
      console.log('STEP 4: FAILING - Empty required enum');
      return {
        isValid: () => false,
        value: formValue,
        errors: [{ message: 'This field is required', path: [], actual: formValue, expected: type }],
      };
    }
    console.log('STEP 4: PASSING - Enum has value');
  }
  
  // Step 5: Check for structs with required list/enum fields (NEW FIX)
  if (typeMeta?.kind === 'struct' && typeMeta.props && typeof formValue === 'object' && formValue !== null) {
    console.log('STEP 5: Checking struct with required fields');
    const structValue = formValue;
    const props = typeMeta.props;
    
    for (const [fieldName, fieldType] of Object.entries(props)) {
      const fieldValue = structValue[fieldName];
      const fieldMeta = fieldType.meta;
      const fieldTypeInfo = getTypeInfo(fieldType);
      
      console.log(`  - Field ${fieldName}: value =`, fieldValue, ', type =', fieldMeta?.kind, ', isMaybe =', fieldTypeInfo.isMaybe);
      
      // Check for required empty lists within struct
      if (fieldMeta?.kind === 'list' && !fieldTypeInfo.isMaybe) {
        if (Array.isArray(fieldValue) && fieldValue.length === 0) {
          console.log(`  - FAILING: Field ${fieldName} is empty required list`);
          return {
            isValid: () => false,
            value: formValue,
            errors: [{ message: 'This field is required', path: [fieldName], actual: fieldValue, expected: fieldType }],
          };
        }
      }
      
      // Check for required empty enums within struct
      if (fieldMeta?.kind === 'enums' && !fieldTypeInfo.isMaybe) {
        if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
          console.log(`  - FAILING: Field ${fieldName} is empty required enum`);
          return {
            isValid: () => false,
            value: formValue,
            errors: [{ message: 'This field is required', path: [fieldName], actual: fieldValue, expected: fieldType }],
          };
        }
      }
    }
    console.log('  - All struct fields passed validation');
  }

  // Step 6: Fall back to tcomb validation
  console.log('STEP 6: Using tcomb validation');
  const result = t.validate(formValue, type);
  console.log('STEP 6: tcomb result isValid =', result.isValid());
  console.log('STEP 6: tcomb result errors =', result.errors);
  
  return result;
}

// Test the validation logic
function testValidationLogic() {
  console.log('=== Testing Form Validation Logic ===');
  
  // Test 1: Empty required list (should fail)
  console.log('\n🔴 TEST 1: Empty required list (should fail)');
  const RequiredList = t.list(t.String);
  const emptyArray = [];
  const result1 = simulateFormValidation(emptyArray, RequiredList);
  console.log('Result: isValid =', result1.isValid(), '| Expected: false');
  
  // Test 2: Filled required list (should pass)
  console.log('\n🟢 TEST 2: Filled required list (should pass)');
  const filledArray = ['user1', 'user2'];
  const result2 = simulateFormValidation(filledArray, RequiredList);
  console.log('Result: isValid =', result2.isValid(), '| Expected: true');
  
  // Test 3: Empty required enum (should fail)
  console.log('\n🔴 TEST 3: Empty required enum (should fail)');
  const RequiredEnum = t.enums({ option1: 'Option 1', option2: 'Option 2' });
  const emptyString = '';
  const result3 = simulateFormValidation(emptyString, RequiredEnum);
  console.log('Result: isValid =', result3.isValid(), '| Expected: false');
  
  // Test 4: Filled required enum (should pass)
  console.log('\n🟢 TEST 4: Filled required enum (should pass)');
  const filledEnum = 'option1';
  const result4 = simulateFormValidation(filledEnum, RequiredEnum);
  console.log('Result: isValid =', result4.isValid(), '| Expected: true');
  
  // Test 5: Complex struct with required list (Findus scenario)
  console.log('\n🔍 TEST 5: Complex struct with required list (Findus scenario)');
  const UserStruct = t.struct({
    name: t.String,
    assignedUsers: t.list(t.String),
    email: t.maybe(t.String),
  });
  
  const emptyUserData = {
    name: 'John Doe',
    assignedUsers: [], // Empty required list
    email: 'john@example.com'
  };
  
  console.log('\n  Testing empty user data:');
  const structResult1 = simulateFormValidation(emptyUserData, UserStruct);
  console.log('  Struct result: isValid =', structResult1.isValid());
  
  // Test the assignedUsers field specifically
  console.log('\n  Testing assignedUsers field specifically:');
  const assignedUsersResult1 = simulateFormValidation(emptyUserData.assignedUsers, t.list(t.String));
  console.log('  assignedUsers result: isValid =', assignedUsersResult1.isValid(), '| Expected: false');
  
  const filledUserData = {
    name: 'John Doe',
    assignedUsers: ['user1', 'user2'], // Filled required list
    email: 'john@example.com'
  };
  
  console.log('\n  Testing filled user data:');
  const structResult2 = simulateFormValidation(filledUserData, UserStruct);
  console.log('  Struct result: isValid =', structResult2.isValid());
  
  console.log('\n  Testing filled assignedUsers field specifically:');
  const assignedUsersResult2 = simulateFormValidation(filledUserData.assignedUsers, t.list(t.String));
  console.log('  assignedUsers result: isValid =', assignedUsersResult2.isValid(), '| Expected: true');
  
  console.log('\n=== Summary ===');
  console.log('If filled forms are still not saving, the issue might be:');
  console.log('1. The Form component is not using the validation logic correctly');
  console.log('2. There are other validation paths we haven\'t identified');
  console.log('3. The issue is in how Findus is calling getValue() or handling the result');
  console.log('4. There might be component-level validation (List, Struct) interfering');
}

// Run the test
if (require.main === module) {
  testValidationLogic();
}

module.exports = { testValidationLogic };
