export default {
  name: 'key in an object passed as a call argument (no root variable)',
  fileExtension: '.ts',
  lines: ['track({', '  event: payload.type,', '});'],
  selectionLine: 1,
  selectedText: 'event',
  deepObjectPath: 'payload.type',
};
