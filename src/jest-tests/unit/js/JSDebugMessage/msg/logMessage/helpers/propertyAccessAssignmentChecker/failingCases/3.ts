export default {
  name: 'target selected on a value line of a multi-line reassignment – should be rejected',
  fileExtension: '.ts',
  lines: ['state = {', '  ...state,', '  ready: true,', '};'],
  selectionLine: 1,
  variableName: 'state',
};
