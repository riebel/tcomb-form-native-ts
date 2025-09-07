const test = require('tape');
const t = require('tcomb-validation');
const transform = require('tcomb-json-schema');

// Import our utilities
const { getTypeFromUnion, isTcombType } = require('../dist/util.js');

test('getTypeFromUnion with Maybe types', function (assert) {
  console.log('\n=== Testing getTypeFromUnion with Maybe Types ===');
  
  // Create the schema that your app uses
  const jsonSchema = {
    type: 'object',
    properties: {
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            task: {
              type: 'string'
            }
          }
        }
      }
    }
  };

  const transformedSchema = transform(jsonSchema);
  const tasksType = transformedSchema.meta.props.tasks;
  
  console.log('Original tasks type:', tasksType.displayName);
  console.log('Original tasks type meta:', tasksType.meta);
  console.log('Is Maybe type:', tasksType.meta.kind === 'maybe');
  
  // Test getTypeFromUnion with different values
  console.log('\n--- Testing getTypeFromUnion with null value ---');
  const resultWithNull = getTypeFromUnion(tasksType, null);
  console.log('Result with null:', resultWithNull);
  console.log('Result with null displayName:', resultWithNull?.displayName);
  console.log('Result with null meta:', resultWithNull?.meta);
  
  console.log('\n--- Testing getTypeFromUnion with undefined value ---');
  const resultWithUndefined = getTypeFromUnion(tasksType, undefined);
  console.log('Result with undefined:', resultWithUndefined);
  console.log('Result with undefined displayName:', resultWithUndefined?.displayName);
  console.log('Result with undefined meta:', resultWithUndefined?.meta);
  
  console.log('\n--- Testing getTypeFromUnion with empty array value ---');
  const resultWithArray = getTypeFromUnion(tasksType, []);
  console.log('Result with array:', resultWithArray);
  console.log('Result with array displayName:', resultWithArray?.displayName);
  console.log('Result with array meta:', resultWithArray?.meta);
  
  // What should happen: getTypeFromUnion should return the inner List type
  const expectedInnerType = tasksType.meta.type;
  console.log('\n--- Expected inner type ---');
  console.log('Expected inner type:', expectedInnerType.displayName);
  console.log('Expected inner type meta:', expectedInnerType.meta);
  
  // Test if the results match the expected inner type
  console.log('\n--- Comparison ---');
  console.log('Result with null === expected:', resultWithNull === expectedInnerType);
  console.log('Result with undefined === expected:', resultWithUndefined === expectedInnerType);
  console.log('Result with array === expected:', resultWithArray === expectedInnerType);

  assert.pass('getTypeFromUnion analysis complete');
  assert.end();
});
