export default {
  fileExtension: '.ts',
  name: 'parameter of a one-line class setter body',
  lines: [
    'class Toggle {',
    '  set checked(value: boolean) { this._checked = value; }',
    '}',
  ],
  selectionLine: 1,
  variableName: 'value',
};
