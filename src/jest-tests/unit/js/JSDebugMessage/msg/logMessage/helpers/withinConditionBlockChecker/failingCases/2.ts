export default {
  name: 'should not detect property access in for loop condition',
  fileExtension: '.ts',
  lines: [
    'for (let i = 0; i < arr.length; i++) {',
    '  console.log(arr[i]);',
    '}',
  ],
  selectionLine: 0,
  variableName: 'arr.length',
  expected: false,
};
