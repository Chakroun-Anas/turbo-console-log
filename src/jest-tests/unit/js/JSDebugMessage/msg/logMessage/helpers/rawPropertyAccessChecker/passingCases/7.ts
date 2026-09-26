export default {
  name: 'nested key in an object assigned to a member (this.state)',
  fileExtension: '.ts',
  lines: ['this.state = {', '  nested: {', '    ready: true,', '  },', '};'],
  selectionLine: 2,
  selectedText: 'ready',
  deepObjectPath: 'this.state.nested.ready',
};
