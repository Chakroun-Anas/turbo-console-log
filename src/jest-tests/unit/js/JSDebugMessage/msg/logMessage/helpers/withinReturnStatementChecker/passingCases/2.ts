// Object literal in return statement - the main edge case we fixed
export default {
  name: 'object literal in return',
  fileExtension: '.ts',
  lines: [
    'function getPersonInfos(person) {',
    '  return {',
    '    name: person.name,',
    '    age: person.age,',
    '  };',
    '}',
  ],
  selectionLine: 2, // Line with object literal content
  variableName: '{ name: person.name, age: person.age }', // This will use position-based matching
};
