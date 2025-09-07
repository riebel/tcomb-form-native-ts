const test = require('tape');
const t = require('tcomb-validation');

test('Nested objects should render correctly', function (tape) {
  // Create a manually constructed tcomb struct that represents the problematic schema
  // This simulates what tcomb-json-schema should produce for nested objects
  
  const ResourcesType = t.struct({
    child: t.maybe(t.String),
    siblings: t.maybe(t.String),
    parents: t.maybe(t.String),
    grandparents: t.maybe(t.String),
    social: t.maybe(t.String)
  }, 'Resources');

  const ResilienciesType = t.struct({
    child: t.maybe(t.String),
    siblings: t.maybe(t.String),
    parents: t.maybe(t.String),
    grandparents: t.maybe(t.String),
    social: t.maybe(t.String)
  }, 'Resiliencies');

  const MainType = t.struct({
    type: t.String,
    datetime: t.Date,
    resources: t.maybe(ResourcesType),
    resiliencies: t.maybe(ResilienciesType)
  }, 'MainForm');

  console.log('Testing nested struct types:');
  console.log('MainType meta:', MainType.meta);
  console.log('MainType props:', Object.keys(MainType.meta.props));
  
  // Check the nested objects
  const resourcesType = MainType.meta.props.resources;
  const resilienciesType = MainType.meta.props.resiliencies;
  
  console.log('Resources type:', resourcesType);
  console.log('Resources meta:', resourcesType.meta);
  
  console.log('Resiliencies type:', resilienciesType);
  console.log('Resiliencies meta:', resilienciesType.meta);
  
  // Check if nested objects have proper struct properties
  if (resourcesType.meta && resourcesType.meta.type && resourcesType.meta.type.meta && resourcesType.meta.type.meta.props) {
    const resourceProps = resourcesType.meta.type.meta.props;
    console.log('Resources props:', Object.keys(resourceProps));
    tape.ok(resourceProps.child, 'Resources should have child property');
    tape.ok(resourceProps.siblings, 'Resources should have siblings property');
    tape.ok(resourceProps.parents, 'Resources should have parents property');
    tape.ok(resourceProps.grandparents, 'Resources should have grandparents property');
    tape.ok(resourceProps.social, 'Resources should have social property');
  } else {
    tape.fail('Resources type should have proper struct properties');
  }
  
  if (resilienciesType.meta && resilienciesType.meta.type && resilienciesType.meta.type.meta && resilienciesType.meta.type.meta.props) {
    const resiliencyProps = resilienciesType.meta.type.meta.props;
    console.log('Resiliencies props:', Object.keys(resiliencyProps));
    tape.ok(resiliencyProps.child, 'Resiliencies should have child property');
    tape.ok(resiliencyProps.siblings, 'Resiliencies should have siblings property');
    tape.ok(resiliencyProps.parents, 'Resiliencies should have parents property');
    tape.ok(resiliencyProps.grandparents, 'Resiliencies should have grandparents property');
    tape.ok(resiliencyProps.social, 'Resiliencies should have social property');
  } else {
    tape.fail('Resiliencies type should have proper struct properties');
  }

  // Test validation with sample data
  const sampleData = {
    type: 'resources',
    datetime: new Date(),
    resources: {
      child: 'Sample child resource',
      siblings: 'Sample siblings resource',
      parents: 'Sample parents resource',
      grandparents: 'Sample grandparents resource',
      social: 'Sample social resource'
    },
    resiliencies: {
      child: 'Sample child resilience',
      siblings: 'Sample siblings resilience',
      parents: 'Sample parents resilience',
      grandparents: 'Sample grandparents resilience',
      social: 'Sample social resilience'
    }
  };

  console.log('Testing validation with sample data:');
  const validationResult = t.validate(sampleData, MainType);
  console.log('Validation result:', validationResult);
  
  tape.ok(validationResult.isValid(), 'Sample data should validate successfully');
  
  tape.end();
});
