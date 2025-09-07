// Debug test to understand why Form validation isn't working
const t = require('tcomb-validation');

// Test the actual tcomb types and their meta information
function debugTypeInfo() {
  console.log('=== Debugging Type Information ===');
  
  // 1. Test required list
  console.log('\n1. Required List (t.list(t.String)):');
  const RequiredList = t.list(t.String);
  console.log('  Type:', RequiredList);
  console.log('  Meta:', RequiredList.meta);
  console.log('  Meta.kind:', RequiredList.meta?.kind);
  console.log('  Is maybe?:', RequiredList.meta?.kind === 'maybe');
  
  // 2. Test optional list
  console.log('\n2. Optional List (t.maybe(t.list(t.String))):');
  const OptionalList = t.maybe(t.list(t.String));
  console.log('  Type:', OptionalList);
  console.log('  Meta:', OptionalList.meta);
  console.log('  Meta.kind:', OptionalList.meta?.kind);
  console.log('  Is maybe?:', OptionalList.meta?.kind === 'maybe');
  
  // 3. Test required enum
  console.log('\n3. Required Enum (t.enums({...})):');
  const RequiredEnum = t.enums({ a: 'A', b: 'B' });
  console.log('  Type:', RequiredEnum);
  console.log('  Meta:', RequiredEnum.meta);
  console.log('  Meta.kind:', RequiredEnum.meta?.kind);
  console.log('  Is maybe?:', RequiredEnum.meta?.kind === 'maybe');
  
  // 4. Test optional enum
  console.log('\n4. Optional Enum (t.maybe(t.enums({...}))):');
  const OptionalEnum = t.maybe(t.enums({ a: 'A', b: 'B' }));
  console.log('  Type:', OptionalEnum);
  console.log('  Meta:', OptionalEnum.meta);
  console.log('  Meta.kind:', OptionalEnum.meta?.kind);
  console.log('  Is maybe?:', OptionalEnum.meta?.kind === 'maybe');
  
  // 5. Test how to detect inner type for maybe types
  console.log('\n5. Inner type detection for maybe types:');
  if (OptionalList.meta?.kind === 'maybe') {
    console.log('  OptionalList inner type:', OptionalList.meta.type);
    console.log('  OptionalList inner meta:', OptionalList.meta.type?.meta);
    console.log('  OptionalList inner kind:', OptionalList.meta.type?.meta?.kind);
  }
  
  console.log('\n=== Summary ===');
  console.log('This shows us the actual structure of tcomb types so we can fix the validation logic.');
}

// Run the debug
if (require.main === module) {
  debugTypeInfo();
}

module.exports = { debugTypeInfo };
