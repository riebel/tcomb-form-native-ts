const test = require('tape');
const t = require('tcomb-validation');

// Import transformation function
const transform = require('tcomb-json-schema');

test('Array of objects should render correctly', function (assert) {
  console.log('\n=== Testing Array of Objects ===');
  
  // This is the exact schema from your Findus app
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

  console.log('Original JSON Schema:', JSON.stringify(jsonSchema, null, 2));

  try {
    const transformedSchema = transform(jsonSchema);
    console.log('Transformed Schema:', JSON.stringify(transformedSchema, null, 2));
    console.log('Transformed Schema type:', typeof transformedSchema);
    console.log('Transformed Schema meta:', transformedSchema.meta);
    
    // Test the tasks field specifically
    if (transformedSchema.meta && transformedSchema.meta.props && transformedSchema.meta.props.tasks) {
      const tasksType = transformedSchema.meta.props.tasks;
      console.log('Tasks type:', JSON.stringify(tasksType, null, 2));
      console.log('Tasks type meta:', tasksType.meta);
      
      if (tasksType.meta && tasksType.meta.type) {
        console.log('Tasks item type:', JSON.stringify(tasksType.meta.type, null, 2));
      }
    }

    assert.pass('Schema transformation succeeded');
    
  } catch (error) {
    console.error('Error during transformation:', error);
    assert.fail('Schema transformation failed: ' + error.message);
  }

  assert.end();
});

test('Direct array schema should work', function (assert) {
  console.log('\n=== Testing Direct Array Schema ===');
  
  // Test with a direct array schema (not wrapped in object)
  const arraySchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          title: 'Aufgabe',
          options: {
            multiline: true
          }
        }
      }
    }
  };

  console.log('Direct Array Schema:', JSON.stringify(arraySchema, null, 2));

  try {
    const transformedSchema = transform(arraySchema);
    console.log('Transformed Array Schema:', JSON.stringify(transformedSchema, null, 2));
    console.log('Transformed Array Schema meta:', transformedSchema.meta);
    
    if (transformedSchema.meta && transformedSchema.meta.type) {
      console.log('Array item type:', JSON.stringify(transformedSchema.meta.type, null, 2));
    }

    assert.pass('Direct array schema transformation succeeded');
    
  } catch (error) {
    console.error('Error with direct array schema:', error);
    assert.fail('Direct array schema failed: ' + error.message);
  }

  assert.end();
});

test('Manual tcomb array type should work', function (assert) {
  console.log('\n=== Testing Manual Tcomb Array Type ===');
  
  // Create a manual tcomb type to see what it should look like
  const TaskType = t.struct({
    task: t.String
  }, 'Task');
  
  const TasksArrayType = t.list(TaskType, 'TasksArray');
  
  console.log('Manual TasksArrayType:', JSON.stringify(TasksArrayType, null, 2));
  console.log('Manual TasksArrayType meta:', TasksArrayType.meta);
  console.log('Manual TasksArrayType meta.type:', JSON.stringify(TasksArrayType.meta.type, null, 2));

  assert.pass('Manual tcomb array type succeeded');

  assert.end();
});
