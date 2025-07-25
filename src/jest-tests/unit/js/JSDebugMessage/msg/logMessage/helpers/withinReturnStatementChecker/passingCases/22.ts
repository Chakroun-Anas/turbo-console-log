// Position-based matching for entire object literal selection
export default {
  name: 'position-based object literal selection',
  lines: [
    'function getPersonInfos(person) {',
    '  return {',
    '    name: person.name,',
    '    age: person.age,',
    '  };',
    '}',
  ],
  selectionLine: 1, // Selection on the opening brace line
  variableName: '{ name: person.name, age: person.age }', // Complex expression that will use position-based matching
};
