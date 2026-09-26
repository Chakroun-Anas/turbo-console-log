// Selecting the VALUE of a property in an object literal passed straight to a
// call — no root variable, same shape as rawPropertyAccessLine case 5.
export default {
  name: 'property value inside an object literal passed as an argument',
  fileExtension: '.ts',
  lines: [
    'function send(payload) {',
    "  emitter.emit('evt', {",
    '    type: payload.kind,',
    '  });',
    '}',
  ],
  selectionLine: 2,
  variableName: 'payload.kind',
  expectedLine: 1,
};
