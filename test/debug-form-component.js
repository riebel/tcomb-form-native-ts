const test = require('tape');
const t = require('tcomb-validation');
const transform = require('tcomb-json-schema');

// Import our utilities
const { getFormComponentName, getTypeInfo, isTcombType } = require('../dist/util.js');

test('Form component type processing', function (assert) {
  console.log('\n=== Testing Form Component Type Processing ===');
  
  // Create the schema that your app uses
  const jsonSchema = {
    type: 'object',
    properties: {
      tasks: {
        type: 'array',
        title: 'Aufgaben für den nächsten Termin',
        items: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              title: 'Aufgabe',
              options: {
                multiline: true
              },
              'ui:widget': 'textarea'
            }
          }
        }
      }
    }
  };

  const transformedSchema = transform(jsonSchema);
  console.log('Root transformed schema meta:', transformedSchema.meta);
  
  // Simulate what happens when Form processes the root schema
  console.log('Root schema component name:', getFormComponentName(transformedSchema, {}));
  
  // Get the tasks field (this is what would be passed to the tasks field component)
  const tasksType = transformedSchema.meta.props.tasks;
  console.log('Tasks type meta:', tasksType.meta);
  console.log('Tasks type displayName:', tasksType.displayName);
  console.log('Is tasks type tcomb?', isTcombType(tasksType));
  
  // Get type info for tasks field
  const tasksTypeInfo = getTypeInfo(tasksType);
  console.log('Tasks type info:', tasksTypeInfo);
  
  // What component would be selected for the tasks field?
  console.log('Tasks field component name:', getFormComponentName(tasksType, {}));
  
  // If it's a Maybe type, what's the inner type?
  if (tasksType.meta.kind === 'maybe') {
    const innerType = tasksType.meta.type;
    console.log('Tasks inner type meta:', innerType.meta);
    console.log('Tasks inner type displayName:', innerType.displayName);
    console.log('Tasks inner component name:', getFormComponentName(innerType, {}));
    
    // This inner type should be what gets passed to the List component
    // Let's see what the List component would receive
    console.log('\n--- What List component should receive ---');
    console.log('List receives type meta:', innerType.meta);
    console.log('List type kind:', innerType.meta.kind);
    
    if (innerType.meta.kind === 'list') {
      const itemType = innerType.meta.type;
      console.log('List item type meta:', itemType.meta);
      console.log('List item type displayName:', itemType.displayName);
      console.log('List item component name:', getFormComponentName(itemType, {}));
    }
  }

  assert.pass('Type processing analysis complete');
  assert.end();
});

test('Direct List type processing', function (assert) {
  console.log('\n=== Testing Direct List Type Processing ===');
  
  // Test with a direct array schema
  const arraySchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          title: 'Aufgabe'
        }
      }
    }
  };

  const transformedArraySchema = transform(arraySchema);
  console.log('Direct array schema meta:', transformedArraySchema.meta);
  console.log('Direct array component name:', getFormComponentName(transformedArraySchema, {}));
  
  // This should be passed directly to List component
  if (transformedArraySchema.meta.kind === 'list') {
    const itemType = transformedArraySchema.meta.type;
    console.log('Direct array item type meta:', itemType.meta);
    console.log('Direct array item type displayName:', itemType.displayName);
    console.log('Direct array item component name:', getFormComponentName(itemType, {}));
  }

  assert.pass('Direct list type processing complete');
  assert.end();
});
