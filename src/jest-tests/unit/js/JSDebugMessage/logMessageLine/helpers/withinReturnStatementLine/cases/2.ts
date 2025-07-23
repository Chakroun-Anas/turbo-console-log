// Object literal in return statement - main edge case
export default {
  name: 'object literal in return',
  lines: [
    'function getPersonInfos(person) {',
    '  return {',
    '    name: person.name,',
    '    age: person.age,',
    '  };',
    '}',
  ],
  selectionLine: 2, // Line with object property
  variableName: 'person.name',
  expected: 1, // Before the return statement
};
