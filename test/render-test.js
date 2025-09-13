// Setup test environment first
require('./setup-test-env');

const React = require('react');
const { renderToString } = require('react-dom/server');
const { JSDOM } = require('jsdom');
const transform = require('tcomb-json-schema');
const t = require('tcomb-validation');

// Import our actual Form component after mocking
const { Form } = require('../dist/Form');

console.log('=== RENDER TESTS FOR ERROR STYLING ===');

// Test schema with required fields at root and nested levels
const testSchema = {
  type: 'object',
  required: ['type', 'datetime', 'appointment'],
  properties: {
    type: { 
      type: 'string', 
      default: 'intervention',
      title: 'Type'
    },
    author: { 
      type: 'string',
      title: 'Author'
    },
    datetime: { 
      type: 'string', 
      format: 'datetime', 
      title: 'Date/Time'
    },
    appointment: {
      type: 'object',
      required: ['datetime'],
      properties: {
        datetime: { 
          type: 'string', 
          format: 'datetime', 
          title: 'Appointment Start'
        },
        datetimeend: { 
          type: 'string', 
          format: 'datetime', 
          title: 'Appointment End'
        },
        description: { 
          type: 'string',
          title: 'Description'
        }
      }
    },
    notes: {
      type: 'object',
      properties: {
        content: { 
          type: 'string',
          title: 'Notes Content'
        }
      }
    }
  }
};

// Transform schema
transform.resetFormats();
transform.registerFormat('datetime', t.Date);
const TestType = transform(testSchema);

console.log('Schema transformed successfully');

// Test scenarios
const testScenarios = [
  {
    name: 'RENDER TEST 1: Empty form (all required fields missing)',
    formValue: {
      type: 'intervention',
      author: 'test-user'
    },
    expectValidation: false,
    expectedRequiredFields: ['datetime', 'appointment'],
    expectedNestedRequiredFields: ['appointment.datetime']
  },
  {
    name: 'RENDER TEST 2: Partial form (some required fields filled)',
    formValue: {
      type: 'intervention',
      author: 'test-user',
      datetime: '2024-01-01T10:00:00Z',
      appointment: {
        description: 'Test appointment'
      }
    },
    expectValidation: false,
    expectedRequiredFields: [],
    expectedNestedRequiredFields: ['appointment.datetime']
  },
  {
    name: 'RENDER TEST 3: Complete form (all required fields filled)',
    formValue: {
      type: 'intervention',
      author: 'test-user',
      datetime: '2024-01-01T10:00:00Z',
      appointment: {
        datetime: '2024-01-01T14:00:00Z',
        description: 'Test appointment'
      }
    },
    expectValidation: true,
    expectedRequiredFields: [],
    expectedNestedRequiredFields: []
  }
];

// Helper function to parse rendered HTML and extract styling information
function analyzeRenderedHTML(htmlString) {
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;
  
  const analysis = {
    labels: [],
    inputs: [],
    errorElements: [],
    requiredIndicators: []
  };
  
  // Find all labels and check for required indicators (*)
  const labels = document.querySelectorAll('label, span[role="label"], .control-label');
  labels.forEach(label => {
    const text = label.textContent || '';
    const hasAsterisk = text.includes('*');
    const fieldName = label.getAttribute('for') || 'unknown';
    
    analysis.labels.push({
      fieldName,
      text,
      hasAsterisk,
      element: label.tagName.toLowerCase()
    });
    
    if (hasAsterisk) {
      analysis.requiredIndicators.push({
        fieldName,
        text
      });
    }
  });
  
  // Find all input elements and check for error styling
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const hasErrorClass = input.className.includes('error') || 
                         input.className.includes('has-error') ||
                         input.style.borderColor === 'red' ||
                         input.style.color === 'red';
    
    const fieldName = input.getAttribute('name') || input.getAttribute('id') || 'unknown';
    
    analysis.inputs.push({
      fieldName,
      type: input.type || input.tagName.toLowerCase(),
      hasErrorClass,
      className: input.className,
      style: input.getAttribute('style') || ''
    });
  });
  
  // Find elements with error-related classes or styling
  const errorElements = document.querySelectorAll('.error, .has-error, [style*="color: red"], [style*="border-color: red"]');
  errorElements.forEach(element => {
    analysis.errorElements.push({
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      style: element.getAttribute('style') || '',
      text: element.textContent || ''
    });
  });
  
  return analysis;
}

