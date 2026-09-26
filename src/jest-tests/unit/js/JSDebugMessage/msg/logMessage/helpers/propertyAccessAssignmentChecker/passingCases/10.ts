export default {
  name: 'member reassigned to a multi-line object at the start of the file',
  fileExtension: '.ts',
  lines: ['this.state = {', '  ready: true,', '};', 'next();'],
  selectionLine: 0,
  variableName: 'this.state',
};
