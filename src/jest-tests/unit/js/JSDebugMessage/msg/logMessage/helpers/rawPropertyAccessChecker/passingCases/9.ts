export default {
  name: 'key whose value has a side effect (no root variable)',
  fileExtension: '.ts',
  lines: ['track({', '  id: nextId(),', '});'],
  selectionLine: 1,
  selectedText: 'id',
  // Logging `nextId()` would call it a second time, and the bare key `id` is
  // not a binding (ReferenceError): the key name is logged as a string.
  deepObjectPath: '"id"',
};
