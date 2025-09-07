// Complete debug test to trace exactly what happens in Findus save scenario
const t = require('tcomb-validation');

// Simulate the exact Findus form structure and validation flow
function debugCompleteFindusSaveFlow() {
  console.log('=== COMPLETE FINDUS SAVE FLOW DEBUG ===');
  
  try {
    // 1. Create the exact Findus schema structure
    console.log('\n1. CREATING FINDUS SCHEMA STRUCTURE:');
    
    // This is the exact structure Findus uses for user documents
    const UserSchema = t.struct({
      name: t.String,
      email: t.maybe(t.String),
      assignedUsers: t.list(t.String), // Required list - this is the problem field
      disabled: t.maybe(t.Boolean),
      tenantAdmin: t.maybe(t.Boolean),
      coordinatedClients: t.maybe(t.list(t.String)), // Optional list
    });
    
    console.log('UserSchema created:', UserSchema.displayName);
    console.log('UserSchema meta:', JSON.stringify(UserSchema.meta, null, 2));
    
    // 2. Test with EMPTY form data (should fail)
    console.log('\n2. TESTING EMPTY FORM DATA (should fail):');
    
    const emptyFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      assignedUsers: [], // Empty required list - should cause validation to fail
      disabled: false,
      tenantAdmin: false,
      coordinatedClients: null,
    };
    
    console.log('Empty form data:', JSON.stringify(emptyFormData, null, 2));
    
    // Simulate Form.validate() call
    console.log('\n  Simulating Form.validate() call:');
    const emptyValidationResult = simulateFormValidation(emptyFormData, UserSchema);
    console.log('  validate().isValid():', emptyValidationResult.isValid());
    console.log('  validate().errors:', emptyValidationResult.errors);
    
    // Simulate Form.getValue() call (what Findus actually calls)
    console.log('\n  Simulating Form.getValue() call:');
    const emptyGetValueResult = simulateFormGetValue(emptyFormData, UserSchema);
    console.log('  getValue() result:', emptyGetValueResult);
    console.log('  Expected: null (should prevent save)');
    
    // 3. Test with FILLED form data (should pass)
    console.log('\n3. TESTING FILLED FORM DATA (should pass):');
    
    const filledFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      assignedUsers: ['user1', 'user2'], // Filled required list - should pass validation
      disabled: false,
      tenantAdmin: false,
      coordinatedClients: ['client1'],
    };
    
    console.log('Filled form data:', JSON.stringify(filledFormData, null, 2));
    
    // Simulate Form.validate() call
    console.log('\n  Simulating Form.validate() call:');
    const filledValidationResult = simulateFormValidation(filledFormData, UserSchema);
    console.log('  validate().isValid():', filledValidationResult.isValid());
    console.log('  validate().errors:', filledValidationResult.errors);
    
    // Simulate Form.getValue() call (what Findus actually calls)
    console.log('\n  Simulating Form.getValue() call:');
    const filledGetValueResult = simulateFormGetValue(filledFormData, UserSchema);
    console.log('  getValue() result:', filledGetValueResult !== null ? 'DATA RETURNED' : 'NULL RETURNED');
    console.log('  Expected: DATA RETURNED (should allow save)');
    
    // 4. Test individual field validation (assignedUsers specifically)
    console.log('\n4. TESTING INDIVIDUAL FIELD VALIDATION:');
    
    const assignedUsersType = t.list(t.String);
    
    console.log('\n  Empty assignedUsers field:');
    const emptyFieldResult = simulateFormValidation([], assignedUsersType);
    console.log('    validate().isValid():', emptyFieldResult.isValid());
    console.log('    getValue() would return:', emptyFieldResult.isValid() ? 'DATA' : 'NULL');
    
    console.log('\n  Filled assignedUsers field:');
    const filledFieldResult = simulateFormValidation(['user1', 'user2'], assignedUsersType);
    console.log('    validate().isValid():', filledFieldResult.isValid());
    console.log('    getValue() would return:', filledFieldResult.isValid() ? 'DATA' : 'NULL');
    
    // 5. Test edge cases that might be causing issues
    console.log('\n5. TESTING EDGE CASES:');
    
    // Test with undefined values
    console.log('\n  Testing with undefined assignedUsers:');
    const undefinedFormData = { ...filledFormData, assignedUsers: undefined };
    const undefinedResult = simulateFormValidation(undefinedFormData, UserSchema);
    console.log('    validate().isValid():', undefinedResult.isValid());
    
    // Test with null values
    console.log('\n  Testing with null assignedUsers:');
    const nullFormData = { ...filledFormData, assignedUsers: null };
    const nullResult = simulateFormValidation(nullFormData, UserSchema);
    console.log('    validate().isValid():', nullResult.isValid());
    
    // Test with array containing empty strings
    console.log('\n  Testing with array containing empty strings:');
    const emptyStringFormData = { ...filledFormData, assignedUsers: ['', 'user2'] };
    const emptyStringResult = simulateFormValidation(emptyStringFormData, UserSchema);
    console.log('    validate().isValid():', emptyStringResult.isValid());
    
  } catch (error) {
    console.log('ERROR in debug test:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('This comprehensive test should reveal exactly what is preventing filled forms from saving.');
  console.log('If filled forms still return null from getValue(), there is another validation path we need to identify.');
}

// Simulate Form validation with the exact logic from Form.tsx
function simulateFormValidation(formValue, type) {
  // Import getTypeInfo function simulation
  function getTypeInfo(type) {
    return {
      isMaybe: type.meta && type.meta.kind === 'maybe',
      isSubtype: false,
      innerType: type,
      getValidationErrorMessage: undefined,
    };
  }
  
  // Basic type check - tcomb types are functions, not objects!
  if (!type || !('meta' in type) || !('is' in type)) {
    return { isValid: () => true, value: formValue, errors: [] };
  }

  // Custom validation for required lists and enums
  const typeInfo = getTypeInfo(type);
  const typeMeta = type.meta;
  
  // Check for required empty lists
  if (typeMeta?.kind === 'list' && !typeInfo.isMaybe) {
    if (Array.isArray(formValue) && formValue.length === 0) {
      return {
        isValid: () => false,
        value: formValue,
        errors: [{ message: 'This field is required', path: [], actual: formValue, expected: type }],
      };
    }
  }
  
  // Check for required empty enums
  if (typeMeta?.kind === 'enums' && !typeInfo.isMaybe) {
    if (formValue === '' || formValue === null || formValue === undefined) {
      return {
        isValid: () => false,
        value: formValue,
        errors: [{ message: 'This field is required', path: [], actual: formValue, expected: type }],
      };
    }
  }

  // Check for structs with required list/enum fields (Findus scenario)
  if (
    typeMeta?.kind === 'struct' &&
    'props' in typeMeta &&
    typeMeta.props &&
    typeof formValue === 'object' &&
    formValue !== null
  ) {
    const structValue = formValue;
    const props = typeMeta.props;
    
    for (const [fieldName, fieldType] of Object.entries(props)) {
      const fieldValue = structValue[fieldName];
      const fieldMeta = fieldType.meta;
      const fieldTypeInfo = getTypeInfo(fieldType);
      
      // Check for required empty lists within struct
      if (fieldMeta?.kind === 'list' && !fieldTypeInfo.isMaybe) {
        if (Array.isArray(fieldValue) && fieldValue.length === 0) {
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
          return {
            isValid: () => false,
            value: formValue,
            errors: [{ message: 'This field is required', path: [fieldName], actual: fieldValue, expected: fieldType }],
          };
        }
      }
    }
  }

  // Use tcomb validation for everything else
  return t.validate(formValue, type);
}

// Simulate Form.getValue() logic
function simulateFormGetValue(formValue, type) {
  const result = simulateFormValidation(formValue, type);
  return result.isValid() ? result.value : null;
}

// Run the debug
if (require.main === module) {
  debugCompleteFindusSaveFlow();
}

module.exports = { debugCompleteFindusSaveFlow };
