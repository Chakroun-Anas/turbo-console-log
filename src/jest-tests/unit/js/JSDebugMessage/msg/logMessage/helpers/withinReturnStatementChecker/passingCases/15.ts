// Type assertion expression in return
export default {
  name: 'type assertion expression in return',
  fileExtension: '.ts',
  lines: [
    'function getTypedValue(data) {',
    '  return data.value as string;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'data.value',
};
