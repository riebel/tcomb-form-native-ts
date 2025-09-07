const test = require('tape');
const React = require('react');
const t = require('tcomb-validation');
const transform = require('tcomb-json-schema');
const { Form } = require('../dist');

// Reset formats like in your app
transform.resetFormats();
transform.registerFormat('color', t.String);
transform.registerFormat('date', t.Date);
transform.registerFormat('time', t.Date);
transform.registerFormat('datetime', t.Date);
transform.registerFormat('person', t.String);
transform.registerFormat('children', t.String);
transform.registerFormat('user', t.String);
transform.registerFormat('client', t.String);
transform.registerFormat('address', t.String);
transform.registerFormat('theme', t.String);
transform.registerFormat('serviceProvider', t.String);
transform.registerFormat('service', t.String);
transform.registerFormat('email', (x) => /(.)+@(.)+/.test(x));
transform.registerFormat('image', t.String);

test('List multiline option debugging', function (assert) {
  // Your exact schema structure
  const schema = {
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
        },
        'ui:options': {
          addButtonLabel: 'Hinzufügen'
        }
      }
    }
  };

  console.log('Original schema:', JSON.stringify(schema, null, 2));

  // Transform schema like in your app
  const transformedSchema = transform(schema);
  console.log('Transformed schema type:', transformedSchema);
  console.log('Transformed schema meta:', transformedSchema.meta);
  
  if (transformedSchema.meta && transformedSchema.meta.props) {
    console.log('Schema props:', transformedSchema.meta.props);
    
    const tasksType = transformedSchema.meta.props.tasks;
    console.log('Tasks type:', tasksType);
    
    if (tasksType && tasksType.meta) {
      console.log('Tasks meta:', tasksType.meta);
      
      if (tasksType.meta.type) {
        console.log('Tasks item type:', tasksType.meta.type);
        
        if (tasksType.meta.type.meta && tasksType.meta.type.meta.props) {
          console.log('Task item props:', tasksType.meta.type.meta.props);
          
          const taskProp = tasksType.meta.type.meta.props.task;
          console.log('Task property:', taskProp);
        }
      }
    }
  }

  // Test data
  const value = {
    tasks: [
      { task: 'Test task content' }
    ]
  };

  // Create form element
  const formElement = React.createElement(Form, {
    type: transformedSchema,
    value: value,
    onChange: (newValue) => {
      console.log('Form changed:', newValue);
    }
  });

  console.log('Form element created:', formElement);

  assert.pass('Debug test completed - check console output');
  assert.end();
});