// Run render tests
testScenarios.forEach((scenario, index) => {
  console.log(`\n--- ${scenario.name} ---`);
  console.log('Form value:', JSON.stringify(scenario.formValue, null, 2));
  
  try {
    // Create form ref to simulate real usage
    const formRef = React.createRef();
    
    // Test 1: Render form initially (before validation)
    console.log('\n1. Rendering form (before validation)...');
    const initialFormElement = React.createElement(Form, {
      ref: formRef,
      type: TestType,
      value: scenario.formValue,
      options: {},
      onChange: (value) => {
        console.log(`[Test] Form onChange called`);
      }
    });
    
    const initialRendered = renderToString(initialFormElement);
    const initialAnalysis = analyzeRenderedHTML(initialRendered);
    
    console.log('Initial render analysis:');
    console.log('- Labels found:', initialAnalysis.labels.length);
    console.log('- Required indicators (*):', initialAnalysis.requiredIndicators.length);
    console.log('- Input elements:', initialAnalysis.inputs.length);
    console.log('- Error elements:', initialAnalysis.errorElements.length);
    
    // Show required indicators found
    if (initialAnalysis.requiredIndicators.length > 0) {
      console.log('Required field indicators found:');
      initialAnalysis.requiredIndicators.forEach(indicator => {
        console.log(`  - "${indicator.text}" (field: ${indicator.fieldName})`);
      });
    }
    
    // Test 2: Simulate form validation attempt
    console.log('\n2. Simulating form validation...');
    
    // Create a mock form ref that simulates validation
    const mockFormRef = {
      getValue: () => {
        console.log('[MockForm] getValue() called - triggering validation');
        
        try {
          const result = t.validate(scenario.formValue, TestType);
          const isValid = result.isValid();
          
          console.log('[MockForm] Validation result:', {
            isValid,
            errors: result.errors?.map(e => ({ 
              path: e.path, 
              message: e.message 
            })) || []
          });
          
          return isValid ? result.value : null;
        } catch (error) {
          console.error('[MockForm] Validation error:', error.message);
          return null;
        }
      }
    };
    
    const validationResult = mockFormRef.getValue();
    const validationPassed = validationResult !== null;
    
    console.log(`Validation ${validationPassed ? 'PASSED' : 'FAILED'} (expected: ${scenario.expectValidation ? 'PASS' : 'FAIL'})`);
    
    // Test 3: Render form after validation attempt (should show error styling)
    console.log('\n3. Rendering form after validation attempt...');
    
    // Create form with validation attempted state
    const postValidationFormElement = React.createElement(Form, {
      ref: formRef,
      type: TestType,
      value: scenario.formValue,
      options: {},
      onChange: (value) => {
        console.log(`[Test] Form onChange called after validation`);
      }
    });
    
    // Simulate validation attempted by calling getValue
    const postValidationRendered = renderToString(postValidationFormElement);
    const postValidationAnalysis = analyzeRenderedHTML(postValidationRendered);
    
    console.log('Post-validation render analysis:');
    console.log('- Labels found:', postValidationAnalysis.labels.length);
    console.log('- Required indicators (*):', postValidationAnalysis.requiredIndicators.length);
    console.log('- Input elements:', postValidationAnalysis.inputs.length);
    console.log('- Error elements:', postValidationAnalysis.errorElements.length);
    
    // Show error styling found
    if (postValidationAnalysis.errorElements.length > 0) {
      console.log('Error styling found:');
      postValidationAnalysis.errorElements.forEach(element => {
        console.log(`  - ${element.tagName} with class "${element.className}" and style "${element.style}"`);
      });
    }
    
    // Test 4: Verify expected required field indicators
    console.log('\n4. Verifying required field indicators...');
    
    const allExpectedRequired = [...scenario.expectedRequiredFields, ...scenario.expectedNestedRequiredFields];
    let requiredIndicatorTests = 0;
    let requiredIndicatorPassed = 0;
    
    allExpectedRequired.forEach(expectedField => {
      requiredIndicatorTests++;
      const foundIndicator = initialAnalysis.requiredIndicators.find(indicator => 
        indicator.text.toLowerCase().includes(expectedField.toLowerCase()) ||
        indicator.fieldName.includes(expectedField)
      );
      
      if (foundIndicator) {
        requiredIndicatorPassed++;
        console.log(`  ✅ Required indicator found for "${expectedField}": "${foundIndicator.text}"`);
      } else {
        console.log(`  ❌ Required indicator MISSING for "${expectedField}"`);
      }
    });
    
    // Test 5: Verify error styling for failed validation
    console.log('\n5. Verifying error styling...');
    
    if (!validationPassed) {
      const hasErrorStyling = postValidationAnalysis.errorElements.length > 0 ||
                             postValidationAnalysis.inputs.some(input => input.hasErrorClass);
      
      if (hasErrorStyling) {
        console.log('  ✅ Error styling found in rendered output');
      } else {
        console.log('  ❌ Error styling MISSING from rendered output');
      }
    } else {
      console.log('  ℹ️  Validation passed - no error styling expected');
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`- Required indicators: ${requiredIndicatorPassed}/${requiredIndicatorTests} found`);
    console.log(`- Validation result: ${validationPassed ? 'PASS' : 'FAIL'} (expected: ${scenario.expectValidation ? 'PASS' : 'FAIL'})`);
    console.log(`- Error styling: ${postValidationAnalysis.errorElements.length > 0 ? 'Present' : 'Missing'}`);
    
  } catch (error) {
    console.error(`Error in render test ${index + 1}:`, error.message);
  }
});

console.log('\n=== RENDER TESTS COMPLETE ===');
