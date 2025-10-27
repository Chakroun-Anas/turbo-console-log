// Arrow function with explicit return
export default {
  name: 'arrow function with explicit return',
  fileExtension: '.ts',
  lines: ['const getName = (person) => {', '  return person.name;', '};'],
  selectionLine: 1,
  variableName: 'person.name',
  expected: 1, // Before the return statement
};
