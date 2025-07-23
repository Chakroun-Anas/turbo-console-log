// Arrow function with expression body (no explicit return statement)
export default {
  name: 'arrow function expression body',
  lines: ['const getName = (person) => person.name;'],
  selectionLine: 0,
  variableName: 'person.name', // This is expression body, not a return statement
};
