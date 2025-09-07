const test = require('tape');
const React = require('react');
const t = require('tcomb-validation');
const { List } = require('../dist/List');
const { getComponentOptions } = require('../dist/util');

test('List component should pass field options to nested components', (assert) => {
  console.log('\n=== List Field Options Passing Test ===\n');

  // Simulate the exact scenario from Findus
  const listOptions = {
    item: {
      fields: {
        task: {
          multiline: true,
          label: 'Aufgabe'
        }
      },
      label: ' '
    },
    label: 'Aufgaben für den nächsten Termin'
  };

  console.log('1. List options structure:', JSON.stringify(listOptions, null, 2));

  // Test getComponentOptions with the list item options
  const itemOptions = getComponentOptions(
    listOptions.item,
    {},
    null,
    t.struct({ task: t.maybe(t.String) })
  );

  console.log('2. Item options after getComponentOptions:', JSON.stringify(itemOptions, null, 2));

  // Check if fields are preserved
  assert.ok(itemOptions.fields, 'Item options should have fields');
  assert.ok(itemOptions.fields.task, 'Item options should have task field');
  assert.equal(itemOptions.fields.task.multiline, true, 'Task field should have multiline: true');
  assert.equal(itemOptions.fields.task.label, 'Aufgabe', 'Task field should have correct label');

  console.log('✅ All assertions passed!');
  console.log('\n=== Test Complete ===\n');

  assert.end();
});
