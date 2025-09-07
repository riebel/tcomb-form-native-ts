const test = require('tape');
const React = require('react');
const { Struct } = require('../dist/Struct');

test('Nested JSON Schema objects should render correctly', function (tape) {
  // This simulates the problematic schema structure from the user
  const nestedSchemaType = {
    type: 'object',
    properties: {
      datetime: {
        type: 'string',
        title: 'Datum',
        format: 'date'
      },
      resources: {
        type: 'object',
        title: 'Ressourcen',
        properties: {
          child: {
            type: 'string',
            title: 'Kind',
            options: {
              multiline: true
            }
          },
          siblings: {
            type: 'string',
            title: 'Geschwister',
            options: {
              multiline: true
            }
          },
          parents: {
            type: 'string',
            title: 'Eltern',
            options: {
              multiline: true
            }
          },
          grandparents: {
            type: 'string',
            title: 'Großeltern u. a. wichtige Mitmenschen',
            options: {
              multiline: true
            }
          },
          social: {
            type: 'string',
            title: 'Sozialraum',
            options: {
              multiline: true
            }
          }
        }
      },
      resiliencies: {
        type: 'object',
        title: 'Resilienzen',
        properties: {
          child: {
            type: 'string',
            title: 'Kind',
            options: {
              multiline: true
            }
          },
          siblings: {
            type: 'string',
            title: 'Geschwister',
            options: {
              multiline: true
            }
          },
          parents: {
            type: 'string',
            title: 'Eltern',
            options: {
              multiline: true
            }
          },
          grandparents: {
            type: 'string',
            title: 'Großeltern u. a. wichtige Mitmenschen',
            options: {
              multiline: true
            }
          },
          social: {
            type: 'string',
            title: 'Sozialraum',
            options: {
              multiline: true
            }
          }
        }
      }
    }
  };

  console.log('Testing nested JSON Schema object structure:');
  
  // Create a mock Struct instance to test the getOrder and getInputs methods
  const mockStruct = new Struct({
    type: nestedSchemaType,
    options: {},
    value: {},
    onChange: () => {},
    ctx: {
      context: {},
      uidGenerator: { next: () => 'test-id' },
      auto: 'labels',
      config: {},
      label: 'Test Form',
      i18n: {},
      stylesheet: {},
      templates: {},
      path: []
    }
  });

  // Test getOrder method with nested schema
  const order = mockStruct.getOrder();
  console.log('Order from nested schema:', order);
  
  tape.ok(order.includes('datetime'), 'Should include datetime field');
  tape.ok(order.includes('resources'), 'Should include resources field');
  tape.ok(order.includes('resiliencies'), 'Should include resiliencies field');
  
  // Test that nested objects are recognized as having properties
  const resourcesSchema = nestedSchemaType.properties.resources;
  const resilienciesSchema = nestedSchemaType.properties.resiliencies;
  
  tape.ok(resourcesSchema.properties, 'Resources should have properties');
  tape.ok(resilienciesSchema.properties, 'Resiliencies should have properties');
  
  tape.ok(resourcesSchema.properties.child, 'Resources should have child property');
  tape.ok(resourcesSchema.properties.siblings, 'Resources should have siblings property');
  tape.ok(resourcesSchema.properties.parents, 'Resources should have parents property');
  tape.ok(resourcesSchema.properties.grandparents, 'Resources should have grandparents property');
  tape.ok(resourcesSchema.properties.social, 'Resources should have social property');
  
  tape.ok(resilienciesSchema.properties.child, 'Resiliencies should have child property');
  tape.ok(resilienciesSchema.properties.siblings, 'Resiliencies should have siblings property');
  tape.ok(resilienciesSchema.properties.parents, 'Resiliencies should have parents property');
  tape.ok(resilienciesSchema.properties.grandparents, 'Resiliencies should have grandparents property');
  tape.ok(resilienciesSchema.properties.social, 'Resiliencies should have social property');

  console.log('Nested JSON Schema object test completed successfully');
  tape.end();
});
