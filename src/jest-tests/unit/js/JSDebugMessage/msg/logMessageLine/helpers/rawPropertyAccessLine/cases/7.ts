export default {
  fileExtension: '.ts',
  name: 'key in an object assigned to a member (this.state.nested.ready)',
  lines: [
    'function reset() {',
    '  this.state = {',
    '    nested: {',
    '      ready: true,',
    '    },',
    '  };',
    '  render();',
    '}',
  ],
  selectionLine: 3,
  variableName: 'ready',
  // The member path is reachable once the assignment has run.
  expectedLine: 6,
};
