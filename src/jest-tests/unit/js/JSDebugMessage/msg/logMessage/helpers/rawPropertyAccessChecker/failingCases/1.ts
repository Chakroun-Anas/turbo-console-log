export default {
  name: 'property not in object literal',
  fileExtension: '.ts',
  lines: ['const person = {', "    firstName: 'Anas',", '    age: 28,', '};'],
  selectionLine: 2,
  selectedText: 'nonExistentProperty',
};
