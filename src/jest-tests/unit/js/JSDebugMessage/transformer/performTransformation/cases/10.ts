export default {
  fileExtension: '.ts',
  name: 'one-line setter body',
  lines: [
    'class Toggle {',
    '  set checked(value: boolean) { this._checked = value; }',
    '}',
  ],
  selectedVar: 'value',
  line: 1,
  debuggingMsg: 'console.log("DEBUG")',
  expected: [
    'class Toggle {',
    '  set checked(value: boolean) {',
    '    console.log("DEBUG");',
    '    this._checked = value;',
    '  }',
    '}',
  ],
};
