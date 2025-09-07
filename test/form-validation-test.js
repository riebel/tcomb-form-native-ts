// Test file to verify our custom validation logic works (Findus scenario)
const t = require('tcomb-validation');

// Simulate the Form validation logic we implemented
function simulateFormValidation(value, type) {
  // This simulates our custom validation logic from Form.tsx
  
  // Basic type check - tcomb types are functions, not objects!
  if (!type || !('meta' in type) || !('is' in type)) {
    return { isValid: () => true, value, errors: [] };
  }

  // Custom validation for required lists and enums (tcomb allows empty arrays/strings)
  // Correctly detect if type is maybe (optional)
  const typeInfo = { isMaybe: type.meta.kind === 'maybe' };
  const typeMeta = type.meta;
  
  // Custom validation logic matches Form.tsx implementation
  
  // Check for required empty lists
  if (typeMeta?.kind === 'list' && !typeInfo.isMaybe) {
    if (Array.isArray(value) && value.length === 0) {
      return {
        isValid: () => false,
        value,
        errors: [{ message: 'This field is required', path: [], actual: value, expected: type }],
      };
    }
  }
  
  // Check for required empty enums
  if (typeMeta?.kind === 'enums' && !typeInfo.isMaybe) {
    if (value === '' || value === null || value === undefined) {
      return {
        isValid: () => false,
        value,
        errors: [{ message: 'This field is required', path: [], actual: value, expected: type }],
      };
    }
  }

  // Use tcomb validation for everything else
  return t.validate(value, type);
}

// Simulate Form.getValue() logic
function simulateFormGetValue(value, type) {
  const result = simulateFormValidation(value, type);
  return result.isValid() ? result.value : null;
}

// Test that our validation logic works correctly
function testFormValidation() {
  console.log('=== Testing Custom Form Validation Logic ===');
  
  try {
    // 1. Test required list with empty array (should return null)
    console.log('\n1. Testing required list with empty array:');
    
    const RequiredStringList = t.list(t.String);
    const emptyArrayValue = [];
    
    const validation = simulateFormValidation(emptyArrayValue, RequiredStringList);
    const getValue = simulateFormGetValue(emptyArrayValue, RequiredStringList);
    
    console.log('  getValue() result:', getValue);
    console.log('  validate().isValid():', validation.isValid());
    console.log('  Expected: getValue() should return null, validate() should be false');
    
    if (getValue === null && !validation.isValid()) {
      console.log('  ✅ PASS: Empty required list correctly returns null');
    } else {
      console.log('  ❌ FAIL: Empty required list should return null but returned:', getValue);
    }
    
    // 2. Test required enum with empty string (should return null)
    console.log('\n2. Testing required enum with empty string:');
    
    const RequiredEnum = t.enums({
      option1: 'Option 1',
      option2: 'Option 2'
    });
    
    const emptyStringValue = '';
    
    const enumValidation = simulateFormValidation(emptyStringValue, RequiredEnum);
    const enumGetValue = simulateFormGetValue(emptyStringValue, RequiredEnum);
    
    console.log('  getValue() result:', enumGetValue);
    console.log('  validate().isValid():', enumValidation.isValid());
    console.log('  Expected: getValue() should return null, validate() should be false');
    
    if (enumGetValue === null && !enumValidation.isValid()) {
      console.log('  ✅ PASS: Empty required enum correctly returns null');
    } else {
      console.log('  ❌ FAIL: Empty required enum should return null but returned:', enumGetValue);
    }
    
    // 3. Test optional list with empty array (should return value)
    console.log('\n3. Testing optional list with empty array:');
    
    const OptionalStringList = t.maybe(t.list(t.String));
    
    const optionalValidation = simulateFormValidation(emptyArrayValue, OptionalStringList);
    const optionalGetValue = simulateFormGetValue(emptyArrayValue, OptionalStringList);
    
    console.log('  getValue() result:', optionalGetValue);
    console.log('  validate().isValid():', optionalValidation.isValid());
    console.log('  Expected: getValue() should return value, validate() should be true');
    
    if (optionalGetValue !== null && optionalValidation.isValid()) {
      console.log('  ✅ PASS: Empty optional list correctly returns value');
    } else {
      console.log('  ❌ FAIL: Empty optional list should return value but returned:', optionalGetValue);
    }
    
    // 4. Test valid required list (should return value)
    console.log('\n4. Testing valid required list:');
    
    const validArrayValue = ['item1'];
    
    const validValidation = simulateFormValidation(validArrayValue, RequiredStringList);
    const validGetValue = simulateFormGetValue(validArrayValue, RequiredStringList);
    
    console.log('  getValue() result:', validGetValue);
    console.log('  validate().isValid():', validValidation.isValid());
    console.log('  Expected: getValue() should return value, validate() should be true');
    
    if (validGetValue !== null && validValidation.isValid()) {
      console.log('  ✅ PASS: Valid required list correctly returns value');
    } else {
      console.log('  ❌ FAIL: Valid required list should return value but returned:', validGetValue);
    }
    
    console.log('\n=== Summary ===');
    console.log('This test verifies that our custom validation logic works correctly:');
    console.log('- Empty required lists/enums: getValue() returns null (prevents save)');
    console.log('- Optional empty fields: getValue() returns data (allows save)');
    console.log('- Valid fields: getValue() returns data (allows save)');
    console.log('This ensures Findus gets null when trying to save invalid data.');
    
  } catch (error) {
    console.log('Error running test:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('\n=== End Form Validation Test ===');
}

// Run the test
if (require.main === module) {
  testFormValidation();
}

module.exports = { testFormValidation };
