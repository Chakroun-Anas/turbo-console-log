export default {
  name: 'should return the statement start line when the call is an argument of a multi-line call',
  fileExtension: '.ts',
  lines: [
    'function pick(options, value) {',
    '  setSelected(',
    '    options.find((o) => o.value === value),',
    '  );',
    '}',
  ],
  selectionLine: 2,
  selectedText: 'options',
  expectedLine: 1,
};
