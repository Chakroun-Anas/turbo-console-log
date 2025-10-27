export default {
  name: 'non-assignment line – should be rejected',
  fileExtension: '.ts',
  lines: ['function sayHello(person: Person) {}'],
  selectionLine: 0,
  variableName: 'sayHello',
};
