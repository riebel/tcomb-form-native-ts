const test = require('tape');
const t = require('tcomb-validation');

const { Textbox } = require('../dist/Textbox');
const { Select } = require('../dist/Select');
const { DatePicker } = require('../dist/DatePicker');
const { List } = require('../dist/List');

// Test that required fields don't show validation errors immediately on creation
test('Validation should not show errors on form creation', function (assert) {
  console.log('🧪 Testing validation behavior on form creation...');

  // Test Textbox component
  const RequiredString = t.refinement(t.String, function (s) {
    return s.length > 0;
  });

  const textboxInstance = new Textbox({
    type: RequiredString,
    options: {},
    value: '', // Empty value for required field
    ctx: {
      auto: 'labels',
      templates: { textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Should not show error immediately on creation (before user interaction)
  assert.equal(
    textboxInstance.hasError(),
    false,
    'Required empty Textbox should not show error on creation'
  );

  // Simulate user interaction by calling onChange
  textboxInstance.onChange('test');
  textboxInstance.onChange(''); // Make it empty again after interaction

  // Now it should show error because user has interacted with it
  assert.equal(
    textboxInstance.hasError(),
    true,
    'Required empty Textbox should show error after user interaction'
  );

  console.log('✅ Textbox validation behavior test passed');

  // Test Select component
  const RequiredEnum = t.enums({ a: 'A', b: 'B' });

  const selectInstance = new Select({
    type: RequiredEnum,
    options: {},
    value: '', // Empty value for required field
    ctx: {
      auto: 'labels',
      templates: { select: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Should not show error immediately on creation
  assert.equal(
    selectInstance.hasError(),
    false,
    'Required empty Select should not show error on creation'
  );

  // Simulate user interaction
  selectInstance.onChange('a');
  selectInstance.onChange(''); // Make it empty again after interaction

  // Now it should show error
  assert.equal(
    selectInstance.hasError(),
    true,
    'Required empty Select should show error after user interaction'
  );

  console.log('✅ Select validation behavior test passed');

  // Test DatePicker component
  const RequiredDate = t.Date;

  const datePickerInstance = new DatePicker({
    type: RequiredDate,
    options: {},
    value: null, // Empty value for required field
    ctx: {
      auto: 'labels',
      templates: { datepicker: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Should not show error immediately on creation
  assert.equal(
    datePickerInstance.hasError(),
    false,
    'Required empty DatePicker should not show error on creation'
  );

  // Simulate user interaction
  datePickerInstance.onChange(new Date());
  datePickerInstance.onChange(null); // Make it empty again after interaction

  // Now it should show error
  assert.equal(
    datePickerInstance.hasError(),
    true,
    'Required empty DatePicker should show error after user interaction'
  );

  console.log('✅ DatePicker validation behavior test passed');

  // Test List component
  const RequiredList = t.list(t.String);

  const listInstance = new List({
    type: RequiredList,
    options: {},
    value: [], // Empty array for required list
    ctx: {
      auto: 'labels',
      templates: { list: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Should not show error immediately on creation
  assert.equal(
    listInstance.hasError(),
    false,
    'Required empty List should not show error on creation'
  );

  // Simulate user interaction by adding and removing items
  listInstance.add();
  listInstance.removeItem(0); // Make it empty again after interaction

  // Now it should show error
  assert.equal(
    listInstance.hasError(),
    true,
    'Required empty List should show error after user interaction'
  );

  console.log('✅ List validation behavior test passed');

  assert.end();
});

// Test that validation still works properly when explicitly called
test('Explicit validation should work correctly', function (assert) {
  console.log('🧪 Testing explicit validation...');

  const RequiredString = t.refinement(t.String, function (s) {
    return s.length > 0;
  });

  const textboxInstance = new Textbox({
    type: RequiredString,
    options: {},
    value: '', // Empty value for required field
    ctx: {
      auto: 'labels',
      templates: { textbox: () => null },
      i18n: { required: ' *', optional: '' },
      uidGenerator: { next: () => 'test' },
      path: [],
      stylesheet: {},
    },
  });

  // Explicit validation should still work
  const validationResult = textboxInstance.validate();
  
  assert.equal(
    validationResult.isValid(),
    false,
    'Explicit validation should fail for empty required field'
  );

  assert.ok(
    validationResult.errors.length > 0,
    'Explicit validation should return errors for empty required field'
  );

  // After explicit validation, hasError should be true
  assert.equal(
    textboxInstance.hasError(),
    true,
    'hasError should be true after explicit validation fails'
  );

  console.log('✅ Explicit validation test passed');

  assert.end();
});
