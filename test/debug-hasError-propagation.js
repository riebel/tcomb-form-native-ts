// Test to verify hasError propagation from Form to child components
const React = require('react');
const { Form } = require('../src/Form');
const t = require('tcomb-validation');

// Mock React Native components
const mockView = ({ children }) => children;
const mockText = ({ children }) => children;
const mockTextInput = ({ value, onChangeText, style }) => ({ 
  type: 'TextInput', 
  props: { value, onChangeText, style } 
});

// Mock React Native
global.React = React;
global.View = mockView;
global.Text = mockText;
global.TextInput = mockTextInput;

function testHasErrorPropagation() {
  console.log('=== TESTING hasError PROPAGATION FROM FORM TO CHILD COMPONENTS ===');
  
  try {
    // 1. Create a simple form schema with required text field
    console.log('\n1. CREATING SIMPLE FORM SCHEMA:');
    
    const SimpleSchema = t.struct({
      title: t.String, // Required text field
      description: t.maybe(t.String), // Optional text field
    });
    
    console.log('Schema created:', SimpleSchema.displayName);
    
    // 2. Create Form component with empty data (should trigger validation error)
    console.log('\n2. CREATING FORM WITH EMPTY REQUIRED FIELD:');
    
    const emptyFormData = {
      title: '', // Empty required field - should cause validation to fail
      description: 'Some description',
    };
    
    console.log('Form data:', JSON.stringify(emptyFormData, null, 2));
    
    // 3. Create Form component instance
    console.log('\n3. CREATING FORM COMPONENT INSTANCE:');
    
    let formRef = null;
    const formProps = {
      type: SimpleSchema,
      value: emptyFormData,
      onChange: (value) => {
        console.log('Form onChange called with:', value);
      },
      ref: (ref) => {
        formRef = ref;
        console.log('Form ref set:', !!ref);
      }
    };
    
    // Create the form element
    const formElement = React.createElement(Form, formProps);
    console.log('Form element created:', !!formElement);
    
    // 4. Simulate validation attempt (what happens when user tries to save)
    console.log('\n4. SIMULATING VALIDATION ATTEMPT:');
    
    if (formRef && formRef.validate) {
      console.log('Calling formRef.validate()...');
      const validationResult = formRef.validate();
      console.log('Validation result:', {
        isValid: validationResult.isValid(),
        errors: validationResult.errors
      });
      
      // 5. Check if hasError is propagated to child components
      console.log('\n5. CHECKING hasError PROPAGATION:');
      
      // After validation fails, the Form should set hasError=true in child component options
      // This should trigger child components to show red labels
      
      console.log('Form should now have hasError=true internally');
      console.log('Child components should receive hasError option');
      
      // 6. Simulate getValue call (what Findus actually calls)
      console.log('\n6. SIMULATING getValue CALL:');
      
      if (formRef.getValue) {
        const getValueResult = formRef.getValue();
        console.log('getValue() result:', getValueResult);
        console.log('Expected: null (should prevent save)');
      }
      
    } else {
      console.log('ERROR: Form ref not available or validate method missing');
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('This test should reveal if hasError is properly propagated from Form to child components.');
    console.log('If child components receive hasError option, red labels should appear.');
    
  } catch (error) {
    console.error('ERROR in hasError propagation test:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testHasErrorPropagation();
